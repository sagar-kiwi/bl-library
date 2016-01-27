// Create and open database
var db = openDatabase('springerDB', '1.0', 'database having information for all downloaed pdf', 5*1024*1024);

// Define Scroll Varibles
var articleScroll;

// Define alert box title and button text
var alertBoxTitle = "Message";
var buttonText = "OK";

$(function() {
  document.addEventListener('deviceready', onDeviceReady, false); // call function on device ready
  document.addEventListener('orientationchange', onOrientationchange, false);
});

function onDeviceReady() {
  var loc = getLocation(); // check which page is calling
  switch(loc) {
    case "index.html":
    indexBindEvents();  // Bind event
    createTable();  // create table if not exist
    changeTab();  // change footer tab on intially call for the article page
    break;

    case "articles.html":
    SpringerPlugin.startLoader();  // start loading animation
    showArticles(); // call function for show save articles
    break;
  }
}

function onOrientationchange() {
  var loc = getLocation(); // check which page is calling
  if(loc == "articles.html")
    changeHeaderPostion();
}

function indexBindEvents() {  // Bind events for index.html
  $('#article_button').on('touchstart', function() {  // Call funciton for article button tab
    var self = $(this);
    if(!self.hasClass('gDarkGray')) {  // check  class and call article page then only
      self.addClass('gDarkGray');
      $('.tabBar').removeClass('gDarkGray');
      SpringerPlugin.callArticlePage(); // Call Article Page
    }
  });

  $('.tabBar').on('touchstart', function() { // call left side tab bar at footer
    if(!checkDeviceOnline()) { // check network connection
      navigator.notification.alert("Sorry, the network is not available.", null, alertBoxTitle, buttonText);
      return false;
    }
    else {
      var self = $(this);
      if(!self.hasClass('gDarkGray')) { // check browser page if network connection availble
        self.addClass('gDarkGray');
        SpringerPlugin.callWebBrowserPage(); // Hide Article Page & show Springer view page
      }
      $('#article_button').removeClass('gDarkGray');
    }
  });

  $('#back_button').on('touchstart', function() { // function for back button
    if(!checkDeviceOnline()) { // check network connection
      navigator.notification.alert("Sorry, the network is not available.", null, alertBoxTitle, buttonText);
      return false;
    }
    else if($('.tabBar').hasClass('gDarkGray'))
      SpringerPlugin.movePageHandler(0);  // Back Button
  });

  $('#forword_button').on('touchstart', function() {  // function for forword button
    if(!checkDeviceOnline()) { // check network connection
      navigator.notification.alert("Sorry, the network is not available.", null, alertBoxTitle, buttonText);
      return false;
    }
    else if($('.tabBar').hasClass('gDarkGray'))
      SpringerPlugin.movePageHandler(1); // Forward Button
  });

  $('#home_button').on('touchstart', function() { // for home button function
    if(!checkDeviceOnline()) { // check network connection
      navigator.notification.alert("Sorry, the network is not available.", null, alertBoxTitle, buttonText);
      return false;
    }
    else if($('.tabBar').hasClass('gDarkGray'))
      SpringerPlugin.callWebBrowserHomePage(); // Reload the Springer view page
  });
}

// Create Table download_pdf if is not exists.
function createTable() {
  var createTblStatement = 'CREATE TABLE IF NOT EXISTS download_pdf (id INTEGER PRIMARY KEY, local_file_path TEXT UNIQUE, pdf_url TEXT UNIQUE, article_title TEXT, author_name TEXT, abstract_content TEXT, publication_title TEXT, article_date TEXT, download_date TEXT)';
  db.transaction(function(tx) {
    tx.executeSql(createTblStatement, [], null, errorCallback);
  });
}

function changeTab() { // change tab functionality to color visibility
  if(!checkDeviceOnline()) { // check network connection
    $('#article_button').addClass('gDarkGray');
    $('.tabBar').removeClass('gDarkGray');
    SpringerPlugin.stopLoader();
  }
}

function showArticles() { // Show all the downloaded articles
  var scrollParam = getScrollParam();
  setTimeout(function() {
    articleScroll = new iScroll("articleScroll",scrollParam); // intiallize the article iscroll
  }, 100);
  db.transaction(function (tx) {
    if(!localStorage.sortingParam || !localStorage.selectedVal) {
      localStorage.sortingParam = 'article_title asc';
      localStorage.selectedVal = 'article_title';
    }
    tx.executeSql('SELECT * FROM download_pdf order by '+localStorage.sortingParam, [], showArticlesSuccessCallback, errorCallback);
    $('#sortArticleDropdown').val(localStorage.selectedVal).attr('selected', true);
  });
}

function showArticlesSuccessCallback (tx, results) {
  var len = results.rows.length;
  if(len > 0) {
    enableBtn('editDoneBtn', true);
    for(var i = 0; i < len; i++) { // render record one less than length
      var localFilePath = results.rows.item(i).local_file_path;
      var pdfUrl = results.rows.item(i).pdf_url;
      var articleTitle = results.rows.item(i).article_title;
      var authorName = results.rows.item(i).author_name;
      var snippet = results.rows.item(i).abstract_content;
      var pubTitle = results.rows.item(i).publication_title;
      var pubDate = results.rows.item(i).article_date;
      var downloadDate = results.rows.item(i).download_date;

      var authorText = "";
      var snippetText = "";
      var pubTitleText = "";

      if(authorName != "")
        authorText = '<span class="pdfAuthor">'+authorName+'</span>';

      if(snippet != "")
        snippetText = '<span class="pdfSnippts">'+snippet+'</span>';

      if(pubTitle != "" || pubDate != "")
        pubTitleText = '<span class="pdfDate">'+pubTitle+' '+pubDate+'</span>';

      $(".pdfList").append('<li class="titleAuthor" data-localLink="'+localFilePath+'"><div class="radioBtn radio_deactive" style="visibility: hidden" data-radio="true"></div><span class="pdfTitle">'+articleTitle+'</span>'+snippetText+authorText+pubTitleText+'<span class="pdfDownloadDate" style="display:none">'+downloadDate+'</span></li>');

      if(i == len-1) {
        articlesBindEvents(); // bind the click event on each li tag
        setTimeout(function() {
          articleScroll.refresh(); // refresh the scroller
        }, 100);
      }
    }
  }
  else {
    $(".pdfList").hide();
    $(".noContent").show();
  }
  SpringerPlugin.stopLoader(); // stop animation function
}

// bind event function
function articlesBindEvents() {
  $('.titleAuthor').on('click', showPDF);
  $("#editDoneBtn").on("click", showOptions);
  $("#selectDeselectBtn").on("touchstart", selectDeselectAllArticles);
  $(".dropdown").selectbox({
    onOpen: enableAndDisableDropdownOption,
    onChange: sortArticlesAndEmailOrOpenIn,
    effect: "slide"
  });
  $("#deleteBtn").on("click", deleteArticle);
  $(".content, .grdHeader, .blankSpan").on("touchstart", function() {
    closeDropdown('dropdown');
  });
}

function showPDF() {
  closeDropdown('dropdown');
  var self = $(this);
  var localFilePath = self.attr("data-localLink");
  if($(event.target).attr('data-radio') == "true") {
    var me = $(this).children('div');
    if(me.hasClass('radio_deactive'))
      selectArticle(me, true);
    else {
      selectArticle(me, false);
      changeBtnTextSelectAll('selectDeselectBtn', true);
    }

    var totalArticleLen = getTotalArticlesLen();
    var selectedArticleLen = getSelectedArticlesLen();

    if(selectedArticleLen > 0)
      enableBtn('deleteBtn', true);
    else
      enableBtn('deleteBtn', false);

    if(totalArticleLen === selectedArticleLen)
      changeBtnTextSelectAll('selectDeselectBtn', false);
  }
  else {
    highlightSelected(self, true);
    updateTime(localFilePath);
    readPDF(localFilePath); // call readPDF function
    setTimeout(function() {
      highlightSelected(self, false);
    }, 1000);
  }
}

function showOptions() {
  var self = $(this);
  if(isVisible('subheader')) {
    self.text("Edit");
    $(".radioBtn").css("visibility", "hidden");
    $('.content').removeClass('contentMore');
  }
  else {
    resetAll();
    self.text("Done");
    $(".radioBtn").css("visibility", "visible");
    $('.content').addClass('contentMore');
  }
  $("#subheader").slideToggle();
  articleScroll.refresh();
}

function selectDeselectAllArticles() {
  var self = $(this);
  if(self.text() == "Select All") {
    changeBtnTextSelectAll(self.attr('id'), false);
    enableBtn('deleteBtn', true);
    selectArticle($('.radioBtn'), true);
  }
  else {
    changeBtnTextSelectAll(self.attr('id'), true);
    enableBtn('deleteBtn', false);
    selectArticle($('.radioBtn'), false);
  }
}

function enableAndDisableDropdownOption() {
  var self = $(this);
  if(self.parent().attr('class') == 'srtReg') {
    var selectedText = self.next().children('a').text();
    self.next().find('li').each(function(i) {
      var self = $(this);
      self.children('a').removeClass('colorBlue');
      if(self.children('a').text() == selectedText)
        self.children('a').addClass('colorBlue');
    });
  }
}

function sortArticlesAndEmailOrOpenIn(val, inst) {
  switch(val) {
    case "article_title":
                          sortUsingNestedText($('.pdfList'), "li", "span.pdfTitle", false);
                          localStorage.sortingParam = 'article_title asc';
                          localStorage.selectedVal = val;
                          break;
    case "oldest_first":
                          sortUsingNestedText($('.pdfList'), "li", "span.pdfDownloadDate", false);
                          localStorage.sortingParam = 'download_date asc';
                          localStorage.selectedVal = val;
                          break;
    case "most_recent_first":
                          sortUsingNestedText($('.pdfList'), "li", "span.pdfDownloadDate", true);
                          localStorage.sortingParam = 'download_date desc';
                          localStorage.selectedVal = val;
                          break;
  }
}

function deleteArticle() {
  navigator.notification.confirm('Are you sure you want to delete?', onConfirm, alertBoxTitle, buttonText+', Cancel');

  function onConfirm(button) {
    if(button == "1") {
      var q = "";
      var localPath = [];
      $("li .radio_active").each(function(i) {
          var me = $(this).parent();
          var localFilePath = me.attr("data-localLink");
          me.remove();
          enableBtn('deleteBtn', false);
          localPath.push(localFilePath);
          q += (q == "" ? "" : ", ") + "?";
      });

      var totalArticleLen = getTotalArticlesLen();
      if(totalArticleLen == 0) {
        enableBtn('editDoneBtn', false);
        $("#subheader").slideToggle();
        $(".noContent").show();
      }
      db.transaction(function(tx) {
        tx.executeSql('delete from download_pdf where local_file_path in (' + q + ')', localPath, deleteSuccessCallback, errorCallback); //delete data into database
      });
    }
  }
}

function deleteSuccessCallback() {
  articleScroll.refresh(); // refresh the scroller
}

// function for check network connection
function checkDeviceOnline() {
  if(navigator.onLine)
    return true;
}

// Definfe scrollParam for iscoll
function getScrollParam() {
  var scrollParam = {
    hScrollbar: false,hScroll:false,
    useTransform: true,
    zoom: false,
    onBeforeScrollStart: function (e) {
      closeDropdown('dropdown');
      var target = e.target;
      while (target.nodeType != 1) target = target.parentNode;
      {
        if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
          e.stopPropagation();
          e.preventDefault();
        }
      }
    }
  };
  return scrollParam;
}

function updateTime(localFilePath) {
  var date = Math.floor($.now()/1000);
  $('.pdfList').find("li[data-localLink = '"+localFilePath+"'] span.pdfDownloadDate").text(date);
  var updateStatement = 'update download_pdf set download_date = ? where local_file_path = ?';
  db.transaction(function(tx) {
    tx.executeSql(updateStatement, [date, localFilePath], null, errorCallback); //insert data into database
  });
}

function readPDF(file_path) {  // read offline pdf
  SpringerPlugin.callOfflinePDF(file_path);
}

function downloadFile(pdfUrl, contentStr, loc) {
  db.transaction(function (tx) {
    // check pdf already exist then render pdf from local storage
    tx.executeSql('SELECT local_file_path, pdf_url FROM download_pdf where pdf_url = ?', [pdfUrl], function (tx, results) {
      var len = results.rows.length;
      if(len > 0) { // if exist
        var localFilePath = results.rows.item(0).local_file_path;
        updateTime(localFilePath);
        readPDF(localFilePath); // call readPDF function
      }
      else {
        readPDF(pdfUrl); // call readPDF function
        var decodedUrl = decodeURIComponent(pdfUrl); //decode the PDF Url
        window.requestFileSystem(

          LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {

            fileSystem.root.getFile(

              "dummy.html", {create: true, exclusive: false}, function gotFileEntry(fileEntry){

                var sPath = cordova.file.documentsDirectory;
                var fileTransfer = new FileTransfer();
                fileEntry.remove();
                fileTransfer.download(pdfUrl, sPath +""+ decodedUrl.split('pdf/')[1], function(theFile) {
                  insertArticleData(theFile.toURI(), pdfUrl, contentStr, loc);
                }, function(error) {
                    console.log("download error source " + error.source);
                    console.log("download error target " + error.target);
                    console.log("upload error code: " + error.code);
                  });
              },
            fail);
          },
        fail);
      }
    }, errorCallback);
  });
}

// function for inserting information regarding download pdf
function insertArticleData(localFilePath, pdfUrl, contentStr, loc){
  var metaDataObj = {
    'title'   : '',
    'author'  : '',
    'snippet' : '',
    'pubTitle': '',
    'pubDate' : ''
  };
  var locStr = loc.split('/')[3].split('?')[0];
  var pdfArr = pdfUrl.split('pdf/');
  var pdfurl = '/content/pdf/' + pdfArr[1];
  var aTag = $(contentStr).find("a[href = '" + pdfurl + "']");
  // get the title and author from different pages of website
  switch(locStr) {
    case "search":
                  var $closestLiEle = aTag.closest('li');
                  metaDataObj['title'] = $.trim($closestLiEle.find("h2 a.title").text());
                  metaDataObj['author'] = getAllAuthors($closestLiEle);
                  metaDataObj['snippet'] = $.trim($closestLiEle.find('.snippet').text());
                  metaDataObj['pubTitle'] = $.trim($closestLiEle.find('.publication-title').attr('title'));
                  var pubDate = $.trim($closestLiEle.find('.year').attr("title"));
                  metaDataObj['pubDate'] = addParentheses(pubDate);
                  break;
    case "article":
                  metaDataObj = getMetaData(contentStr);
                  break;
    case "chapter":
                  metaDataObj = getMetaData(contentStr);
                  break;
    case "journal":
                  var $closestLiEle = aTag.closest('li');
                  metaDataObj['title'] = $.trim($closestLiEle.find('h3').text());
                  metaDataObj['author'] = getAllAuthors($closestLiEle);
                  metaDataObj['snippet'] = $.trim($(contentStr).find('.abstract-content').text());
                  metaDataObj['pubTitle'] = $.trim($(contentStr).find('h1[id="title"]').text());
                  metaDataObj['pubDate'] = $.trim($closestLiEle.find('.date').text());
                  break;
    case "book":
                  var $closestLiEle = aTag.closest('li');
                  var isFMIOrBMIClass = $closestLiEle.is('.front-matter-item, .back-matter-item');
                  if($closestLiEle.length) {
                    if(isFMIOrBMIClass) {
                      metaDataObj['title'] = $.trim($closestLiEle.find('h3').text());
                    } else {
                      metaDataObj['title'] = $.trim($closestLiEle.find('.title').text());
                      metaDataObj['author'] = getAllAuthors($closestLiEle);
                    }
                  } else {
                    metaDataObj['title'] = $.trim($(contentStr).find('h1[id="title"]').text());
                    metaDataObj['author'] = $.trim($(contentStr).find('ul.authors li.author').text());
                  }

                  if(!isFMIOrBMIClass) {
                    metaDataObj['pubTitle'] = $.trim($(contentStr).find('div#publication-title').text());
                    var pubDate = $.trim($(contentStr).find('div#enumeration span.copyright-year').text());
                    metaDataObj['pubDate'] = addParentheses(pubDate);
                  }
                  break;
    default:
                  metaDataObj = getMetaData(contentStr);
                  if(!metaDataObj['title'])
                    metaDataObj['title'] = pdfArr[1];
                  break;
  }
  var date = Math.floor($.now()/1000);
  var insertStatement = "INSERT INTO download_pdf (local_file_path, pdf_url, article_title, author_name,abstract_content, publication_title, article_date, download_date) VALUES (?, ?, ?, ?,?,?,?,?)";
  db.transaction(function(tx) {
    tx.executeSql(insertStatement, [localFilePath, pdfUrl, metaDataObj['title'], metaDataObj['author'], metaDataObj['snippet'], metaDataObj['pubTitle'], metaDataObj['pubDate'], date], null, errorCallback); //insert data into database
  });
}

function getAllAuthors($closestLiEle) {
  var $authorsSpanEle = $closestLiEle.find('span.authors');
  var authorNames = '';
  $authorsSpanEle.children('a').each(function() {
    authorNames += $.trim($(this).text()) + ', ';
  });

  var $spanWithTitle = $authorsSpanEle.children('span[title]');
  if($spanWithTitle.length) {
    authorNames += $.trim($authorsSpanEle.children('span[title]').attr('title'));
  }

  if(authorNames) {
    if($spanWithTitle.length) {
      var lastIndex = authorNames.lastIndexOf(", et al");
      if(lastIndex > -1) {
        authorNames = authorNames.substr(0, lastIndex);
      }
    } else {
      authorNames = authorNames.replace(/,\s*$/, '');
    }
  }
  return authorNames;
}

function getMetaData(contentStr) {
  var metaDataObj = {
    'title'   : '',
    'author'  : '',
    'snippet' : '',
    'pubTitle': '',
    'pubDate' : ''
  };
  // metaDataObj['title'] = $.trim($(contentStr).find('h1[id="title"]').text());
  // metaDataObj['author'] = $.trim($(contentStr).find('li[class="author"]').text());
  // metaDataObj['snippet'] = $.trim($(contentStr).find('.abstract-content').text());
  // var pubTitleDiv = $(contentStr).find('#publication-title');
  // metaDataObj['pubTitle'] = $.trim(pubTitleDiv.text());
  // metaDataObj['pubDate'] = $.trim(pubTitleDiv.nextAll('span:first').text().split(',')[0]);


  metaDataObj['title'] = $.trim($(contentStr).find('div.MainTitleSection h1').text());

  var authorNames = '';
  $(contentStr).find('ul.AuthorNames li span.AuthorName').each(function() {
    authorNames += $.trim($(this).text()) + ', ';
  });
  if(authorNames) {
    authorNames = authorNames.replace(/,\s*$/, '');
    metaDataObj['author'] = authorNames;
  }

  metaDataObj['snippet'] = $.trim($(contentStr).find('section.Abstract p.Para').text());
  metaDataObj['pubTitle'] = $.trim($(contentStr).find('header#enumeration p:first a').text());
  var pubDate = $.trim($(contentStr).find('header#enumeration time:last').text());
  pubDate = pubDate.substr(pubDate.indexOf(' ') + 1);
  metaDataObj['pubDate'] = addParentheses(pubDate);
  return metaDataObj;
}

function addParentheses(str) {
  var str = $.trim(str);
  if(str) {
    str = '(' + str + ')';
  }
  return str;
}

function fail(evt) { // faliure event
  // console.log(evt.target.error.code);
}

function errorCallback(tx, error) {
  console.log(error.message);
}

function callBackFun(res) { // call function for forword & backwork button and change the class accordingly
  switch(res) {
    case "B_1":
                $(".btnPrevious").removeClass("lessOpacity");
                $(".btnNext").addClass("lessOpacity");
                break;
    case "F_1":
                $(".btnNext").removeClass("lessOpacity");
                $(".btnPrevious").addClass("lessOpacity");
                break;
    case "F_1B_1":
                $(".btnNext").removeClass("lessOpacity");
                $(".btnPrevious").removeClass("lessOpacity");
                break;
  }
}

function openPDF(PDF_url) {  // open the PDF in InAppBrowser when request comes from Objective-c
  var flag = true;
  var ref = window.open(PDF_url, "_blank", "location=no,enableViewportScale=yes");
  ref.addEventListener('loadstart', function() { // load start event
    // if(flag)
      //SpringerPlugin.startLoader(); // start loader
  });

  ref.addEventListener('loadstop', function() { // load stop event
    flag = false;
    //SpringerPlugin.stopLoader(); // stop loader
  });

  ref.addEventListener('exit', function() { // exit event
    ref.close(); // delete the ref
    //SpringerPlugin.stopLoader(); // stop loader
  });
}

function sortUsingNestedText(parent, childSelector, keySelector, flag) {
  var items = parent.children(childSelector).sort(function(a, b) {
    var vA = $(keySelector, a).text();
    var vB = $(keySelector, b).text();
    if(flag)
      return (vB < vA) ? -1 : (vA > vB) ? 1 : 0;
    else
      return (vA < vB) ? -1 : (vA > vB) ? 1 : 0;
  });
  parent.append(items);
}

// function for checking which page is calling
function getLocation() {
  var loc = window.location.href.split("/").pop();
  return loc;
}

// function for Total Articles Length
function getTotalArticlesLen() {
  var len = $(".pdfList li").length;
  return len;
}

// function for Selected Articles Length
function getSelectedArticlesLen() {
  var len = $("li .radio_active").length;
  return len;
}

// function for check visibility of element
function isVisible(eleId) {
  var flag = $('#'+eleId).is(':visible');
  return flag;
}

// function for close the drop-down
function closeDropdown(ddClass) {
  $('.'+ddClass).selectbox("close");
}

// function for changing the header position
function changeHeaderPostion() {
  if(isVisible('subheader'))
    $('.content').addClass('contentMore');
  else
    $('.content').removeClass('contentMore');
}

// function for Enable Or Disable button
function enableBtn(btnId, flag) {
  if(flag)
    $("#"+btnId).removeClass('deActive').removeAttr('disabled');
  else {
    $("#"+btnId).addClass('deActive').attr('disabled', 'true');
    if(btnId == "editDoneBtn")
      $("#"+btnId).text("Edit");
  }
}

// function for change select button text to Select All Or Deselect All
function changeBtnTextSelectAll(btnId, flag) {
  if(flag)
    $('#'+btnId).text("Select All").removeClass('colorBlue');
  else
    $('#'+btnId).text("Deselect All").addClass('colorBlue');
}

// function for select Or unselect a Article
function selectArticle(obj, flag) {
  if(flag)
    obj.removeClass('radio_deactive').addClass('radio_active');
  else
    obj.removeClass('radio_active').addClass('radio_deactive');
}

// function for changing the color of active li tag
function highlightSelected(obj, flag) {
  if(flag)
    obj.addClass('active').children('span').addClass('activeSpan');
  else
    obj.removeClass('active').children('span').removeClass('activeSpan');
}

// function for reset all the things when click the Done button
function resetAll() {
  selectArticle($('.radioBtn'), false);
  changeBtnTextSelectAll('selectDeselectBtn', true);
  enableBtn('deleteBtn', false);
}
