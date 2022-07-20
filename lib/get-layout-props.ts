import { resolveBuilderContent } from './resolve-builder-content'

export async function getLayoutProps(targetingAttributes?: any) {
  const theme = await resolveBuilderContent('theme', targetingAttributes)
  const announcementBar= await resolveBuilderContent('announcement-bar', targetingAttributes)
  const footer = await resolveBuilderContent('footer', targetingAttributes)
  return {
    theme: theme || null,
    announcementBar: announcementBar || null,
    footer: footer || null
  }
}
