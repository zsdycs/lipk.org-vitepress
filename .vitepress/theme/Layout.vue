<script setup lang="ts">
import { inBrowser } from "vitepress";
import { useData } from "./composables/data";
import Home from "./page/Home.vue";
import List from "./page/List.vue";
import BlogContent from "./page/BlogContent.vue";
import NotFound from "./page/NotFound.vue";
import { useRoute } from "vitepress";
import { watch } from "vue";
import { setHomeClass } from "./composables/home-class";
import { setInitialMode } from "./composables/page-mode";
import { registerSW } from "./composables/register-sw";
import { consoleInfo } from "./composables/console-info";
import { useEventListener } from "./composables/event-listener";
import { throttle } from "./utils";
import { getScrollDirection } from "./composables/get-scroll-direction";
import {
  loadFont,
  applyFontFamilyToElements,
  getCurrentFontFamily,
} from "./composables/font-face";
import { printPage } from "./composables/print-page";
import { preloadSearch } from "./composables/pagefind";
import FixedButton from "./components/FixedButton.vue";
import Resume from "./page/Resume.vue";
import SearchModal from "./components/SearchModal.vue";
import UpdateNotice from "./components/UpdateNotice.vue";

// 页面加载完成后在后台静默预加载搜索索引
if (inBrowser) {
  preloadSearch();
}

const { frontmatter, page, theme } = useData();
const route = useRoute();

// 页面主题模式
setInitialMode();
// 注册 PWA
registerSW();
// 控制台信息
consoleInfo();

watch(() => route.path, setHomeClass, {
  immediate: true,
});

watch(
  () => route.path,
  async () => {
    printPage({
      path: route.path,
      frontmatter,
      theme,
    });

    // 路由切换时补加载当前已选字体的该页面子集
    await loadFont(route.path);

    // 路由切换后应用当前选中的字体
    applyFontFamilyToElements(getCurrentFontFamily());
  },
  {
    immediate: true,
  }
);

if (inBrowser) {
  useEventListener(document, "scroll", throttle(getScrollDirection, 500, 200));

  useEventListener(document, "resize", throttle(getScrollDirection, 500, 200));
}
</script>

<template>
  <!-- 首页 -->
  <Home v-if="frontmatter.homePage" />
  <!-- 列表页 -->
  <List v-else-if="frontmatter.listPage" />
  <!-- 404页 -->
  <NotFound v-else-if="page.isNotFound" />
  <!-- 简历页 -->
  <Resume v-else-if="frontmatter.resumePage" />
  <!-- 博客内容页 -->
  <BlogContent v-else-if="frontmatter.layout !== false" />
  <!-- 仅显示内容 -->
  <Content v-else />
  <!-- 固定在页面边上的按钮 -->
  <FixedButton v-if="!frontmatter.homePage" />
  <!-- PWA 更新通知 -->
  <UpdateNotice />
  <!-- 全文搜索弹框 -->
  <SearchModal />
</template>
