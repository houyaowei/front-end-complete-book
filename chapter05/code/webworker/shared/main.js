
let worker = new SharedWorker("./webworker.js","myWorker");
let logObj = document.querySelector(".log");


// worker.port.onmessage = function(e) { 
//   document.querySelector(".log").innerHTML =   e.data;
// }
//我们改用addEventListener
worker.port.addEventListener("message", (e) => {
	logObj.innerHTML += "\n" + e.data;
},false)

//如果是用的addEventListener,使用start方法启动是必须的
worker.port.start();
worker.port.postMessage('ping');