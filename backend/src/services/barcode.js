import bwipjs from "bwip-js";

export async function generateBarcodePng(bufferText) {
  return bwipjs.toBuffer({
    bcid: "code128",
    text: String(bufferText),
    scale: 2,
    height: 10,
    includetext: false
  });
}
