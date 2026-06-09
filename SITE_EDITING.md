# LWG Site Editing Cheat Sheet

Pin this file in your editor — it is **not** published (lives outside `content/`).

## What to edit

| What you want to change | File |
| --- | --- |
| Homepage heading, intro, guide list | `content/Index.md` |
| Site name in top-left sidebar | `quartz.config.yaml` → `pageTitle` |
| "Browse" sidebar label | `quartz.config.yaml` → explorer `options.title` |
| Footer links (YouTube, etc.) | `quartz.config.yaml` → footer `links` |
| Any guide content | `content/Guides/Your Guide.md` |
| Graphics page stubs | `content/Graphics/*.md` |
| Page subtitle (graphics pages) | italic `<p class="page-subtitle">` under `# title` in the `.md` body |
| SEO / search preview text | `description:` in frontmatter (keep in sync with subtitle) |
| Sidebar / homepage styling | `quartz/styles/custom.scss` |

## Preview locally

```bash
npx quartz build --serve
```

**Important:** Always use `--serve` for local preview. A plain `npx quartz build` bakes in `/Little-War-Game` as the base path — navigation will 404 on `localhost:8080`.

## Deploy

You work on the `main` branch now (history was squashed to a single commit). Make sure you're on `main` before pushing — not `v5:main`, which pushes an old local branch and will be rejected.

```bash
git add -A && git commit -m "bleh" && git push origin main
```

Replace `bleh` with a short note about what you changed, or keep `bleh` if it's a tiny tweak.

## Page subtitle (graphics pages like Opening Response Guide)

Graphics stub pages use `cssclasses: [graphic-page]` to hide the Properties block and date.

- **On-page subtitle** — edit the italic line in the `.md` body:
  ```html
  <p class="page-subtitle">Your subtitle text here.</p>
  ```
- **SEO / link previews** — edit `description:` in frontmatter (keep it matching the subtitle)

## Homepage text (`content/Index.md`)

- `title:` in frontmatter → browser tab title
- `# Heading` in the body → on-page title
- Intro paragraph → plain markdown below the heading

## New guide

1. Copy `content/templates/Guide Template.md` → `content/Guides/Your Guide.md`
2. Set `draft: false` when ready
3. Add a link on `content/Index.md` and `content/Guides/index.md`
4. Interactive graphics use full URLs: `https://brandanmahaffey.github.io/Little-War-Game/static/Graphics/...html`

## Explorer sidebar stuck?

DevTools → Application → Local Storage → delete `fileTree` → refresh.
