import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const excalidrawPaths = [
  path.join(root, "Excalidraw", "decision_making_skeleton.excalidraw"),
  path.join(
    "C:",
    "Users",
    "haffey",
    "Documents",
    "lwg notes",
    "Little War Game",
    "Excalidraw",
    "decision_making_skeleton.excalidraw",
  ),
]

const excalidrawPath = excalidrawPaths.find((p) => fs.existsSync(p))
if (!excalidrawPath) {
  console.error("Could not find decision_making_skeleton.excalidraw")
  process.exit(1)
}

const SHIFT = 86
const DIVIDER_Y = 158
const NEW_TEXT_Y = 151

const newText =
  "Producing workers is really expensive — roughly ¼ of what that base is making while you're still building them. When you stop making workers that cost just goes away, and you'll notice a real spike in your spendable income. Your mines are still pulling the same; you just aren't sinking a quarter of it back into the next worker anymore.\n\nIf you cut workers before saturation you'll feel that bump sooner, but the earlier you stop investing in workers the less you're leaving yourself with later. Understanding when and why there will be a spike in funds will help us time transitions into more production or tech/upgrades etc."

const data = JSON.parse(fs.readFileSync(excalidrawPath, "utf8"))

for (const el of data.elements) {
  if (el.isDeleted) continue
  if (typeof el.y === "number" && el.y >= DIVIDER_Y) {
    el.y += SHIFT
  }
  if (Array.isArray(el.points)) {
    for (const pt of el.points) {
      if (pt[1] >= DIVIDER_Y) pt[1] += SHIFT
    }
  }
}

const newElement = {
  id: "wkIncSpk1",
  type: "text",
  x: 50,
  y: NEW_TEXT_Y,
  width: 918,
  height: 72,
  angle: 0,
  strokeColor: "#ffffff",
  backgroundColor: "transparent",
  fillStyle: "solid",
  strokeWidth: 1,
  strokeStyle: "solid",
  roughness: 0,
  opacity: 70,
  text: newText,
  fontSize: 12,
  fontFamily: 3,
  textAlign: "left",
  verticalAlign: "top",
  baseline: 12,
  groupIds: [],
  frameId: null,
  locked: false,
  boundElements: [],
  containerId: null,
  originalText: newText,
  autoResize: false,
  lineHeight: 1.2,
  version: 1,
  versionNonce: Math.floor(Math.random() * 1e9),
  index: "a4b",
  isDeleted: false,
  seed: 1,
  roundness: null,
  updated: Date.now(),
  hasTextLink: false,
  rawText: newText,
  link: null,
}

// Insert after worker-cut line (puqMw3cy, index a4)
const insertIdx = data.elements.findIndex((el) => el.id === "puqMw3cy")
data.elements.splice(insertIdx + 1, 0, newElement)

for (const outPath of [excalidrawPath, ...excalidrawPaths.filter((p) => p !== excalidrawPath && fs.existsSync(path.dirname(p)))]) {
  if (fs.existsSync(path.dirname(outPath))) {
    fs.writeFileSync(outPath, JSON.stringify(data, null, "\t"))
    console.log(`Updated ${outPath}`)
  }
}

// Export SVG
const { exportToSvg } = await import("@excalidraw/utils/export")
const svg = await exportToSvg({
  elements: data.elements,
  appState: {
    ...data.appState,
    exportBackground: true,
    exportWithDarkMode: true,
  },
  files: data.files ?? {},
  exportPadding: 10,
})

const svgString = new XMLSerializer().serializeToString(svg)

const outputDirs = [
  path.join(root, "quartz", "static", "Graphics"),
  path.join(
    "C:",
    "Users",
    "haffey",
    "Documents",
    "lwg notes",
    "Little War Game",
    "Quartz",
    "Graphics",
  ),
]

for (const dir of outputDirs) {
  if (!fs.existsSync(dir)) continue
  const svgPath = path.join(dir, "decision_making_skeleton.svg")
  fs.writeFileSync(svgPath, svgString)
  console.log(`Wrote ${svgPath}`)
}
