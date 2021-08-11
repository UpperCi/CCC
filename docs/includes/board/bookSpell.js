import { Vector } from "../engine/vector.js";
import { Spell } from "./item.js";
export class BookSpell {
    constructor(pos, game, src, spell, cost) {
        this.cost = {};
        // deep copy of Vectorm without this the same Vector object gets used for all pages
        pos = new Vector(pos.x, pos.y);
        this.sprite = game.createImage(src, pos.add(new Vector(6, 6)));
        this.spell = spell;
        this.spriteSrc = src;
        this.cost = cost;
        this.btn = game.createButton('button.png', pos, new Vector(30, 32), () => { this.genItem(); });
        game.frontImage(this.sprite);
        this.game = game;
        this.disableSprite = game.createImage('buttonBlocked.png', pos);
    }
    updateLook() {
        this.disableSprite.visible = !this.affordable;
    }
    genItem() {
        let board = this.game.board;
        let inv = board.inventory;
        if (!this.affordable)
            return;
        for (let i of Object.keys(this.cost)) {
            board.inventory[i] -= this.cost[i];
        }
        let randomCell = Math.floor(Math.random() * board.size.x * board.size.y);
        let spell = new Spell();
        spell.image = this.game.createImage(this.spriteSrc, board.cellToPos(randomCell));
        this.game.removeImage(board.items[randomCell].image);
        Object.assign(spell, this.spell);
        board.items[randomCell] = spell;
        board.updateSpellbook();
    }
    get affordable() {
        let board = this.game.board;
        let inv = board.inventory;
        for (let i of Object.keys(this.cost)) {
            if (!(i in inv)) {
                return false;
            }
            else if (inv[i] < this.cost[i]) {
                return false;
            }
        }
        return true;
    }
}