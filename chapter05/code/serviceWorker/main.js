/**
	创建XHR并获得json文件
*/
function createXHR(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "info.json", true);
    xhr.send();
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.querySelector(".view").innerHTML = xhr.responseText;
        }                
    }
        
}

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("./sw.js").then(cb => {
		console.log('service worker register successfully:', cb.scope);
	  if (cb.installing) {
          serviceWorker = cb.installing;
          document.querySelector('.result').innerHTML = 'installing';
      } else if (cb.waiting) {
          serviceWorker = cb.waiting;
          document.querySelector('.result').innerHTML = 'waiting';
      } else if (cb.active) {
          serviceWorker = cb.active;
          document.querySelector('.result').innerHTML = 'active';
      }
	}).catch(error => {
		console.log('register error:',error)
	});
}

document.querySelector('#show').addEventListener('click', () => {
  const c = document.querySelector('.container');
  c.style.display = 'block';
});

document.querySelector('#fetch').addEventListener('click', () => {
  createXHR();
});
