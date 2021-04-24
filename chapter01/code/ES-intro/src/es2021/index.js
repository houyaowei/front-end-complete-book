'aabbcc'.replaceAll('b', '_'); // aa__cc
const queryString = 'q=b+c+d';
let newStr = queryString.replaceAll('+', ''); //q=bcd
console.log(newStr); 

console.log("--------&&=-----------")

const deleteUsers = () => {
  return "users is empty";
};

const user = {
  id: "71002",
  name: "houyw",
  isAdmin: true
};
let users = user.isAdmin &&= deleteUsers();
console.log(users)

console.log("--------||=-----------")
let goCode =" I go to coding"
const user2 = {
  id: "71002",
  name: "houyw",
  isSuperMan: false
};
let status = user2.isSuperMan ||= goCode;
console.log(status); // " I go to coding"

console.log("--------??=-----------")
let x = null;
let y = "hello";
console.log((x ??= y)); // "hello"
console.log((x = x ?? y)); // "hello


console.log("--------WeakRef-----------")
// no ployfill in core-js
// const myWeakRef = new WeakRef({ 
//   name: 'Cache', 
//   size: 'unlimited' 
// }) 
// console.log(myWeakRef.deref()) 

console.log("--------Promise.any-----------")
const promise1 = new Promise((resolve, reject) => {
  reject("失败");
});

const promise2 = new Promise((resolve, reject) => {
  setTimeout(resolve, 500, "slower");
});

const promise3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, "faster");
});

const promises = [promise1, promise2, promise3];

Promise.any(promises).then((value)=>console.log(value));
