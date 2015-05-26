// WN2sIgvwGLABqF43Gt/dm2ZGWdTOaOYeOmohRyWKhp+IakotqWnxfE0AMsgoZZweNHvs5waJkUK8Lz7/UY30GsPEFJQzU7+N5RhQx+czqc8zqfCEmZRKKYt1sVf1jd6o07uc0gWvAEbfv18TCGR1X6GAk8IxVNoaZA1+OuXBK5pFo1rUkoxrxqTfq5mvxrgtQbd0Ey/alWXz8/QoKP67eC1rNgiE0TkX/fH+1wOg/5S6jQP12HGlM/S/2P8k2YlPnI5Y4xpZzzp+nfZrOQRZXU/m1Rz1QaaXIxYKTILDW4gPyndXJwJRjspkHQXAG8x5rbhFIvpUMmgXvIWo1k+QVA==
/**
** Copyright (C) 2000-2015 Opera Software ASA.  All rights reserved.
**
** This file is part of the Opera web browser.
**
** This script patches sites to work better with Opera
** For more information see http://www.opera.com/docs/browserjs/
**
** If you have comments on these patches (for example if you are the webmaster
** and want to inform us about a fixed site that no longer needs patching)
** please report issues through the bug tracking system
** https://bugs.opera.com/
**
** DO NOT EDIT THIS FILE! It will not be used by Opera if edited.
**/
(function(){
	if(location.href.indexOf('operabrowserjs=no')!=-1) {
		return;
	}
	var bjsversion = " Opera OPRDesktop 28.0 core 1750.0, May 20, 2015." +
					 " Active patches: 18 ";

	var href = location.href;
	var pathname = location.pathname;
	var hostname = location.hostname;

	/* We make references to the following functions to not get version that users
	have overwritten */
	var addEventListener = Window.prototype.addEventListener;
	var appendChild = Node.prototype.appendChild;
	var call = Function.prototype.call;
	var createElement = Document.prototype.createElement;
	var createTextNode = Document.prototype.createTextNode;
	var getElementsByTagName = Document.prototype.getElementsByTagName;
	var insertBefore = Node.prototype.insertBefore;
	var querySelector = Document.prototype.querySelector;
	var setAttribute = Element.prototype.setAttribute;
	var setTimeout = window.setTimeout;

	function log(str) {
		console.log("Opera has modified script or content on "
								+ hostname + " (" + str + "). See browser.js for details");
	}


	// Utility functions

	function addCssToDocument2(cssText, doc, mediaType){
		getElementsByTagName.call=addEventListener.call=createElement.call=createTextNode.call=setAttribute.call=appendChild.call=call;
		doc = doc||document;
		mediaType = mediaType||'';
		addCssToDocument2.styleObj=addCssToDocument2.styleObj||{};
		var styles = addCssToDocument2.styleObj[mediaType];
		if(!styles){
			var head = getElementsByTagName.call(doc, "head")[0];
			if( !head ){//head always present in html5-parsers, assume document not ready
				addEventListener.call(doc, 'DOMContentLoaded',
					function(){ addCssToDocument2(cssText, doc, mediaType); },false);
				return;
			}
			addCssToDocument2.styleObj[mediaType] = styles = createElement.call(doc, "style");
			setAttribute.call(styles, "type","text/css");
			if(mediaType)setAttribute.call(styles, "media", mediaType);
			appendChild.call(styles, createTextNode.call(doc,' '));
			appendChild.call(head, styles)
		}
		styles.firstChild.nodeValue += cssText+"\n";
		return true;
	}



	if((hostname.endsWith('.nic.in') || hostname.endsWith('.gov.in')) && hostname.includes('ssc')){
		if(hostname.match(/ssc(?:online)?2?\.(?:nic|gov)\.in/)) {
			document.addEventListener('DOMContentLoaded', function() {
				Object.defineProperty(window.navigator, "appName", {
					get: function() { return 'Opera'}
				});
			}, false)
		}
		
		log('PATCH-1173, ssc[online][2].{nic,gov}.in - Netscape not supported message - workaround browser sniffing');
	} else if(hostname.endsWith('.delta.com') || hostname.value == 'delta.com'){
		var UnsupportedBrowser;
		Object.defineProperty(window, "UnsupportedBrowser", {
			get: function(){return UnsupportedBrowser},
			set: function(arg) {
				arg.badBrowser=function(){return false};
				UnsupportedBrowser = arg;
			}
		});
		
		log('PATCH-1190, Delta.com shows browser warning to Opera 25');
	} else if(hostname.endsWith('.facebook.com') || hostname.value == 'facebook.com'){
		document.addEventListener("keypress", function(e) {
		    // check if it's first character here
		    if (e.target.textContent !== '')
		        return;
		    // check that it's a comment box
		    var element = e.target;
		    while (!element.classList.contains('UFIAddCommentInput')) {
		        element = element.parentElement;
		        if (!element)
		            return;
		    }
		    e.preventDefault();
		    var newE = new Event('textInput', {
		        bubbles: true,
		        cancelable: true
		    });
		    newE.data = String.fromCharCode(e.charCode);
		    e.target.dispatchEvent(newE);
		})
		log('PATCH-1195, Facebook - block first character in the comment field from triggering a single key keyboard shortcut');
	} else if(hostname.endsWith('.hao123.com') || hostname.value == 'hao123.com'){
		var expires = new Date();
		expires.setDate(expires.getDate()+14);
		document.cookie='toptip=100;expires='+expires.toGMTString()+';domain=.hao123.com;path=/';
		var topbanner = document.querySelector('.widget-topbanner');
		if(topbanner){
			topbanner.style.display='none';
		}
		
		log('PATCH-1194, remove topbanner on www.hao123.com');
	} else if(hostname.endsWith('.icloud.com') || hostname.value == 'icloud.com'){
		Object.defineProperty(window, "SC", {
			get: function(){return this.__SC__},
			set: function(arg) {
				if(!arg.hasOwnProperty('browser')) {
					Object.defineProperty(arg, "browser", {
						get: function(){return this.__browser__},
						set: function(arg) {
							arg.isChrome = true;
							arg.current = "chrome";
							arg.chrome = arg.version;
							this.__browser__ = arg;
						}
					});
				}
				this.__SC__ = arg;
			}
		});
		log('PATCH-1174, iCloud iWork new document stays blank - camouflage as Chrome');
	} else if(hostname.endsWith('.stanserhorn.ch') || hostname.value == 'stanserhorn.ch'){
		Object.defineProperty(navigator, 'vendor', { get: function(){ return 'Google Inc.' } });
		log('OTWK-21, stanserhorn.ch - fix UDM sniffing');
	} else if(hostname.endsWith('.vimeo.com') || hostname.value == 'vimeo.com'){
		var isPatched = false;
		function patch(){
			document.body.addEventListener('click',function(){
				if(isPatched)return
				if(document.querySelector('object') && document.querySelector('object').SetVariable === undefined ){
					addCssToDocument2('div.target{display:none !important;}');
					document.querySelector('div.player').addEventListener('mousedown',function(e){
						e.stopPropagation();
					},true);
				}
				isPatched = true;
			},false);
		}
		window.addEventListener('load',patch,false);
		log('PATCH-1166, vimeo.com - make click-to-play and turbo mode work');
	} else if(hostname.endsWith('itunesu.itunes.apple.com')){
		var _newUA = navigator.userAgent.replace(/ ?OPR.[0-9.]*/, '');
		Object.defineProperty(window.navigator, "userAgent", {
			get: function() {return _newUA}
		});
		
		log('PATCH-1187, iTunes U Course Manager - hide Opera tag');
	} else if(hostname.endsWith('my.tnt.com')){
		var _orig_clearPrintBlock;
		function handleMediaChange(mql) {
			if (mql.matches) {
				if(typeof clearPrintBlock == "function"){
					_orig_clearPrintBlock = clearPrintBlock;
					clearPrintBlock = function(){}
				}
			} else {
				if(typeof _orig_clearPrintBlock == "function"){
					setTimeout(_orig_clearPrintBlock, 500);
				}
			}
		}
		
		document.addEventListener('DOMContentLoaded', function() {
			var mpl = window.matchMedia("print");
			mpl.addListener(handleMediaChange);
		},false);
		log('PATCH-1156, my.tnt.com - fix empty printout');
	} else if(hostname.indexOf('.google.')>-1){
		/* Google */
	
	
		if(hostname.startsWith('docs.google.') || hostname.startsWith('drive.google.')){
			var timeout = 100;
			var fixit = function(target) {
				if(target.innerHTML.match(/\/\/support.google.com\/drive\/\?p=system_requirements"/)) {
					target.querySelector('[data-target="dismiss"]').click();
				}
			}
			var init = function() {
				var target = document.querySelector('#drive_main_page [aria-live="assertive"]');
				if(target) {
					var observer = new MutationObserver(function(mutations) {
						mutations.forEach(function(mutation) {
							if(mutation.type == 'childList' &&
								mutation.addedNodes.length == 1) {
								fixit(mutation.target);
							}
						});
						console.log('Google, please make sure your obfuscator does not change class names, so our patch continues working (or stop browser-sniffing as we both use and contribute to Blink!) - love, Opera.');
					});
					observer.observe(target, {childList: true, subtree: true});
					fixit(target);
				} else {
					setTimeout(init, timeout);
					timeout *= 2;
				}
			}
			document.addEventListener('DOMContentLoaded', init, false);
			
			log('PATCH-1191, Still an "unsupported browser" according to Google');
		}
		if(hostname.startsWith('mail.google.')){
			addCssToDocument2('div.n6 {display: block !important} table.cf.hX{display:inline-table}');//"more", labels
			log('PATCH-1163, No "More" button in Gmail and misaligned labels');
		}
		if(hostname.startsWith('translate.google.')){
			document.addEventListener('DOMContentLoaded',
				function(){
					var obj = '<object type="application/x-shockwave-flash" data="//ssl.gstatic.com/translate/sound_player2.swf" width="18" height="18" id="tts"><param value="//ssl.gstatic.com/translate/sound_player2.swf" name="movie"><param value="sound_name_cb=_TTSSoundFile" name="flashvars"><param value="transparent" name="wmode"><param value="always" name="allowScriptAccess"></object>';
					var aud = document.getElementById('tts');
					if(aud && aud instanceof HTMLAudioElement && aud.parentNode.childNodes.length == 1){
						aud.parentNode.innerHTML = obj;
					}
				}
			,false);
			log('PATCH-1148, Google Translate: use flash instead of mp3-audio');
		}
		if(pathname.indexOf('hangouts')==-1){
			var _newUA = navigator.userAgent.replace(/ ?OPR.[0-9.]*/, '');
			Object.defineProperty(window.navigator, "userAgent", {
				get: function() {return _newUA}
			});
			
			log('PATCH-1176, Navigation keys are not working on Google - hide Opera tag from userAgent for all sites except hangouts');
		}
	} else if(hostname.indexOf('.youtube.com')>-1){
		addCssToDocument2('#movie_player { z-index: 100 !important; }');
		log('PATCH-1185, youtube.com - show video above playlist');
	} else if(hostname.indexOf('opera.com')>-1&& pathname.indexOf('/docs/browserjs/')==0){
		document.addEventListener('DOMContentLoaded',function(){
			var browserjs_active = document.getElementById('browserjs_active');
			var browserjs_status_message = document.getElementById('browserjs_status_message');
			if(browserjs_active && browserjs_active.getElementsByTagName('span').length>0){
				browserjs_active.style.display='';
				browserjs_active.getElementsByTagName('span')[0].appendChild(document.createTextNode(bjsversion));
				if(browserjs_status_message){
					browserjs_status_message.style.display='none';
				}
			}
		}, false);
		log('1, Browser.js status and version reported on browser.js documentation page');
	} else if(href==='https://bugs.opera.com/wizarddesktop/'){
		document.addEventListener('DOMContentLoaded', function(){
			var frm;
			if(document.getElementById('bug') instanceof HTMLFormElement){
				frm=document.getElementById('bug');
				if(frm.auto)frm.auto.value+='\n\nBrowser JavaScript: \n'+bjsversion;
			}
		}, false);
		log('PATCH-221, Include browser.js timestamp in bug reports');
	} else if(pathname.indexOf('/AnalyticalReporting/')==0){
		if(pathname.indexOf('AnalyticalReporting/WebiModify.do')>-1 || pathname.indexOf('AnalyticalReporting/WebiCreate.do')>-1){
			Object.defineProperty(window, 'embed_size_attr', {
				get:function(){return this.__embed_size_attr__},
				set:function(arg){
					if(arg.split('"').length==2)arg+='"';
					this.__embed_size_attr__ = arg;
				}
			});	
		}
		log('PATCH-555, Analytix: add missing end quote');
	}

})();
