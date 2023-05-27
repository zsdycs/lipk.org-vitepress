import type { FontSource, PageFontSource } from "theme";
import { ajaxGetBlob, ajaxGetJson, addBlobFontFace } from "../utils";

// 页面和字体的映射列表
let pageFontSources: PageFontSource[] = [];
// 字体列表
let fontSources: FontSource[] = [];
// 是否已加载完成的字体文件
let isFullFontFileLoaded: boolean = false;

export const loadFont = async (routePath: string) => {
  if (!pageFontSources.length || !fontSources.length) {
    // 页面和字体的映射列表
    pageFontSources = await ajaxGetJson<PageFontSource[]>(
      "/pageFontSources.json"
    );
    // 获取字体列表
    fontSources = await ajaxGetJson<FontSource[]>("/fontSources.json");
  }
  const currentPageFontSource = pageFontSources.find(
    (item) => item.path === routePath
  );

  if (currentPageFontSource && !isFullFontFileLoaded) {
    // 加载每一个字体
    for (let i = 0; i < fontSources.length; i++) {
      const fontSource = fontSources[i];
      const { name: fontName } = fontSource;
      const fontFileName = currentPageFontSource[fontName] as string;
      // 添加 await 确保依次加载
      await ajaxGetBlob(`/fontSource/${fontFileName}`).then((response) => {
        addBlobFontFace(response);
      });
    }
  }

  if (!isFullFontFileLoaded) {
    // 加载每一个字体完整的字体文件
    const fullFontPromiseList = [];
    for (let i = 0; i < fontSources.length; i++) {
      const fontSource = fontSources[i];
      const { fileName } = fontSource;
      // 添加 await 确保依次加载
      fullFontPromiseList.push(ajaxGetBlob(`/fullFontSource/${fileName}`));
    }
    Promise.all(fullFontPromiseList).then((responseList) => {
      for (let i = 0; i < responseList.length; i++) {
        const itemResponse = responseList[i];
        addBlobFontFace(itemResponse);
      }
      isFullFontFileLoaded = true;
    });
  }
};
