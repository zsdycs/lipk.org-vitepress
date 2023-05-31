<!-- 页面菜单 -->
<script setup lang="ts">
import { useData } from '../composables/data';
import PageMode from '../components/PageMode.vue'
import { useRoute } from 'vitepress'

const route = useRoute();
const { theme } = useData();

const menu = theme.value.menu;
const currentMenu = menu[route.path] || menu.default;

</script>

<template>
  <nav class="menu">
    <ul>
      <li v-for="(item) in currentMenu" :class="{ active: route.path === item.url }">
        <a :href="item.url">{{ item.name }}</a>
      </li>
      <li>
        <PageMode />
      </li>
    </ul>
    <span style="display: none">浅色深色深橙深蓝冷黑暗黑</span>
  </nav>
</template>

