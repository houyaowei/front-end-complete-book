"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 装饰抽象类
 */
var ShapeDecorator = /** @class */ (function () {
    function ShapeDecorator(s) {
        this.shape = s;
    }
    /**
     * draw
     */
    ShapeDecorator.prototype.draw = function () {
        this.shape.draw();
    };
    return ShapeDecorator;
}());
exports.default = ShapeDecorator;
