(() => {
  function likePost() {
    const likeBtn = document.getElementsByClassName("react-button__trigger")[0];
    console.log("likeBtn", likeBtn);

    if (!likeBtn) {
      console.log("likeBtn not found");
      return;
    }

    // trigger like button only if it is not already pressed  == post is not liked yet
    likeBtn.click();
    if (likeBtn.ariaPressed === "false") {
      // trigger like button
    }
  }

  function delayAsync(delay) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }
  // contentScript.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "logic") {
      console.log("Message from background.js:", message);
      // Perform your content script logic here
      // Example: Manipulate the DOM of the current page
    likePost();
    sendResponse();

      
      // document.body.style.backgroundColor = "red";
      // setTimeout(() => {

      //     sendResponse();
      // }, 5000);

      // Signal completion to the background script
    }
  });
})();
