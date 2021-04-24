"use strict";

require("core-js/modules/esnext.string.replace-all.js");

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
var status = user2.isSuperMan && (user2.isSuperMan = goCode);
console.log(status); // " I go to coding"

console.log("--------??=-----------");
var x = null;
var y = "hello";
console.log((_x = x) !== null && _x !== void 0 ? _x : x = y); // "hello"

console.log(x = (_x2 = x) !== null && _x2 !== void 0 ? _x2 : y); // "hello