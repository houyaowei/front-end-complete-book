"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
/**
 * @author houyw
 * 强光
 */
var State_1 = require("./State");
var CloseClass_1 = require("./CloseClass");
var HighLightClass = /** @class */ (function (_super) {
    __extends(HighLightClass, _super);
    function HighLightClass() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HighLightClass.prototype.slightLight = function () {
        console.log("slight state in HighLightClass");
    };
    HighLightClass.prototype.highLight = function () {
        console.log("highLight state in HighLightClass");
    };
    HighLightClass.prototype.close = function () {
        console.log("state in hightLight, I will change state to close");
        this.context.transitionTo(new CloseClass_1["default"]());
    };
    return HighLightClass;
}(State_1["default"]));
exports["default"] = HighLightClass;
