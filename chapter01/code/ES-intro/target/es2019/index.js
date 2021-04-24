"use strict";

require("core-js/modules/es.array.flat.js");

require("core-js/modules/es.array.flat-map.js");

require("core-js/modules/es.array.unscopables.flat-map.js");

require("core-js/modules/es.object.entries.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.object.from-entries.js");

require("core-js/modules/es.string.trim.js");

require("core-js/modules/es.string.trim-start.js");

require("core-js/modules/es.string.trim-end.js");

var origin = [1, ['aa', 'bb'], [3, ['cc', 'dd']]];

var _flat = origin.flat(2);

console.log(_flat);
console.log(origin);

var duplicate = function duplicate(x) {
  return [x, x];
};

var result = [2, 3, 4].flatMap(duplicate);
console.log(result);

var _entry = Object.entries({
  name: "ass",
  age: 22
});

console.log(_entry);
var putorigin = Object.fromEntries(_entry);
console.log(putorigin);
var s = "  houyw  ";
console.log(s.trim());
console.log(s.trimStart());
console.log(s.trimEnd());