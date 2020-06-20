/**
 * 主文件入口
 */
const placeMapping = {
    "101110101" : "西安",
    "101020100": "上海",
    "101210101": "杭州",
    "101180501" : "平顶山",
    "101180505" : "叶县"
}
let currentPlace = null;

function buildCard(data) {
    let arr =[];
    data.forEach(function (item,index) {
        arr.push(`<ul class="b">
        <li>${item.date}</li>
        <li>${item.wea}</li>
        <li>最高温度：${item.tem_day}℃</li>
        <li>最低温度：${item.tem_night}℃</li>
        <li>${item.win}：${item.win_speed}</li>
        </ul>`)
    })
    return arr.join("")
}
document.getElementById("city").addEventListener("change", (e) => {
    document.getElementById("target").innerHTML = placeMapping[document.getElementById("city").value];

    let url = `https://www.tianqiapi.com/free/week?appid=68134783&appsecret=PblyiX1y&cityid=${e.target.value}`;
    fetch(url).then((res) => {
        return res.json()
      }).then(res => {
        currentPlace = res;
        document.getElementsByClassName("weather")[0].innerHTML = buildCard(res.data)
    })
});

// Registering Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").then(res => {
      console.log('Registration succeeded. Scope is ' + res.scope);
  });
}

let button = document.getElementById("notifications");
button.addEventListener("click", function (e) {
  Notification.requestPermission().then(function (result) {
      if (result === "granted") {
        sendNotification();
      }
    });
});

//Notification
function sendNotification() {

  let notifTitle = `天气已更新`;
  let notifBody = `地点：${currentPlace.city}， 更新时间 ${currentPlace.update_time}`;
  let options = {
    body: notifBody,
  };
  let notif = new Notification(notifTitle, options);
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
