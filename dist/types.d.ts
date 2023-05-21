export declare enum TextAlignMode {
    'center' = "center",
    'left' = "left"
}
export interface InsertTextConfig {
    text: string;
    coord: TextCoordinates;
    font?: string;
    rotate?: number;
    style?: string;
    mode: TextAlignMode;
}
export interface TextCoordinates {
    xs: number;
    xe?: number;
    y: number;
}
