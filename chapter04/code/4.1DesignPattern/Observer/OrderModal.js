"use strict";
/**
 * @Date 2019-12-21
 * @author houyw
 */
exports.__esModule = true;
var Order = /** @class */ (function () {
    function Order(_id, _description, _price) {
        this.id = _id;
        this.description = _description;
        this.price = _price;
        this.date = new Date().getTime();
    }
    return Order;
}());
exports["default"] = Order;
