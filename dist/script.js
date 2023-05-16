"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsertTextOverImageObject = exports.getBetterFontSize = exports.getFontWithTextInfo = exports.getRangeFontSize = exports.getFontCentralRecomendedValue = exports.insertTextOverImage = void 0;
const types_1 = require("./types");
const insert_1 = require("./insert");
const sharp_1 = __importDefault(require("sharp"));
const utils_1 = require("./utils");
function insertTextOverImage(image, width, height) {
    return __awaiter(this, void 0, void 0, function* () {
        const canvas = new insert_1.CanvasImageTransform(width, height, image);
        return {
            canvas,
            insert,
            findBetterFontSize,
        };
        function insert(config) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const { betterFontSize, breakLineSpacing } = yield findBetterFontSize(config);
                    yield canvas.drawImage(0, 0, width, height);
                    if (config.font.path) {
                        canvas.registerFont({
                            path: config.font.path,
                            family: config.font.family,
                        });
                    }
                    let addx = 0;
                    if (config.alignMode === types_1.TextAlignMode.center) {
                        addx = config.maxWidth / 2;
                    }
                    let startY = config.ys;
                    if (config.centerHeight) {
                        let addy = (config.maxHeight - betterFontSize.totalHeight) / 2;
                        if (addy > 0) {
                            startY += addy;
                        }
                    }
                    for (let index = 0; index < betterFontSize.texts.length; index++) {
                        let iText = betterFontSize.texts[index].trim();
                        yield canvas.insertText({
                            text: iText,
                            font: betterFontSize.fontName,
                            rotate: config.rotate,
                            style: config.font.style,
                            mode: config.alignMode,
                            coord: {
                                y: startY + (index * (betterFontSize.fontSize + breakLineSpacing)),
                                xs: config.xs + addx,
                            }
                        });
                    }
                    return canvas;
                }
                catch (e) {
                    throw e;
                }
            });
        }
        function findBetterFontSize(config) {
            const centralValue = config.font.size || getFontCentralRecomendedValue(canvas, config.text, config.font.family, config.maxWidth, config.maxHeight);
            const breakLineSpacing = Math.floor(config.font.breakLineSpacing || (centralValue * 0.1));
            let betterFontSize = false;
            if (!config.font.adjust_size) {
                betterFontSize = getFontWithTextInfo(canvas, config.text, centralValue, {
                    maxWidth: config.maxWidth,
                    font: {
                        size: centralValue,
                        family: config.font.family
                    },
                    breakLineSpacing,
                });
            }
            else {
                const fontRanges = getRangeFontSize(canvas, config.text, {
                    maxWidth: config.maxWidth,
                    font: {
                        size: centralValue,
                        family: config.font.family
                    },
                    breakLineSpacing: breakLineSpacing,
                });
                betterFontSize = getBetterFontSize(fontRanges, { maxWidth: config.maxWidth, maxHeight: config.maxHeight, maxLines: config.maxLines });
                if (!betterFontSize) {
                    if (fontRanges.length < 3) {
                        betterFontSize = fontRanges[0];
                    }
                    else {
                        betterFontSize = fontRanges[Math.floor((fontRanges.length - 1) / 2)];
                    }
                }
            }
            return {
                betterFontSize,
                breakLineSpacing,
            };
        }
    });
}
exports.insertTextOverImage = insertTextOverImage;
function getFontCentralRecomendedValue(canva, text, fontFamily, maxWidth, maxHeight) {
    const dW = getWidthConst();
    const dH = getHeightConst();
    const totalv = (maxWidth * maxHeight * dW * dH) / text.length;
    const fSize = Math.floor(Math.pow(totalv, 1 / 2)) / 2;
    if (fSize > 0)
        return fSize;
    return 1;
    function getWidthConst() {
        const baseValues = [90];
        let total = 0;
        for (let i = 0; i < baseValues.length; i++) {
            let msr = canva.measureText(text, (0, utils_1.getCanvasFontName)({ family: fontFamily }, baseValues[i]));
            total += baseValues[i] / (msr.width / text.length);
        }
        return total / baseValues.length;
    }
    function getHeightConst() {
        const baseValues = [46];
        let total = 0;
        for (let i = 0; i < baseValues.length; i++) {
            let msr = canva.measureText(text, (0, utils_1.getCanvasFontName)({ family: fontFamily }, baseValues[i]));
            total += baseValues[i] / (msr.actualBoundingBoxAscent + msr.actualBoundingBoxDescent);
        }
        return total / baseValues.length;
    }
}
exports.getFontCentralRecomendedValue = getFontCentralRecomendedValue;
function separeTextIfMaxWidth(sizePerChar, maxWidth, text) {
    let maxCharsPerLine = Math.floor(maxWidth / sizePerChar);
    let texts = [];
    const words = sliptMulti(text, [' ', '  ', '\n']);
    let tempText = "";
    for (let i = 0; i < words.length; i++) {
        if (tempText == "") {
            tempText = words[i];
        }
        else {
            if ((tempText.length + 1 + words[i].length) <= maxCharsPerLine) {
                tempText += ` ${words[i]}`;
            }
            else {
                texts.push(tempText);
                tempText = words[i];
            }
        }
        if (tempText.length < maxCharsPerLine && i < words.length - 1) {
            continue;
        }
        else {
            texts.push(tempText);
            tempText = "";
        }
    }
    return texts;
}
function sliptMulti(text, separators) {
    let temp = separators[0];
    let rText = text;
    for (let i = 1; i < separators.length; i++) {
        rText = rText.split(separators[i]).join(temp);
    }
    return rText.split(temp);
}
function getRangeFontSize(canva, text, config) {
    try {
        let texts = [];
        const { font, maxWidth } = config;
        const factor = font.size * 0.03;
        const range = 10;
        for (let i = -range; i <= 3 * range; i++) {
            let cFontSize = Math.floor(font.size + (i * factor));
            if (cFontSize == 0)
                continue;
            texts.push(getFontWithTextInfo(canva, text, cFontSize, config));
        }
        return texts;
    }
    catch (e) {
        throw e;
    }
}
exports.getRangeFontSize = getRangeFontSize;
function getFontWithTextInfo(canva, text, fontSize, config) {
    try {
        const { font, maxWidth } = config;
        let fontName = (0, utils_1.getCanvasFontName)({ family: font.family }, fontSize);
        const measure = canva.measureText(text, fontName);
        const sizePerChar = measure.width / text.length;
        let tempTexts = separeTextIfMaxWidth(sizePerChar, maxWidth, text);
        let totalHeight = tempTexts.length * (fontSize + (config.breakLineSpacing || 0));
        let ret = {
            fontName,
            lines: tempTexts.length,
            fontSize: fontSize,
            sizePerChar: sizePerChar,
            texts: tempTexts,
            totalHeight: 0,
            measure: tempTexts.map((text) => {
                let msr = canva.measureText(text, fontName);
                return {
                    width: msr.width,
                    height: msr.actualBoundingBoxAscent + msr.actualBoundingBoxDescent,
                };
            })
        };
        totalHeight = (ret.lines - 1) * (config.breakLineSpacing || 0);
        ret.measure.map((msr) => {
            totalHeight += msr.height;
        });
        ret.totalHeight = totalHeight;
        return ret;
    }
    catch (e) {
        throw e;
    }
}
exports.getFontWithTextInfo = getFontWithTextInfo;
function getBetterFontSize(datas, config) {
    try {
        let filteredData = [];
        const passMaxWidthTolerance = config.passMaxWidthTolerance || 0;
        const { maxWidth } = config;
        for (let data of datas) {
            if (config.maxHeight) {
                if (data.totalHeight > config.maxHeight)
                    continue;
            }
            filteredData.push(data);
        }
        let widthInfo = getMaxWidthDiference(filteredData, maxWidth);
        let lowerIndex = -1;
        let lowerMaxDistance = +Infinity;
        for (let i = 0; i < widthInfo.length; i++) {
            let info = widthInfo[i];
            if (info.lower < 0 && -info.lower > passMaxWidthTolerance)
                continue;
            if (config.maxLines && info.lines > config.maxLines)
                continue;
            let uselower = info.lines === 1 ? info.lower : info.greaterWithoutLast;
            if (uselower < lowerMaxDistance) {
                lowerMaxDistance = uselower;
                lowerIndex = i;
            }
        }
        if (lowerIndex < 0)
            return false;
        return filteredData[lowerIndex];
    }
    catch (e) {
        throw e;
    }
    function getMaxWidthDiference(datas, maxWidth) {
        let ret = [];
        for (let data of datas) {
            let difs = [];
            let greater = -Infinity;
            let greaterWithoutLast = -Infinity;
            let lower = +Infinity;
            const lastIndex = data.measure.length - 1;
            for (let index = 0; index < data.measure.length; index++) {
                let textMe = data.measure[index];
                let dif = maxWidth - textMe.width;
                difs.push(dif);
                if (dif > greater) {
                    greater = dif;
                }
                if (index < lastIndex && dif > greaterWithoutLast) {
                    greaterWithoutLast = dif;
                }
                if (dif < lower) {
                    lower = dif;
                }
            }
            ret.push({
                difs,
                greater,
                greaterWithoutLast,
                lower,
                lines: data.lines,
            });
        }
        return ret;
    }
}
exports.getBetterFontSize = getBetterFontSize;
function getInsertTextOverImageObject(img) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const baseImage = (0, sharp_1.default)(img);
            const metaData = yield baseImage.metadata();
            if (!metaData.width || !metaData.height)
                throw "error to get metadata";
            const insertTextOverImageObj = yield insertTextOverImage(img, metaData.width, metaData.height);
            return {
                baseImage,
                metaData,
                insert,
                insertTextOverImageObj,
            };
            function insert(config) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        let imageResult = yield insertTextOverImageObj.insert(config);
                        return imageResult;
                    }
                    catch (e) {
                        throw e;
                    }
                });
            }
        }
        catch (e) {
            throw e;
        }
    });
}
exports.getInsertTextOverImageObject = getInsertTextOverImageObject;
