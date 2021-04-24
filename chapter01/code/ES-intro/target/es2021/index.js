"use strict";

require("core-js/modules/esnext.string.replace-all.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/web.timers.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.string.iterator.js");

require("core-js/modules/esnext.promise.any.js");

require("core-js/modules/web.dom-collections.iterator.js");

var _x, _x2;

'aabbcc'.replaceAll('b', '_'); // aa__cc

var queryString = 'q=b+c+d';
var newStr = queryString.replaceAll('+', ''); //q=bcd

console.log(newStr);
console.log("--------&&=-----------");

var deleteUsers = function deleteUsers() {
  return "users is empty";
};

var user = {
  id: "71002",
  name: "houyw",
  isAdmin: true
};
var users = user.isAdmin && (user.isAdmin = deleteUsers());
console.log(users);
console.log("--------||=-----------");
var goCode = " I go to coding";
var user2 = {
  id: "71002",
  name: "houyw",
  isSuperMan: false
};
var status = user2.isSuperMan || (user2.isSuperMan = goCode);
console.log(status); // " I go to coding"

console.log("--------??=-----------");
var x = null;
var y = "hello";
console.log((_x = x) !== null && _x !== void 0 ? _x : x = y); // "hello"

console.log(x = (_x2 = x) !== null && _x2 !== void 0 ? _x2 : y); // "hello

console.log("--------WeakRef-----------"); // no ployfill in core-js
// const myWeakRef = new WeakRef({ 
//   name: 'Cache', 
//   size: 'unlimited' 
// }) 
// console.log(myWeakRef.deref()) 

console.log("--------Promise.any-----------");
var promise1 = new Promise(function (resolve, reject) {
  reject("失败");
});
var promise2 = new Promise(function (resolve, reject) {
  setTimeout(resolve, 500, "slower");
});
var promise3 = new Promise(function (resolve, reject) {
  setTimeout(resolve, 100, "faster");
});
var promises = [promise1, promise2, promise3];
Promise.any(promises).then(function (value) {
  return console.log(value);
});