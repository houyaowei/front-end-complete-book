"use strict";
/**
 * 策略实现类A
 */
exports.__esModule = true;
var StrategyAImpl = /** @class */ (function () {
    function StrategyAImpl() {
    }
    StrategyAImpl.prototype.toHandleStringArray = function (_d) {
        return _d.sort();
    };
    return StrategyAImpl;
}());
exports["default"] = StrategyAImpl;
