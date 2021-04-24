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
let status = user2.isSuperMan &&= goCode;
console.log(status); // " I go to coding"

console.log("--------??=-----------")
let x = null;
let y = "hello";
console.log((x ??= y)); // "hello"
console.log((x = x ?? y)); // "hello