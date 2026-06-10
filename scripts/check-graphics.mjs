import fs from "fs"

const files = [
  "quartz/static/Graphics/Opening_Response_Guide.svg",
  "quartz/static/Graphics/Opening_Response_Guide.html",
  "quartz/static/Graphics/decision_making_skeleton.html",
]

const markers = [
  "When defending with Den",
  "Gold reads apply",
  "Heavy Pressure builds",
  "Opening Scouting Response Guide",
]

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log(f, "MISSING")
    continue
  }
  const s = fs.readFileSync(f, "utf8")
  const vb = s.match(/viewBox="0 0 ([^"]+)"/)?.[1]
  console.log("\n" + f)
  console.log("  size:", s.length, "viewBox:", vb || "n/a")
  for (const m of markers) console.log("  ", m, s.includes(m))
}
