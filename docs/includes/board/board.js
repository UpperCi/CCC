import { Vector } from "../engine/vector.js";
import { Item, ELEMENTS, ITEMTYPES, Rune, Ingredient } from "./item.js";
var states;
(function (states) {
    states[states["ANIMATION"] = 0] = "ANIMATION";
    states[states["GAMEPLAY"] = 1] = "GAMEPLAY";
    states[states["BOARDUPDATE"] = 2] = "BOARDUPDATE";
    states[states["WAIT"] = 3] = "WAIT";
})(states || (states = {}));
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
        "src": "batWings.png",
        "type": ELEMENTS.OTHER,
        "mode": ITEMTYPES.INGREDIENT,
        "name": "batWings"
    }
];
export class GameBoard {
    constructor(itemTypes = undefined) {
        this.size = new Vector(7, 7);
        this.items = [];
        this.itemTypes = [0, 1, 2, 3, 4];
        this.itemGenerationPool = [];
        this.itemPool = [];
        this.totalItemWeight = 0;
        this.cellSize = new Vector(20, 20);
        this.cellStart = new Vector(11, 171);
        this.generatedItems = [];
        this.trackedItem = -1;
        this.toClear = [];
        this.state = states.GAMEPLAY;
        this.animTimer = 0;
        this.waitTimer = 0;
        this.points = 0;
        this.inventory = {};
        if (itemTypes) {
            this.itemTypes = itemTypes;
        }
        this.initItemPool();
    }
    randomItem() {
        let n = Math.floor(Math.random() * this.totalItemWeight);
        let emptyItem = new Item();
        for (let i = 0; i < this.itemGenerationPool.length; i++) {
            let x = this.itemGenerationPool[i];
            if (n < x) {
                if (this.itemPool[i] instanceof Ingredient) {
                    emptyItem = new Ingredient();
                }
                return Object.assign(emptyItem, this.itemPool[i]);
            }
        }
        return this.itemPool[0];
    }
    generateBoard(game) {
        this.game = game;
        game.createImage('sketchBG.png', Vector.ZERO());
        this.scoreText = game.createText("0", new Vector(80, 80));
        let btn = game.createButton('button.png', new Vector(8, 124), new Vector(30, 32), () => { console.log('button pressed'); });
        btn.hoverSrc = "buttonHover.png";
        for (let i = 0; i < this.size.x * this.size.y; i++) {
            let pos = this.cellToPos(i);
            let item = this.randomItem();
            let leftItem = this.items[i - 1];
            let upItem = this.items[i - this.size.x];
            while (true) {
                let matching = false;
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
                }
                else {
                    break;
                }
            }
            if (item.type in this.generatedItems) {
                this.generatedItems[item.type]++;
            }
            else {
                this.generatedItems[item.type] = 1;
            }
            item.image = game.createImage(item.src, pos);
            this.items.push(item);
        }
        this.highlight = this.game.createImage('highlight.png', new Vector(-20, 0));
        this.updateItems();
    }
    inBounds(v) {
        let cellEnd = this.cellStart.add(this.cellSize.multiply(this.size)).subtract(new Vector(1, 1));
        return (v.x > this.cellStart.x && v.y > this.cellStart.y && v.x < cellEnd.x && v.y < cellEnd.y);
    }
    posToCell(v) {
        v = v.subtract(this.cellStart);
        v.x = Math.floor(v.x / this.cellSize.x);
        v.y = Math.floor(v.y / this.cellSize.y);
        return v;
    }
    cellToPos(c) {
        let v = Vector.ZERO();
        v.x = c % this.size.x;
        if (v.x < 0) {
            v.x = this.size.x + v.x;
        }
        v.y = Math.floor(c / this.size.x);
        return v.multiply(this.cellSize).add(this.cellStart);
    }
    updateHighlight(pos) {
        this.highlight.position = pos.multiply(this.cellSize).add(this.cellStart).subtract(new Vector(1, 1));
    }
    updateItemImages() {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i]) {
                this.items[i].image.position = this.cellToPos(i);
            }
        }
    }
    compareItems(i, vertical = false, count = 1) {
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
    checkIngredient(i) {
        if (this.items[i] instanceof Ingredient && this.toClear.indexOf(i) === -1) {
            this.toClear.push(i);
        }
    }
    checkAdjacent(i) {
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
    toClearItems(start, n, vertical) {
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
                }
                else {
                    item.toClearHorizontal = true;
                }
            }
            points += Math.ceil(this.items[i].value * pointMod);
        }
        this.points += points;
        this.scoreText.text = this.points.toString();
    }
    updateItems() {
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
    clearItems() {
        this.toClear.sort((a, b) => a - b);
        let toGen = [];
        for (let i of this.toClear) {
            let item = this.items[i];
            this.game.removeImage(this.items[i].image);
            this.game.createAnimation('explosion.png', 22, this.cellToPos(i), 15, true);
            this.items[i] = undefined;
            if (item instanceof Ingredient) {
                let name = item.name;
                if (!(name in this.inventory)) {
                    this.inventory[name] = 1;
                }
                else {
                    this.inventory[name]++;
                }
                console.log(this.inventory);
            }
        }
        for (let i = 0; i < this.items.length; i++) {
            // if it encounters a hole, everything above it will be moved one cell down
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
        }
        else {
            this.waitTimer = 20;
            this.state = states.WAIT;
            this.toClear = [];
        }
    }
    animItem(item, targetCell, speed = 1, relative = false) {
        item.targetCell = targetCell;
        item.moving = true;
        item.animSpeed = speed;
    }
    itemGrabUpdate() {
        // grab item
        if (this.touch.justDown) {
            if (this.inBounds(this.touch.lastMove)) {
                let pos = (this.posToCell(this.touch.lastMove));
                this.trackedItem = pos.x + pos.y * this.size.x;
                this.trackItemRef = this.items[this.trackedItem];
            }
        }
        // release item
        if (this.touch.justTapped && this.trackedItem != -1) {
            let x = this.trackedItem % this.size.x;
            let y = Math.floor(this.trackedItem / this.size.x);
            let pos = this.posToCell(this.touch.lastTap);
            let currentPos = pos.x + pos.y * this.size.x;
            // released in adjacent cell?
            if (currentPos === this.trackedItem - 1 || currentPos === this.trackedItem + 1 ||
                currentPos === this.trackedItem - this.size.x || currentPos === this.trackedItem + this.size.x) {
                this.updateHighlight(new Vector(-20, 0));
                let otherItem = this.items[currentPos];
                this.items[this.trackedItem] = otherItem;
                this.items[currentPos] = this.trackItemRef;
                this.trackItemRef.image.position = this.cellToPos(currentPos);
                this.animItem(otherItem, this.trackedItem, 2);
                this.animTimer = 20;
                this.state = states.ANIMATION;
            }
            else {
                this.trackItemRef.image.position = this.cellToPos(this.trackedItem);
            }
            this.trackedItem = -1;
        }
    }
    // update highlight when hovering over items
    hoverUpdate() {
        if (this.trackedItem === -1 && this.touch.justMoved) {
            if (this.inBounds(this.touch.lastMove)) {
                let pos = (this.posToCell(this.touch.lastMove));
                this.updateHighlight(pos);
            }
        }
    }
    holdUpdate() {
        // activates when holding an item
        if (this.trackedItem != -1) {
            this.trackItemRef.image.position = this.touch.lastMove.subtract(this.cellSize.divide(2));
            let pos = this.posToCell(this.touch.lastMove);
            let currentPos = pos.x + pos.y * this.size.x;
            // check if currently hovering over adjacent cell
            if (currentPos === this.trackedItem - 1 || currentPos === this.trackedItem + 1 || currentPos === this.trackedItem ||
                currentPos === this.trackedItem - this.size.x || currentPos === this.trackedItem + this.size.x) {
                this.updateHighlight(pos);
            }
        }
    }
    // moves moving items to their actual new cell in items arr
    finishAnim() {
        let tempBoard = [];
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
    animUpdate() {
        for (let i of this.items) {
            if (i.moving) {
                let targetPos = this.cellToPos(i.targetCell);
                let diff = targetPos.subtract(i.image.position);
                if (diff.length < i.animSpeed) {
                    i.image.position = targetPos;
                }
                else {
                    i.image.position = i.image.position.add(diff.normalize().multiply(i.animSpeed * this.game.delta));
                }
            }
        }
        this.animTimer -= this.game.delta;
        if (this.animTimer <= 0) {
            this.finishAnim();
        }
    }
    wait() {
        this.waitTimer -= this.game.delta;
        if (this.waitTimer <= 0) {
            this.state = states.ANIMATION;
        }
    }
    update() {
        switch (this.state) {
            case states.GAMEPLAY:
                this.itemGrabUpdate();
                this.hoverUpdate();
                this.holdUpdate();
                break;
            case states.ANIMATION:
                this.updateHighlight(new Vector(-20, 0));
                this.animUpdate();
                break;
            case states.BOARDUPDATE:
                this.updateItems();
                this.clearItems();
                break;
            case states.WAIT:
                this.wait();
        }
        this.touch.update();
    }
    initItemPool() {
        let currentItemWeight = 0;
        for (let i of this.itemTypes) {
            let itemData = ITEMS[i];
            let item;
            if (itemData.mode == ITEMTYPES.RUNE) {
                item = new Rune(itemData['type']);
                item.value = 10;
                item.weight = 100;
            }
            else if (itemData.mode == ITEMTYPES.INGREDIENT) {
                item = new Ingredient();
                item.value = 20;
                item.weight = 30;
                item['name'] = itemData['name'];
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
