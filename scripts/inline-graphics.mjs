import fs from "fs"
import path from "path"

const dir = path.join("quartz", "static", "Graphics")
const HOME_URL = "https://brandanmahaffey.github.io/LWG-Guides/"
const pairs = [
  ["decision_making_skeleton.html", "decision_making_skeleton.svg"],
  ["Opening_Response_Guide.html", "Opening_Response_Guide.svg"],
]

function patchViewerNav(html) {
  if (!html.includes("toolbar-nav")) {
    const navCss = `
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

    html = html.replace(/(\.toolbar span \{[^}]+\})/, `$1${navCss}`)
    html = html.replace(/button \{/, "button, a.nav-btn {")
    html = html.replace(/button:hover \{/, "button:hover, a.nav-btn:hover {")

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

  return html
}

function useExternalViewer(html) {
  if (!html.includes('src="viewer.js"')) {
    html = html.replace(
      "</style>\n</head>",
      `</style>\n  <script src="viewer.js" defer></script>\n</head>`,
    )
  }
  html = html.replace(
    /<div class="hint">scroll to zoom[\s\S]*?<\/script>\s*(?=<\/body>)/,
    '<div class="hint">scroll to zoom · drag to pan</div>\n\n',
  )
  return html
}

function patchScript(html) {
  if (!html.includes("function graphicSize(")) {
    html = html.replace(
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
  }

  if (html.includes("img.naturalWidth")) {
    html = html
      .replace(
        /  function fitToScreen\(\) \{\n    const vw = viewport\.clientWidth;\n    const vh = viewport\.clientHeight;\n    const iw = img\.naturalWidth;\n    const ih = img\.naturalHeight;/,
        `  function fitToScreen() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const { w: iw, h: ih } = graphicSize(img);
    if (vw < 1 || vh < 1 || iw < 1 || ih < 1) return;`,
      )
      .replace(/img\.naturalWidth/g, "graphicSize(img).w")
      .replace(/img\.naturalHeight/g, "graphicSize(img).h")
  } else if (
    html.includes("function fitToScreen()") &&
    !html.includes("if (vw < 1 || vh < 1")
  ) {
    html = html.replace(
      /(function fitToScreen\(\) \{\n    const vw = viewport\.clientWidth;\n    const vh = viewport\.clientHeight;\n    const \{ w: iw, h: ih \} = graphicSize\(img\);)/,
      `$1
    if (vw < 1 || vh < 1 || iw < 1 || ih < 1) return;`,
    )
  }

  if (!html.includes(".canvas svg")) {
    html = html.replace(
      ".canvas img {\n      display: block;\n      max-width: none;\n    }",
      `.canvas img,
    .canvas svg {
      display: block;
      max-width: none;
    }`,
    )
  }

  const initBlock = `  function scheduleFitToScreen() {
    requestAnimationFrame(() => {
      if (viewport.clientWidth < 1 || viewport.clientHeight < 1) return;
      fitToScreen();
    });
  }

  function initViewer() {
    const ready = () => {
      fitToScreen();
      requestAnimationFrame(fitToScreen);
    };
    if (img.tagName.toLowerCase() === 'svg') {
      ready();
    } else {
      img.onload = ready;
      if (img.complete) ready();
    }
  }

  initViewer();
  window.addEventListener('resize', scheduleFitToScreen);
  window.addEventListener('load', scheduleFitToScreen);
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) scheduleFitToScreen();
  });
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(scheduleFitToScreen).observe(viewport);
  }`

  if (html.includes("// Init — fit to screen once graphic is ready")) {
    html = html.replace(
      /  \/\/ Init — fit to screen once graphic is ready[\s\S]*?(?=\n<\/script>)/,
      initBlock,
    )
  } else if (html.includes("// Init — fit to screen once image loads")) {
    html = html.replace(
      /  \/\/ Init — fit to screen once image loads\n  img\.onload = fitToScreen;\n  if \(img\.complete\) fitToScreen\(\);/,
      initBlock,
    )
  }

  return html
}

function embedSvg(html, svg) {
  if (/<svg id="img"[\s\S]*?<\/svg>/.test(html)) {
    return html.replace(/<svg id="img"[\s\S]*?<\/svg>/, svg.trim())
  }
  if (/<img[^>]+>/.test(html)) {
    return html.replace(/<img[^>]+>/, svg)
  }
  return html
}

for (const [htmlFile, svgFile] of pairs) {
  let html = fs.readFileSync(path.join(dir, htmlFile), "utf8")
  let svg = fs.readFileSync(path.join(dir, svgFile), "utf8")
  svg = svg.replace("<svg ", '<svg id="img" style="display:block" ')
  html = embedSvg(html, svg)
  html = patchScript(html)
  html = patchViewerNav(html)
  html = useExternalViewer(html)
  fs.writeFileSync(path.join(dir, htmlFile), html)
  console.log(`Updated ${htmlFile} (${fs.statSync(path.join(dir, htmlFile)).size} bytes)`)
}
