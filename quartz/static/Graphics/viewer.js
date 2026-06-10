const HOME_URL = "https://brandanmahaffey.github.io/LWG-Guides/"

function goBack() {
  if (document.referrer) {
    window.location.assign(document.referrer)
    return
  }
  window.location.assign(HOME_URL)
}

function initGraphicViewer() {
  const viewport = document.getElementById("viewport")
  const canvas = document.getElementById("canvas")
  const img = document.getElementById("img")
  if (!viewport || !canvas || !img || viewport.dataset.viewerReady) return
  viewport.dataset.viewerReady = "1"

  function graphicSize(el) {
    if (el.tagName.toLowerCase() === "svg") {
      const vb = el.viewBox.baseVal
      if (vb && vb.width > 0) return { w: vb.width, h: vb.height }
      return {
        w: parseFloat(el.getAttribute("width")),
        h: parseFloat(el.getAttribute("height")),
      }
    }
    return { w: el.naturalWidth, h: el.naturalHeight }
  }

  let scale = 1
  let offsetX = 0
  let offsetY = 0
  let isDragging = false
  let startX, startY, startOffsetX, startOffsetY

  function applyTransform() {
    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
  }

  function fitToScreen() {
    const vw = viewport.clientWidth
    const vh = viewport.clientHeight
    const { w: iw, h: ih } = graphicSize(img)
    if (vw < 1 || vh < 1 || iw < 1 || ih < 1) return
    scale = Math.min(vw / iw, vh / ih) * 0.95
    offsetX = (vw - iw * scale) / 2
    offsetY = (vh - ih * scale) / 2
    applyTransform()
  }

  function zoomIn() {
    const cx = viewport.clientWidth / 2
    const cy = viewport.clientHeight / 2
    zoomAt(cx, cy, 1.25)
  }

  function zoomOut() {
    const cx = viewport.clientWidth / 2
    const cy = viewport.clientHeight / 2
    zoomAt(cx, cy, 0.8)
  }

  function resetZoom() {
    scale = 1
    offsetX = (viewport.clientWidth - graphicSize(img).w) / 2
    offsetY = (viewport.clientHeight - graphicSize(img).h) / 2
    applyTransform()
  }

  function zoomAt(cx, cy, factor) {
    const newScale = Math.min(Math.max(scale * factor, 0.1), 8)
    offsetX = cx - (cx - offsetX) * (newScale / scale)
    offsetY = cy - (cy - offsetY) * (newScale / scale)
    scale = newScale
    applyTransform()
  }

  window.goBack = goBack
  window.fitToScreen = fitToScreen
  window.zoomIn = zoomIn
  window.zoomOut = zoomOut
  window.resetZoom = resetZoom

  viewport.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault()
      const rect = viewport.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.1 : 0.9
      zoomAt(cx, cy, factor)
    },
    { passive: false },
  )

  viewport.addEventListener("mousedown", (e) => {
    isDragging = true
    startX = e.clientX
    startY = e.clientY
    startOffsetX = offsetX
    startOffsetY = offsetY
  })

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return
    offsetX = startOffsetX + (e.clientX - startX)
    offsetY = startOffsetY + (e.clientY - startY)
    applyTransform()
  })

  window.addEventListener("mouseup", () => {
    isDragging = false
  })

  let lastTouchDist = null
  viewport.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isDragging = true
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      startOffsetX = offsetX
      startOffsetY = offsetY
    }
  })

  viewport.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault()
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (lastTouchDist) {
          const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
          const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
          zoomAt(cx, cy, dist / lastTouchDist)
        }
        lastTouchDist = dist
      } else if (e.touches.length === 1 && isDragging) {
        offsetX = startOffsetX + (e.touches[0].clientX - startX)
        offsetY = startOffsetY + (e.touches[0].clientY - startY)
        applyTransform()
      }
    },
    { passive: false },
  )

  viewport.addEventListener("touchend", () => {
    isDragging = false
    lastTouchDist = null
  })

  function scheduleFitToScreen() {
    requestAnimationFrame(() => {
      if (viewport.clientWidth < 1 || viewport.clientHeight < 1) return
      fitToScreen()
    })
  }

  function ready() {
    fitToScreen()
    requestAnimationFrame(fitToScreen)
  }

  if (img.tagName.toLowerCase() === "svg") {
    ready()
  } else {
    img.onload = ready
    if (img.complete) ready()
  }

  window.addEventListener("resize", scheduleFitToScreen)
  window.addEventListener("load", scheduleFitToScreen)
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) scheduleFitToScreen()
  })
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(scheduleFitToScreen).observe(viewport)
  }
}

window.goBack = goBack

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGraphicViewer)
} else {
  initGraphicViewer()
}
