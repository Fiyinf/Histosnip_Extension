//When history page is opened, send message to background script to retrieve history from backend
chrome.runtime.sendMessage({
	"message": "get_history"
});

//When history data is ready, push into history element in popup.html
//TODO: Make it look nicer. 
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "history_ready") {
            document.getElementById("history").innerHTML = JSON.stringify(request.history, undefined, 2);
        }
    }
);


