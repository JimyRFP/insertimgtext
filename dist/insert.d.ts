/// <reference types="node" />
import { Image, Canvas } from "canvas";
import { InsertTextConfig } from "./types";
import { CanvasRenderingContext2D } from "canvas";
export declare class CanvasImageTransform {
    _image: Image;
    _paramImage: Image | string | Buffer;
    _canvas: Canvas;
    createCanvas: Function;
    constructor(width: number, height: number, image: string | Buffer | Image);
    loadImage(): Promise<void>;
    drawImage(dx: number, dy: number, dw: number, dh: number): Promise<void>;
    measureText(text: string, font?: string): import("canvas").TextMetrics;
    get2dContext(): CanvasRenderingContext2D;
    insertText(config: InsertTextConfig): Promise<void>;
}
