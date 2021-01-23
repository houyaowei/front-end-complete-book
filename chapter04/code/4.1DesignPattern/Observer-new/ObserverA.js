"use strict";
exports.__esModule = true;
var SubjectA_1 = require("./SubjectA");
var ObserverA = /** @class */ (function () {
    function ObserverA() {
    }
    ObserverA.prototype.update = function (subject) {
        // console.log("is ObserverA: " , subject instanceof SubjectInstance)
        if (subject instanceof SubjectA_1["default"] && subject.state < 13) {
            console.log('观察者A收到通知.');
        }
    };
    return ObserverA;
}());
exports["default"] = ObserverA;
