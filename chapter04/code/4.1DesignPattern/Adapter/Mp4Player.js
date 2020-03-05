"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Mp4Player = /** @class */ (function () {
    function Mp4Player() {
    }
    Mp4Player.prototype.playVlcType = function (fileName) {
        //空实现
    };
    Mp4Player.prototype.playMp4Type = function (fileName) {
        console.log(fileName + " is palying");
    };
    return Mp4Player;
}());
exports.default = Mp4Player;
