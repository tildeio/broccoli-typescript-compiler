import B from "./b";
export default class A {
    private b;
    private name;
    static create(name: string): A;
    constructor(b: B, name: string);
    hello(): void;
}
