import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const excalidrawPath =
  "C:/Users/haffey/Documents/lwg notes/Little War Game/Excalidraw/decision_making_skeleton.excalidraw"

const svgPaths = [
  path.join(root, "quartz", "static", "Graphics", "decision_making_skeleton.svg"),
  "C:/Users/haffey/Documents/lwg notes/Little War Game/Quartz/Graphics/decision_making_skeleton.svg",
]

const data = JSON.parse(fs.readFileSync(excalidrawPath, "utf8"))
const textEl = data.elements.find(
  (el) => el.type === "text" && el.text?.includes("Producing workers is really expensive"),
)

if (!textEl) {
  console.error("Could not find worker-income text element in Excalidraw file")
  process.exit(1)
}

const lines = textEl.text.split("\n")
const halfW = (textEl.width ?? 918) / 2
const halfH = (textEl.height ?? 86.4) / 2
const yStart = 11.36015625
const lineHeight = 14.4

const textStyle =
  'font-family="Cascadia, monospace, Segoe UI Emoji" font-size="12px" fill="#8892a4" text-anchor="start" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic"'

const inner = lines
  .map((line, i) => {
    const y = yStart + i * lineHeight
    return `<text x="0" y="${y}" ${textStyle}>${escapeXml(line)}</text>`
  })
  .join("")

const newGroup = `<g stroke-opacity="0.7" fill-opacity="0.7" transform="translate(10.000000000000114 167.81009252687997) rotate(0 ${halfW} ${halfH})">${inner}</g>`

const groupPattern =
  /<g stroke-opacity="0\.7" fill-opacity="0\.7" transform="translate\(10\.000000000000114 167\.81009252687997\) rotate\(0 [^"]+\)">[\s\S]*?Producing workers is really expensive[\s\S]*?tech\/upgrades etc\.<\/text><\/g>/

for (const svgPath of svgPaths) {
  let svg = fs.readFileSync(svgPath, "utf8")
  if (!groupPattern.test(svg)) {
    console.error(`Could not find worker-income group in ${svgPath}`)
    process.exit(1)
  }
  svg = svg.replace(groupPattern, newGroup)
  fs.writeFileSync(svgPath, svg)
  console.log(`Updated ${svgPath}`)
  console.log("  1/4th:", svg.includes("1/4th"))
  console.log("  a base is earning:", svg.includes("a base is earning"))
  console.log("  hit\\nsaturation:", svg.includes("hit</text><text") && svg.includes("saturation and stop"))
}

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
