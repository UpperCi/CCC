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
        this.fullScreen = false;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvasSize.x;
        this.canvas.height = this.canvasSize.y;
        this.touch = new TouchManager();
        this.touch.initListeners();
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        document.querySelector('body').appendChild(this.canvas);
    }
    toggleFullscreen() {
        let elem = document.documentElement;
        if (!this.fullScreen && elem.requestFullscreen) {
            elem.requestFullscreen();
            this.fullScreen = true;
            this.fsBtn.bgSrc = "unfullscreen.png";
        }
        else if (this.fullScreen && document.exitFullscreen) {
            document.exitFullscreen();
            this.fullScreen = false;
            this.fsBtn.bgSrc = "fullscreen.png";
        }
    }
    updateDisplaySize(doMargins = true) {
        let docSize = document.querySelector('html').getBoundingClientRect();
        let w = docSize.width;
        let h = docSize.height;
        if (doMargins) {
            if (w * 2 > h) {
                h = h - GAMEMARGINS;
                w = h / 2;
            }
            else {
                w = w - GAMEMARGINS / 2;
                h = w * 2;
            }
        }
        else {
            if (w * 2 > h) {
                h = h;
                w = h / 2;
            }
            else {
                w = w;
                h = w * 2;
            }
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
        this.canvasObjs = [];
        this.board = new GameBoard();
        this.board.touch = this.touch;
        this.board.generateBoard(this);
        this.updateDisplaySize(!this.fullScreen);
        window.addEventListener('resize', () => this.updateDisplaySize(!this.fullScreen));
        requestAnimationFrame((ms) => this.loop(ms));
        this.fsBtn = this.createButton("fullscreen.png", new Vector(134, 6), new Vector(20, 20), () => this.toggleFullscreen());
        this.fsBtn.zIndex = 100;
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
        // works, kind of
        for (let i = 0; i < this.canvasObjs.length; i++) {
            if (this.canvasObjs[i] != undefined) {
                for (let j of this.canvasObjs[i]) {
                    if (j.zIndex != i) {
                        this.removeObj(j);
                        if (this.canvasObjs.length < j.zIndex + 1 || this.canvasObjs[j.zIndex] === undefined) {
                            this.canvasObjs[j.zIndex] = [j];
                        }
                        else {
                            this.canvasObjs[j.zIndex].push(j);
                        }
                    }
                }
            }
        }
        for (let i of this.canvasObjs) {
            if (i != undefined) {
                for (let j of i) {
                    j.draw(this.ctx, this);
                }
            }
        }
        this.board.update();
        this.touch.update();
        requestAnimationFrame((ms) => this.loop(ms));
    }
    addObj(obj) {
        if (this.canvasObjs.length < obj.zIndex + 1) {
            this.canvasObjs[obj.zIndex] = [obj];
        }
        else {
            this.canvasObjs[obj.zIndex].push(obj);
        }
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
        for (let i = 0; i < this.canvasObjs.length; i++) {
            if (this.canvasObjs[i] == undefined) {
                continue;
            }
            let pos = this.canvasObjs[i].indexOf(obj);
            if (pos != -1) {
                this.canvasObjs[i].splice(pos, 1);
            }
        }
    }
}
