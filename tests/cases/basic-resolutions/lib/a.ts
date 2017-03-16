import B from "./b";
import C from "./c";

export default class A {
  public static create(name: string) {
    return new this(new B(new C()), name);
  }

  constructor(private b: B, private name: string) {
  }

  public hello() {
    this.b.hello(this.name);
  }
}
