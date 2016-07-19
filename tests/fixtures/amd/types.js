define("types", ["require", "exports"], function (require, exports) {
    "use strict";
    var Greeter = (function () {
        function Greeter() {
        }
        Greeter.prototype.greet = function (thing) {
            return "<h1>Hello, " + thing.name() + "</h1>";
        };
        return Greeter;
    }());
    exports.__esModule = true;
    exports["default"] = Greeter;
    ;
    ;
});
