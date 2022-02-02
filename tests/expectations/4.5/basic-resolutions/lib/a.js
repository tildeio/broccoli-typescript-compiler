"use strict";
exports.__esModule = true;
var b_1 = require("./b");
var c_1 = require("./c");
var A = /** @class */ (function () {
    function A(b, name) {
        this.b = b;
        this.name = name;
    }
    A.create = function (name) {
        return new this(new b_1["default"](new c_1["default"]()), name);
    };
    A.prototype.hello = function () {
        this.b.hello(this.name);
    };
    return A;
}());
exports["default"] = A;
//# sourceMappingURL=a.js.map