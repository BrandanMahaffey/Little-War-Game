# LWG Site Editing Cheat Sheet

Pin this file in your editor — it is **not** published (lives outside `content/`).

## What to edit

| What you want to change | File |
| --- | --- |
| Homepage heading, intro, guide list | [[content/Index.md]] |
| Site name in top-left sidebar | [[quartz.config.yaml]] → `pageTitle` |
| "Browse" sidebar label | [[quartz.config.yaml]] → explorer `options.title` |
| Footer links (YouTube, etc.) | [[quartz.config.yaml]] → footer `links` |
| Any guide content | [[content/Guides/]] → `Your Guide.md` |
| Graphics page stubs | [[content/Graphics/]] |
| Page subtitle (graphics pages) | italic `<p class="page-subtitle">` under `# title` in the `.md` body |
| SEO / search preview text | `description:` in frontmatter (keep in sync with subtitle) |
| Sidebar / homepage styling | [[quartz/styles/custom.scss]] |

## Preview locally

From the repo root (`C:\Users\haffey\quartz`):

```bash
npm run preview
```

Same thing, longer form:

```bash
npx quartz build --serve
```

Then open **http://localhost:8080** in your browser. The server watches `content/` and rebuilds on save — the tab should refresh automatically.

**Important:** Always use `--serve` (or `npm run preview`). A plain `npx quartz build` bakes in `/LWG-Guides` as the base path — navigation will 404 on `localhost:8080`.

**Graphics stub pages** (iframe + “Open fullscreen viewer” on [[content/Graphics/]]) use the **live GitHub Pages URL** on purpose, so embedded previews always work in the SPA. To test **local** HTML/SVG changes before deploy, open the viewer directly:

- http://localhost:8080/static/Graphics/decision_making_skeleton.html
- http://localhost:8080/static/Graphics/Opening_Response_Guide.html

After editing files under `quartz/static/Graphics/`, re-inline SVG into HTML:

```bash
node scripts/inline-graphics.mjs
```

Fullscreen viewers have **← Back** and **Home** in the toolbar; guide/index links open them in the **same tab** (no new tab).

## Deploy

Work on the `main` branch. Do not use `v5:main` — that pushes an old local branch and will be rejected.

```bash
git add -A && git commit -m "bleh" && git push origin main
```

Replace `bleh` with a short note about what you changed, or keep `bleh` for tiny tweaks.

## Page subtitle (graphics pages like Opening Response Guide)

Graphics stub pages use `cssclasses: [graphic-page]` to hide the Properties block and date.

- **On-page subtitle** — edit the italic line in the `.md` body:
  ```html
  <p class="page-subtitle">Your subtitle text here</p>
  ```
- **SEO / link previews** — edit `description:` in frontmatter (keep it matching the subtitle)

## Homepage text ([[content/Index.md]])

- `title:` in frontmatter → browser tab title
- `# Heading` in the body → on-page title
- Intro paragraph → plain markdown below the heading

## New guide

1. Copy [[content/templates/Guide Template.md]] → `content/Guides/Your Guide.md`
2. Set `draft: false` when ready
3. Add a link on [[content/Index.md]] and [[content/Guides/index.md]]
4. Interactive graphics must use full static URLs with `data-router-ignore`: `<a data-router-ignore href="https://brandanmahaffey.github.io/LWG-Guides/static/Graphics/...html">` — relative paths become SPA 404s; without `data-router-ignore`, Quartz SPA hijacks the click and the viewer JS never runs (no zoom/fit). The SPA router also bypasses `/static/Graphics/*.html` in `spa.inline.ts`. Viewer logic lives in `quartz/static/Graphics/viewer.js`. Same-tab fullscreen, no `target="_blank"`.
5. Source assets: `quartz/static/Graphics/` (`.html`, `.svg`); Excalidraw sources live in Obsidian `Excalidraw/`

## Explorer sidebar stuck?

DevTools → Application → Local Storage → delete `fileTree` → refresh.
