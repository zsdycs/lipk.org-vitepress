<!-- 路由导航 -->
<script setup lang="ts">
import { useData } from '../composables/data'
import { routePathList } from '../composables/route-path';
import type { Routes } from "../../theme";
import { useRoute } from 'vitepress'
import { watch, ref } from 'vue'
import { useEventListener } from '../composables/event-listener'

const props = defineProps<{
  routePath?: string,
}>();

const route = useRoute();
const { theme } = useData();

let lastRoute = ref<Routes | null>(null);
let nextRoute = ref<Routes | null>(null);
let lastTitle = ref('');
let nextTitle = ref('');
const prevLink = ref<HTMLAnchorElement>();
const nextLink = ref<HTMLAnchorElement>();

watch(() => route.path, setPostNavRoute, {
  immediate: true,
});

useEventListener(document, 'keyup', (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    // 左箭头
    prevLink.value?.click();
  } else if (e.key === 'ArrowRight') {
    // 右箭头
    nextLink.value?.click();
  }
});

function setPostNavRoute() {
  let routePath = '';
  if (props.routePath) {
    routePath = props.routePath;
  } else {
    // 取当前路由的前缀
    const pathname = location.pathname;
    const pathStrList = pathname.split('/');
    if (pathStrList.length === 2) {
      // 一级目录 /xxx
      routePath = '/';
    } else if (pathStrList.length === 3) {
      // 二级目录 /xxx/xxx
      routePath = `/${pathStrList[1]}/`;
    }
  }

  const routes: Routes[] = routePathList(theme.value.routes, routePath);
  const routesLength = routes.length - 1;

  const currentRouteIndex = routes.findIndex((itemRoute) => {
    let isThis = false;
    if (itemRoute.path === route.path) {
      isThis = true;
    }

    return isThis;
  });

  if (currentRouteIndex > 0 && currentRouteIndex < routesLength) {
    lastRoute.value = routes[currentRouteIndex + 1];
    nextRoute.value = routes[currentRouteIndex - 1];
    lastTitle.value = lastRoute?.value?.frontmatter?.title || '';
    nextTitle.value = nextRoute?.value?.frontmatter?.title || '';
  } else if (currentRouteIndex === 0) {
    // 第一篇
    lastRoute.value = routes[currentRouteIndex + 1];
    lastTitle.value = lastRoute?.value?.frontmatter?.title || '';
    nextRoute.value = null;
    nextTitle.value = ''
  } else if (currentRouteIndex === routesLength) {
    // 最后一篇
    lastRoute.value = null;
    lastTitle.value = '';
    nextRoute.value = routes[currentRouteIndex - 1];
    nextTitle.value = nextRoute?.value?.frontmatter?.title || ''
  }
}

</script>

<template>
  <nav class="post-nav">
    <!-- @keydown -->
    <span class="nav-prev">
      <span v-if="lastRoute">
        ← <a ref="prevLink" :href="lastRoute.path" title="单击可前进(键盘左箭头)">{{ lastTitle }}</a>
      </span>
    </span>
    <span class="nav-next">
      <span v-if="nextRoute">
        <a ref="nextLink" :href="nextRoute.path" title="单击可前进(键盘右箭头)">{{ nextTitle }}</a> →
      </span>
    </span>
  </nav>
</template>
