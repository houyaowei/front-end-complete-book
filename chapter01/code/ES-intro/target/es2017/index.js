"use strict";

require("core-js/modules/es.object.values.js");

require("core-js/modules/es.object.entries.js");

require("core-js/modules/es.string.pad-start.js");

require("core-js/modules/es.string.pad-end.js");

require("core-js/modules/es.object.get-own-property-descriptors.js");

var obj = {
  foo: "bar",
  baz: 42
};
console.log(Object.values(obj));
var person = {
  name: "houyw",
  age: 19
};
console.log(Object.entries(person));
var people = ['Fred', 'Tony'];
console.log(Object.entries(people));
"x".padStart(4, "ab"); // 'abax'

"x".padEnd(5, "ab"); // 'xabab'

console.log(Object.getOwnPropertyDescriptors(person));