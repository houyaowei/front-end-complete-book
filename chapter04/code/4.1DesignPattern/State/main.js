"use strict";
/**
 * 主文件
 **/
Object.defineProperty(exports, "__esModule", { value: true });
var Context_1 = require("./Context");
var SlighLightClass_1 = require("./SlighLightClass");
var context = new Context_1.default(new SlighLightClass_1.default());
context.setSlighLight();
context.setHightLight();
context.close();
