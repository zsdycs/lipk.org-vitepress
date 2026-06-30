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
import { loadFont } from "./composables/font-face";
import { printPage } from "./composables/print-page";
import FixedButton from "./components/FixedButton.vue";
import Resume from "./page/Resume.vue";
import SearchModal from "./components/SearchModal.vue";

const { frontmatter, page, theme } = useData();
const route = useRoute();

// 页面主题模式
setInitialMode();
// 注册 PWA
registerSW();
// 控制台信息
consoleInfo();
// 加载字体
loadFont(route.path);

watch(() => route.path, setHomeClass, {
  immediate: true,
});

watch(
  () => route.path,
  () => {
    printPage({
      path: route.path,
      frontmatter,
      theme,
    });
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
  <!-- 全文搜索弹框 -->
  <SearchModal />
</template>
