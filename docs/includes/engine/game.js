import { GameBoard } from "../board/board.js";
import { Button, CanvasAnimatedImage, CanvasImage, CanvasText } from "./canvasObject.js";
import { TouchManager } from "./touchManager.js";
import { Vector } from "./vector.js";
const GAMEMARGINS = 64;
export class Game {
    constructor() {
        this.canvasSize = new Vector(160, 320);
        this.canvasObjs = [];
        this.deltaTimestamp = 0;
        this.delta = 0;
        this.frameCounter = 0;
        this.frameTimer = 0;
        this.frameRate = 0;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvasSize.x;
        this.canvas.height = this.canvasSize.y;
        this.touch = new TouchManager();
        this.touch.initListeners();
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        document.querySelector('body').appendChild(this.canvas);
    }
    updateDisplaySize() {
        let docSize = document.querySelector('html').getBoundingClientRect();
        let w = docSize.width;
        let h = docSize.height;
        if (w * 2 > h) {
            h = h - GAMEMARGINS;
            w = h / 2;
        }
        else {
            w = w - GAMEMARGINS / 2;
            h = w * 2;
        }
        this.canvas.style.height = `${Math.round(h)}px`;
        this.canvas.style.width = `${Math.round(w)}px`;
        this.board.touch.resMult = h / this.canvasSize.y;
        this.canvas.style.left = `calc(50% - ${Math.round(w / 2)}px)`;
        this.canvas.style.top = `calc(50% - ${Math.round(h / 2)}px)`;
        let canvasBox = this.canvas.getBoundingClientRect();
        this.board.touch.offset = new Vector(canvasBox.x, canvasBox.y);
    }
    start() {
        this.board = new GameBoard();
        this.board.touch = this.touch;
        this.board.generateBoard(this);
        this.updateDisplaySize();
        requestAnimationFrame((ms) => this.loop(ms));
    }
    updateFrames(ms) {
        this.delta = (ms - this.deltaTimestamp) / 1000 * 60;
        this.deltaTimestamp = ms;
        this.frameTimer += this.delta / 60;
        this.frameCounter++;
        if (this.frameTimer > 1) {
            this.frameTimer -= 1;
            this.frameRate = this.frameCounter;
            this.frameCounter = 0;
        }
    }
    loop(ms) {
        this.updateFrames(ms);
        this.ctx.fillStyle = '#4b5bab';
        this.ctx.fillRect(0, 0, this.canvasSize.x, this.canvasSize.y);
        for (let i of this.canvasObjs) {
            i.draw(this.ctx, this);
        }
        this.board.update();
        requestAnimationFrame((ms) => this.loop(ms));
    }
    addObj(obj) {
        this.canvasObjs.push(obj);
        // to-do. More efficiënt method than sorting everything everytime.
        this.canvasObjs.sort((a, b) => {
            return a.zIndex - b.zIndex;
        });
    }
    // create an animated image from a spritesheet
    createAnimation(src, w, pos, fps = 15, selfDestruct = false) {
        let anim = new CanvasAnimatedImage(src, w, pos, fps, selfDestruct);
        this.addObj(anim);
        return anim;
    }
    // creates an image object that will be rendered at given position
    createImage(src, pos) {
        let image = new CanvasImage(src, pos);
        this.addObj(image);
        return image;
    }
    createText(str, pos) {
        let text = new CanvasText(str, pos);
        this.addObj(text);
        return text;
    }
    createButton(bgSrc, pos, size, effect) {
        let button = new Button(bgSrc, pos, size, effect);
        this.addObj(button);
        return button;
    }
    removeObj(obj) {
        let pos = this.canvasObjs.indexOf(obj);
        this.canvasObjs.splice(pos, 1);
    }
}
