import fs from "fs"
import path from "path"

const HOME_URL = "https://brandanmahaffey.github.io/LWG-Guides/"
const htmlFiles = [
  path.join("quartz", "static", "Graphics", "decision_making_skeleton.html"),
  path.join("quartz", "static", "Graphics", "Opening_Response_Guide.html"),
  path.join(
    "C:",
    "Users",
    "haffey",
    "Documents",
    "lwg notes",
    "Little War Game",
    "Quartz",
    "Graphics",
    "decision_making_skeleton.html",
  ),
  path.join(
    "C:",
    "Users",
    "haffey",
    "Documents",
    "lwg notes",
    "Little War Game",
    "Quartz",
    "Graphics",
    "Opening_Response_Guide.html",
  ),
]

const NAV_CSS = `
    .toolbar-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    a.nav-btn {
      text-decoration: none;
      display: inline-flex;
      align-items: center;
    }`

const GO_BACK_JS = `  const HOME_URL = '${HOME_URL}';

  function goBack() {
    if (window.history.length > 1) {
      history.back();
    } else {
      window.location.href = HOME_URL;
    }
  }

`

function patchNav(html) {
  if (!html.includes("toolbar-nav")) {
    html = html.replace(
      /(\.toolbar span \{[^}]+\})/,
      `$1${NAV_CSS}`,
    )
    html = html.replace(
      /button \{/,
      "button, a.nav-btn {",
    )
    html = html.replace(
      /button:hover \{/,
      "button:hover, a.nav-btn:hover {",
    )
    html = html.replace(
      /<div class="toolbar">\s*\n\s*<span>/,
      `<div class="toolbar">
  <div class="toolbar-nav">
    <button type="button" class="nav-btn" onclick="goBack()">← Back</button>
    <a class="nav-btn" href="${HOME_URL}">Home</a>
  </div>
  <span>`,
    )
  }

  if (!html.includes("function goBack()")) {
    html = html.replace(/<script>\s*\n/, `<script>\n${GO_BACK_JS}`)
  }

  while ((html.match(/function graphicSize\(/g) || []).length > 1) {
    html = html.replace(
      /\n  function graphicSize\(el\) \{[\s\S]*?return \{ w: el\.naturalWidth, h: el\.naturalHeight \}\n  \}/,
      "",
    )
  }

  return html
}

for (const file of htmlFiles) {
  if (!fs.existsSync(file)) {
    console.log(`Skip missing ${file}`)
    continue
  }
  const html = patchNav(fs.readFileSync(file, "utf8"))
  fs.writeFileSync(file, html)
  console.log(`Patched ${file}`)
}
