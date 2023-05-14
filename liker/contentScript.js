(() => {
  let groupChatName = "";

  function likePost() {
    const likeBtn = document.querySelector(".react-button__trigger");
    if (!likeBtn) {
      // console.log("likeBtn not found");
      return;
    }

    if (likeBtn.ariaPressed === "false") {
      likeBtn.click();
    }
  }

  function getGroupChatName() {
    const chatHeaderTitle = document.querySelector(
      'span[data-testid="conversation-info-header-chat-title"]'
    );
    groupChatName = chatHeaderTitle.textContent;
    // console.log("groupChatName", groupChatName);
    return groupChatName;
  }

  function extractLinksFromMessages(messages) {
    const fittingLinks = [];

    for (const message of messages) {
      const messageContainer = message.querySelector("div.copyable-text");

      if (messageContainer == null) continue;

      const messageData = messageContainer.getAttribute("data-pre-plain-text");
      const dateRegex = /\[(\d{2}:\d{2}), (\d{1,2}[./]\d{1,2}[./]\d{4})\]/;
      const dateMatch = messageData.match(dateRegex);

      const links = messageContainer.getElementsByTagName("a");
      for (const link of links) {
        const href = link.href;
        if (
          href.startsWith("https://www.linkedin.com/") &&
          !fittingLinks.includes(href)
        ) {
          fittingLinks.push({
            link: href,
            // date: dateAndTime,
            groupName: groupChatName,
          });
        }
      }

      // if (dateMatch) {
      //   const date = formatDate(dateMatch[2]);
      //   if (date === null) continue; // Skip this message if the date format is unknown
      //   const time = dateMatch[1];
      //   const dateAndTime = `${date} ${time}`;

      //   const links = messageContainer.getElementsByTagName("a");

      //   for (const link of links) {
      //     const href = link.href;
      //     if (
      //       href.startsWith("https://www.linkedin.com/") &&
      //       !fittingLinks.includes(href)
      //     ) {
      //       fittingLinks.push({
      //         link: href,
      //         date: dateAndTime,
      //         groupName: groupChatName,
      //       });
      //     }
      //   }
      // }
    }

    return fittingLinks;
  }

  function formatDate(date) {
    // Check the date format
    if (date.includes("/")) {
      // Format: MM/DD/YYYY
      const [month, day, year] = date.split("/");
      date = `${year}-${month}-${day}`;
      return date;
    } else if (date.includes(".")) {
      // Format: DD.MM.YYYY
      const [day, month, year] = date.split(".");
      date = `${year}-${month}-${day}`;
      return date;
    } else {
      // Handle unknown date format
      // console.log("Unknown date format:", date);
      return null;
    }
    /* const [month, day, year] = date.split("/");
    return `${year}-${month}-${day}`; */
  }

  function delayAsync(delay) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }

  const addLinksToDB = (links = []) => {
    fetch("https://chrome.likemeplease.com/links/addLinks", {
      method: "POST",
      body: JSON.stringify(links),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        response.json().then((data) => {
          // console.log("saved data", data);
        });
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const onChatScrollHandler = throttle(() => {
    const chat = document.querySelector("div._2gzeB");
    const messages = chat.querySelectorAll(
      ".cm280p3y.to2l77zo.n1yiu2zv.ft2m32mm.oq31bsqd.e1yunedv"
    );

    const extractedLinks = extractLinksFromMessages(messages);
    if (extractedLinks.length > 0) {
      addLinksToDB(extractedLinks);
    }
  }, 2000); // Throttle delay of 2000 milliseconds

  function handleSidePanelClick(event) {
    getGroupChatName();
    const chat = document.querySelector("div._2gzeB");
    const messagesPanel = chat.querySelector(
      'div._5kRIK[data-testid="conversation-panel-messages"]'
    );

    messagesPanel.addEventListener("scroll", onChatScrollHandler);
  }

  function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;

    return function (...args) {
      const currentTime = Date.now();
      const timeSinceLastExec = currentTime - lastExecTime;

      if (timeSinceLastExec >= delay) {
        clearTimeout(timeoutId);
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - timeSinceLastExec);
      }
    };
  }

  const onPagedLoaded = () => {
    const sidePanel = document.getElementById("pane-side");

    const handleClickOnSidePanel = (event) => {
      getGroupChatName();
      const chat = document.querySelector("div._2gzeB");
      const messagesPanel = chat.querySelector(
        'div._5kRIK[data-testid="conversation-panel-messages"]'
      );

      messagesPanel.addEventListener("scroll", onChatScrollHandler);
    };

    sidePanel.addEventListener("click", handleSidePanelClick);
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.log("message", message);
    if (message.type === "NEW") {
      onPagedLoaded();
    }
    if (message.type === "logic") {
      // console.log("Message from background.js:", message);
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

    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.type === "getGroupName") {
          const name  = getGroupChatName();
          sendResponse({ groupName: name });
        }
      });
      
  });
})();
