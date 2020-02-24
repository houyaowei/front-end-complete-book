"use strict";
/**
 * 主文件
 **/
Object.defineProperty(exports, "__esModule", { value: true });
var Context_1 = require("./Context");
var SlightLightClass_1 = require("./SlightLightClass");
var context = new Context_1.default(new SlightLightClass_1.default());
// const context = new Context(new CloseLight());
context.setSlighLight();
context.setHightLight();
context.close();
