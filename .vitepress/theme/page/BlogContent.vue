<!-- blog content 内容页面 -->
<script setup lang="ts">
import { useData } from '../composables/data';
import Menu from '../components/Menu.vue';
import Meta from '../components/Meta.vue';
import Footer from '../components/Footer.vue';
import { watch, ref } from 'vue';
import { useRoute } from 'vitepress';
import { setRightQuotes } from '../composables/right-quote';

const { frontmatter } = useData()
const route = useRoute();

const footerMode = "common" // 常规

let footerComment = ref(true);
let footerPostNav = ref(true);

watch(() => route.path, setFooter, {
  immediate: true,
});

watch(() => route.path, setRightQuotes, {
  immediate: true,
})

function setFooter() {
  if (frontmatter.value.notComment === true) {
    // 不带有评论
    footerComment.value = false;
  } else {
    footerComment.value = true;
  }

  if (frontmatter.value.notPostNav === true) {
    footerPostNav.value = false;
  } else {
    footerPostNav.value = true;
  }
}

</script>

<template>
  <header class="masthead">
    <Menu />
  </header>
  <article class="main">
    <header v-if="frontmatter.title" class="title">
      <Meta :title="frontmatter.title" :blog="true" />
    </header>
    <div class="archive">
      <Content />
    </div>
    <Footer :mode="footerMode" :comment="footerComment" :postNav="footerPostNav" />
  </article>
</template>
