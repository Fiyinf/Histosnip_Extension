const serverAddress = "http://127.0.0.1:5000"

//When extension icon clicked, open new tab and display history page
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({url: 'html/popup.html'});
})

//Listen for messages from other js pages
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        switch(request.message) {
            case 'snippet_ready':
                chrome.tabs.onUpdated.addListener(function (tabId , info) {
                    if (info.status === 'complete') {
                        //This makes sure that you only try to find a snippet in the page of the url you clicked from the google search results page.
                        //Unfortunately Chrome.tabs.query can only be called in the background script.
                        //Hence the sending of messages back and forth between background.js and the snippet.js where the information
                        //is actually needed.
                        chrome.tabs.query({'active': true, 'currentWindow': true}, function (tabs) {
                            var currentUrl = tabs[0].url;
                            if(currentUrl == request.url) {
                                findInPage(request.snippet, tabs[0].id);
                            }
                        });
                    }
                });
                break;
            case 'notify_snippet_not_found':
                createNotif('Did not find snippet in page', 'snippet_not_found');
                break;
            case 'get_current_url':
                chrome.tabs.query({'active': true, 'currentWindow': true}, function (tabs) {
                    chrome.tabs.executeScript(tabs[0].id, {
                        code: "document.referrer;"
                    },
                    function(result) {
                        chrome.tabs.sendMessage(tabs[0].id, {"message":"current_url_ready", "current_url":tabs[0].url, "referrer": result});
                    });  
                });
                break;
            case 'click_from_google':
                fetch(serverAddress +'/record_history', {
                    method: 'post',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "url": request.url,
                        "from_google": true,
                        "search_term": request.search_term
                    })
                }).catch((error) => {
                    createNotif('Could not record page in history', 'history_not_recorded');
                });
                break;
            case 'click_not_from_google':
                fetch(serverAddress +'/record_history', {
                    method: 'post',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "url": request.url,
                        "from_google": false,
                        "page_html": request.page_html,
                        "base_url": request.base_url
                    })
                }).catch((error) => {
                    createNotif('Could not record page in history', 'history_not_recorded');
                });
                break;
            case 'get_history':
                fetch(serverAddress + '/get_history', {
                    method: 'get',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    },
                })
                .then((result) => result.json())
                .then(function(data) {
                    chrome.runtime.sendMessage({
                        "message": "history_ready", 
                        "history": data
                    });
                })
                .catch((error) => {
                    createNotif('Could not get history', 'get_history_error');
                });
                break;
        }
    }
);


//Separate out snippet into array of every five words.
//This is because google snippets aren't always from the same part of the webpage
//or even entirely from the webpage.
//This way we search for parts of the snippet in the page and try to find a match
//Could be better?
function findInPage(snippet, currentTab) {
    const re = /\b[\w']+(?:[^\w\n]+[\w']+){0,4}\b/g;
    var snippetInSentences = snippet.match(re);
    chrome.tabs.sendMessage(currentTab, {"message":"find_snippet_in_page", "search_array": snippetInSentences, "current_tab": currentTab});
}

//Basic alert for when something goes wrong
function createNotif(message, notif_id) {
    var notifOptions = {
        type: 'basic',
        iconUrl: 'assets/icon48.jpg',
        title: 'Uh-oh',
        message: message
    }
    chrome.notifications.create(notif_id, notifOptions, function(id) {
        timer = setTimeout(function(){chrome.notifications.clear(id);}, 1300);
    });
}



