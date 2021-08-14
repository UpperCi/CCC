import { Vector } from "../engine/vector.js";

export class RenderText {
    public position: Vector;
    public text: string;
    public visible = true;
    public align: CanvasTextAlign = "center";
    public font = "Arial 24px"
    public fill = "#fff";
}
