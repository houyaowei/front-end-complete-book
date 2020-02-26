"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VlcPlayer = /** @class */ (function () {
    function VlcPlayer() {
    }
    VlcPlayer.prototype.playVlcType = function (fileName) {
        //空实现
    };
    VlcPlayer.prototype.playMp4Type = function (fileName) {
        console.log(fileName + " is palying");
    };
    return VlcPlayer;
}());
exports.default = VlcPlayer;
