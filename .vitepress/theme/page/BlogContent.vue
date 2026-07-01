<!-- blog content 内容页面 -->
<script setup lang="ts">
import { useData } from "../composables/data";
import Menu from "../components/Menu.vue";
import Meta from "../components/Meta.vue";
import TableOfContentsBar from "../components/TableOfContentsBar.vue";
import Footer from "../components/Footer.vue";
import { setRightQuotes } from "../composables/right-quote";
import { watch, ref } from "vue";
import { useRoute } from "vitepress";
import { inBrowser } from "vitepress";

const { frontmatter } = useData();
const route = useRoute();

const footerMode = "common"; // 常规

let footerComment = ref(true);
let footerPostNav = ref(true);

watch(() => route.path, setFooter, {
  immediate: true,
});

watch(() => route.path, setRightQuotes, {
  immediate: true,
});

watch(() => route.path, handlePictureView, {
  immediate: true,
});

watch(() => route.path, revertArticleStyle, {
  immediate: true,
});

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

function handlePictureView() {
  if (frontmatter.value.pictureView && inBrowser) {
    // @ts-ignore
    import("photoswipe/style.css");
    import("photoswipe/lightbox").then((mod) => {
      const PhotoSwipeLightbox = mod.default || mod;
      const lightbox = new PhotoSwipeLightbox({
        gallerySelector: "article.main",
        childSelector: "figure img",
        pswpModule: () => import("photoswipe"),
      });
      lightbox.on("itemData", (item: any) => {
        const { itemData, index } = item;
        const { element } = itemData;
        const dataSource = frontmatter.value.pictureView;

        itemData.src = dataSource[index].src;
        itemData.w =
          dataSource[index].w || (element as HTMLImageElement).naturalWidth;
        itemData.h =
          dataSource[index].h || (element as HTMLImageElement).naturalHeight;
        itemData.msrc = dataSource[index].msrc || dataSource[index].src;
        itemData.thumbCropped = true;
      });
      lightbox.init();
      document.querySelectorAll("figure img").forEach((element) => {
        (element as HTMLImageElement).style.cursor = "pointer";
      });
    });
  }
}

function revertArticleStyle() {
  if (!inBrowser || frontmatter.value.tableOfContents) {
    return;
  }
  const main = document.querySelector(".main") as HTMLElement | null;
  if (main) main.style.borderRight = "0px";
}
</script>

<template>
  <header class="masthead">
    <Menu />
  </header>
  <TableOfContentsBar v-if="frontmatter.tableOfContents" />
  <article class="main">
    <header v-if="frontmatter.title" class="title">
      <Meta :title="frontmatter.title" :blog="true" />
    </header>
    <div class="archive" :data-pagefind-body="frontmatter.search !== false ? '' : undefined">
      <span v-if="frontmatter.title" data-pagefind-meta="title" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">{{ frontmatter.title }}</span>
      <Content />
    </div>
    <Footer :mode="footerMode" :comment="footerComment" :postNav="footerPostNav" />
  </article>
</template>
