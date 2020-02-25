"use strict";
/**
 * 策略实现类A
 */
Object.defineProperty(exports, "__esModule", { value: true });
var StrategyAImpl = /** @class */ (function () {
    function StrategyAImpl() {
    }
    StrategyAImpl.prototype.toHandleStringArray = function (_d) {
        return _d.sort();
    };
    return StrategyAImpl;
}());
exports.default = StrategyAImpl;
