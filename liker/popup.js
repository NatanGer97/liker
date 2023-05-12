document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("btnTest");
  btn.addEventListener("click", function () {
    // const links = [
    //   "https://www.google.com",
    //   "https://www.walla.co.il",
    //   "https://www.youtube.com",
    // ];
    const links = [
        "https://www.linkedin.com/posts/nivitzhaky_devops-jenkins-github-activity-7061618358328131584-vDRE?utm_source=share&utm_medium=member_desktop",
        "https://www.linkedin.com/posts/nivitzhaky_build-a-chrome-extension-course-for-beginners-activity-7061956189898629120-bcmw?utm_source=share&utm_medium=member_desktop",
        "https://www.linkedin.com/posts/nivitzhaky_potfolio-juniordeveloper-gethired-activity-7061228133311520768-EUnp?utm_source=share&utm_medium=member_desktop",
      ];

    chrome.runtime.sendMessage({ type: "processLinks", links });
  });
});
