import { resolveBuilderContent } from './resolve-builder-content'

export async function getLayoutProps(targetingAttributes?: any) {
  const theme = await resolveBuilderContent('theme', targetingAttributes) as any
  console.log(' here getting theme with ', targetingAttributes, theme?.query, theme?.id);
  return {
    theme: theme || null,
  }
}
