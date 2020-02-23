"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @Date 2020-2-5
 * @author houyw
 */
var Seller_1 = require("./Seller");
var Observer = /** @class */ (function () {
    function Observer() {
        this.seller = new Seller_1.default();
    }
    Observer.prototype.register = function (customer) {
        console.log("");
        this.seller.register(customer);
    };
    Observer.prototype.fire = function () {
        this.seller.notifyAll();
    };
    Observer.prototype.getAllCustomers = function () {
        return this.seller.customers;
    };
    Observer.prototype.remove = function (customerId) {
        this.seller.remove(customerId);
    };
    return Observer;
}());
exports.default = Observer;
