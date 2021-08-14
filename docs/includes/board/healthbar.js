import { CanvasImage } from "../engine/canvasObject.js";
export class Healthbar extends CanvasImage {
    constructor(pos, maxHealth) {
        super("healthbarOver.png", pos);
        this.hp = 0;
        this.maxHealth = 1000;
        this.clip = 0;
        this.maxHealth = maxHealth;
        this.hp = maxHealth;
    }
    draw(ctx, game) {
        if (this.visible) {
            let w = this.img.width;
            let h = this.img.height;
            ctx.drawImage(this.img, 0, 0, this.clip, h, this.position.x, this.position.y, this.clip, h);
        }
    }
    updateHealth(dmg) {
        this.hp = this.maxHealth - dmg;
        this.clip = (this.hp / this.maxHealth) * this.img.width;
    }
}
