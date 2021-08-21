import { GameBoard } from "../board/board.js";
import { Button, CanvasAnimatedImage, CanvasImage, CanvasObject, CanvasText } from "./canvasObject.js";
import { TouchManager } from "./touchManager.js";
import { Vector } from "./vector.js";

const GAMEMARGINS = 64;

export class Game {
	public canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	public touch: TouchManager;

	public canvasSize: Vector = new Vector(160, 320);

	private canvasObjs: CanvasObject[][] = [];

	public board: GameBoard;

	private deltaTimestamp = 0
	public delta = 0;
	private frameCounter = 0;
	private frameTimer = 0;
	private frameRate = 0;

	private fullScreen = false;
	private fsBtn: Button;

	constructor() {
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.canvasSize.x;
		this.canvas.height = this.canvasSize.y;
		this.touch = new TouchManager();
		this.touch.initListeners();
		this.ctx = this.canvas.getContext('2d', { alpha: false });
		document.querySelector('body').appendChild(this.canvas);
	}

	private toggleFullscreen() { // thx W3schools: https://www.w3schools.com/howto/howto_js_fullscreen.asp
		let elem = document.documentElement;
		if (!this.fullScreen && elem.requestFullscreen) {
			elem.requestFullscreen();
			this.fullScreen = true;
			this.fsBtn.bgSrc = "unfullscreen.png";
		} else if (this.fullScreen && document.exitFullscreen) {
			document.exitFullscreen();
			this.fullScreen = false;
			this.fsBtn.bgSrc = "fullscreen.png";
		}
	}

	private updateDisplaySize(doMargins = true): void {
		let docSize = document.querySelector('html').getBoundingClientRect();
		let w = docSize.width;
		let h = docSize.height;

		if (doMargins) {
			if (w * 2 > h) {
				h = h - GAMEMARGINS;
				w = h / 2;
			} else {
				w = w - GAMEMARGINS / 2;
				h = w * 2;
			}
		} else {
			if (w * 2 > h) {
				h = h;
				w = h / 2;
			} else {
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
		this.board.touch.offset = new Vector(canvasBox.x, canvasBox.y)
	}

	public start(): void {
		this.canvasObjs = [];
		this.board = new GameBoard();
		this.board.touch = this.touch;
		this.board.generateBoard(this);
		this.updateDisplaySize(!this.fullScreen);
		window.addEventListener('resize', () => this.updateDisplaySize(!this.fullScreen));
		requestAnimationFrame((ms: number) => this.loop(ms));
		this.fsBtn = this.createButton("fullscreen.png", new Vector(134, 6), new Vector(20, 20), () => this.toggleFullscreen());
		this.fsBtn.zIndex = 100;
	}

	private updateFrames(ms: number): void {
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

	private loop(ms: number): void {
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
						} else {
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

		requestAnimationFrame((ms: number) => this.loop(ms));
	}

	public addObj(obj: CanvasObject) {
		if (this.canvasObjs.length < obj.zIndex + 1) {
			this.canvasObjs[obj.zIndex] = [obj];
		} else {
			this.canvasObjs[obj.zIndex].push(obj);
		}
	}

	// create an animated image from a spritesheet
	public createAnimation(src: string, w: number, pos: Vector, fps: number = 15, selfDestruct = false): CanvasAnimatedImage {
		let anim = new CanvasAnimatedImage(src, w, pos, fps, selfDestruct);
		this.addObj(anim);

		return anim;
	}

	// creates an image object that will be rendered at given position
	public createImage(src: string, pos: Vector): CanvasImage {
		let image = new CanvasImage(src, pos);
		this.addObj(image);

		return image;
	}

	public createText(str: string, pos: Vector): CanvasText {
		let text = new CanvasText(str, pos);
		this.addObj(text);

		return text;
	}

	public createButton(bgSrc: string, pos: Vector, size: Vector, effect: () => void): Button {
		let button = new Button(bgSrc, pos, size, effect);
		this.addObj(button);

		return button;
	}

	public removeObj(obj: CanvasObject): void {
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
