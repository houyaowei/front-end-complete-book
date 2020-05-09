// onconnect = function(e) {
//   let port = e.ports[0];
//   console.log('port:' ,port);
//   port.postMessage('Hello , shared web worker!');
// }

onconnect = function(e) {
  let port = e.ports[0];
  port.postMessage('Hello, shared web worker!');
  port.onmessage = function(e) {
  	 port.postMessage('pong'); 
   //e.target.postMessage('pong'); //这样也可以工作
  }
}