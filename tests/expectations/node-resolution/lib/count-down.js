"use strict";
exports.__esModule = true;
var leftPad = require("left-pad");
function countDown(c) {
    var pad = c.toString(2).length;
    while (c) {
        leftPad(c, pad, "0");
        c--;
    }
}
exports["default"] = countDown;
//# sourceMappingURL=count-down.js.map