import { CanvasImage } from "../engine/canvasImage.js";
import { Game } from "../engine/game.js";
import { Vector } from "../engine/vector.js";

export class Button {
    private position: Vector;
    private size: Vector;
    public effect: () => void;

    public hover = false;
    
    public bgSrc: string;
    public hoverSrc: string;

    public img: CanvasImage;
    
    constructor(bgSrc: string, pos: Vector, size: Vector, effect: () => void, game: Game) {
        this.position = pos;
        this.size = size;
        this.bgSrc = bgSrc;
        this.img = game.createImage(this.bgSrc, this.position);
        this.effect = effect;
    }

    private posIn(v: Vector) : boolean {
        let p = this.position;
        let s = this.size;
        return (v.x > p.x && v.x < p.x + s.x && v.y > p.y && v.y < p.y + s.y);
    }

    public checkHover(v: Vector) : void {
        this.hover = this.posIn(v);
        if (this.hover && this.hoverSrc != undefined) {
            this.img.src = `assets/${this.hoverSrc}`;
        } else {
            this.img.src = `assets/${this.bgSrc}`;
        }
    }
} 
