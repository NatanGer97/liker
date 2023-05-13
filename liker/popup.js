import { urls } from "./urls.js";
import { getActiveTabURL } from "./utils.js";

let user;

document.addEventListener("DOMContentLoaded", async function () {
  isNewUser();
  await getUser();
  initLikeBtn();
  const activeTab = await getActiveTabURL();
  if (!activeTab.url.includes("web.whatsapp.com")) {
    const container = document.getElementsByClassName("container")[0];
    container.innerHTML =
      '<div class="container">This is not a valid  page.</div>';
  }
});

const getNotLikedLinksFromDB = async (groupName, minusDays) => {
  try {
    const user = await getUser();

    const url = `${urls.notLikedLinks}?user_uuid=${user}&minus_days=${minusDays}&group_name=${groupName}`;
    const results = await fetch(url, { method: "GET" });
    const resultsAsJson = await results.json();
    console.log("results", resultsAsJson);
    // globalLinks = resultsAsJson;
    return resultsAsJson;
  } catch (error) {
    console.log("error", error);
  }
};

const getGroupName = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "getGroupName" },
        function (response) {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          }
          if (response && response.groupName) {
            const groupName = response.groupName;
            console.log("Group Name:", groupName);
            resolve(groupName);
          } else {
            console.log("Group name not found.");
            resolve(null);
          }
        }
      );
    });
  });
};

const likeClickHandler = async (event) => {
  const likeRangeInput = document.getElementById("like-range");
  const minusDays = likeRangeInput.value;
  const activeTab = await getActiveTabURL();
  let groupName = await getGroupName();

  let links = await getNotLikedLinksFromDB(groupName, minusDays);
  console.log("links", links);
  let fittingLinksToLike = [];


  let likedLinksForReq = [];
  for (let link of links) {
    if (!fittingLinksToLike.includes(link.link)) {
      fittingLinksToLike.push(link.link);
      likedLinksForReq.push(link);
    }
  }

  // console.log("fittingLinksToLike", fittingLinksToLike);
  // links = [
  //   "https://www.linkedin.com/posts/nivitzhaky_potfolio-juniordeveloper-gethired-activity-7061228133311520768-EUnp?utm_source=share&utm_medium=member_desktop",
  //   "https://www.linkedin.com/posts/nivitzhaky_devops-activity-7060879940476444672-CO0U?utm_source=share&utm_medium=member_desktop",
  //   "https://www.linkedin.com/posts/nivitzhaky_devops-jenkins-github-activity-7061618358328131584-vDRE?utm_source=share&utm_medium=member_desktop",
  // ];

  // send like req to server

  // console.log("likedLinksForReq", likedLinksForReq);

  if (likedLinksForReq.length > 0) {
    sendLikeRequest(likedLinksForReq);
    chrome.runtime.sendMessage({ type: "processLinks", links: fittingLinksToLike });
  } else {
    alert("No links to like");
  }
};

const sendLikeRequest = async (links = []) => {
  const user = await getUser();
  let linksToLike = [];
  for (let link of links) {
    linksToLike.push({ linkId: link.id, liked_by: user });
  }

  const body = JSON.stringify(linksToLike);
  try {
    const results = await fetch(urls.likeLinks, {
      method: "POST",
      body: body,
      headers: { "Content-Type": "application/json" },
    });
    const resultsAsJson = await results.json();
    // console.log("results", resultsAsJson);
  } catch (error) {
    console.log("error", error);
  }
};

const initLikeBtn = () => {
  const likeBtn = document.getElementById("likesBtn");
  likeBtn.addEventListener("click", likeClickHandler);
};

const getUser = async () => {
  user = (await chrome.storage.local.get("user")).user;

  return user;
};

function isNewUser() {
  chrome.storage.local.get("user", function (result) {
    if (!result.user) {
      console.log("new user");
      createNewUser();
    } else {
      console.log(result.user);
      console.log("user exist");
    }
  });
}

async function createNewUser() {
  // send request to server to create uuid

  try {
    const results = await fetch(urls.createUser, { method: "POST" });
    const resultsAsJson = await results.json();
    console.log("new user", JSON.stringify(resultsAsJson));
    chrome.storage.local.set({ user: resultsAsJson.user_uuid });
  } catch (error) {
    console.log("error", error);
  }
}
