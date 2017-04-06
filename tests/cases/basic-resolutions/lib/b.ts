import C from "./c";

export default class B {
  constructor(private c: C) {
  }

  public hello(to: string) {
    return this.c.shout(`hello ${to}`);
  }
}

