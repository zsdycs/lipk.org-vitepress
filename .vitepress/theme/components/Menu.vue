<!-- 页面菜单 -->
<script setup lang="ts">
import PageMode from '../components/PageMode.vue'
import { MENU } from '../composables/constant';
import { useRoute } from 'vitepress'

const route = useRoute();

const currentMenu = MENU[route.path] || MENU.default;

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

