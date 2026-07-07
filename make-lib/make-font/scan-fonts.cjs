const fs = require("fs");
const path = require("path");

function sanitizeFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "-");
}

// SourceHanSerif-VF.ttf.ttc 中 SC（简体中文）子字体索引
const SOURCE_HAN_SERIF_VF_SC_INDEX = 2;

function normalizeFontBaseName(baseName) {
  return baseName.replace(/\.(ttf|otf|woff2?|ttc)$/i, "");
}

function getTtcScanIndices(baseName, numFonts) {
  const normalizedBaseName = normalizeFontBaseName(baseName).toLowerCase();

  // 仅保留 SourceHanSerif-VF 的简体中文子字体，避免生成繁体/港版等语言文件
  if (normalizedBaseName === "sourcehanserif-vf") {
    const scIndex =
      SOURCE_HAN_SERIF_VF_SC_INDEX < numFonts
        ? SOURCE_HAN_SERIF_VF_SC_INDEX
        : 0;
    return [scIndex];
  }

  return Array.from({ length: numFonts }, (_, index) => index);
}

function readUtf16String(buf, isBE) {
  if (isBE) {
    const swapped = Buffer.from(buf);
    for (let i = 0; i < swapped.length; i += 2) {
      const tmp = swapped[i];
      swapped[i] = swapped[i + 1];
      swapped[i + 1] = tmp;
    }
    return swapped.toString("utf16le").replace(/\u0000/g, "");
  }
  return buf.toString("utf16le").replace(/\u0000/g, "");
}

function getFamilyName(buf, fontIndex = null) {
  let offset = 0;
  if (fontIndex !== null) {
    offset = buf.readUInt32BE(12 + fontIndex * 4);
  }
  const numTables = buf.readUInt16BE(offset + 4);

  for (let i = 0; i < numTables; i++) {
    const entryOffset = offset + 12 + i * 16;
    const tag = buf.slice(entryOffset, entryOffset + 4).toString("ascii");
    if (tag === "name") {
      const tableOffset = buf.readUInt32BE(entryOffset + 8);
      const stringOffset = buf.readUInt16BE(tableOffset + 4);
      const count = buf.readUInt16BE(tableOffset + 2);

      for (const preferred of [
        { platform: 3, encoding: 1, lang: 2052, be: true },
        { platform: 3, encoding: 1, lang: 1028, be: true },
        { platform: 3, encoding: 1, lang: 3076, be: true },
        { platform: 3, encoding: 1, lang: 1033, be: true },
        { platform: 1, encoding: 0, lang: 0, be: false },
      ]) {
        for (let j = 0; j < count; j++) {
          const recordOffset = tableOffset + 6 + j * 12;
          const platformID = buf.readUInt16BE(recordOffset);
          const encodingID = buf.readUInt16BE(recordOffset + 2);
          const languageID = buf.readUInt16BE(recordOffset + 4);
          const nameID = buf.readUInt16BE(recordOffset + 6);

          if (
            nameID === 1 &&
            platformID === preferred.platform &&
            encodingID === preferred.encoding &&
            languageID === preferred.lang
          ) {
            const length = buf.readUInt16BE(recordOffset + 8);
            const strOffset = buf.readUInt16BE(recordOffset + 10);
            const strBuf = buf.slice(
              tableOffset + stringOffset + strOffset,
              tableOffset + stringOffset + strOffset + length,
            );
            return readUtf16String(strBuf, preferred.be);
          }
        }
      }
      break;
    }
  }
  return null;
}

function isVariableFont(buf, fontIndex = null) {
  let offset = 0;
  if (fontIndex !== null) {
    offset = buf.readUInt32BE(12 + fontIndex * 4);
  }
  const numTables = buf.readUInt16BE(offset + 4);
  for (let i = 0; i < numTables; i++) {
    const entryOffset = offset + 12 + i * 16;
    const tag = buf.slice(entryOffset, entryOffset + 4).toString("ascii");
    if (tag === "fvar") return true;
  }
  return false;
}

function getWeightClass(buf, fontIndex = null) {
  let offset = 0;
  if (fontIndex !== null) {
    offset = buf.readUInt32BE(12 + fontIndex * 4);
  }
  const numTables = buf.readUInt16BE(offset + 4);
  for (let i = 0; i < numTables; i++) {
    const entryOffset = offset + 12 + i * 16;
    const tag = buf.slice(entryOffset, entryOffset + 4).toString("ascii");
    if (tag === "OS/2") {
      const tableOffset = buf.readUInt32BE(entryOffset + 8);
      return buf.readUInt16BE(tableOffset + 4);
    }
  }
  return 400;
}

function scanFontGroups(fontSourcePath) {
  const files = fs
    .readdirSync(fontSourcePath)
    .filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return (
        ext === ".ttf" ||
        ext === ".otf" ||
        ext === ".ttc" ||
        ext === ".woff" ||
        ext === ".woff2"
      );
    })
    .sort((a, b) => {
      const aName = path.basename(a, path.extname(a));
      const bName = path.basename(b, path.extname(b));
      return aName.localeCompare(bName, "zh-CN");
    });

  const fontGroups = [];

  for (const file of files) {
    const buf = fs.readFileSync(path.join(fontSourcePath, file));
    const ext = path.extname(file).toLowerCase();
    const baseName = path.basename(file, ext);

    if (ext === ".ttc") {
      const numFonts = buf.readUInt32BE(8);
      const scanIndices = getTtcScanIndices(baseName, numFonts);
      for (let i = 0; i < scanIndices.length; i++) {
        const fontIndex = scanIndices[i];
        fontGroups.push({
          familyName:
            getFamilyName(buf, fontIndex) || baseName + "-" + fontIndex,
          fileName: file,
          fontIndex,
          isVariableFont: isVariableFont(buf, fontIndex),
          weightClass: getWeightClass(buf, fontIndex),
        });
      }
    } else {
      fontGroups.push({
        familyName: getFamilyName(buf) || baseName,
        fileName: file,
        fontIndex: null,
        isVariableFont: isVariableFont(buf),
        weightClass: getWeightClass(buf),
      });
    }
  }

  fontGroups.sort((a, b) => a.familyName.localeCompare(b.familyName, "zh-CN"));

  return fontGroups;
}

function buildFontSourceList(fontGroups, weights = ["300", "500", "600"]) {
  const fontSourceList = [];
  fontGroups.forEach((group, groupIndex) => {
    weights.forEach((weight, weightIndex) => {
      fontSourceList.push({
        name: sanitizeFileName(group.familyName) + "-" + weight,
        displayName: group.familyName,
        familyName: group.familyName,
        fileName: group.fileName,
        fontIndex: group.fontIndex,
        weight: weight,
        isVariableFont: group.isVariableFont,
        groupIndex,
        weightIndex,
      });
    });
  });
  return fontSourceList;
}

function buildFontGroupsMeta(fontGroups, weights = ["300", "500", "600"]) {
  return fontGroups.map((group) => ({
    familyName: group.familyName,
    displayName: group.familyName,
    isVariableFont: group.isVariableFont,
    weights,
  }));
}

module.exports = {
  scanFontGroups,
  buildFontSourceList,
  buildFontGroupsMeta,
  sanitizeFileName,
};

if (require.main === module) {
  const groups = scanFontGroups("./site/public/fullFontSource");
  console.log(JSON.stringify(buildFontSourceList(groups), null, 2));
}
