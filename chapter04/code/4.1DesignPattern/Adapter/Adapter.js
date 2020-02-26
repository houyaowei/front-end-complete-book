"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VlcPlayer_1 = require("./VlcPlayer");
var Mp4Player_1 = require("./Mp4Player");
var MediaAdatper = /** @class */ (function () {
    function MediaAdatper(type) {
        if (type === "vlc") {
            this.advanceTarget = new VlcPlayer_1.default();
        }
        if (type == "mp4") {
            this.advanceTarget = new Mp4Player_1.default();
        }
    }
    MediaAdatper.prototype.play = function (type, fileName) {
        if (type === "vlc") {
            this.advanceTarget.playVlcType(fileName);
        }
        if (type == "mp4") {
            this.advanceTarget.playMp4Type(fileName);
        }
    };
    return MediaAdatper;
}());
exports.default = MediaAdatper;
