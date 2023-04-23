<!-- list 列表页 -->
<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useData } from '../composables/data'
import { routePathList } from '../composables/route-path';
import Menu from '../components/Menu.vue';
import Meta from '../components/Meta.vue';
import type { Routes } from "../../theme";

interface BlogPath extends Routes {
  summary?: string;
}

const route = useRoute()
const { theme, frontmatter } = useData()
const blogPaths: BlogPath[] = [];

routePathList(theme.value.routes, route).forEach((item) => {
  const contentHtml = item.content;
  let summary = '';
  if (contentHtml) {
    const div = document.createElement('div');
    div.innerHTML = contentHtml;
    const contentStr = div.textContent;
    if (contentStr) {
      summary = contentStr?.substring(0, 400); // 截取前 400 个字符作为摘要
    }
  }
  blogPaths.push({
    ...item,
    summary,
  });

});


// watch(() => route.path, setHomeClass, {
//   immediate: true,
// })

// function setHomeClass() {
//   if (route.path === '/') {
//     // 首页时: <html> => <html class="home">
//     document.documentElement.classList.add('home')
//   }
// }
</script>

<template>
  <header class="masthead">
    <Menu />
  </header>
  <article class="main">
    <header v-if="frontmatter.title" class="title">
      <Meta :title="frontmatter.title" />
    </header>
    <div class="archive">
      <a class="list" v-for="(item) in blogPaths" :key="item.path" :href="item.path">
        <span class="title">{{ item.frontmatter?.title }}</span><time class="date">date TODO</time>
        <p class="summary" v-if="item.summary">{{ item.summary }}</p>
      </a>
    </div>
  </article>
</template>
