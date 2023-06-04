import { inBrowser } from "vitepress";

/**
 * 文字内容是否超过元素宽度
 * @param {String} content 内容
 * @param {Number} width
 * @param {Number} fontSize
 */
export const isTextExceedElementWidth = (
  content: string,
  width: string | number,
  fontSize: string | number
): boolean => {
  if (!inBrowser) {
    return false;
  }
  const div = document.createElement("div");
  div.style.fontSize = `${fontSize}px`;
  div.style.visibility = "hidden";
  div.style.display = "inline-block";
  if (typeof div.textContent !== undefined) {
    div.textContent = content;
  } else {
    div.innerText = content;
  }
  document.body.appendChild(div);
  const resultWidth = parseFloat(window.getComputedStyle(div).width);
  document.body.removeChild(div);

  return resultWidth > Number(width);
};

/**
 * Parse the time to string
 * @param {(Date|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export const parseTime = (
  time: Date | string | number,
  cFormat: string
): string | null => {
  if (!time) {
    return null;
  }

  const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
  let date;
  if (typeof time === "object") {
    date = time;
  } else {
    if (typeof time === "string") {
      if (/^[0-9]+$/.test(time)) {
        // support "1548221490638"
        time = parseInt(time);
      } else {
        if (time.indexOf(".") > -1) {
          time = time.split(".")[0];
        }
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), "/");
        time = time.replace(new RegExp(/T/gm), " ");
      }
    }

    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj: Record<string, number> = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key: string) => {
    const value = formatObj[key] as number;
    // Note: getDay() returns 0 on Sunday
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value];
    }
    return value.toString().padStart(2, "0");
  });
  return time_str;
};

/**
 * 节流
 * @param {Function} func 执行函数
 * @param {number} wait 延迟执行时间
 * @param {number} runTime 执行间隔
 */
export const throttle = (func: Function, wait: number, runTime: number) => {
  let startTime = Number(new Date());
  let timeout: number | null = null;

  return function () {
    const current = Number(new Date());

    if (timeout) {
      clearTimeout(timeout);
    }
    // 如果达到了规定的触发时间间隔，触发 func
    if (current - startTime >= runTime) {
      // @ts-ignore
      func.apply(this, arguments);
      startTime = current;
    } else {
      timeout = setTimeout(func, wait);
    }
  };
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(blob);

    reader.onload = () => resolve(reader.result as string);

    reader.onerror = (error) => reject(error);
  });
};

interface ResponseTarget<T> extends EventTarget {
  response: T;
}

export const ajaxGetBlob = (url: string): Promise<Blob> => {
  return new Promise((resolve) => {
    if (!inBrowser) {
      return;
    }
    const xhrSemiBold: XMLHttpRequest = new XMLHttpRequest();
    xhrSemiBold.open("GET", url, true);
    xhrSemiBold.responseType = "blob";
    xhrSemiBold.send();
    xhrSemiBold.onload = (event: ProgressEvent) => {
      if (event?.currentTarget) {
        const currentTarget = event.currentTarget as ResponseTarget<Blob>;
        resolve(currentTarget?.response);
      }
    };
  });
};

export const ajaxGetJson = <T>(url: string): Promise<T> => {
  return new Promise((resolve) => {
    if (!inBrowser) {
      return;
    }
    const xhrSemiBold: XMLHttpRequest = new XMLHttpRequest();
    xhrSemiBold.open("GET", url, true);
    xhrSemiBold.responseType = "json";
    xhrSemiBold.send();
    xhrSemiBold.onload = (event: ProgressEvent) => {
      if (event?.currentTarget) {
        const currentTarget = event.currentTarget as ResponseTarget<T>;
        resolve(currentTarget?.response);
      }
    };
  });
};

export const addBlobFontFace = (response: Blob) => {
  if (!inBrowser) {
    return;
  }
  blobToBase64(response).then((base64) => {
    const lightFont = new FontFace("source-han-serif-sc", `url(${base64})`, {
      display: "swap",
      // weight: '100',
    });
    lightFont.load().then(() => {
      document.fonts.add(lightFont);
    });
  });
};

/**
 * 将字符串放到粘贴板中
 * @param {string} text 字符串
 */
export const copyTextToClipboard = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.style.cssText = `position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;box-shadow:none;background:transparent`;
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    console.error(err);
  }
  document.body.removeChild(textArea);
};
