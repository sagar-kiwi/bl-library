//
//  SpringerPlugin.h
//
//
//  Created by Nitin/Jitendra on 12-06-13.


#import <Cordova/CDV.h>

@interface SpringerPlugin : CDVPlugin {
    
}

// +(void) callArticlePage:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
+ (void) callArticlePage:(CDVInvokedUrlCommand*)command;
+ (void) callWebBrowserHomePage:(CDVInvokedUrlCommand*)command;
// - (void) movePageHandler:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-(void)movePageHandler:(CDVInvokedUrlCommand*)command;
// - (void) callWebBrowserHomePage:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

-(void) callWebBrowserHomePage:(CDVInvokedUrlCommand*)command;
// - (void) callArticlePage:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) callArticlePage:(CDVInvokedUrlCommand*)command;
// - (void) callWebBrowserPage:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-(void) callWebBrowserPage:(CDVInvokedUrlCommand*)command;
// - (void) callOfflinePDF:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-(void) callOfflinePDF:(CDVInvokedUrlCommand*)command;
// - (void) startLoader:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-(void) startLoader:(CDVInvokedUrlCommand*)command;
// - (void) stopLoader:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-(void) stopLoader:(CDVInvokedUrlCommand*)command;
// - (void) callback:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
-(void) callback:(CDVInvokedUrlCommand*)command;
@end
