"use strict";
/**
 * @Date 2020-2-5
 * @author houyw
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Seller = /** @class */ (function () {
    function Seller() {
        this.customers = new Array();
    }
    Seller.prototype.register = function (customer) {
        this.customers.push(customer);
    };
    Seller.prototype.remove = function (id) {
        this.customers.forEach(function (c) {
            if (c.getId() === id) {
                console.log("this id: " + id + " should be removed");
            }
        });
    };
    Seller.prototype.notifyAll = function () {
        this.customers.forEach(function (cus) {
            cus.dealOrder();
        });
    };
    return Seller;
}());
exports.default = Seller;
