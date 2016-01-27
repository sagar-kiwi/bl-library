cordova.define("com.springer.springerplugin.SpringerPlugin", function(require, exports, module) { /*global cordova, module*/

module.exports = {
    movePageHandler: function(direction) {
		var args = {};
		if(direction)
			args.direction = direction;
		cordova.exec(null, null, "SpringerPlugin", "movePageHandler", [args]);
	},

	callWebBrowserHomePage: function() {
	    var args = {};
		cordova.exec(null, null, "SpringerPlugin", "callWebBrowserHomePage", [args]);
	},

	callArticlePage: function() {
	    var args = {};
		cordova.exec(null, null, "SpringerPlugin", "callArticlePage", [args]);
	},

	callWebBrowserPage: function() {
	    var args = {};
		cordova.exec(null, null, "SpringerPlugin", "callWebBrowserPage", [args]);
	},

	callOfflinePDF: function(filePath) {
	    var args = {};
		if(filePath)
			args.filePath = filePath;
		cordova.exec(null, null, "SpringerPlugin", "callOfflinePDF", [args]);
	},

	startLoader: function() {
	    var args = {};
		cordova.exec(null, null, "SpringerPlugin", "startLoader", [args]);
	},

	stopLoader: function() {
	    var args = {};
		cordova.exec(null, null, "SpringerPlugin", "stopLoader", [args]);
	},

	callback: function() {
	    var args = {};
		cordova.exec(null, null, "SpringerPlugin", "callback", [args]);
	}
};

});
