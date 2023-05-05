<!-- 404 内容页面 -->
<script setup lang="ts">
import Menu from '../components/Menu.vue';
import Footer from '../components/Footer.vue';
import { ref } from 'vue';

const footerMode = "common" // 常规

const footerComment = ref(true);
const footerPostNav = ref(false);
const locationPathname = ref(window.location.pathname);


</script>

<template>
  <header class="masthead">
    <Menu />
  </header>
  <article class="main">
    <header class="title">
      <h1>404</h1>
      <h3></h3>
      <hr id="beginning">
    </header>
    <div class="archive">
      <p>
        <b>状态：404 ，</b>
        <ins>这是个错误。</ins>
      </p>
      <p>请求路径 <code> {{ locationPathname }}</code> 在服务器中没有找到对应的资源。</p>
      <figure class="image">
        <img src="/images/watchdog.gif" alt="404 not found" title="404 not found" />
      </figure>
    </div>
    <Footer :mode="footerMode" :comment="footerComment" :postNav="footerPostNav" />
  </article>
</template>
