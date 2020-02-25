"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 测试方法
 */
var Context_1 = require("./Context");
var StrategyBImpl_1 = require("./StrategyBImpl");
// const context = new Context(new StrategyA());
// context.executeStrategy();
var context = new Context_1.default(new StrategyBImpl_1.default());
context.executeStrategy();
