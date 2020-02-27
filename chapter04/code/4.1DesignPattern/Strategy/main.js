"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 测试方法
 */
var Context_1 = require("./Context");
var StrategyAImpl_1 = require("./StrategyAImpl");
var context = new Context_1.default(new StrategyAImpl_1.default());
context.executeStrategy();
// const context = new Context(new StrategyB()); context.executeStrategy();
