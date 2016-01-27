//
//  SpringerPlugin.m
//
//
//  Created by Nitin/Jitendra on 12-06-13.

#import "SpringerPlugin.h"
#import "MainViewController.h"
#import "AppDelegate.h"

@implementation SpringerPlugin
CDVViewController* viewController;

// - (void) movePageHandler:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
// {
- (void) movePageHandler:(CDVInvokedUrlCommand *)command{

    NSString* directionString = [[command.arguments objectAtIndex:0] objectForKey:@"direction"];
//    NSString* directionString = [command.arguments objectAtIndex:0 ];
//    NSLog(@"%@", directionString);
    if(directionString)
    {
        if(springerWebView.canGoForward)
        {
            [springerWebView goForward];
        }
    }
    else
    {
        if(springerWebView.canGoBack)
        {
            [springerWebView goBack];
        }
    }
}

// + (void) callWebBrowserHomePage:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
+ (void) callWebBrowserHomePage:(CDVInvokedUrlCommand *)command{
    
    NSURL *url = [NSURL URLWithString:@"http://link.springer.com"];
    NSURLRequest *request = [NSURLRequest requestWithURL:url];
    [springerWebView loadRequest:request];
    [[AppDelegate getInstance] showActivityIndicator:false];
}

// - (void) callWebBrowserHomePage:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
- (void) callWebBrowserHomePage:(CDVInvokedUrlCommand *)command{
    
    NSURL *url = [NSURL URLWithString:@"http://link.springer.com"];
    NSURLRequest *request = [NSURLRequest requestWithURL:url];
    [springerWebView loadRequest:request];
}

// + (void) callArticlePage:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
+ (void) callArticlePage:(CDVInvokedUrlCommand *)command{
    
    [[AppDelegate getInstance] showActivityIndicator:false];
    springerWebView.hidden = YES;
    articleWebView.hidden = NO;
    MainViewController *controller = (MainViewController *)((AppDelegate *)[UIApplication sharedApplication].delegate).viewController;
    
    if(viewController != nil)
    {
        [viewController.view removeFromSuperview];
        viewController = nil;
    }
    viewController = [[CDVViewController alloc] init];
    viewController.wwwFolderName = @"www";
    viewController.startPage = @"articles.html";
   //viewController.useSplashScreen = NO;
    viewController.view.frame = CGRectMake(0, 0, controller.view.bounds.size.width, controller.view.bounds.size.height - [AppDelegate getInstance].footerHeight);
    [articleWebView addSubview:viewController.view];
}

// - (void) callArticlePage:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
- (void) callArticlePage:(CDVInvokedUrlCommand *)command{
    
    [[AppDelegate getInstance] showActivityIndicator:false];
    springerWebView.hidden = YES;
    articleWebView.hidden = NO;
    MainViewController *controller = (MainViewController *)((AppDelegate *)[UIApplication sharedApplication].delegate).viewController;
    
    if(viewController != nil)
    {
        [viewController.view removeFromSuperview];
        viewController = nil;
    }
    viewController = [[CDVViewController alloc] init];
    viewController.wwwFolderName = @"www";
    viewController.startPage = @"articles.html";
    //    viewController.useSplashScreen = NO;
    viewController.view.frame = CGRectMake(0, 0, controller.view.bounds.size.width, controller.view.bounds.size.height - [AppDelegate getInstance].footerHeight);
    [articleWebView addSubview:viewController.view];
}

// - (void) callWebBrowserPage:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
- (void) callWebBrowserPage:(CDVInvokedUrlCommand *)command{
    
    springerWebView.hidden = NO;
    articleWebView.hidden = YES;
    if(!springerWebView.canGoForward && !springerWebView.canGoBack)
    {
        [SpringerPlugin callWebBrowserHomePage:NULL];
    }
}

// - (void) callOfflinePDF:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
- (void) callOfflinePDF:(CDVInvokedUrlCommand *)command{
    
    NSString* filePath = [[command.arguments objectAtIndex:0] valueForKey:@"filePath"];
//    NSString* filePath = [options valueForKey:@"filePath"];
    
    MainViewController *controller = (MainViewController *)((AppDelegate *)[UIApplication sharedApplication].delegate).viewController;
    [controller.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"openPDF('%@')", filePath]];
}

// - (void) startLoader:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
- (void) startLoader:(CDVInvokedUrlCommand *)command{
    
    [[AppDelegate getInstance] showActivityIndicator:true];
}

// - (void) stopLoader:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
- (void) stopLoader:(CDVInvokedUrlCommand *)command{
    
    [[AppDelegate getInstance] showActivityIndicator:false];
}

// - (void) callback:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
// {
- (void) callback:(CDVInvokedUrlCommand *)command{
    
    MainViewController *controller = (MainViewController *)((AppDelegate *)[UIApplication sharedApplication].delegate).viewController;
    self.webView.frame = CGRectMake(0, 0, controller.view.bounds.size.width, controller.view.bounds.size.height - [AppDelegate getInstance].footerHeight);
}
@end
