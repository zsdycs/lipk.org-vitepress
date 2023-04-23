<script setup lang="ts">
import { useData } from 'vitepress'
import Home from './page/Home.vue'
import List from './page/List.vue'
import { useRoute } from 'vitepress'
import { watch } from 'vue'
import { setHomeClass } from './composables/home-class';
import { setInitialMode } from './composables/page-mode';
import { registerSW } from './composables/register-sw';
import { consoleInfo } from './composables/console-info';

const { frontmatter, page, } = useData();
const route = useRoute();

// 页面主题模式
setInitialMode();
// 注册PWA
registerSW();
// 控制台信息
consoleInfo();

// 引用文言 TODO
// 引用参考资料 TODO
// 无序复选列表 TODO
// 菜单栏自动隐藏 TODO
// 评论 TODO
// 打印 TODO
// 目录 TODO
// 图片查看 TODO
// 编辑本页 TODO
// 返回顶部 TODO
// 404页 TODO
// 字体 TODO

watch(() => route.path, setHomeClass, {
  immediate: true,
})

// v-if="page.isNotFound" <NotFound />

</script>

<template>
  <template v-if="frontmatter.home">
    <!-- 首页 -->
    <Home />
  </template>
  <template v-else-if="frontmatter.list">
    <!-- 列表页 -->
    <List />
    <a href="/">Home</a>
  </template>
  <template v-else-if="page.isNotFound">
    <!-- 404页 -->
    <a href="/">Home</a>
    404
    <Content />
  </template>
  <template v-else>
    <a href="/">Home</a>
    <Content />
  </template>
</template>
