"use strict";
exports.__esModule = true;
var SubjectA_1 = require("./SubjectA");
var ObserverB = /** @class */ (function () {
    function ObserverB() {
    }
    ObserverB.prototype.update = function (subject) {
        // console.log("is observerB: " , subject instanceof SubjectInstance)
        if (subject instanceof SubjectA_1["default"] && (subject.state < 8)) {
            console.log('--观察者B收到通知--');
        }
    };
    return ObserverB;
}());
exports["default"] = ObserverB;
