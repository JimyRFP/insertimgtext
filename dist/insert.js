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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasImageTransform = void 0;
const canvas_1 = require("canvas");
const types_1 = require("./types");
class CanvasImageTransform {
    constructor(width, height, image) {
        this._paramImage = image;
        this._canvas = (0, canvas_1.createCanvas)(width, height);
    }
    registerFont(font) {
        (0, canvas_1.registerFont)(font.path, { family: font.family });
    }
    loadImage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (typeof window !== 'undefined' || this._paramImage instanceof canvas_1.Image) {
                    //@ts-ignore
                    this._image = this._paramImage;
                }
                else {
                    this._image = yield (0, canvas_1.loadImage)(this._paramImage);
                }
            }
            catch (e) {
                throw e;
            }
        });
    }
    drawImage(dx, dy, dw, dh) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.loadImage();
                let context = yield this.get2dContext();
                yield context.drawImage(this._image, dx, dy, dw, dh);
            }
            catch (e) {
                throw e;
            }
        });
    }
    measureText(text, font) {
        let context = this.get2dContext();
        if (font)
            context.font = font;
        return context.measureText(text);
    }
    get2dContext() {
        return this._canvas.getContext('2d');
    }
    insertText(config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let context = this.get2dContext();
                context.textBaseline = 'top';
                context.textDrawingMode = 'path';
                const textCoordinates = getTextCoordinates(this._canvas.width, this._canvas.height);
                if (config.font)
                    context.font = config.font;
                if (config.rotate)
                    context.rotate(config.rotate);
                switch (config.mode) {
                    case types_1.TextAlignMode.center:
                        textCenterMode(context, textCoordinates);
                        break;
                    case types_1.TextAlignMode.left:
                        textLeftMode(context, textCoordinates);
                        break;
                    default:
                        textCenterMode(context, textCoordinates);
                        break;
                }
                if (config.rotate)
                    context.rotate(-config.rotate);
            }
            catch (e) {
                throw e;
            }
            function textCenterMode(context, coord) {
                context.textAlign = 'center';
                const maxWidth = coord.xe ? (coord.xe - coord.xs) : undefined;
                const setcenter = maxWidth ? maxWidth / 2 : 0;
                fillText(config, context, coord.xs, coord.y, maxWidth);
            }
            function textLeftMode(context, coord) {
                context.textAlign = 'left';
                fillText(config, context, coord.xs, coord.y);
            }
            function getTextCoordinates(width, height) {
                let xs = config.coord.xs;
                let xe = config.coord.xe;
                let y = config.coord.y;
                if (xs > 0 && xs < 1) {
                    xs = Math.floor(width * xs);
                }
                if (xe && xe > 0 && xe < 1) {
                    xe = Math.floor(width * xe);
                }
                if (y > 0 && y < 1) {
                    y = Math.floor(height * y);
                }
                return {
                    xs, xe, y
                };
            }
        });
    }
}
exports.CanvasImageTransform = CanvasImageTransform;
function fillText(config, context, xs, y, maxWidth) {
    if (!config.style) {
        context.fillStyle = `#000`;
    }
    else {
        context.fillStyle = `${config.style}`;
    }
    context.fillText(config.text, xs, y, maxWidth);
}
