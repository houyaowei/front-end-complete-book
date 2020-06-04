/**
 * 主文件入口
 */
function buildCard(data) {}
document.getElementById("city").addEventListener("change", (e) => {
    let url = `https://www.tianqiapi.com/free/week?appid=68134783&appsecret=PblyiX1y&cityid=${e.target.value}`;
    console.log(url);
    $.getJSON(url).then((res) => {
        console.log(res);
      });
  });

// let content = "";
// document.getElementById("content").innerHTML = content;

// Registering Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}

let button = document.getElementById("notifications");
button.addEventListener("click", function (e) {
  Notification.requestPermission().then(function (result) {
      if (result === "granted") {
        randomNotification();
      }
    });
});

//Notification
function randomNotification() {
  let randomItem = Math.floor(Math.random());
  let notifTitle = games[randomItem].name;
  let notifBody = "Created by .";
  let notifImg = "data/img/.jpg";
  let options = {
    body: notifBody,
    icon: notifImg
  };
  let notif = new Notification(notifTitle, options);
  setTimeout(randomNotification, 30000);
}

// Progressive loading images
let imagesToLoad = document.querySelectorAll("img[data-src]");
let loadImages = function (image) {
  image.setAttribute("src", image.getAttribute("data-src"));
  image.onload = function () {
    image.removeAttribute("data-src");
  };
};

if ("IntersectionObserver" in window) {
  let observer = new IntersectionObserver(function (items, observer) {
    items
      .forEach(function (item) {
        if (item.isIntersecting) {
          loadImages(item.target);
          observer.unobserve(item.target);
        }
      });
  });
  imagesToLoad.forEach(function (img) {
    observer.observe(img);
  });
} else {
  imagesToLoad
    .forEach(function (img) {
      loadImages(img);
    });
}
