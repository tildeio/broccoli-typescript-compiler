import Greeter from './types';
class Person {
    constructor(name) {
        this._name = name;
    }
    name() {
        return this._name;
    }
}
document.body.innerHTML = new Greeter().greet(new Person("Godfrey"));
