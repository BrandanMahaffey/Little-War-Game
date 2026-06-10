import fs from "fs"
import path from "path"

const roots = [
  path.join("content"),
  path.join("C:", "Users", "haffey", "Documents", "lwg notes", "Little War Game", "Quartz"),
]

function patchFile(filePath) {
  let text = fs.readFileSync(filePath, "utf8")
  const original = text

  text = text.replace(
    /(<a[^>]*href="https:\/\/brandanmahaffey\.github\.io\/LWG-Guides\/static\/Graphics\/[^"]+\.html") target="_blank"(?: rel="noopener")?/g,
    "$1",
  )

  text = text.replace(
    />Open interactive viewer ↗</g,
    ">Open fullscreen viewer</",
  )

  text = text.replace(
    /<a(?![^>]*data-router-ignore)([^>]*href="https:\/\/brandanmahaffey\.github\.io\/LWG-Guides\/static\/Graphics\/[^"]+\.html")/g,
    "<a data-router-ignore$1",
  )

  if (text !== original) {
    fs.writeFileSync(filePath, text)
    console.log(`Patched ${filePath}`)
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith(".md")) patchFile(full)
  }
}

for (const root of roots) walk(root)
