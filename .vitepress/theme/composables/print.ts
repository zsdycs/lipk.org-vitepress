import { Watermark } from "@pansy/watermark";
import { parseTime, copyTextToClipboard } from "../utils/index";
import { inBrowser } from "vitepress";

const watermarkConfig = {
  // mode: "interval",
  monitor: true,
  text: "",
  image: undefined,
  opacity: 0.24,
  width: 240,
  height: 64,
  offsetLeft: 0,
  offsetTop: 0,
  gapX: 340,
  gapY: 340,
  zIndex: 9999,
  rotate: -22,
  fontSize: 32,
  // textAlign: "center",
  // fontStyle: "normal",
  fontColor: "#000",
  fontFamily:
    "source-han-serif-sc, sans-serif, Microsoft Yahei , Times New Roman, times, serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
  fontWeight: "300",
  blindText: "",
  blindOpacity: 0.01,
};

let watermark: Watermark | null = null;
if (inBrowser) {
  watermark = new Watermark({
    ...watermarkConfig,
  });
}

// 打印
export const printPage = (obj: any) => {
  const { path, theme, frontmatter } = obj;
  if (inBrowser && watermark) {
    let title = "";
    if (theme.value.author && frontmatter.value.title) {
      title = `${frontmatter.value.title}-${theme.value.author}`;
    }
    const currentTimeStr = parseTime(new Date(), "{y}-{m}-{d}");

    const watermarkTextList = [currentTimeStr, window.location.href, title];
    const watermarkText = watermarkTextList.join(" ");

    watermark.update({
      ...watermarkConfig,
      text: watermarkText,
      blindText: watermarkText,
    });

    watermark.hide();

    // 打印：打印时加载水印，以保留打印信息
    window.onbeforeprint = () => {
      let copyText = `lipk.org_${title}`;

      if (path.includes("/resume")) {
        copyText = `【前端开发】李鹏坤-简历_${currentTimeStr}`;
      }

      copyTextToClipboard(copyText);
      watermark?.show();
    };

    window.onafterprint = () => {
      // 隐藏水印
      watermark?.hide();
      // 销毁水印
      // watermark.destroy();
    };
  }
};
