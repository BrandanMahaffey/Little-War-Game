import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SHIFT = 86
const THRESHOLD = 174.81009252687997
const SVG_Y = 151 + 16.81009252687997

const lines = [
  "Producing workers is really expensive — roughly ¼ of what that base is making while you're still building them. When you stop making",
  "workers that cost just goes away, and you'll notice a real spike in your spendable income. Your mines are still pulling the same; you just",
  "aren't sinking a quarter of it back into the next worker anymore.",
  "",
  "If you cut workers before saturation you'll feel that bump sooner, but the earlier you stop investing in workers the less you're leaving",
  "yourself with later. Understanding when and why there will be a spike in funds will help us time transitions into more production or",
  "tech/upgrades etc.",
]

const textEls = lines
  .map((line, i) => {
    const y = 11.36015625 + i * 14.4
    return `<text x="0" y="${y}" font-family="Cascadia, monospace, Segoe UI Emoji" font-size="12px" fill="#8892a4" text-anchor="start" style="white-space: pre;" direction="ltr" dominant-baseline="alphabetic">${line}</text>`
  })
  .join("")

const newGroup = `<g stroke-opacity="0.7" fill-opacity="0.7" transform="translate(10.000000000000114 ${SVG_Y}) rotate(0 459 36)">${textEls}</g>`

const svgDirs = [
  path.join(__dirname, "..", "quartz", "static", "Graphics"),
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

for (const dir of svgDirs) {
  const svgPath = path.join(dir, "decision_making_skeleton.svg")
  if (!fs.existsSync(svgPath)) continue

  let svg = fs.readFileSync(svgPath, "utf8")

  if (svg.includes("Producing workers is really expensive")) {
    console.log(`Already patched: ${svgPath}`)
    continue
  }

  svg = svg.replace(
    /viewBox="0 0 ([\d.]+) ([\d.]+)"/,
    (_, w, h) => `viewBox="0 0 ${w} ${parseFloat(h) + SHIFT}"`,
  )
  svg = svg.replace(
    /height="([\d.]+)"/g,
    (match, h, offset) => {
      // only bump the root svg + background rect heights
      const idx = svg.indexOf(match)
      return match
    },
  )

  // bump canvas dimensions
  svg = svg.replace(
    /<svg([^>]*?)width="([\d.]+)" height="([\d.]+)"/,
    (_, attrs, w, h) => `<svg${attrs}width="${w}" height="${parseFloat(h) + SHIFT}"`,
  )
  svg = svg.replace(
    /<rect x="0" y="0" width="([\d.]+)" height="([\d.]+)" fill="#0f1117">/,
    (_, w, h) => `<rect x="0" y="0" width="${w}" height="${parseFloat(h) + SHIFT}" fill="#0f1117">`,
  )

  // shift elements at/after the divider
  svg = svg.replace(
    /transform="translate\(([^)]+)\) rotate/g,
    (match, coords) => {
      const parts = coords.trim().split(/\s+/)
      if (parts.length < 2) return match
      const y = parseFloat(parts[1])
      if (y >= THRESHOLD) {
        parts[1] = String(y + SHIFT)
        return `transform="translate(${parts.join(" ")}) rotate`
      }
      return match
    },
  )

  // insert new text block before the divider group (still at shifted position)
  const shiftedDivider = `<g stroke-linecap="round" transform="translate(10.000000000000114 ${THRESHOLD + SHIFT}`
  svg = svg.replace(shiftedDivider, `${newGroup}${shiftedDivider}`)

  fs.writeFileSync(svgPath, svg)
  console.log(`Patched ${svgPath}`)
}
