export class Button {
    constructor(bgSrc, pos, size, effect, game) {
        this.hover = false;
        this.position = pos;
        this.size = size;
        this.bgSrc = bgSrc;
        this.effect = effect;
    }
    posIn(v) {
        let p = this.position;
        let s = this.size;
        return (v.x > p.x && v.x < p.x + s.x && v.y > p.y && v.y < p.y + s.y);
    }
    checkHover(v) {
        this.hover = this.posIn(v);
        if (this.hover && this.hoverSrc != undefined) {
            this.img.src = `assets/${this.hoverSrc}`;
        }
        else {
            this.img.src = `assets/${this.bgSrc}`;
        }
    }
}
