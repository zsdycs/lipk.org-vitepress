<!-- list 列表页 -->
<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useData } from '../composables/data'

const route = useRoute()
const { theme } = useData()
console.log('---------route', route.path, '/blog/');
console.log('--------theme.routes', theme.value.routes);


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
  <main class="index">
    <article>
      <Content />
    </article>
  </main>
</template>
