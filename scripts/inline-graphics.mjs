import fs from "fs"
import path from "path"

const dir = path.join("quartz", "static", "Graphics")
const pairs = [
  ["decision_making_skeleton.html", "decision_making_skeleton.svg"],
  ["Opening_Response_Guide.html", "Opening_Response_Guide.svg"],
]

function patchScript(html) {
  return html
    .replace(
      "  const img = document.getElementById('img');",
      `  const img = document.getElementById('img');

  function graphicSize(el) {
    if (el.tagName.toLowerCase() === 'svg') {
      const vb = el.viewBox.baseVal
      if (vb && vb.width > 0) return { w: vb.width, h: vb.height }
      return {
        w: parseFloat(el.getAttribute("width")),
        h: parseFloat(el.getAttribute("height")),
      }
    }
    return { w: el.naturalWidth, h: el.naturalHeight }
  }`,
    )
    .replace(
      /  function fitToScreen\(\) \{\n    const vw = viewport\.clientWidth;\n    const vh = viewport\.clientHeight;\n    const iw = img\.naturalWidth;\n    const ih = img\.naturalHeight;/,
      `  function fitToScreen() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const { w: iw, h: ih } = graphicSize(img);`,
    )
    .replace(/img\.naturalWidth/g, "graphicSize(img).w")
    .replace(/img\.naturalHeight/g, "graphicSize(img).h")
    .replace(
      /  \/\/ Init — fit to screen once image loads\n  img\.onload = fitToScreen;\n  if \(img\.complete\) fitToScreen\(\);/,
      `  // Init — fit to screen once graphic is ready
  if (img.tagName.toLowerCase() === 'svg') {
    fitToScreen();
  } else {
    img.onload = fitToScreen;
    if (img.complete) fitToScreen();
  }`,
    )
}

for (const [htmlFile, svgFile] of pairs) {
  let html = fs.readFileSync(path.join(dir, htmlFile), "utf8")
  let svg = fs.readFileSync(path.join(dir, svgFile), "utf8")
  svg = svg.replace("<svg ", '<svg id="img" style="display:block" ')
  html = html.replace(/<img[^>]+>/, svg)
  html = patchScript(html)
  fs.writeFileSync(path.join(dir, htmlFile), html)
  console.log(`Updated ${htmlFile} (${fs.statSync(path.join(dir, htmlFile)).size} bytes)`)
}
