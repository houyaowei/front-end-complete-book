"use strict";
/**
 * 策略实现类B
 */
exports.__esModule = true;
var StrategyBImpl = /** @class */ (function () {
    function StrategyBImpl() {
    }
    StrategyBImpl.prototype.toHandleStringArray = function (_d) {
        return _d.reverse();
    };
    return StrategyBImpl;
}());
exports["default"] = StrategyBImpl;
