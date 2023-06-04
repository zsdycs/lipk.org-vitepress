declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent;
  export default component;
}

declare module "@siteData" {
  import type { SiteData } from "vitepress";
  const data: SiteData;
  export default data;
}

declare module "@theme/index" {
  import type { Theme } from "vitepress";
  const theme: Theme;
  export default theme;
}

declare module "markdown-it-footnote";
{
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module "markdown-it-image-figures";
{
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}

declare module "markdown-it-task-lists";
{
  const plugin: MarkdownIt.PluginSimple;
  export default plugin;
}
