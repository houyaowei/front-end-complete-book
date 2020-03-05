"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Adapter_1 = require("./Adapter");
var Player = /** @class */ (function () {
    function Player() {
    }
    Player.prototype.play = function (type, fileName) {
        if (type == "mp3") {
            console.log("Mp3 as the basic format, can play at will");
        }
        else if (type === "vlc" || type == "mp4") {
            this.mediaAdapter = new Adapter_1.default(type);
            this
                .mediaAdapter
                .play(type, fileName);
        }
        else {
            console.error("sorry,type " + type + " is not support");
        }
    };
    return Player;
}());
exports.default = Player;
