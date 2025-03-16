document.addEventListener("DOMContentLoaded", function () {
    const squareButton = document.querySelector("#square");
    const rectangleButton = document.querySelector("#rectangle");

    if (squareButton) {
        squareButton.addEventListener("click", () => {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs && tabs.length > 0) {
                    const tabId = tabs[0].id;
                    chrome.tabs.sendMessage(tabId, { action: "toggleSquare" }, function(response) {
                        console.log(response && response.status);
                      
                        chrome.tabs.reload(tabId);
                      
                   
                    });
                } else {
                    console.error("没有找到活动标签页");
                }
            });
        });
    }


    if (rectangleButton) {
        rectangleButton.addEventListener("click", () => {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs && tabs.length > 0) {
                    const tabId = tabs[0].id;
                    chrome.tabs.sendMessage(tabId, { action: "toggleRectangle" }, function(response) {
                        console.log(response && response.status);
                    });
                   
               
                } else {
                    console.error("没有找到活动标签页");
                }
            });
        });
    }
});
