"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Proxy = /** @class */ (function () {
    function Proxy(ro) {
        this.realSubject = ro;
    }
    Proxy.prototype.chcekIsGoodFriend = function () {
        console.log("It's is checking if good friend");
        var r = Math.ceil(Math.random() * 10);
        //只有够意思才给你传话
        if (r > 6 || r == 6) {
            return true;
        }
        else {
            console.log("This friend is not worth be trusted. ");
            return false;
        }
    };
    Proxy.prototype.checkPromission = function () {
        console.log("It's checking the promission");
        if (this.chcekIsGoodFriend()) {
            return true;
        }
        return false;
    };
    Proxy.prototype.proposal = function () {
        if (this.checkPromission()) {
            this
                .realSubject
                .proposal();
        }
        else {
            console.log("This friend is unwilling to talk to his girlfriend");
        }
    };
    return Proxy;
}());
exports.default = Proxy;
