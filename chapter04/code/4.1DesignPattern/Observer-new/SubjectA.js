"use strict";
exports.__esModule = true;
var SubjectA = /** @class */ (function () {
    function SubjectA() {
        //保存所有的订阅者
        this.observers = [];
    }
    //注册
    SubjectA.prototype.register = function (observer) {
        var isExist = this.observers.indexOf(observer);
        if (isExist != -1) {
            return console.log('订阅者已经存在');
        }
        this.observers.push(observer);
        console.log("订阅者添加完成");
    };
    //移出
    SubjectA.prototype.remove = function (observer) {
        var observerIndex = this.observers.indexOf(observer);
        if (observerIndex === -1) {
            return console.log('要删除的订阅者不存在');
        }
        this.observers.splice(observerIndex, 1);
        console.log('订阅已删除');
    };
    SubjectA.prototype.notify = function () {
        for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
            var observer = _a[_i];
            // console.log(this)
            observer.update(this);
        }
    };
    SubjectA.prototype.setSteateToNotify = function () {
        this.state = Math.floor(Math.random() * (10 + 1));
        console.log("state\u5DF2\u7ECF\u66F4\u65B0\u4E3A: " + this.state + "\uFF0C\u5E76\u5F00\u59CB\u901A\u77E5");
        this.notify();
    };
    return SubjectA;
}());
exports["default"] = SubjectA;
