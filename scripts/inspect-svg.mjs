import fs from "fs"

const s = fs.readFileSync("quartz/static/Graphics/decision_making_skeleton.svg", "utf8")
const positions = [...s.matchAll(/translate\(10\.000000000000114 ([\d.]+)\)/g)]
  .slice(0, 8)
  .map((x) => x[1])
console.log("positions:", positions.join(", "))
console.log("has text:", s.includes("Producing workers"))
const vb = s.match(/viewBox="0 0 [\d.]+ ([\d.]+)"/)
console.log("viewBox height:", vb?.[1])
