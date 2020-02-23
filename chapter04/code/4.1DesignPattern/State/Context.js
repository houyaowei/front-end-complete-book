"use strict";
/**
 * @author houyw
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Context = /** @class */ (function () {
    function Context(state) {
        this.transitionTo(state);
    }
    Context.prototype.transitionTo = function (_s) {
        console.log("Context: transition to " + _s.constructor.name);
        this.state = _s;
        this.state.setContext(this);
    };
    Context.prototype.setSlighLight = function () {
        this.state.slightLight();
    };
    Context.prototype.setHightLight = function () {
        this.state.highLight();
    };
    Context.prototype.close = function () {
        this.state.close();
    };
    return Context;
}());
exports.default = Context;
