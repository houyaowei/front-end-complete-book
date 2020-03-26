/**
 * 宏任务、微任务
 */
console.log("console-1");

setTimeout(() => {
  console.log("settimeout-1");
  Promise
    .resolve()
    .then(() => {
      console.log("promise-1")
    });
});

new Promise((resolve, reject) => {
  console.log("promise-2")
  resolve("promise-2-resolve")
}).then((data) => {
  console.log(data);
});

setTimeout(() => {
  console.log("settimeout-2");
});

console.log("console-2");

/**
 *
console-1
promise-2
console-2
promise-2-resolve
settimeout-1
promise-1
settimeout-2

 */