<!-- 页面内目录导航栏 -->
<script setup lang="ts">
import { inBrowser } from "vitepress";
import { onMounted, onUnmounted } from "vue";
import initToc from "../composables/table-of-contents";

let toc: any = null;

onMounted(() => {
  handleTableOfContents();
});

onUnmounted(() => {
  if (toc) {
    toc.destroy();
    toc = null;
  }
});

function handleTableOfContents() {
  if (inBrowser) {
    toc = initToc();
  }
}
</script>

<template>
  <div id="tableOfContents-bar"></div>
</template>
