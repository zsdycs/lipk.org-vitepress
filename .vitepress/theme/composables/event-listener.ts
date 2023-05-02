import { onMounted, onUnmounted } from "vue";

export function useEventListener(
  target: Element | Document | Window,
  event: string,
  callback: any
) {
  onMounted(() => target.addEventListener(event, callback));
  onUnmounted(() => target.removeEventListener(event, callback));
}
