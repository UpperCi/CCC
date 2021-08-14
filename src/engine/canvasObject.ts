import { Game } from "./game.js";
import { Vector } from "./vector.js";

export interface CanvasObject {
    visible: boolean;
    zIndex: number;
    draw(ctx: CanvasRenderingContext2D, game: Game) : void;
}

// source file drawn onto given position
export class CanvasImage implements CanvasObject {
    public visible: boolean = true;
    public zIndex: number = 0;

    public position: Vector;
    public img: HTMLImageElement;

    constructor(src: string, pos: Vector) {
        this.img = new Image();
        this.img.src = `assets/${src}`;;
        this.position = pos;
    }

    public draw(ctx: CanvasRenderingContext2D, game: Game) : void {
        if (this.visible) {
            ctx.drawImage(this.img, this.position.x, this.position.y);
        }
    }
}

// aniamted images through spritesheets. Only supports horizontal spritesheets where all sprites are the same size
export class CanvasAnimatedImage extends CanvasImage {
    // width of singular frame
    public frameWidth: number;
    public currentFrame: number = 0;
    public frameTime: number;
    public fpsTimer: number = 0;
    public frames: number;
    public selfDestruct = false;

    constructor(src: string, w: number, pos: Vector, fps: number = 15, selfDestruct = false) {
        super(src, pos);
        this.frameWidth = w;
        this.frameTime = 60 / fps;
        this.selfDestruct = selfDestruct;
        this.frames = Math.floor(this.img.width / this.frameWidth);
    }

    public draw(ctx: CanvasRenderingContext2D, game: Game) : void {
        this.fpsTimer += game.delta;
        if (this.fpsTimer > this.frameTime) {
            this.fpsTimer -= this.frameTime;
            this.currentFrame++;
            if (this.currentFrame > this.frames) {
                if (this.selfDestruct) {
                    game.removeObj(this);
                } else {
                    this.currentFrame = 0;
                }
            }
        }
        let clipPos = this.currentFrame * this.frameWidth;
        if (this.visible) {
            ctx.drawImage(this.img, clipPos, 0, this.frameWidth, this.img.height,
            this.position.x, this.position.y, this.frameWidth, this.img.height);
        }
    }
}

// text. Supports fonts n colors
export class CanvasText implements CanvasObject {
    public visible: boolean = true;
    public zIndex: number = 0;
    
    public position: Vector;
    public text: string;
    public align: CanvasTextAlign = "center";
    public font = "Arial 24px"
    public fill = "#fff";

    constructor(text: string, pos: Vector) {
        this.position = pos;
        this.text = text;
    }

    public draw(ctx: CanvasRenderingContext2D, game: Game) : void {
        ctx.font = this.font;
        ctx.textAlign = this.align;
        ctx.fillStyle = this.fill;
        ctx.fillText(this.text, this.position.x, this.position.y);
    }
}

// image drawn onto canvas, executes function if a click is detected within boundaries of button
export class Button extends CanvasImage implements CanvasObject {
    private size: Vector;
    public effect: () => void;

    public hover = false;
    
    public bgSrc: string;
    public hoverSrc: string;
    
    constructor(bgSrc: string, pos: Vector, size: Vector, effect: () => void) {
        super(bgSrc, pos);
        this.size = size;
        this.bgSrc = bgSrc;
        this.effect = effect;
    }

    public posIn(v: Vector) : boolean {
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

    public draw(ctx: CanvasRenderingContext2D, game: Game) : void {
        super.draw(ctx, game);
        if (game.touch.justMoved) {
            this.checkHover(game.touch.lastMove);
        }
        if (game.touch.justTapped && this.posIn(game.touch.lastTap)) {
            this.effect();
        }
    }
} 
