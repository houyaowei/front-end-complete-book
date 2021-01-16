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
var SlightLightClass_1 = require("./SlightLightClass");
var ColseClass = /** @class */ (function (_super) {
    __extends(ColseClass, _super);
    function ColseClass() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ColseClass.prototype.slightLight = function () { };
    ColseClass.prototype.highLight = function () {
        console.log("highLight in HighLightClass");
    };
    ColseClass.prototype.close = function () {
        console.log("state in closeClass, I will change state to slight");
        this.context.transitionTo(new SlightLightClass_1["default"]());
    };
    return ColseClass;
}(State_1["default"]));
exports["default"] = ColseClass;
