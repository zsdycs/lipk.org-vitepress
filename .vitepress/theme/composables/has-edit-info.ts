import { computed } from "vue";
import { useData } from "../composables/data";

export function useHasEditInfo() {
  const { theme, frontmatter, page } = useData();

  return computed(() => {
    return (
      theme.value.editLink &&
      page.value.lastUpdated &&
      !frontmatter.value.notEditInfo
    );
  });
}
