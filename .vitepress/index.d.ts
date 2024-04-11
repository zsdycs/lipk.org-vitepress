declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent;
  export default component;
}

declare module "markdown-it-footnote";

declare module "markdown-it-image-figures";

declare module "markdown-it-task-lists";
