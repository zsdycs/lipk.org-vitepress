<!-- list 列表页 -->
<script setup lang="ts">
import { useRoute, useRouter } from 'vitepress'
import { watch } from 'vue'

const route = useRoute()
const router = useRouter()
console.log('---------route', route);
console.log('---------router', router);


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
