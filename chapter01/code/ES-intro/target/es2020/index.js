"use strict";

require("core-js/modules/es.array.slice.js");

require("core-js/modules/es.function.name.js");

require("core-js/modules/es.array.from.js");

require("core-js/modules/es.symbol.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.symbol.iterator.js");

require("core-js/modules/es.array.is-array.js");

require("core-js/modules/es.number.max-safe-integer.js");

require("core-js/modules/es.number.constructor.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/web.timers.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.promise.all-settled.js");

require("core-js/modules/es.string.iterator.js");

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.array.for-each.js");

require("core-js/modules/web.dom-collections.for-each.js");

require("core-js/modules/es.string.match-all.js");

var _travelPlans$tuesday, _travelPlans$monday, _false, _, _ref, _ref2;

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

console.log("--------matchAll-----------");
var string = 'Magic hex numbers: DEADBEEF CAFE';
var regex = /\b[0-9A-Fa-f]+\b/g;

var _iterator = _createForOfIteratorHelper(string.matchAll(regex)),
    _step;

try {
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    var match = _step.value;
    console.log(match);
  }
} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}

console.log("--------bigint-----------");
var bn = BigInt(Number.MAX_SAFE_INTEGER) + 2n;
console.log(bn);
var alsoHuge = BigInt(9007199254740991);
console.log(alsoHuge);
var hugeString = BigInt("9007199254740991");
console.log(hugeString);
var hugeHex = BigInt("0x1fffffffffffff");
console.log(hugeHex);
console.log("is BigInt:", typeof 2n === 'bigint');
console.log("--------Optional Chaining----------");
var travelPlans = {
  destination: "xi'an",
  monday: {
    location: "shangxi",
    time: "23:20",
    no: "mu5716"
  }
};
console.log((_travelPlans$tuesday = travelPlans.tuesday) === null || _travelPlans$tuesday === void 0 ? void 0 : _travelPlans$tuesday.location);
console.log((_travelPlans$monday = travelPlans.monday) === null || _travelPlans$monday === void 0 ? void 0 : _travelPlans$monday.location);
console.log("--------Nullish----------");
console.log((_false = false) !== null && _false !== void 0 ? _false : true); // => false

console.log((_ = 0) !== null && _ !== void 0 ? _ : 1); // => 0

console.log((_ref = '') !== null && _ref !== void 0 ? _ref : 'default'); // => ''

console.log((_ref2 = null) !== null && _ref2 !== void 0 ? _ref2 : []); // =>[]

console.log(undefined !== null && undefined !== void 0 ? undefined : []); // => []

console.log("--------Promise.allSettled----------");
var promise1 = Promise.resolve(3);
var promise2 = new Promise(function (resolve, reject) {
  return setTimeout(reject, 100, 'foo');
});
var promises = [promise1, promise2];
Promise.allSettled(promises).then(function (results) {
  return results.forEach(function (result) {
    return console.log(result.status);
  });
});