import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { joinSegments, pathToRoot } from "../util/path"
import { classNames } from "../util/lang"

function SiteTitleImage({ fileData, cfg, displayClass }: QuartzComponentProps) {
  const base = pathToRoot(fileData.slug!)
  const homeHref = joinSegments(base, "index")
  const imgSrc = joinSegments(base, "static/site-title.png")

  return (
    <h2 class={classNames(displayClass, "page-title")}>
      <a href={homeHref} aria-label={cfg.pageTitle}>
        <img src={imgSrc} alt={cfg.pageTitle} class="site-title-img" />
      </a>
    </h2>
  )
}

export default (() => SiteTitleImage) satisfies QuartzComponentConstructor
