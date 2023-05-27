import { inBrowser } from "vitepress";
import { onMounted } from "vue";

export const setRightQuotes = () => {
  onMounted(() => {
    if (!inBrowser) {
      return;
    }
    const quotes = document.getElementsByTagName("blockquote");
    for (let i = 0; i < quotes.length; i++) {
      const quote = quotes[i];
      const n = quote.children.length;
      if (n === 0) continue;
      const el = <HTMLElement>quote.children[n - 1];
      if (!el || el.nodeName !== "P") continue;
      // 右对齐 p 如果开头为: '—' 或 '——'
      if (/^(—|——)/.test(el.textContent || "")) el.style.textAlign = "right";
    }
  });
};
