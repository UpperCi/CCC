import { CanvasText, CanvasImage } from "../engine/canvasObject.js";
import { Game } from "../engine/game.js";
import { TouchManager } from "../engine/touchManager.js";
import { Vector } from "../engine/vector.js";
import { BookSpell } from "./bookSpell.js";
import { Healthbar } from "./healthbar.js";
import { Item, ELEMENTS, ITEMTYPES, Rune, Ingredient, Spell } from "./item.js";
import { Recipe } from "./recipe.js";

export enum states {
	ANIMATION,
	GAMEPLAY,
	BOARDUPDATE,
	WAIT,
	STOP
}

const ITEMS = [
	{
		"src": "windRune.png",
		"type": ELEMENTS.AIR,
		"mode": ITEMTYPES.RUNE
	},
	{
		"src": "fireRune.png",
		"type": ELEMENTS.FIRE,
		"mode": ITEMTYPES.RUNE
	},
	{
		"src": "earthRune.png",
		"type": ELEMENTS.EARTH,
		"mode": ITEMTYPES.RUNE
	},
	{
		"src": "waterRune.png",
		"type": ELEMENTS.WATER,
		"mode": ITEMTYPES.RUNE
	},
	{
		"src": "batwings.png",
		"type": ELEMENTS.OTHER,
		"mode": ITEMTYPES.INGREDIENT,
		"name": "batwings"
	},
	{
		"src": "pumpkin.png",
		"type": ELEMENTS.OTHER,
		"mode": ITEMTYPES.SPELL,
		"name": "pumpkin",
		"onUse": (board: GameBoard, pos: number, game: Game) => {
			let y = Math.floor(pos / board.size.x);
			for (let i = 0; i < board.size.x; i++) {
				let cell = y * board.size.x + i;
				board.score(cell, 2);
				board.clear(cell);
			}
		},
		"cost": {"batwings" : 3}
	},
	{
		"src": "pumpkin.png",
		"type": ELEMENTS.OTHER,
		"mode": ITEMTYPES.SPELL,
		"name": "pumpkin",
		"onUse": (board: GameBoard, pos: number, game: Game) => {
			let y = Math.floor(pos / board.size.x);
			for (let i = 0; i < board.size.x; i++) {
				let cell = y * board.size.x + i;
				board.clear(cell);

			}
		},
		"cost": {"batwings" : 3, "pumpkin" : 6}
	}
]

export class GameBoard {
	public size: Vector = new Vector(7, 7);

	public items: Item[] = [];
	// declares which items (of ITEMS array) can naturally generate
	private itemTypes = [0, 1, 2, 3, 4, 5, 6];
	private itemGenerationPool: number[] = [];
	private itemPool: Item[] = [];
	private totalItemWeight = 0;
	
	private spellBook: BookSpell[] = [];
	// used to calc positions to draw cells
	private cellSize = new Vector(20, 20);
	private cellStart = new Vector(11, 171);
	// used to calc positions to draw spells
	private spellBookStart = new Vector(4, 124);
	private spellBookDiv = 42;

	public recipe: Recipe;

	private game: Game;
	public touch: TouchManager;

	private generatedItems: number[] = [];
	
	private highlight: CanvasImage;
	private trackedItem = -1;
	private trackItemRef: Item;

	private toClear: number[] = []

	public state: states = states.GAMEPLAY;
	private animTimer = 0;
	private waitTimer = 0;

	private points = 0;
	public inventory = {};
	private hpBar: Healthbar;
	private barBG: CanvasImage;
	
	private scoreText: CanvasText;

	constructor(itemTypes: number[] = undefined) {
		if (itemTypes) {
			this.itemTypes = itemTypes;
		}
	}
	// returns a deep copy of a random item from the generation pool, takes generation weights into account
	private randomItem(): Item {
		let n = Math.floor(Math.random() * this.totalItemWeight);

		let emptyItem = new Item();

		for (let i = 0; i < this.itemGenerationPool.length; i++) {
			let x = this.itemGenerationPool[i];
			if (n < x) {
				if (this.itemPool[i] instanceof Ingredient) {
					emptyItem = new Ingredient();
				} else if (this.itemPool[i] instanceof Spell) {
					emptyItem = new Spell();
				}
				return Object.assign(emptyItem, this.itemPool[i]);
			}
		}

		return this.itemPool[0];
	}
	// generates initial board
	public generateBoard(game: Game) {
		// also does a lot of stuff other than generating the board, basically a 'start' method
		this.game = game;
		this.initItemPool();
		game.createImage('sketchBG.png', Vector.ZERO());
		this.scoreText = game.createText("0", new Vector(80, 80));
		this.scoreText.zIndex = 2;
		this.recipe = new Recipe(game);
		this.hpBar = new Healthbar(new Vector(16, 9), 1000);
		game.addObj(this.hpBar);
		this.hpBar.updateHealth(0);
		this.hpBar.zIndex = 10;
		this.barBG = game.createImage('healthbarUnder.png', new Vector(16, 9));
		game.createImage('robot.png', new Vector(40, 32));

		for (let i = 0; i < this.size.x * this.size.y; i++) {
			let pos = this.cellToPos(i);

			let item = this.randomItem();

			let leftItem = this.items[i - 1];
			let upItem = this.items[i - this.size.x];

			// loop that makes sure that this doesn't generate 3 of the same item in a row as to avoid already matching tiles
			while (true) {
				let matching = false

				let extraLeftItem = this.items[i - 2];
				let extraUpItem = this.items[i - 2 * this.size.x];

				if (leftItem && extraLeftItem) {
					if (leftItem.type === item.type && extraLeftItem.type === item.type) {
						matching = true;
					}
				}
				if (upItem && extraUpItem) {
					if (upItem.type === item.type && extraUpItem.type === item.type) {
						matching = true;
					}
				}

				if (matching) {
					item = this.randomItem();
				} else {
					break;
				}
			}
			// keep track of how many of each type of item has been generated, only used for debugging
			if (item.type in this.generatedItems) {
				this.generatedItems[item.type]++;
			} else {
				this.generatedItems[item.type] = 1;
			}

			item.image = game.createImage(item.src, pos);
			this.items.push(item);
		}
		this.highlight = this.game.createImage('highlight.png', new Vector(-20, 0));
		this.updateItems();
	}
	// check if position is inside the playing field
	private inBounds(v: Vector): boolean {
		let cellEnd = this.cellStart.add(this.cellSize.multiply(this.size)).subtract(new Vector(1, 1));
		return (v.x > this.cellStart.x && v.y > this.cellStart.y && v.x < cellEnd.x && v.y < cellEnd.y);
	}
	// returns coords that indicate which cell a vector is touching
	private posToCell(v: Vector): Vector {
		v = v.subtract(this.cellStart);
		v.x = Math.floor(v.x / this.cellSize.x);
		v.y = Math.floor(v.y / this.cellSize.y);
		return v;
	}
	// convert number of cell to a position
	public cellToPos(c: number): Vector {
		let v = Vector.ZERO();
		v.x = c % this.size.x;
		if (v.x < 0) {
			v.x = this.size.x + v.x;
		}
		v.y = Math.floor(c / this.size.x);
		return v.multiply(this.cellSize).add(this.cellStart);
	}

	private updateHighlight(pos: Vector) {
		this.highlight.position = pos.multiply(this.cellSize).add(this.cellStart).subtract(new Vector(1, 1));
	}

	private updateItemImages(): void {
		for (let i = 0; i < this.items.length; i++) {
			if (this.items[i]) {
				this.items[i].image.position = this.cellToPos(i);
			}
		}
	}

	public updateSpellbook(): void {
		for (let i of this.spellBook) {
			i.updateLook();
		}
	}
	// check if item [i] is matching either vertically or horizontally, uses recursion to track how long the chain is
	private compareItems(i: number, vertical = false, count = 1): number {
		let increment = vertical ? this.size.x : 1;

		let item1 = this.items[i];
		let item2 = this.items[i + increment];

		if (item1 != undefined && item2 != undefined) {
			// prevent 4+ chains of items from 'clearing' multiple times
			if ((vertical && item2.toClearVertical) || (!vertical && item2.toClearHorizontal)) {
				return 0;
			}
			if (item1.matchable.indexOf(item2.type) != -1 && item2.matchable.indexOf(item1.type) != -1) {
				if (i + increment >= this.items.length) {
					return count;
				}
				return this.compareItems(i + increment, vertical, count + 1);
			}
		}
		return count;
	}

	private checkIngredient(i: number) {
		if (this.items[i] instanceof Ingredient) {
			this.clear(i);
		}
	}
	// called when a rune is cleared to clear any adjacent ingredients
	private checkAdjacent(i: number) {
		let x = i % this.size.x;
		let y = Math.floor(i / this.size.x);
		if (x > 0) {
			this.checkIngredient(i - 1);
		}
		if (x < this.size.x) {
			this.checkIngredient(i + 1);
		}
		if (y > 0) {
			this.checkIngredient(i - this.size.x);
		}
		if (y < this.size.x) {
			this.checkIngredient(i + this.size.x);
		}
	}
	// adds value of cell to the score
	public score(pos: number, mod: number = 1) {
		if (this.items[pos] != undefined && 'value' in this.items[pos]) {
			this.points += this.items[pos].value * mod;
			this.hpBar.updateHealth(this.points);
			this.scoreText.text = this.points.toString();
		}
	}

	public clear(pos: number) {
		if (this.toClear.indexOf(pos) === -1) {
			this.toClear.push(pos);
		}
	}
	// update points and vertical/horizontal clear values of items
	private toClearItems(start: number, n: number, vertical: boolean): void {
		if (n < 3) {
			return;
		}

		let increment = vertical ? this.size.x : 1;
		let pointMod = Math.pow(1.5, n - 3);
		let points = 0;

		for (let i = 0; i < n; i++) {	
			let pos = start + i * increment;
			if (this.toClear.indexOf(pos) == -1) {
				this.toClear.push(pos);
				let item = this.items[pos];
				this.checkAdjacent(pos);
				if (vertical) {
					item.toClearVertical = true;
				} else {
					item.toClearHorizontal = true;
				}
			}
			points += Math.ceil(this.items[i].value * pointMod);
		}

		this.points += points;
		this.hpBar.updateHealth(this.points);
		this.scoreText.text = this.points.toString();
	}
	// check which items need to be cleared and mark those
	private updateItems(): void {
		for (let i = 0; i < this.items.length; i++) {
			let x = i % this.size.x;
			let y = Math.floor(i / this.size.x);
			if (x < this.size.x - 2) {
				let n = this.compareItems(i, false);
				this.toClearItems(i, n, false);
			}
			if (y < this.size.x - 2) {
				let n = this.compareItems(i, true);
				this.toClearItems(i, n, true);
			}
		}
	}
	// actually clear all marked items
	private clearItems(): void {
		this.toClear.sort((a, b) => a - b);
		let toGen = [];
		for (let i of this.toClear) {
			let item = this.items[i];
			this.game.removeObj(this.items[i].image);
			this.game.createAnimation('explosion.png', 22, this.cellToPos(i), 15, true);
			this.items[i] = undefined;
			// if ingredient, add to inventory
			if (item instanceof Ingredient) {
				let name = item.name;
				if (!(name in this.inventory)) {
					this.inventory[name] = 1;
				} else {
					this.inventory[name]++;
				}
				console.log(this.inventory);
			// if spell, activate effect
			} else if (item instanceof Spell) {
				item.use(this, i, this.game);
			}
		}

		for (let i = 0; i < this.items.length; i++) {
			// if hole is encountered, everything above will be moved one cell down
			if (this.items[i] == undefined) {
				let depth = Math.floor(i / this.size.x);
				let x = i % this.size.x;

				for (let j = depth; j > 0; j--) {
					let firstPos = x + (j) * this.size.x;
					let secondPos = x + (j - 1) * this.size.x;
					let firstItem = this.items[firstPos];
					this.items[firstPos] = this.items[secondPos];
					this.items[secondPos] = firstItem;
					if (this.items[firstPos] != undefined) {
						this.animItem(this.items[firstPos], firstPos, 3);
					}
					if (this.items[secondPos] != undefined) {
						this.animItem(this.items[secondPos], secondPos, 3);
					}
				}
				if (!(x in toGen)) {
					toGen[x] = 0;
				}
				toGen[x]++;
			}
		}
		// generate new items
		for (let x = 0; x < toGen.length; x++) {
			if (toGen[x]) {
				this.animTimer = Math.max(toGen[x] * 7, this.animTimer) + 3;
			}
			for (let y = 0; y < toGen[x]; y++) {
				let pos = x + y * this.size.x;
				// used to calculate how far above the field the images should start
				let startY = toGen[x] - y;
				let startPos = x - (startY) * this.size.x;

				let item = this.randomItem();
				this.items[pos] = item;
				item.image = this.game.createImage(item.src, this.cellToPos(startPos));

				// the items need to fall into their place
				this.animItem(item, pos, 3);
			}
		}

		if (this.toClear.length === 0) {
			this.state = states.GAMEPLAY;
			this.updateItemImages();
		} else {
			this.waitTimer = 20;
			this.state = states.WAIT;
			this.toClear = [];
		}
	}

	private animItem(item: Item, targetCell: number, speed = 1, relative = false) {
		item.targetCell = targetCell;
		item.moving = true;
		item.animSpeed = speed;
	}

	private itemGrabUpdate(): void {
		// grab item
		if (this.touch.justDown) {
			if (this.inBounds(this.touch.lastMove)) {
				let pos = (this.posToCell(this.touch.lastMove));
				let cell = pos.x + pos.y * this.size.x;
				let item = this.items[cell];
				if (item instanceof Spell) {
					this.clear(cell);
					// item.use(this, cell, this.game);

					this.animTimer = 20;
					this.state = states.ANIMATION;
					this.trackedItem = -1;
				} else {
					this.trackedItem = cell;
					this.trackItemRef = item;
				}
			}
		}
		// release item
		if (this.touch.justTapped && this.trackedItem != -1) {
			let x = this.trackedItem % this.size.x;
			let y = Math.floor(this.trackedItem / this.size.x);

			let pos = this.posToCell(this.touch.lastTap);
			let currentPos = pos.x + pos.y * this.size.x;
			// released in adjacent cell?
			if ( this.inBounds(this.touch.lastTap) &&
				(currentPos === this.trackedItem - 1 || currentPos === this.trackedItem + 1 ||
				currentPos === this.trackedItem - this.size.x || currentPos === this.trackedItem + this.size.x)) {
				this.updateHighlight(new Vector(-20, 0));
				let otherItem = this.items[currentPos];
				this.items[this.trackedItem] = otherItem;
				this.items[currentPos] = this.trackItemRef;

				this.trackItemRef.image.position = this.cellToPos(currentPos);
				this.animItem(otherItem, this.trackedItem, 2);

				this.animTimer = 20;
				this.state = states.ANIMATION;
			} else {
				this.trackItemRef.image.position = this.cellToPos(this.trackedItem);
			}
			this.trackedItem = -1;
		}
	}

	// update highlight when hovering over items
	private hoverUpdate(): void {
		if (this.trackedItem === -1 && this.touch.justMoved) {
			if (this.inBounds(this.touch.lastMove)) {
				let pos = (this.posToCell(this.touch.lastMove));
				this.updateHighlight(pos);
			}
		}
	}

	private holdUpdate(): void {
		// activates when holding an item
		if (this.trackedItem != -1) {
			this.trackItemRef.image.position = this.touch.lastMove.subtract(this.cellSize.divide(2));

			let pos = this.posToCell(this.touch.lastMove);
			let currentPos = pos.x + pos.y * this.size.x;
			// check if currently hovering over adjacent cell
			if (this.inBounds(this.touch.lastMove) &&
				(currentPos === this.trackedItem - 1 || currentPos === this.trackedItem + 1 || currentPos === this.trackedItem ||
				currentPos === this.trackedItem - this.size.x || currentPos === this.trackedItem + this.size.x)) {
				this.updateHighlight(pos);
			}
		}
	}

	// moves moving items to their actual new cell in items arr
	private finishAnim(): void {
		let tempBoard: Item[] = [];
		Object.assign(tempBoard, this.items);
		for (let i = 0; i < tempBoard.length; i++) {
			let item = tempBoard[i];
			if (item.moving) {
				item.moving = false;
				item.image.position = this.cellToPos(item.targetCell);
				this.items[item.targetCell] = item;
			}
		}
		this.state = states.BOARDUPDATE;
	}

	// interpolates item-images between current and target pos
	private animUpdate(): void {
		for (let i of this.items) {
			if (i.moving) {
				let targetPos = this.cellToPos(i.targetCell);
				let diff = targetPos.subtract(i.image.position);
				if (diff.length < i.animSpeed) {
					i.image.position = targetPos;
				} else {
					i.image.position = i.image.position.add(diff.normalize().multiply(i.animSpeed * this.game.delta));
				}
			}
		}

		this.animTimer -= this.game.delta;
		if (this.animTimer <= 0) {
			this.finishAnim();
		}
	}

	private wait(): void {
		this.waitTimer -= this.game.delta;
		if (this.waitTimer <= 0) {
			this.state = states.ANIMATION;
		}
	}

	private checkHP(): void {
		if (this.hpBar.hp <= 0) {
			this.state = states.STOP;
			let btn = this.game.createButton("retry.png", new Vector(50, 130), new Vector(60, 60),
			() => {
				this.game.start();
			});
			btn.hoverSrc = "retryHover.png";
			btn.zIndex = 100;
		} 
	}

	public update() {
		switch (this.state) {
			case states.GAMEPLAY: // react to player input
				this.itemGrabUpdate();
				this.hoverUpdate();
				this.holdUpdate();
				break;
			case states.ANIMATION: // play item animations
				this.updateHighlight(new Vector(-20, 0));
				this.animUpdate();
				break;
			case states.BOARDUPDATE: // check what needs to be cleared
				this.updateItems();
				this.clearItems();
				this.updateSpellbook()
				this.checkHP();
				break;
			case states.WAIT: // wait
				this.wait();
				break;
			case states.STOP: // wait indefinitely
				// this.game.fillRect('rgba(0,0,0,0.5)', 0, 0, this.game.canvasSize.x, this.game.canvasSize.y);
				break;
		}

		this.touch.update();
	}
	// initialise item classes based on data in the ITEMS constant, add those to generatable items
	private initItemPool() {
		let currentItemWeight = 0
		for (let i of this.itemTypes) {
			let itemData = ITEMS[i];
			let item: Item;

			if (itemData.mode == ITEMTYPES.RUNE) {
				item = new Rune(itemData['type']);
				item.value = 10;
				item.weight = 100;
			} else if (itemData.mode == ITEMTYPES.INGREDIENT) {
				item = new Ingredient();
				item.value = 20;
				item.weight = 30;
				item['name'] = itemData['name'];
			} else if (itemData.mode == ITEMTYPES.SPELL) {
				let spell = new Spell();
				spell['use'] = itemData['onUse'];
				let pos = this.spellBookStart;
				pos.x += (this.spellBook.length) * this.spellBookDiv;
				let page = new BookSpell(pos, this.game, itemData['src'], spell, itemData['cost']);
				this.spellBook.push(page);
				continue; // skips rest as spells don't naturally generate
			}
			item.src = itemData.src;

			if ('weight' in itemData && typeof [itemData['weight']] === "number") {
				item.weight = itemData['weight'];
			}

			currentItemWeight += item.weight;
			this.itemGenerationPool.push(currentItemWeight);
			this.itemPool.push(item);
		}
		this.totalItemWeight = currentItemWeight;
	}
}