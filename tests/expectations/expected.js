"use strict";
var types_1 = require('./types');
var Person = (function () {
    function Person(name) {
        this._name = name;
    }
    Person.prototype.name = function () {
        return this._name;
    };
    return Person;
}());
document.body.innerHTML = new types_1["default"]().greet(new Person("Godfrey"));
