chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "processLinks") {
      console.log("Message from popup.js:", message);
      const { links } = message;
  
      processLinks(links);
  
      function processLinks(links) {
        if (links.length === 0) {
          return;
        }
  
        const firstLink = links.shift();
  
        const tabProperties = { url: firstLink, active: true };
  
        chrome.tabs.create(tabProperties, (tab) => {
          waitForPageLoad(tab, links);
        });
      }
  
      function waitForPageLoad(tab, links) {
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
          if (tabId === tab.id && changeInfo.status === "complete") {
            chrome.tabs.onUpdated.removeListener(listener);
  
            setTimeout(() => {
              performLogicInTab(tab, () => {
                processNextLink(tab, links);
              });
            }, 2000); // Delay of 2000 milliseconds (adjust as needed)
          }
        });
      }
  
      function processNextLink(tab, links) {
        if (links.length === 0) {
          return;
        }
  
        const nextLink = links.shift();
  
        chrome.tabs.update(tab.id, { url: nextLink }, () => {
          waitForPageLoad(tab, links);
        });
      }
  
      function performLogicInTab(tab, callback) {
        chrome.tabs.sendMessage(tab.id, { type: "logic" }, (response) => {
          console.log("Received response from content script:", response);
          // Handle the response from the content script if needed
  
          // Call the callback function to proceed to the next link
          if (typeof callback === "function") {
            callback();
          }
        });
      }
    }
  });
  