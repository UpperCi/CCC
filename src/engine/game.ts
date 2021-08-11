import { GameBoard } from "../board/board.js";
import { Button } from "../ui/button.js";
import { RenderText } from "../ui/renderObjects.js";
import { CanvasAnimation, CanvasImage } from "./canvasImage.js";
import { TouchManager } from "./touchManager.js";
import { Vector } from "./vector.js";

const GAMEMARGINS = 64;

export class Game {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private touch: TouchManager;

	private canvasSize: Vector = new Vector(160, 320);

	private renderImages: CanvasImage[] = [];
	private renderAnims: CanvasAnimation[] = [];
	private renderText: RenderText[] = [];
	private buttons: Button[] = [];

	public board: GameBoard;

	private deltaTimestamp = 0
	public delta = 0;
	private frameCounter = 0;
	private frameTimer = 0;
	private frameRate = 0;


	constructor() {
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.canvasSize.x;
		this.canvas.height = this.canvasSize.y;
		this.touch = new TouchManager();
		this.touch.initListeners();
		this.ctx = this.canvas.getContext('2d', { alpha: false });
		document.querySelector('body').appendChild(this.canvas);
	}

	private updateDisplaySize(): void {
		let docSize = document.querySelector('html').getBoundingClientRect();
		let w = docSize.width;
		let h = docSize.height;

		if (w * 2 > h) {
			h = h - GAMEMARGINS;
			w = h / 2;
		} else {
			w = w - GAMEMARGINS / 2;
			h = w * 2;
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
		this.board = new GameBoard();
		this.board.touch = this.touch;
		this.board.generateBoard(this);
		this.updateDisplaySize();
		requestAnimationFrame((ms: number) => this.loop(ms));
	}

	public updateFrames(ms: number): void {
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

	private renderImgs() {
		for (let img of this.renderImages) {
			if (img.visible) {
				this.ctx.drawImage(img, img.position.x, img.position.y);
			}
		}
	}

	private renderAnimations() {
		for (let anim of this.renderAnims) {
			anim.fpsTimer += this.delta;
			let fpsTime = 60 / anim.fps;
			if (anim.fpsTimer > fpsTime) {
				anim.fpsTimer -= fpsTime;
				anim.currentFrame++;
				if (anim.currentFrame > anim.frames) {
					if (anim.selfDestruct) {
						this.removeAnim(anim);
					} else {
						anim.currentFrame = 0;
					}
				}
			}

			let pos = anim.currentFrame * anim.frameWidth;
			if (anim.visible) {
				this.ctx.drawImage(anim, pos, 0, anim.height, anim.frameWidth,
					anim.position.x, anim.position.y, anim.height, anim.frameWidth);
			}
		}
	}

	private renderTexts() {
		for (let text of this.renderText) {
			this.ctx.font = text.font;
			this.ctx.textAlign = text.align;
			this.ctx.fillStyle = text.fill;
			this.ctx.fillText(text.text, text.position.x, text.position.y);
		}
	}

	private updateButtons(): void {
		for (let button of this.buttons) {
			if (this.touch.justMoved) {
				button.checkHover(this.touch.lastMove);
			}
			if (button.hover && this.touch.justTapped) {
				button.effect();
			}
		}
	}

	private loop(ms: number): void {
		this.updateFrames(ms);

		this.ctx.fillStyle = '#4b5bab';
		this.ctx.fillRect(0, 0, this.canvasSize.x, this.canvasSize.y);

		this.renderImgs();
		this.renderAnimations();
		this.renderTexts();
		this.updateButtons();

		this.board.update();

		requestAnimationFrame((ms: number) => this.loop(ms));
	}

	// create an animated image from a spritesheet
	public createAnimation(src: string, w: number, pos: Vector, fps: number = 15, selfDestruct = false): CanvasAnimation {
		let anim = new CanvasAnimation();
		anim.src = `assets/${src}`;
		anim.frameWidth = w;
		anim.fps = fps;
		anim.frames = Math.floor(anim.width / anim.frameWidth);
		anim.selfDestruct = selfDestruct;
		anim.position = pos;
		anim.currentFrame = 0;
		anim.fpsTimer = 0;

		this.renderAnims.push(anim);

		return anim;
	}

	// creates an image object that will be rendered at given position
	public createImage(src: string, pos: Vector): CanvasImage {
		let image = new CanvasImage();
		image.src = `assets/${src}`;

		image.position = pos;

		this.renderImages.push(image);
		return image;
	}

	public createText(str: string, pos: Vector): RenderText {
		let text = new RenderText();
		text.text = str;
		text.position = pos;

		this.renderText.push(text);
		return text;
	}

	public createButton(bgSrc: string, pos: Vector, size: Vector, effect: () => void): Button {
		let button = new Button(bgSrc, pos, size, effect, this);
		button.img = this.createImage(bgSrc, pos);

		this.buttons.push(button);

		return button;
	}
 
	// stops rendering an image
	public removeImage(img: CanvasImage): void {
		let pos = this.renderImages.indexOf(img);
		this.renderImages.splice(pos, 1);
	}

	// stops rendering an image
	public removeAnim(img: CanvasAnimation): void {
		let pos = this.renderAnims.indexOf(img);
		this.renderAnims.splice(pos, 1);
	}

	// stops rendering an image
	public removeButton(button: Button): void {
		let pos = this.buttons.indexOf(button);
		this.buttons.splice(pos, 1);
		this.removeImage(button.img);
	}

	// puts an image to the front of rendering
	public frontImage(img: CanvasImage): void {
		this.removeImage(img);
		this.renderImages.push(img);
	}
}
