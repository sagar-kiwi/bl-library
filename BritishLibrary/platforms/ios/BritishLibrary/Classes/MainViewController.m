/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

//
//  MainViewController.h
//  BritishLibrary
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  Copyright ___ORGANIZATIONNAME___ ___YEAR___. All rights reserved.
//

#import "MainViewController.h"
#import "AppDelegate.h"
#import "SpringerPlugin.h"

@implementation MainViewController

- (id)initWithNibName:(NSString*)nibNameOrNil bundle:(NSBundle*)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Uncomment to override the CDVCommandDelegateImpl used
        // _commandDelegate = [[MainCommandDelegate alloc] initWithViewController:self];
        // Uncomment to override the CDVCommandQueue used
        // _commandQueue = [[MainCommandQueue alloc] initWithViewController:self];
    }
    return self;
}

- (id)init
{
    self = [super init];
    if (self) {
        // Uncomment to override the CDVCommandDelegateImpl used
        // _commandDelegate = [[MainCommandDelegate alloc] initWithViewController:self];
        // Uncomment to override the CDVCommandQueue used
        // _commandQueue = [[MainCommandQueue alloc] initWithViewController:self];
    }
    return self;
}

- (void)didReceiveMemoryWarning
{
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];

    // Release any cached data, images, etc that aren't in use.
}

#pragma mark View lifecycle

- (void)viewWillAppear:(BOOL)animated
{
    // View defaults to full size.  If you want to customize the view's size, or its subviews (e.g. webView),
    // you can do so here.

    [super viewWillAppear:animated];
    [self handleRotation];
}

- (void)viewDidAppear:(BOOL)animated
{

    [super viewDidAppear:animated];
    [self handleRotation];
}

-(void)dealloc
{
//    [super dealloc];
}

- (void)viewDidLoad
{
    self.view.backgroundColor = [UIColor clearColor];
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    screen = [UIScreen mainScreen];
    [self.webView setFrame:CGRectMake(0, self.view.bounds.size.height - 55, self.view.bounds.size.height, 55)];
    self.webView.autoresizingMask = UIViewAutoresizingNone;
    
    [[self.webView scrollView]setScrollEnabled:false];
    
    springerWebView = [[UIWebView alloc] initWithFrame:CGRectMake(0, [AppDelegate getInstance].yOffset, self.view.bounds.size.width, self.view.bounds.size.height - [AppDelegate getInstance].footerHeight)];
    springerWebView.autoresizingMask = UIViewAutoresizingNone;
    [self.view addSubview:springerWebView];
    [springerWebView setDelegate:self];
    
    
    [springerWebView.scrollView setBounces:false];
    NSURL *url = [NSURL URLWithString:@"http://link.springer.com"];
    NSURLRequest *request = [NSURLRequest requestWithURL:url];
    [springerWebView loadRequest:request];
   
    
    articleWebView = [[UIWebView alloc] initWithFrame:CGRectMake(0, [AppDelegate getInstance].yOffset, self.view.bounds.size.width, self.view.bounds.size.height - [AppDelegate getInstance].footerHeight)];
    [self.view addSubview:articleWebView];
    articleWebView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;

    [articleWebView setDelegate:self];
    
    [articleWebView.scrollView setBounces:false];
    articleWebView.hidden = YES;
    articleWebView.autoresizesSubviews = YES;
    if(![AppDelegate isNetConnectionAvailable]) {
//        [SpringerPlugin callArticlePage:NULL withDict:NULL ];
    }
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{

    [self handleRotation];
    // Return YES for supported orientations
    return (isIphone == NO);
}

- (void)handleRotation {
    
    springerWebView.frame = CGRectMake(0, [AppDelegate getInstance].yOffset,self.view.bounds.size.width, self.view.bounds.size.height - [AppDelegate getInstance].footerHeight);
    self.webView.frame = CGRectMake(0, self.view.bounds.size.height - 55,self.view.bounds.size.width, 55);
}

- (BOOL)shouldAutorotate {
    
    [self handleRotation];

    return (isIphone == NO);
}


- (NSUInteger)supportedInterfaceOrientations {
    
    return UIInterfaceOrientationMaskAll;
}

- (UIStatusBarStyle)preferredStatusBarStyle
{
    return UIStatusBarStyleBlackTranslucent;
}

/* Comment out the block below to over-ride */

/*
- (UIWebView*) newCordovaViewWithFrame:(CGRect)bounds
{
    return[super newCordovaViewWithFrame:bounds];
}
*/

#pragma mark UIWebDelegate implementation

- (void)webViewDidFinishLoad:(UIWebView*)theWebView
{
    // Black base color for background matches the native apps
    theWebView.backgroundColor = [UIColor clearColor];
    
    if(theWebView == springerWebView)
    {
        [[AppDelegate getInstance] showActivityIndicator:false];
        locURL = theWebView.request.URL;
        locURLString = [locURL absoluteString];
    }

//    theWebView.scrollView.alpha = 1;
    return [super webViewDidFinishLoad:theWebView];
}

/* Comment out the block below to over-ride */

- (void) webViewDidStartLoad:(UIWebView*)theWebView
{
//    theWebView.scrollView.alpha = 0.5;
    [[AppDelegate getInstance] showActivityIndicator:true];
    return [super webViewDidStartLoad:theWebView];
}

- (void) webView:(UIWebView*)theWebView didFailLoadWithError:(NSError*)error
{
//    theWebView.scrollView.alpha = 1;
    [[AppDelegate getInstance] showActivityIndicator:false];
    return [super webView:theWebView didFailLoadWithError:error];
}

- (BOOL) webView:(UIWebView*)theWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    if(theWebView == springerWebView)
    {
        NSString *jsCode = @"\
            $('#branding-logo, #logo').css({'background':'url(http://118.139.188.171/temp/BritishLibrary/img/bl_logo.png) no-repeat','background-size':'100% 100%'});\
            $('head').append('<link rel=\"stylesheet\" href=\"http://118.139.188.171/temp/BritishLibrary/css/bl_modern_link.css\">');\
            $('.content-pricing, #results-only-access, #results-teaser').hide();\
            $('#results-list').css('border-top', 'none');\
            $('head').append('<style>#coverImageUrl, .content-pricing, .price-disclaimer {display: none;} #abstract-actions .action.icon-epub a, #abstract-actions .action.icon-epub span {color: #c00;}</style>');\
            $(\"a[href*='mailto']\").removeAttr('href');";
        
        [springerWebView stringByEvaluatingJavaScriptFromString: jsCode];
        
        if(UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPhone)
            [springerWebView stringByEvaluatingJavaScriptFromString:@"$('#logo').css('background-size', '100% 75%');"];
        
        if(navigationType==UIWebViewNavigationTypeLinkClicked || navigationType == UIWebViewNavigationTypeFormSubmitted)
        {
            if(![AppDelegate isNetConnectionAvailable]) {
                UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Message"
                                                      message:@"Sorry, the network is not available."
                                                      delegate:self
                                                      cancelButtonTitle:@"OK"
                                                      otherButtonTitles:nil, nil];
                [alert show];
                [[AppDelegate getInstance] showActivityIndicator:false];
            }
            else
            {
                NSURL *url = [request URL];
                NSString *urlString = [url absoluteString];
                NSString *newString = [urlString lastPathComponent];
                NSString *ext = [newString pathExtension];
                
                if([urlString rangeOfString:@"search"].location != NSNotFound)
                {
                    if([urlString rangeOfString:@"showAll=false"].location == NSNotFound){
                        if([urlString rangeOfString:@"?"].location != NSNotFound){
                            urlString = [urlString stringByAppendingString:@"&showAll=false"];
                        }
                        else {
                            urlString = [urlString stringByAppendingString:@"?showAll=false"];
                        }
                        
                        NSURL *newURL = [[NSURL alloc] initWithString:urlString];
                        NSURLRequest *newURLReq = [[NSURLRequest alloc] initWithURL:newURL];
                        [springerWebView loadRequest:newURLReq];
                    }
                }
                
                if ([[url scheme] isEqualToString:@"http"] && [ext compare:@"pdf"] == NSOrderedSame)
                {
                    NSString *loc = [springerWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"location.href"]];
                    NSString *htmlStr = [springerWebView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"document.body.innerHTML.replace(/'/g, '&quot;')"]];
                    htmlStr = [htmlStr stringByReplacingOccurrencesOfString:@"\n" withString:@""];
                    htmlStr = [htmlStr stringByTrimmingCharactersInSet:[NSCharacterSet newlineCharacterSet]];
                    
                    [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"downloadFile('%@', '%@', '%@')", urlString, htmlStr, loc]];
                    [[AppDelegate getInstance] showActivityIndicator:false];
                    return NO;
                }
            }
        }
        NSString* callBackStr = @"";
        if(springerWebView.canGoForward){
            callBackStr = [callBackStr stringByAppendingString:@"F_1"];
        }
        if(springerWebView.canGoBack){
            callBackStr = [callBackStr stringByAppendingString:@"B_1"];
        }
        [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"callBackFun('%@')", callBackStr]];
    }
    return [super webView:theWebView shouldStartLoadWithRequest:request navigationType:navigationType];
}

@end

@implementation MainCommandDelegate

/* To override the methods, uncomment the line in the init function(s)
   in MainViewController.m
 */

#pragma mark CDVCommandDelegate implementation

- (id)getCommandInstance:(NSString*)className
{
    return [super getCommandInstance:className];
}

/*
   NOTE: this will only inspect execute calls coming explicitly from native plugins,
   not the commandQueue (from JavaScript). To see execute calls from JavaScript, see
   MainCommandQueue below
*/
- (BOOL)execute:(CDVInvokedUrlCommand*)command
{
    return true;
//    return [super execute:command];
}

- (NSString*)pathForResource:(NSString*)resourcepath;
{
    return [super pathForResource:resourcepath];
}

@end

@implementation MainCommandQueue

/* To override, uncomment the line in the init function(s)
   in MainViewController.m
 */
- (BOOL)execute:(CDVInvokedUrlCommand*)command
{
    return [super execute:command];
}

@end
