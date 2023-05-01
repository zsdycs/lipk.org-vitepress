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
  let resultWidth: number;
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
  resultWidth = parseFloat(window.getComputedStyle(div).width);
  document.body.removeChild(div);
  if (resultWidth > Number(width)) {
    return true;
  } else {
    return false;
  }
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
