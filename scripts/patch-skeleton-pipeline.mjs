import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Full-width 6px "pipeline" bar between flow boxes — obscures gap arrows. */
const PIPELINE_TRACK =
  /<g stroke-linecap="round" transform="translate\([^)]+\) rotate\(0 750 3\)">[\s\S]*?<\/g>/

export function removeSkeletonPipelineTrack(svg) {
  if (!PIPELINE_TRACK.test(svg)) return { svg, changed: false }
  return { svg: svg.replace(PIPELINE_TRACK, ""), changed: true }
}

const svgPaths = [
  path.join(__dirname, "../quartz/static/Graphics/decision_making_skeleton.svg"),
  path.join(
    "C:/Users/haffey/Documents/lwg notes/Little War Game/Quartz/Graphics/decision_making_skeleton.svg",
  ),
]

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  for (const svgPath of svgPaths) {
    if (!fs.existsSync(svgPath)) {
      console.warn(`Skip (missing): ${svgPath}`)
      continue
    }
    const { svg, changed } = removeSkeletonPipelineTrack(fs.readFileSync(svgPath, "utf8"))
    if (!changed) {
      console.log(`Already clean: ${svgPath}`)
      continue
    }
    fs.writeFileSync(svgPath, svg)
    console.log(`Removed pipeline track: ${svgPath}`)
  }
}
