"use strict";
exports.__esModule = true;
var CustomerModal_1 = require("./CustomerModal");
var Observer_1 = require("./Observer");
var customer1 = new CustomerModal_1["default"](1101, "caozn", "shanxi", "12900000");
var os = new Observer_1["default"]();
os.register(customer1);
var customer2 = new CustomerModal_1["default"](1102, "houyw", "henan", "12900001");
os.register(customer2);
console.log("现在商家有", os.getAllCustomers().length, "个客户订阅");
os.notifyAll();
