<script setup lang="ts">
import { useData } from 'vitepress'
import Home from './page/Home.vue'
import List from './page/List.vue'
import { useRoute } from 'vitepress'
import { watch } from 'vue'
import { setHomeClass } from './composables/home-class';
import { setInitialMode } from './composables/page-mode';

const { site, frontmatter, page, } = useData();
const route = useRoute();

setInitialMode();

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
    <!-- 404 -->
    <a href="/">Home</a>
    404
    <Content />
  </template>
  <template v-else>
    <a href="/">Home</a>
    <Content />
  </template>
</template>
