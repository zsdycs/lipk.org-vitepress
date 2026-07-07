const fs = require("fs");
const path = require("path");
const subsetFont = require("./node_modules/subset-font");

// TTC 字体集合中 SC（简体中文）子字体的索引
const VF_TTC_FONT_INDEX = 2;

// 为静态字体生成 fake bold 变体：修改 OS/2.usWeightClass 和 head.macStyle
function makeFakeBold(inputBuffer, weightClass, isBold) {
  const out = Buffer.from(inputBuffer);
  const numTables = out.readUInt16BE(4);
  let os2Offset = null;
  let headOffset = null;

  for (let i = 0; i < numTables; i++) {
    const entryOffset = 12 + i * 16;
    const tag = out.slice(entryOffset, entryOffset + 4).toString("ascii");
    if (tag === "OS/2") {
      os2Offset = out.readUInt32BE(entryOffset + 8);
    } else if (tag === "head") {
      headOffset = out.readUInt32BE(entryOffset + 8);
    }
  }

  if (os2Offset === null || headOffset === null) {
    throw new Error("找不到 OS/2 或 head 表");
  }

  out.writeUInt16BE(weightClass, os2Offset + 4);
  const currentMacStyle = out.readUInt16BE(headOffset + 44);
  const newMacStyle = isBold ? currentMacStyle | 1 : currentMacStyle & ~1;
  out.writeUInt16BE(newMacStyle, headOffset + 44);

  return out;
}

const extractFontFromTtc = (ttcBuffer, fontIndex) => {
  const numFonts = ttcBuffer.readUInt32BE(8);
  if (fontIndex >= numFonts) {
    throw new Error(
      `TTC 中不存在索引 ${fontIndex} 的子字体，共有 ${numFonts} 个`,
    );
  }

  const offset = ttcBuffer.readUInt32BE(12 + fontIndex * 4);
  const numTables = ttcBuffer.readUInt16BE(offset + 4);
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const tableEntryOffset = offset + 12 + i * 16;
    const tag = ttcBuffer.slice(tableEntryOffset, tableEntryOffset + 4);
    const tableStart = ttcBuffer.readUInt32BE(tableEntryOffset + 8);
    const tableLen = ttcBuffer.readUInt32BE(tableEntryOffset + 12);
    const data = Buffer.from(
      ttcBuffer.slice(tableStart, tableStart + tableLen),
    );
    tables.push({ tag, data, len: tableLen });
  }

  const headerSize = 12 + numTables * 16;
  let dataSize = 0;
  for (const t of tables) {
    dataSize += t.len + ((4 - (t.len % 4)) % 4);
  }

  const out = Buffer.alloc(headerSize + dataSize);
  out.writeUInt32BE(0x00010000, 0);
  out.writeUInt16BE(numTables, 4);
  const entrySelector = Math.floor(Math.log2(numTables));
  out.writeUInt16BE(Math.pow(2, entrySelector) * 16, 6);
  out.writeUInt16BE(entrySelector, 8);
  out.writeUInt16BE(numTables * 16 - Math.pow(2, entrySelector) * 16, 10);

  let currentOffset = headerSize;
  for (let i = 0; i < numTables; i++) {
    const t = tables[i];
    const entryOffset = 12 + i * 16;
    t.tag.copy(out, entryOffset);
    out.writeUInt32BE(0, entryOffset + 4);
    out.writeUInt32BE(currentOffset, entryOffset + 8);
    out.writeUInt32BE(t.len, entryOffset + 12);
    t.data.copy(out, currentOffset);
    currentOffset += t.len + ((4 - (t.len % 4)) % 4);
  }

  return out;
};

async function subsetRoute({
  sourceFile,
  text,
  weight,
  chunkSize = 50,
  fontIndex = null,
  isVariableFont: isVariableFontInput,
}) {
  const isVariableFont =
    isVariableFontInput !== undefined
      ? isVariableFontInput
      : sourceFile.endsWith(".ttc");

  let currentFont;
  if (isVariableFont) {
    const ttcBuffer = fs.readFileSync(sourceFile);
    currentFont = extractFontFromTtc(
      ttcBuffer,
      fontIndex !== null ? fontIndex : VF_TTC_FONT_INDEX,
    );
  } else {
    currentFont = fs.readFileSync(sourceFile);
    // 静态字体通过 fake bold 模拟不同字重
    const weightClass = Number(weight);
    const isBold = weightClass >= 600;
    currentFont = makeFakeBold(currentFont, weightClass, isBold);
  }

  if (isVariableFont) {
    const uniqueChars = [...new Set(text)].sort();
    // 累积分块：每次传入从开头到当前 chunk 的所有字符，确保字形逐步保留
    for (let i = 0; i < uniqueChars.length; i += chunkSize) {
      const chunk = uniqueChars.slice(0, i + chunkSize).join("");
      currentFont = await subsetFont(Buffer.from(currentFont), chunk, {
        targetFormat: "sfnt",
      });
    }

    const pinnedBuffer = await subsetFont(currentFont, text, {
      targetFormat: "sfnt",
      variationAxes: {
        wght: Number(weight),
      },
    });

    currentFont = await subsetFont(pinnedBuffer, text, {
      targetFormat: "woff2",
    });
  } else {
    currentFont = await subsetFont(currentFont, text, {
      targetFormat: "woff2",
    });
  }

  return currentFont;
}

process.on("message", async (task) => {
  try {
    const {
      sourceFile,
      text,
      weight,
      resultFileName,
      fontSourceSavePath,
      chunkSize,
      fontIndex,
      isVariableFont,
    } = task;

    if (!fs.existsSync(fontSourceSavePath)) {
      fs.mkdirSync(fontSourceSavePath, { recursive: true });
    }

    const subsetBuffer = await subsetRoute({
      sourceFile,
      text,
      weight,
      chunkSize,
      fontIndex,
      isVariableFont,
    });
    const outputPath = path.join(fontSourceSavePath, resultFileName);
    fs.writeFileSync(outputPath, subsetBuffer);

    process.send({ success: true, resultFileName });
  } catch (error) {
    process.send({ success: false, error: error.message, stack: error.stack });
  } finally {
    process.exit(0);
  }
});
