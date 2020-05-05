
let worker = new Worker("./webworker.js");

worker.postMessage({
	status: 0
})

worker.onmessage = function (event) {
	document.querySelector(".calc").innerHTML = event.data;
	worker.terminate();
}