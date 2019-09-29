
//Listens for anytime a page is loaded on browser and asks background.js to get the page's url
$(document).ready( function() {
	chrome.runtime.sendMessage({
        "message": "get_current_url"
    });
});


//When page's url is ready, get the referrer for the page
//If google search results:
//	(For now) we can assume the page content is related to whatever the user searched so get search term
//	and use as topic for that page
//If not google search results:
//	Get page's html to be analyzed in backend
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.message === 'current_url_ready') {
		var uri = parseUri(request.current_url);
		//if on google search results page, wait for user to click on a result
		if (uri.host.indexOf('google')!=-1){
			if(uri.path=='/search'){
				$(document).on("click", "a", function() {
					//Get the search term, we'll use it as a topic
					var search_term = uri.queryKey.q.replace(/\+/g, " ");
					var href = $(this).attr("href");
					chrome.runtime.sendMessage({
						"message": "click_from_google",
						"url": href,
						"search_term": search_term
					});
				});
			}
		} else {
			//Referrer to page is not google search results
			if(request.referrer == null || request.referrer.length < 1 || request.referrer[0].indexOf('google')==-1){
				//Get page html. We'll clean and analyze the webpage's text for topics in the backend
				var pageHtml = getPageHtml();
				chrome.runtime.sendMessage({
					"message": "click_not_from_google",
					"url": request.current_url,
					"page_html": pageHtml,
					"base_url": window.location.origin
				})
			}
			
		}

	}
});


function getText() {
    return document.body.innerText;
}


function getPageHtml() {
	return document.body.outerHTML;
}




// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};