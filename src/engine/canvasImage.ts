import { Vector } from "./vector.js";

export class CanvasImage extends Image {
    public position: Vector;
    public visible = true;
}

export class CanvasAnimation extends CanvasImage {
    // width of singular frame
    public frameWidth: number;
    public currentFrame: number;
    public fps: number;
    public fpsTimer: number;
    public frames: number;
    public selfDestruct = false;
}
