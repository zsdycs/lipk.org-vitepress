<!-- 页面底部 -->
<script setup lang="ts">
import { useData } from '../composables/data'
import { SVG_STRING } from '../composables/svg-resources';
import PostNav from '../components/PostNav.vue'
import Beaudar from "../components/Beaudar.vue";

const props = defineProps<{
  mode: string, // 模式 home, common
  comment?: boolean, // 是否显示评论
  postNav?: boolean, // 是否显示导航
}>();

const { theme } = useData();

const nowYear = (new Date()).getUTCFullYear();

</script>

<template>
  <footer>
    <!-- mode === 'home' 首页 -->
    <div class="copyright" v-if="props.mode === 'home'">
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

    <!-- 结束线 -->
    <div id="eof" v-if="postNav || comment">
      <hr>
    </div>

    <!-- 导航 -->
    <PostNav v-if="postNav" />

    <!-- 表达 评论 -->
    <Beaudar v-if="comment" class="comments"></Beaudar>

    <!-- mode === 'common' 常规 -->
    <hr v-if="props.mode === 'common'">
    <div class="copyright" v-if="props.mode === 'common'">
      <span class="slogan" v-if="theme.slogan">{{ theme.slogan }}</span>
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
