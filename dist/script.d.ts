/// <reference types="node" />
import { Image } from "canvas";
import { TextAlignMode } from "./types";
import { CanvasImageTransform } from "./insert";
interface RangeFontSizeInfo {
    fontName: string;
    texts: Array<string>;
    lines: number;
    sizePerChar: number;
    measure: Array<{
        width: number;
        height: number;
    }>;
    totalHeight: number;
    fontSize: number;
}
export interface InsertTextOverImageConfig {
    alignMode: TextAlignMode;
    xs: number;
    ys: number;
    maxWidth: number;
    maxHeight: number;
    centerHeight?: boolean;
    text: string;
    maxLines?: number;
    font: {
        path?: string;
        family: string;
        style?: string;
        size?: number;
        adjust_size?: boolean;
        breakLineSpacing?: number;
    };
    rotate?: number;
}
export declare function insertTextOverImage(image: string | Buffer | Image, width: number, height: number): Promise<{
    canvas: CanvasImageTransform;
    insert: (config: InsertTextOverImageConfig) => Promise<CanvasImageTransform>;
    findBetterFontSize: (config: InsertTextOverImageConfig) => {
        betterFontSize: RangeFontSizeInfo;
        breakLineSpacing: number;
    };
}>;
export declare function getFontCentralRecomendedValue(canva: CanvasImageTransform, text: string, fontFamily: string, maxWidth: number, maxHeight: number): number;
export declare function getRangeFontSize(canva: CanvasImageTransform, text: string, config: {
    maxWidth: number;
    font: {
        size: number;
        family: string;
        path?: string;
    };
    breakLineSpacing?: number;
}): RangeFontSizeInfo[];
export declare function getFontWithTextInfo(canva: CanvasImageTransform, text: string, fontSize: number, config: {
    maxWidth: number;
    font: {
        size: number;
        family: string;
        path?: string;
    };
    breakLineSpacing?: number;
}): {
    fontName: string;
    lines: number;
    fontSize: number;
    sizePerChar: number;
    texts: string[];
    totalHeight: number;
    measure: {
        width: number;
        height: number;
    }[];
};
export declare function getBetterFontSize(datas: Array<RangeFontSizeInfo>, config: {
    maxHeight: number;
    maxWidth: number;
    passMaxWidthTolerance?: number;
}): false | RangeFontSizeInfo;
export declare function getInsertTextOverImageObject(img: Buffer, width: number, height: number): Promise<{
    insert: (config: InsertTextOverImageConfig) => Promise<CanvasImageTransform>;
    insertTextOverImageObj: {
        canvas: CanvasImageTransform;
        insert: (config: InsertTextOverImageConfig) => Promise<CanvasImageTransform>;
        findBetterFontSize: (config: InsertTextOverImageConfig) => {
            betterFontSize: RangeFontSizeInfo;
            breakLineSpacing: number;
        };
    };
}>;
export {};
