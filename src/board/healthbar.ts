import { CanvasImage } from "../engine/canvasObject.js";
import { Game } from "../engine/game.js";
import { Vector } from "../engine/vector.js";

export class Healthbar extends CanvasImage {
    public hp: number = 0;
    private maxHealth: number = 100;
    private clip: number = 0;

    constructor(pos: Vector, maxHealth: number) {
        super("healthbarOver.png", pos);
        this.maxHealth = maxHealth;
        this.hp = maxHealth;
    }

    public draw(ctx: CanvasRenderingContext2D, game: Game) {
        if (this.visible) {
            let w = this.img.width;
            let h = this.img.height;
            // clips part of image based on remaining health
            ctx.drawImage(this.img, 0, 0, this.clip, h, this.position.x, this.position.y, Math.ceil(this.clip), h);
        }
    }

    public updateHealth(dmg: number) {
        this.hp = this.maxHealth - dmg;
        this.clip = (this.hp / this.maxHealth) * this.img.width;
    }
}
