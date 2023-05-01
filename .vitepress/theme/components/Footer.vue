<!-- 页面底部 -->
<script setup lang="ts">
import { useRoute } from 'vitepress'
import { useData } from '../composables/data'
import { SVG_STRING } from '../composables/svg-resources';

const route = useRoute()
const { theme } = useData();

const nowYear = (new Date()).getUTCFullYear();

</script>

<template>
  <footer>
    <div class="copyright" v-if="route.path === '/'">
      <!-- 首页 -->
      <span>&copy;{{ theme.since }}-{{ nowYear }} {{ theme.author }}</span>
      <span v-html="SVG_STRING['version']"></span>
      <a class="svg-link" href="https://github.com/zsdycs" target="_blank" rel="noopener noreferrer"
        title="zsdycs | Github">
        <span v-html="SVG_STRING['fa-github']"></span>
      </a>
      <a class="svg-link" href="https://www.travellings.cn/go.html" target="_blank" rel="noopener noreferrer"
        title="开往-友链接力">
        <span v-html="SVG_STRING['travelling']"></span>
      </a>
      <span class="beian">
        <img src="/images/beian.png" alt="公网安备" width="17" height="17" />
        <a target="_blank" rel="noopener noreferrer"
          href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44200002444254">
          粤公网安备 44200002444254 号
        </a>
      </span>
    </div>
  </footer>
</template>
