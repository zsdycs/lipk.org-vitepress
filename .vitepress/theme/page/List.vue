<!-- list 列表页 -->
<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useData } from '../composables/data'
import { ref } from 'vue'
import { routePathList } from '../composables/route-path';

const route = useRoute()
const { theme, frontmatter } = useData()
const blogPaths = ref(routePathList(theme.value.routes, route))

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
  <main class="main">
    <article>
      <header v-if="frontmatter.title" class="title">
        <h1>{{ frontmatter.title }}</h1>
        <h3></h3>
        <hr id="beginning">
      </header>
      <div class="archive">
        <a class="list" v-for="(item) in blogPaths" :key="item.path" :href="item.path">
          <span class="title">{{ item.frontmatter?.title }}</span><time class="date">date TODO</time>
          <p class="summary">summary TODO</p>
        </a>
      </div>
    </article>
  </main>
</template>
