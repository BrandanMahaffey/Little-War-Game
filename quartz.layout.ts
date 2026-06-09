import SiteTitleImage from "./quartz/components/SiteTitleImage"
import type { QuartzComponent } from "./quartz/components/types"

type PageLayout = {
  left?: QuartzComponent[]
  right?: QuartzComponent[]
  [key: string]: unknown
}

type FullLayout = {
  defaults: PageLayout
  byPageType: Record<string, PageLayout>
}

function prependSiteTitle(left?: QuartzComponent[]) {
  return [SiteTitleImage(), ...(left ?? [])]
}

export function applyLayoutOverrides(layout: FullLayout): FullLayout {
  return {
    defaults: {
      ...layout.defaults,
      left: prependSiteTitle(layout.defaults.left),
      right: layout.defaults.right?.filter((c) => c.displayName !== "TableOfContents"),
    },
    byPageType: Object.fromEntries(
      Object.entries(layout.byPageType).map(([pageType, pageLayout]) => [
        pageType,
        {
          ...pageLayout,
          left: pageLayout.left ? prependSiteTitle(pageLayout.left) : pageLayout.left,
          right: pageLayout.right?.filter((c) => c.displayName !== "TableOfContents"),
        },
      ]),
    ),
  }
}
