// window.plugins.SpringerPlugin
// SpringerPlugin : all args optional

function SpringerPlugin() {}

SpringerPlugin.prototype.movePageHandler = function(direction) {

	var args = {};
	if(direction)
		args.direction = direction;
	cordova.exec(null, null, "SpringerPlugin", "movePageHandler", [args]);
}

SpringerPlugin.prototype.callWebBrowserHomePage = function() {
    
    var args = {};
	cordova.exec(null, null, "SpringerPlugin", "callWebBrowserHomePage", [args]);
}

SpringerPlugin.prototype.callArticlePage = function() {
    
    var args = {};
	cordova.exec(null, null, "SpringerPlugin", "callArticlePage", [args]);
}

SpringerPlugin.prototype.callWebBrowserPage = function() {
    
    var args = {};
	cordova.exec(null, null, "SpringerPlugin", "callWebBrowserPage", [args]);
}

SpringerPlugin.prototype.callOfflinePDF = function(filePath) {
    
    var args = {};
	if(filePath)
		args.filePath = filePath;
	cordova.exec(null, null, "SpringerPlugin", "callOfflinePDF", [args]);
}

SpringerPlugin.prototype.startLoader = function() {
    
    var args = {};
	cordova.exec(null, null, "SpringerPlugin", "startLoader", [args]);
}

SpringerPlugin.prototype.stopLoader = function() {
    
    var args = {};
	cordova.exec(null, null, "SpringerPlugin", "stopLoader", [args]);
}

SpringerPlugin.prototype.callback = function() {
    
    var args = {};
	cordova.exec(null, null, "SpringerPlugin", "callback", [args]);
}

// this will be forever known as the orch-func -jm
cordova.addConstructor(function() {

	if (!window.plugins) {
		window.plugins = {};
	}
					  
	// shim to work in 1.5 and 1.6
	if (!window.Cordova) {
		window.Cordova = cordova;
	};
					   
	window.plugins.springerPlugin = new SpringerPlugin();
});
