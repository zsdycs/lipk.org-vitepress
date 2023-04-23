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
