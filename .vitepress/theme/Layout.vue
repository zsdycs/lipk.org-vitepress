<script setup lang="ts">
import { inBrowser, useData } from 'vitepress'
import Home from './page/Home.vue'
import List from './page/List.vue'
import BlogContent from './page/BlogContent.vue'
import NotFound from './page/NotFound.vue'
import { useRoute } from 'vitepress'
import { watch } from 'vue'
import { setHomeClass } from './composables/home-class';
import { setInitialMode } from './composables/page-mode';
import { registerSW } from './composables/register-sw';
import { consoleInfo } from './composables/console-info';
import { useEventListener } from './composables/event-listener'
import { throttle } from './utils'
import { getScrollDirection } from './composables/get-scroll-direction'
import { loadFont } from './composables/font-face'

const { frontmatter, page, } = useData();
const route = useRoute();

// 页面主题模式
setInitialMode();
// 注册PWA
registerSW();
// 控制台信息
consoleInfo();
// 加载字体
loadFont(route.path);

// 引用参考资料 TODO
// 无序复选列表 TODO
// 打印 TODO
// 图片查看 TODO
// 编辑本页 TODO
// 返回顶部 TODO

watch(() => route.path, setHomeClass, {
  immediate: true,
})


if (inBrowser) {
  useEventListener(document, 'scroll', throttle(getScrollDirection, 500, 200));

  useEventListener(document, 'resize', throttle(getScrollDirection, 500, 200));
}

// v-if="page.isNotFound" <NotFound />

</script>

<template>
  <template v-if="frontmatter.homePage">
    <!-- 首页 -->
    <Home />
  </template>
  <template v-else-if="frontmatter.listPage">
    <!-- 列表页 -->
    <List />
  </template>
  <template v-else-if="page.isNotFound">
    <!-- 404页 -->
    <NotFound />
  </template>
  <template v-else>
    <BlogContent />
  </template>
</template>
