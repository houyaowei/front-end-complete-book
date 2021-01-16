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
 * 弱光
 */
var State_1 = require("./State");
var HighLightClass_1 = require("./HighLightClass");
var SlighLightClass = /** @class */ (function (_super) {
    __extends(SlighLightClass, _super);
    function SlighLightClass() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SlighLightClass.prototype.slightLight = function () {
        console.log("state in SlighLightClass, I will change state to highLight");
        this.context.transitionTo(new HighLightClass_1["default"]());
    };
    SlighLightClass.prototype.highLight = function () {
        console.log("hightstate state in SlighLightClass");
    };
    SlighLightClass.prototype.close = function () {
        console.log("close state in SlighLightClass");
    };
    return SlighLightClass;
}(State_1["default"]));
exports["default"] = SlighLightClass;
