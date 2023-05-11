let oldPageYOffset = window.pageYOffset;
const documentElementClientHeight = document.documentElement.clientHeight;

export function getScrollDirection() {
  const $ = document.querySelector.bind(document);
  const menu: HTMLElement | null = $("header.masthead");
  const fixedBtn: HTMLElement | null = $("#fixed-button");
  if (!menu) return;

  if (window.innerWidth < 1220) {
    if (window.pageYOffset < 50) {
      menu.style.display = "block";
      if (fixedBtn) {
        fixedBtn.style.display = "block";
      }
      return;
    }
    if (
      document.documentElement.scrollHeight -
        document.documentElement.scrollTop -
        300 <=
      documentElementClientHeight
    ) {
      menu.style.display = "block";
      if (fixedBtn) {
        fixedBtn.style.display = "block";
      }
      return;
    }
    const newPageYOffset = window.pageYOffset;
    if (newPageYOffset < oldPageYOffset) {
      menu.style.display = "block";
      if (fixedBtn) {
        fixedBtn.style.display = "block";
      }
    } else if (newPageYOffset - oldPageYOffset > 20) {
      menu.style.display = "none";
      if (fixedBtn) {
        fixedBtn.style.display = "none";
      }
    }
    oldPageYOffset = newPageYOffset;
  } else {
    menu.style.display = "block";
    if (fixedBtn) {
      fixedBtn.style.display = "block";
    }
  }
}
