"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VlcPlayer = /** @class */ (function () {
    function VlcPlayer() {
    }
    VlcPlayer.prototype.playVlcType = function (fileName) {
        console.log(fileName + " is palying!");
    };
    VlcPlayer.prototype.playMp4Type = function (fileName) {
        //空实现
    };
    return VlcPlayer;
}());
exports.default = VlcPlayer;
