"use strict";
/**
 * Context类，保持对当前策略的引用
 */
Object.defineProperty(exports, "__esModule", { value: true });
var names = ["hou", "cao", "ss"];
var Context = /** @class */ (function () {
    function Context(_s) {
        this.strategy = _s;
    }
    Context.prototype.setStrategy = function (_s) {
        this.strategy = _s;
    };
    //执行的方法是策略中定义的方法
    Context.prototype.executeStrategy = function () {
        console.log("Context: current strategy is " + this.strategy.constructor.name);
        var result = this.strategy.toHandleStringArray(names);
        console.log("result:", result.join("->"));
    };
    return Context;
}());
exports.default = Context;
