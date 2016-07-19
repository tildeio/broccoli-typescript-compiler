export default class Greeter {
  greet(thing: Named) {
    return "<h1>Hello, " + thing.name() + "</h1>";
  }
};

export interface Named {
  name(): String;
};
