import { h, defineComponent } from "vue";
import type { VNode } from "vue";
import type { Routes } from "../types";
import type { HeadConfig } from "vitepress";
import { parseTime } from "../utils";

interface Props {
  list: Routes[];
}

export default defineComponent({
  name: "ArchiveList",
  props: {
    list: { type: Array, default: [] },
  },
  setup(props) {
    const { list } = props as Props;

    const vnode: VNode[] = [h("div")];
    list.forEach((item, index) => {
      const currentDate = item.frontmatter?.date || "";
      const currentYear = currentDate
        ? new Date(currentDate).getFullYear()
        : "";
      const lastDate = list[index - 1]?.frontmatter?.date || "";
      const lastYear = lastDate ? new Date(lastDate).getFullYear() : "";
      const head: HeadConfig[] = item.frontmatter?.head || [];

      const descriptionMeta = head.find((itemHead) => {
        let isFind = false;
        if (itemHead?.[1]?.["name"] === "description") {
          isFind = true;
        }

        return isFind;
      });

      const content = [
        h("span", {
          class: "title",
          innerHTML: item.frontmatter?.title,
        }),
        currentDate
          ? h("time", {
              class: "date",
              innerHTML: parseTime(currentDate, "{m}-{d}"),
            })
          : "",
        descriptionMeta && descriptionMeta?.[1]?.["content"]
          ? h("p", {
              class: "summary",
              innerHTML: descriptionMeta?.[1]?.["content"],
            })
          : "",
      ];

      if (currentYear !== lastYear) {
        vnode.push(
          h("h2", { class: "archive-title", innerHTML: currentYear }),
          h(
            "a",
            {
              class: "list",
              href: item.path,
            },
            content
          )
        );
      } else {
        vnode.push(
          h(
            "a",
            {
              class: "list",
              href: item.path,
            },
            content
          )
        );
      }
    });

    return () => vnode;
  },
});
