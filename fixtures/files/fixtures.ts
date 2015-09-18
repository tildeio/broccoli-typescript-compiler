import Greeter, { Named } from './types';

class Person implements Named {
  private _name: String;

  constructor(name: String) {
	  this._name = name;
  }

  name() {
	  return this._name;
  }
}

document.body.innerHTML = new Greeter().greet(new Person("Godfrey"));
