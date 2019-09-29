//When Google search result is clicked, get snippet and send to background script
$(document).on("click", "a", function() {
	if ($(this).parent().parent().closest('div').attr('class').split(' ') == 'rc'){
		var href = $(this).attr("href");
		var rc = $(this).parent().parent();
		var snippet = rc.children('div.s').children('div').children('span.st').text()

		chrome.runtime.sendMessage({
            "message": "snippet_ready",
            "snippet": snippet,
            "url": href
        });
	}
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.message === 'find_snippet_in_page') {
		var length = request.search_array.length;
		if(length > 0) {
			scrollToSnippet(request.search_array, length);
		}
	}
});


//Finds parts of the snippet in the webpages innertext and scrolls to first match
//TODO: Highlight the found snippet (surprisingly really difficult :/)
//TODO: Should also be able to scroll to the other snippet hits on webpage which some keystroke combo
function scrollToSnippet(snipArray, aLength) {
	var foundSnippet = false;

	for (var i = 0; i < snipArray.length; i++ ) {
		if(getText().indexOf(snipArray[i]) > -1 && $("*:contains('" + snipArray[i] + "'):last").offset() !== null) {
			foundSnippet = true;
			$(window).scrollTop($("*:contains('" + snipArray[i] + "'):last").offset().top);
			break;
		}
	}

	if(!foundSnippet){
		chrome.runtime.sendMessage({
            "message": "notify_snippet_not_found"
        });
	}


	document.addEventListener ("keydown", function (zEvent) {
		//If user hits ctrl+alt+l scroll back to top of page
		if (zEvent.ctrlKey && zEvent.altKey && zEvent.key === "l") {
	    	document.body.scrollTop = document.documentElement.scrollTop = 0;
	    }
		// Keep search through document; needs work
	    // if (zEvent.ctrlKey  &&  zEvent.altKey  &&  zEvent.key === "k") {  
	    //     if (i < length) { i++; } else { i = 0; }
	    //     $(window).scrollTop($("*:contains('" + snipArray[i] + "'):last").offset().top);
	    // }
	});
}


function getText() {
    return document.body.innerText;
}


