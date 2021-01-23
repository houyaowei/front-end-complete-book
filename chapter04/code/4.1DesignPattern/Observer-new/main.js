"use strict";
exports.__esModule = true;
var SubjectA_1 = require("./SubjectA");
var ObserverA_1 = require("./ObserverA");
var ObserverB_1 = require("./ObserverB");
//发布者对象
var subject = new SubjectA_1["default"]();
//订阅者声明并增加到观察者列表
var observer1 = new ObserverA_1["default"]();
subject.register(observer1);
var observer2 = new ObserverB_1["default"]();
subject.register(observer2);
console.log("---------------");
//通知两次
subject.setSteateToNotify();
console.log("---------------");
subject.remove(observer2);
subject.setSteateToNotify();
