<script setup lang="ts">
import { useData } from 'vitepress'
import Home from './page/Home.vue'
import List from './page/List.vue'

const { site, frontmatter, page } = useData()
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
    <!-- 列表页 -->
    <a href="/">Home</a>
    <Content />
  </template>
</template>
