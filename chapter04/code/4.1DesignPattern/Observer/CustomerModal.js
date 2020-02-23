"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Customer = /** @class */ (function () {
    function Customer(_id, _name, _address, _telNum) {
        this.id = _id;
        this.name = _name;
        this.address = _address;
        this.telNum = _telNum;
    }
    Customer.prototype.getId = function () {
        return this.id;
    };
    Customer.prototype.dealOrder = function () {
        //make a order
        console.log("I am  " + this.name + "\uFF0C I have got message from seller");
    };
    return Customer;
}());
exports.default = Customer;
