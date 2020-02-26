"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CircleShape_1 = require("./CircleShape");
var BlueShapeDecorator_1 = require("./BlueShapeDecorator");
var RectangleShape_1 = require("./RectangleShape");
var GreenShapeDecorator_1 = require("./GreenShapeDecorator");
var shape = new CircleShape_1.default();
var shape2 = new RectangleShape_1.default();
var decorator1 = new BlueShapeDecorator_1.default(shape);
var decorator2 = new GreenShapeDecorator_1.default(shape2);
decorator1.draw();
console.log("---------------------");
decorator2.draw();
