import { inBrowser } from "vitepress";

export interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

interface ZhFallbackPage {
  url: string;
  title: string;
  text: string;
}

let pagefindInstance: any = null;
let loadPromise: Promise<any> | null = null;
let zhFallbackPromise: Promise<ZhFallbackPage[]> | null = null;

export async function loadPagefind(): Promise<any | null> {
  if (!inBrowser) {
    return null;
  }
  if (pagefindInstance) {
    return pagefindInstance;
  }
  if (loadPromise) {
    return loadPromise;
  }
  // 使用动态模板字符串避免 Vite 在开发模式下解析不存在的绝对路径
  const pagefindModule = "pagefind";
  // @ts-ignore
  loadPromise = import(/* @vite-ignore */ `/${pagefindModule}/pagefind.js`)
    .then(async (mod) => {
      const pf = mod.default || mod;
      await pf.init();
      // 降低页面长度惩罚、降低词频饱和度，让短页面也能出现在结果中
      await pf.options({
        ranking: {
          pageLength: 0.1,
          termSaturation: 0.5,
        },
      });
      pagefindInstance = pf;
      return pf;
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("[Pagefind] 加载搜索索引失败，请确认已执行构建命令生成索引。", err);
      return null;
    });
  return loadPromise;
}

function loadZhFallback(): Promise<ZhFallbackPage[]> {
  if (zhFallbackPromise) {
    return zhFallbackPromise;
  }
  zhFallbackPromise = fetch("/pagefind-zh.json")
    .then(async (res) => {
      if (!res.ok) return [];
      return (await res.json()) as ZhFallbackPage[];
    })
    .catch(() => []);
  return zhFallbackPromise;
}

function containsCjk(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

function makeExcerpt(text: string, query: string, length = 60): string {
  const idx = text.indexOf(query);
  if (idx === -1) return text.slice(0, length);
  const start = Math.max(0, idx - length / 2);
  const end = Math.min(text.length, idx + query.length + length / 2);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  const snippet = text.slice(start, end);
  return (
    prefix +
    snippet.replace(
      new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      "<mark>$&</mark>"
    ) +
    suffix
  );
}

export async function searchPagefind(query: string): Promise<{
  results: SearchResult[];
  timings: any;
}> {
  const pf = await loadPagefind();
  const pfResults: SearchResult[] = [];
  let timings: any;

  if (pf) {
    const response = await pf.search(query);
    timings = response.timings;
    const mapped = await Promise.all(
      response.results.map(async (item: any) => {
        const data = await item.data();
        return {
          url: data.url,
          title: data.meta?.title || data.title || "无标题",
          excerpt: data.excerpt,
        };
      })
    );
    pfResults.push(...mapped);
  }

  // For CJK queries, also perform a simple substring fallback because
  // Pagefind's Intl.Segmenter can split common words into single characters
  // at query time while indexing them as whole words, causing exact-word
  // matches to be missed.
  if (containsCjk(query)) {
    const pages = await loadZhFallback();
    const seen = new Set(pfResults.map((r) => r.url));
    for (const page of pages) {
      if (seen.has(page.url)) continue;
      if (!page.text.includes(query)) continue;
      seen.add(page.url);
      pfResults.push({
        url: page.url,
        title: page.title || "无标题",
        excerpt: makeExcerpt(page.text, query),
      });
    }
  }

  return { results: pfResults, timings };
}
