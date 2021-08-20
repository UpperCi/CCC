// source file drawn onto given position
export class CanvasImage {
    constructor(src, pos) {
        this.visible = true;
        this.zIndex = 0;
        this.img = new Image();
        this.img.src = `assets/${src}`;
        ;
        this.position = pos;
    }
    draw(ctx, game) {
        if (this.visible) {
            ctx.drawImage(this.img, this.position.x, this.position.y);
        }
    }
}
// aniamted images through spritesheets. Only supports horizontal spritesheets where all sprites are the same size
export class CanvasAnimatedImage extends CanvasImage {
    constructor(src, w, pos, fps = 15, selfDestruct = false) {
        super(src, pos);
        this.currentFrame = 0;
        this.fpsTimer = 0;
        this.selfDestruct = false;
        this.frameWidth = w;
        this.frameTime = 60 / fps;
        this.selfDestruct = selfDestruct;
        this.frames = Math.floor(this.img.width / this.frameWidth);
    }
    draw(ctx, game) {
        this.fpsTimer += game.delta;
        if (this.fpsTimer > this.frameTime) {
            this.fpsTimer -= this.frameTime;
            this.currentFrame++;
            if (this.currentFrame > this.frames) {
                if (this.selfDestruct) {
                    game.removeObj(this);
                }
                else {
                    this.currentFrame = 0;
                }
            }
        }
        let clipPos = this.currentFrame * this.frameWidth;
        if (this.visible) {
            ctx.drawImage(this.img, clipPos, 0, this.frameWidth, this.img.height, this.position.x, this.position.y, this.frameWidth, this.img.height);
        }
    }
}
// text drawn onto canvas
export class CanvasText {
    constructor(text, pos) {
        this.visible = true;
        this.zIndex = 0;
        this.align = "center";
        this.font = "Arial 24px";
        this.fill = "#fff";
        this.position = pos;
        this.text = text;
    }
    draw(ctx, game) {
        ctx.font = this.font;
        ctx.textAlign = this.align;
        ctx.fillStyle = this.fill;
        ctx.fillText(this.text, this.position.x, this.position.y);
    }
}
// image drawn onto canvas, executes function if a click is detected within boundaries of button
export class Button extends CanvasImage {
    constructor(bgSrc, pos, size, effect) {
        super(bgSrc, pos);
        this.hover = false;
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
    draw(ctx, game) {
        super.draw(ctx, game);
        if (game.touch.justMoved) {
            this.checkHover(game.touch.lastMove);
            if (this.hover) {
                game.canvas.style.cursor = 'pointer';
            }
            else {
                game.canvas.style.cursor = 'default';
            }
        }
        if (game.touch.justTapped && this.posIn(game.touch.lastTap)) {
            this.effect();
        }
    }
}
