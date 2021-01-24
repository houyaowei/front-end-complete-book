"use strict";
/**
 *
 */
exports.__esModule = true;
var RealSubject_1 = require("./RealSubject");
var Proxy_1 = require("./Proxy");
var realSubject = new RealSubject_1["default"]();
var subject = new Proxy_1["default"](realSubject);
subject.proposal();
