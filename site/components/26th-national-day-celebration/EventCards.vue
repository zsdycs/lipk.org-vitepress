<!-- 26年国庆活动 · 每日行程卡片 -->
<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { inBrowser } from "vitepress";
import {
  EVENT,
  allCheckItems,
  type EventCheckItem,
  type EventDay,
} from "./event-data";

/* ================= 常量 ================= */

const days = EVENT.days;
const TOTAL_ITEMS = allCheckItems(EVENT).length;

/** 勾选状态 localStorage key（用户打勾记录，优先于文件默认状态） */
const STORE_KEY = `lipk:event:${EVENT.id}:checks`;
/** 首次访问引导 localStorage key */
const GUIDE_KEY = `lipk:event:${EVENT.id}:guide-seen`;

/** 站点深色主题列表（与 .vitepress/theme/composables/constant.ts 的 DARK_MODE 一致） */
const DARK_THEMES = [
  "github-dark",
  "github-dark-orange",
  "dark-blue",
  "icy-dark",
  "photon-dark",
];

const WEEK_TEXT = ["日", "一", "二", "三", "四", "五", "六"];

/* ================= 响应式状态 ================= */

/** 是否已完成挂载（控制入场淡入，避免 SSR 与客户端不一致） */
const ready = ref(false);
/** 今天的日期串 YYYY-MM-DD（仅在客户端挂载后设置） */
const todayStr = ref("");
/** 当前卡片下标 */
const activeIndex = ref(0);
/** 深色模式（跟随站点 html[theme] 属性，站点按打开时间自动切换深浅色） */
const isDark = ref(false);
/** 用户对勾选项的修改记录：{ [itemId]: boolean }，未记录的项读取文件默认 done */
const overrides = ref<Record<string, boolean>>({});
/** 是否展示首次访问引导 */
const showGuide = ref(false);

/* ================= 主题（深 / 浅色） ================= */

const detectDark = () =>
  inBrowser &&
  DARK_THEMES.includes(
    document.documentElement.getAttribute("theme") || ""
  );

let themeObserver: MutationObserver | null = null;

/* ================= 日期与卡片状态 ================= */

type DayStatus = "unknown" | "ended" | "today" | "upcoming";

const statusOf = (day: EventDay): DayStatus => {
  if (!todayStr.value) return "unknown";
  if (day.date < todayStr.value) return "ended";
  if (day.date === todayStr.value) return "today";
  return "upcoming";
};

const diffDays = (day: EventDay): number => {
  if (!todayStr.value) return 0;
  const a = new Date(`${day.date}T00:00:00`).getTime();
  const b = new Date(`${todayStr.value}T00:00:00`).getTime();
  return Math.round((a - b) / 86400000);
};

const statusText = (day: EventDay): string => {
  const s = statusOf(day);
  if (s === "ended") return "已结束";
  if (s === "today") return "今天";
  if (s === "upcoming") {
    const d = diffDays(day);
    return d > 0 ? `${d} 天后` : "未开始";
  }
  return "";
};

const formatDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getMonth() + 1}月${d.getDate()}日 周${WEEK_TEXT[d.getDay()]}`;
};

/* ================= 勾选（打勾） ================= */

/** 展示状态：用户打过勾的以 localStorage 记录为准，否则读取文件默认 done */
const isDone = (item: EventCheckItem): boolean =>
  overrides.value[item.id] ?? item.done;

const persist = () => {
  if (!inBrowser) return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(overrides.value));
  } catch {
    /* 隐私模式等场景下静默失败 */
  }
};

const toggle = (item: EventCheckItem) => {
  dismissGuide();
  overrides.value = { ...overrides.value, [item.id]: !isDone(item) };
  persist();
};

const doneCount = computed(
  () => allCheckItems(EVENT).filter((it) => isDone(it)).length
);

const percent = computed(() =>
  TOTAL_ITEMS === 0 ? 0 : Math.round((doneCount.value / TOTAL_ITEMS) * 100)
);

const dayDoneCount = (day: EventDay): number => {
  let n = day.schedule.filter((it) => isDone(it)).length;
  if (Array.isArray(day.transport)) {
    n += day.transport.filter((it) => isDone(it)).length;
  }
  return n;
};

const dayTotalCount = (day: EventDay): number =>
  day.schedule.length + (Array.isArray(day.transport) ? day.transport.length : 0);

/* ================= 卡片轮播 ================= */

const viewportRef = ref<HTMLElement | null>(null);
const trackRef = ref<HTMLElement | null>(null);

const cardWidth = ref(0);
const cardGap = ref(0);
const viewportWidth = ref(0);
/** 视口高度（贴合当前卡片高度，切换时动画过渡） */
const viewportHeight = ref(0);

/** 将视口高度对齐到当前卡片 */
const updateHeight = async () => {
  await nextTick();
  const track = trackRef.value;
  if (!track) return;
  const card = track.children[activeIndex.value] as HTMLElement | undefined;
  if (card) viewportHeight.value = card.offsetHeight;
};

watch(activeIndex, updateHeight);

/** 拖拽偏移量（px），为 0 且未拖拽时由 activeIndex 决定位置 */
const dragX = ref(0);
const dragging = ref(false);

const measure = () => {
  const viewport = viewportRef.value;
  const track = trackRef.value;
  if (!viewport || !track) return;
  const card = track.querySelector<HTMLElement>(".ev-card");
  if (!card) return;
  viewportWidth.value = viewport.clientWidth;
  cardWidth.value = card.offsetWidth;
  const gap = parseFloat(getComputedStyle(track).columnGap || "0");
  cardGap.value = Number.isFinite(gap) ? gap : 0;
};

/** 让第 i 张卡片居中所需的位移 */
const offsetFor = (i: number): number => {
  const step = cardWidth.value + cardGap.value;
  return i * step - (viewportWidth.value - cardWidth.value) / 2;
};

const trackStyle = computed(() => {
  const x = -offsetFor(activeIndex.value) + dragX.value;
  return { transform: `translate3d(${x}px, 0, 0)` };
});

const canPrev = computed(() => activeIndex.value > 0);
const canNext = computed(() => activeIndex.value < days.length - 1);

const goTo = (i: number) => {
  const next = Math.min(Math.max(i, 0), days.length - 1);
  if (next !== activeIndex.value) {
    activeIndex.value = next;
    dismissGuide();
  }
};

const prev = () => goTo(activeIndex.value - 1);
const next = () => goTo(activeIndex.value + 1);

/* ---- 触摸 / 鼠标拖拽 ---- */

let startX = 0;
let startY = 0;
let lastX = 0;
let lastT = 0;
let moved = false;
let lockAxis: "" | "x" | "y" = "";
let activePointerId = -1;
let captured = false;

/** 边缘橡皮筋效果 */
const rubber = (dx: number): number => {
  const atStart = activeIndex.value === 0 && dx > 0;
  const atEnd = activeIndex.value === days.length - 1 && dx < 0;
  return atStart || atEnd ? dx * 0.35 : dx;
};

const onPointerDown = (e: PointerEvent) => {
  if (!e.isPrimary || e.button > 0) return;
  startX = lastX = e.clientX;
  startY = e.clientY;
  lastT = performance.now();
  moved = false;
  lockAxis = "";
  activePointerId = e.pointerId;
  captured = false;
  dragging.value = true;
};

const onPointerMove = (e: PointerEvent) => {
  if (!dragging.value || !e.isPrimary) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  // 轴向锁定：横向滑动才接管，纵向让位给页面滚动
  if (!lockAxis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
    lockAxis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
    // 确认是横向拖拽后才捕获指针，避免普通点击被重定向到容器而失效
    if (lockAxis === "x" && !captured) {
      viewportRef.value?.setPointerCapture?.(activePointerId);
      captured = true;
    }
  }
  if (lockAxis === "y") return;

  if (Math.abs(dx) > 6) moved = true;
  dragX.value = rubber(dx);
  lastX = e.clientX;
  lastT = performance.now();
};

const endDrag = (e: PointerEvent, cancelled = false) => {
  if (!dragging.value || !e.isPrimary) return;
  dragging.value = false;

  if (!cancelled && lockAxis !== "y") {
    const dx = e.clientX - startX;
    const dt = Math.max(performance.now() - lastT, 1);
    const velocity = Math.abs(e.clientX - lastX) / dt; // px/ms
    const passDistance = Math.abs(dx) > Math.min(cardWidth.value * 0.2, 90);
    const passVelocity = velocity > 0.35 && Math.abs(dx) > 24;

    if ((passDistance || passVelocity) && dx < 0 && canNext.value) {
      next();
    } else if ((passDistance || passVelocity) && dx > 0 && canPrev.value) {
      prev();
    } else if (Math.abs(dx) > 6) {
      dismissGuide();
    }
  }
  dragX.value = 0;
};

const onPointerUp = (e: PointerEvent) => endDrag(e);
const onPointerCancel = (e: PointerEvent) => endDrag(e, true);

/** 拖拽结束后抑制意外点击（避免松手时触发打勾） */
const onClickCapture = (e: MouseEvent) => {
  if (moved) {
    e.stopPropagation();
    e.preventDefault();
    moved = false;
  }
};

/* ---- 触控板横向滚动 ---- */

let wheelAcc = 0;
let wheelCooling = false;

const onWheel = (e: WheelEvent) => {
  if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
  e.preventDefault();
  if (wheelCooling) return;
  wheelAcc += e.deltaX;
  if (Math.abs(wheelAcc) > 60) {
    wheelAcc > 0 ? next() : prev();
    wheelAcc = 0;
    wheelCooling = true;
    window.setTimeout(() => (wheelCooling = false), 450);
  }
};

/* ---- 键盘左右切换 ---- */

const onKeydown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement | null;
  if (
    target &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable)
  ) {
    return;
  }
  if (e.key === "ArrowLeft") prev();
  else if (e.key === "ArrowRight") next();
};

/* ================= 首次访问引导 ================= */

let guideTimer = 0;

const dismissGuide = () => {
  if (!showGuide.value) return;
  showGuide.value = false;
  if (inBrowser) {
    try {
      localStorage.setItem(GUIDE_KEY, "1");
    } catch {
      /* ignore */
    }
  }
  window.clearTimeout(guideTimer);
};

const maybeShowGuide = () => {
  if (!inBrowser || days.length < 2) return;
  let seen = false;
  try {
    seen = localStorage.getItem(GUIDE_KEY) === "1";
  } catch {
    seen = true;
  }
  if (seen) return;
  showGuide.value = true;
  // 6 秒后自动消失
  guideTimer = window.setTimeout(dismissGuide, 6000);
};

/* ================= 默认定位到今天 ================= */

const locateToday = () => {
  if (!todayStr.value) return 0;
  const i = days.findIndex((d) => d.date >= todayStr.value);
  if (i === -1) return days.length - 1; // 活动已全部结束，停到最后一天
  // 当天之后的卡片是未来，若当天早于活动开始则停第一天
  return i;
};

/* ================= 隐藏页面默认标题头 ================= */

let titleEleDisplay = "";
const hidePageTitle = () => {
  const el = document.querySelector<HTMLElement>("header.title");
  if (el) {
    titleEleDisplay = el.style.display;
    el.style.display = "none";
  }
};
const restorePageTitle = () => {
  const el = document.querySelector<HTMLElement>("header.title");
  if (el) el.style.display = titleEleDisplay;
};

/* ================= 生命周期 ================= */

const onResize = () => {
  measure();
  updateHeight();
};

onMounted(async () => {
  // 今天日期（支持 ?today=YYYY-MM-DD 预览任意日期的卡片状态）
  let today = "";
  const param = new URLSearchParams(location.search).get("today");
  if (param && /^\d{4}-\d{2}-\d{2}$/.test(param)) {
    today = param;
  } else {
    const n = new Date();
    today = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(n.getDate()).padStart(2, "0")}`;
  }
  todayStr.value = today;

  // 主题
  isDark.value = detectDark();
  themeObserver = new MutationObserver(() => (isDark.value = detectDark()));
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["theme"],
  });

  // 读取浏览器中记录的勾选状态
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) overrides.value = JSON.parse(raw) || {};
  } catch {
    /* ignore */
  }

  // 默认展示当天卡片
  activeIndex.value = locateToday();

  await nextTick();
  measure();
  await updateHeight();
  ready.value = true;

  // 字体加载完成后卡片高度可能变化，重新测量
  document.fonts?.ready.then(() => {
    measure();
    updateHeight();
  });

  hidePageTitle();
  maybeShowGuide();

  window.addEventListener("resize", onResize);
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  restorePageTitle();
  themeObserver?.disconnect();
  window.removeEventListener("resize", onResize);
  document.removeEventListener("keydown", onKeydown);
  window.clearTimeout(guideTimer);
});
</script>

<template>
  <div class="event-page" :class="{ dark: isDark, ready }">
    <!-- 头部 -->
    <header class="ev-header">
      <p class="ev-overline">{{ EVENT.subtitle }}</p>
      <div class="ev-progress">
        <div class="ev-progress-track">
          <i class="ev-progress-bar" :style="{ width: `${percent}%` }"></i>
        </div>
        <span class="ev-progress-text">{{ doneCount }}/{{ TOTAL_ITEMS }}</span>
      </div>
    </header>

    <!-- 卡片轮播 -->
    <div ref="viewportRef" class="ev-viewport" :class="{ dragging }" @pointerdown="onPointerDown"
      @pointermove="onPointerMove" @pointerup="onPointerUp" @pointercancel="onPointerCancel"
      @click.capture="onClickCapture" @wheel="onWheel" :style="ready ? { height: `${viewportHeight}px` } : undefined">
      <div ref="trackRef" class="ev-track" :style="trackStyle">
        <section v-for="(day, i) in days" :key="day.id" class="ev-card"
          :class="[statusOf(day), { active: i === activeIndex }]" :aria-hidden="i !== activeIndex">
          <!-- 卡片头 -->
          <header class="ev-card-head">
            <div class="ev-card-head-main">
              <span class="ev-day-label">{{ day.label }}</span>
              <span class="ev-day-date">{{ formatDate(day.date) }}</span>
            </div>
            <span v-if="statusOf(day) !== 'unknown'" class="ev-status">
              {{ statusText(day) }}
            </span>
          </header>

          <!-- 行程 -->
          <div class="ev-sec">
            <h3 class="ev-sec-title">
              <svg viewBox="0 0 24 24" class="ev-ico">
                <path d="M12 21s-7-5.1-7-11a7 7 0 1 1 14 0c0 5.9-7 11-7 11Z" fill="none" stroke="currentColor"
                  stroke-width="1.8" />
                <circle cx="12" cy="10" r="2.6" fill="currentColor" />
              </svg>
              行程
              <span class="ev-sec-count">{{ dayDoneCount(day) }}/{{ dayTotalCount(day) }}</span>
            </h3>
            <ul class="ev-list">
              <li v-for="it in day.schedule" :key="it.id">
                <button type="button" class="ev-check" :class="{ done: isDone(it) }" role="checkbox"
                  :aria-checked="isDone(it)" :tabindex="i === activeIndex ? undefined : -1" @click="toggle(it)">
                  <span class="ev-box">
                    <svg viewBox="0 0 16 16">
                      <path d="M3.2 8.6 6.4 11.6 12.8 4.6" />
                    </svg>
                  </span>
                  <span class="ev-txt"
                    ><span class="ev-txt-line">{{ it.text }}</span></span
                  >
                </button>
              </li>
            </ul>
          </div>

          <!-- 交通 -->
          <div class="ev-sec">
            <h3 class="ev-sec-title">
              <svg viewBox="0 0 24 24" class="ev-ico">
                <path
                  d="M6 3h12a2 2 0 0 1 2 2v8a3 3 0 0 1-3 3l2 3h-2.4l-1.6-2.4H9L7.4 19H5l2-3a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2Z"
                  fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
                <path d="M6 10h12" stroke="currentColor" stroke-width="1.8" />
                <circle cx="9" cy="13" r="1" fill="currentColor" />
                <circle cx="15" cy="13" r="1" fill="currentColor" />
              </svg>
              交通
            </h3>
            <ul v-if="Array.isArray(day.transport)" class="ev-list">
              <li v-for="it in day.transport" :key="it.id">
                <button type="button" class="ev-check" :class="{ done: isDone(it) }" role="checkbox"
                  :aria-checked="isDone(it)" :tabindex="i === activeIndex ? undefined : -1" @click="toggle(it)">
                  <span class="ev-box">
                    <svg viewBox="0 0 16 16">
                      <path d="M3.2 8.6 6.4 11.6 12.8 4.6" />
                    </svg>
                  </span>
                  <span class="ev-txt"
                    ><span class="ev-txt-line">{{ it.text }}</span></span
                  >
                </button>
              </li>
            </ul>
            <p v-else class="ev-plain">{{ day.transport }}</p>
          </div>

          <!-- 住宿 -->
          <div v-if="day.stay" class="ev-sec">
            <h3 class="ev-sec-title">
              <svg viewBox="0 0 24 24" class="ev-ico">
                <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" fill="none" stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" />
                <path d="M3 18h18M5 9V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" fill="none" stroke="currentColor"
                  stroke-width="1.8" stroke-linecap="round" />
              </svg>
              住宿
            </h3>
            <p class="ev-plain">{{ day.stay }}</p>
          </div>
        </section>
      </div>

      <!-- 左右箭头 -->
      <button type="button" class="ev-arrow prev" :class="{ disabled: !canPrev }" aria-label="前一天" @click="prev">
        <svg viewBox="0 0 24 24">
          <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>
      <button type="button" class="ev-arrow next" :class="{ disabled: !canNext }" aria-label="后一天" @click="next">
        <svg viewBox="0 0 24 24">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>

      <!-- 首次访问滑动引导 -->
      <transition name="ev-fade">
        <div v-if="showGuide" class="ev-guide">
          <div class="ev-guide-card">
            <span class="ev-guide-hand">👆</span>
            <p>左右滑动，切换每日行程</p>
          </div>
        </div>
      </transition>
    </div>

    <!-- 指示点 -->
    <nav class="ev-dots" aria-label="日期选择">
      <button v-for="(day, i) in days" :key="day.id" type="button" class="ev-dot"
        :class="{ active: i === activeIndex, ended: statusOf(day) === 'ended' }"
        :aria-label="`${day.label} ${formatDate(day.date)}`" @click="goTo(i)"></button>
    </nav>
    <p class="ev-position">{{ activeIndex }}/{{ days.length - 1 }}</p>
  </div>
</template>

<style scoped>
/* ============ 主题变量（浅色默认，深色跟随站点 theme 属性） ============ */
.event-page {
  --ev-accent: #e5484d;
  --ev-accent-soft: rgba(229, 72, 77, 0.1);
  --ev-done: #16a34a;
  --ev-card-bg: #ffffff;
  --ev-border: #e9e9ee;
  --ev-text: #1b1b1f;
  --ev-text-2: #79797f;
  --ev-track: #ececf1;
  --ev-hover: rgba(27, 27, 31, 0.05);
  --ev-shadow: 0 14px 34px -16px rgba(20, 20, 40, 0.18);
  --ev-guide-bg: rgba(20, 20, 26, 0.72);
  color: var(--ev-text);
}

.event-page.dark {
  --ev-accent: #f27078;
  --ev-accent-soft: rgba(242, 112, 120, 0.16);
  --ev-done: #4ade80;
  --ev-card-bg: #1f1f24;
  --ev-border: #313138;
  --ev-text: #e9e9ee;
  --ev-text-2: #9b9ba4;
  --ev-track: #2a2a31;
  --ev-hover: rgba(255, 255, 255, 0.07);
  --ev-shadow: 0 16px 38px -16px rgba(0, 0, 0, 0.65);
  --ev-guide-bg: rgba(10, 10, 14, 0.78);
}

/* ============ 头部 ============ */
.ev-header {
  text-align: center;
  margin-bottom: 26px;
}

.ev-overline {
  margin: 0;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--ev-text-2);
  text-align: center;
}

.ev-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 340px;
  margin: 14px auto 0;
}

.ev-progress-track {
  flex: 1;
  height: 5px;
  border-radius: 99px;
  background: var(--ev-track);
  overflow: hidden;
}

.ev-progress-bar {
  display: block;
  height: 100%;
  border-radius: 99px;
  background: var(--ev-accent);
  transition: width 0.5s cubic-bezier(0.22, 0.68, 0.32, 1);
}

.ev-progress-text {
  font-size: 12px;
  color: var(--ev-text-2);
  font-variant-numeric: tabular-nums;
}

/* ============ 轮播 ============ */
.ev-viewport {
  position: relative;
  overflow: hidden;
  touch-action: pan-y;
  cursor: grab;
  -webkit-tap-highlight-color: transparent;
  border-radius: 22px;
  transition: height 0.45s cubic-bezier(0.22, 0.68, 0.32, 1);
}

.ev-viewport.dragging {
  cursor: grabbing;
  user-select: none;
  -webkit-user-select: none;
}

.ev-track {
  display: flex;
  column-gap: 16px;
  align-items: flex-start;
  opacity: 0;
  transition: transform 0.55s cubic-bezier(0.22, 0.68, 0.32, 1),
    opacity 0.4s ease;
  will-change: transform;
}

.ready .ev-track {
  opacity: 1;
}

.dragging .ev-track {
  transition: opacity 0.4s ease;
}

/* ============ 卡片 ============ */
.ev-card {
  flex: 0 0 auto;
  width: min(520px, 84%);
  background: var(--ev-card-bg);
  border: 1px solid var(--ev-border);
  border-radius: 20px;
  box-shadow: var(--ev-shadow);
  padding: 20px 22px 16px;
  opacity: 0.55;
  transform: scale(0.965);
  transform-origin: center top;
  transition: opacity 0.45s ease, transform 0.45s ease, filter 0.45s ease,
    border-color 0.4s ease, box-shadow 0.4s ease;
}

.ev-card.active {
  opacity: 1;
  transform: scale(1);
}

/* 已结束 */
.ev-card.ended {
  filter: saturate(0.45);
}

.ev-card.ended:not(.active) {
  opacity: 0.38;
}

.ev-card.ended.active {
  opacity: 0.82;
}

/* 今天 */
.ev-card.today {
  border-color: var(--ev-accent);
}

.ev-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 12px;
  margin-bottom: 4px;
  border-bottom: 1px dashed var(--ev-border);
}

.ev-card-head-main {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.ev-day-label {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 1px;
  white-space: nowrap;
}

.ev-day-date {
  font-size: 13px;
  color: var(--ev-text-2);
  white-space: nowrap;
}

.ev-status {
  flex: none;
  font-size: 12px;
  line-height: 1;
  padding: 5px 10px;
  border-radius: 99px;
  border: 1px solid var(--ev-border);
  color: var(--ev-text-2);
}

.ev-card.today .ev-status {
  background: var(--ev-accent);
  border-color: var(--ev-accent);
  color: #fff;
  font-weight: 700;
}

.ev-card.ended .ev-status {
  background: var(--ev-track);
}

/* ============ 分区 ============ */
.ev-sec {
  margin-top: 12px;
}

.ev-sec-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--ev-text-2);
  text-align: left;
  width: 100%;
}

.ev-ico {
  width: 16px;
  height: 16px;
}

.ev-sec-count {
  margin-left: auto;
  font-weight: 500;
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
}

.ev-plain {
  margin: 0;
  padding: 4px 8px;
  font-size: 14px;
  line-height: 1.9;
}

/* ============ 勾选项 ============ */
.ev-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ev-check {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 7px 8px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--ev-text);
  font-size: 14px;
  line-height: 1.7;
  letter-spacing: 1px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
}

.ev-check:hover {
  background: var(--ev-hover);
}



.ev-box {
  flex: none;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  border-radius: 7px;
  border: 1.5px solid var(--ev-text-2);
  display: grid;
  place-items: center;
  transition: background 0.25s ease, border-color 0.25s ease,
    transform 0.25s ease;
}

.ev-box svg {
  width: 12px;
  height: 12px;
}

.ev-box path {
  fill: none;
  stroke: #fff;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 16;
  stroke-dashoffset: 16;
  transition: stroke-dashoffset 0.3s ease 0.06s;
}

.ev-check.done .ev-box {
  background: var(--ev-done);
  border-color: var(--ev-done);
  animation: ev-pop 0.32s ease;
}

.ev-check.done .ev-box path {
  stroke-dashoffset: 0;
}

/* 完成划线：渐变背景画在内联文本上，box-decoration-break: clone 让
   多行文本的每一行都有划线；各行亚像素偏移一致，粗细统一 */
.ev-txt {
  transition: color 0.3s ease;
}

.ev-txt-line {
  background-image: linear-gradient(var(--ev-text-2), var(--ev-text-2));
  background-repeat: no-repeat;
  background-position: 0 55%;
  background-size: 0% 1.5px;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  transition: background-size 0.35s cubic-bezier(0.22, 0.68, 0.32, 1);
}

.ev-check.done .ev-txt {
  color: var(--ev-text-2);
}

.ev-check.done .ev-txt-line {
  background-size: 100% 1.5px;
}

@keyframes ev-pop {
  45% {
    transform: scale(1.28);
  }
}

/* ============ 箭头 ============ */
.ev-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--ev-border);
  background: var(--ev-card-bg);
  color: var(--ev-text-2);
  display: grid;
  place-items: center;
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 0.25s, color 0.25s, border-color 0.25s,
    transform 0.25s;
}

.ev-arrow svg {
  width: 18px;
  height: 18px;
}

.ev-arrow:hover {
  color: var(--ev-accent);
  border-color: var(--ev-accent);
  opacity: 1;
  transform: translateY(-50%) scale(1.06);
}

.ev-arrow.disabled {
  opacity: 0.25;
  pointer-events: none;
}

.ev-arrow.prev {
  left: 8px;
}

.ev-arrow.next {
  right: 8px;
}

/* ============ 首次引导 ============ */
.ev-guide {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.ev-guide-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 30px;
  border-radius: 18px;
  background: var(--ev-guide-bg);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: #fff;
  box-shadow: 0 18px 40px -14px rgba(0, 0, 0, 0.45);
}

.ev-guide-hand {
  font-size: 30px;
  line-height: 1;
  animation: ev-swipe 1.4s ease-in-out infinite;
}

.ev-guide-card p {
  margin: 0;
  font-size: 14px;
  letter-spacing: 2px;
  white-space: nowrap;
}

@keyframes ev-swipe {

  0%,
  100% {
    transform: translateX(-22px);
  }

  50% {
    transform: translateX(22px);
  }
}

.ev-fade-enter-active,
.ev-fade-leave-active {
  transition: opacity 0.45s ease;
}

.ev-fade-enter-from,
.ev-fade-leave-to {
  opacity: 0;
}

/* ============ 指示点 ============ */
.ev-dots {
  display: flex;
  justify-content: center;
  gap: 7px;
  margin-top: 18px;
  flex-wrap: wrap;
}

.ev-dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 99px;
  background: var(--ev-track);
  cursor: pointer;
  transition: width 0.3s cubic-bezier(0.22, 0.68, 0.32, 1),
    background 0.3s ease, opacity 0.3s ease;
}

.ev-dot.ended {
  opacity: 0.45;
}

.ev-dot.active {
  width: 22px;
  background: var(--ev-accent);
  opacity: 1;
}

.ev-position {
  margin: 8px 0 0;
  text-align: center;
  font-size: 12px;
  color: var(--ev-text-2);
  letter-spacing: 2px;
}

/* ============ 响应式 ============ */
@media (max-width: 640px) {
  .ev-card {
    width: 86%;
    padding: 16px 16px 12px;
  }

  .ev-overline {
    font-size: 11px;
    letter-spacing: 2px;
  }

  .ev-arrow {
    width: 32px;
    height: 32px;
    opacity: 0.6;
  }

  .ev-arrow.prev {
    left: 4px;
  }

  .ev-arrow.next {
    right: 4px;
  }
}

/* 打印时展开为纵向排列 */
@media print {
  .ev-viewport {
    overflow: visible;
  }

  .ev-track {
    flex-direction: column;
    transform: none !important;
    opacity: 1;
  }

  .ev-card {
    width: 100%;
  }

  .ev-arrow,
  .ev-dots,
  .ev-position,
  .ev-guide {
    display: none;
  }
}
</style>
