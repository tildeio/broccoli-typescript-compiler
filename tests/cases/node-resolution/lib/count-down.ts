import leftPad = require("left-pad");

export default function countDown(c: number) {
  let pad = c.toString(2).length;
  while (c) {
    leftPad(c, pad, "0");
    c--;
  }
}
