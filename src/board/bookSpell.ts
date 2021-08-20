import { CanvasImage, Button, CanvasAnimatedImage } from "../engine/canvasObject.js";
import { Game } from "../engine/game.js";
import { Vector } from "../engine/vector.js";
import { states } from "./board.js";
import { Spell } from "./item.js";

export class BookSpell {
    public sprite: CanvasAnimatedImage;
    public spell: Spell;
    public cost: Object = {};
    public btn: Button;
    public game: Game;
    public spriteSrc: string;
    public disableSprite: CanvasImage;

    constructor(pos: Vector, game: Game, src: string, spell: Spell, cost: Object) {
        // deep copy of Vectorm without this the same Vector object gets used for all pages
        pos = new Vector(pos.x, pos.y);
        this.sprite = game.createAnimation(src, 18, pos.add(new Vector(6, 7)), 10, false);
        this.spell = spell;
        this.spriteSrc = src;
        this.cost = cost;
        this.btn = game.createButton('button.png', pos, new Vector(30, 32), () => {this.genItem()});
        this.btn.zIndex = 5;
        this.sprite.zIndex = 10;
        this.game = game;
        this.disableSprite = game.createImage('buttonBlocked.png', pos);
        this.disableSprite.zIndex = 12;
    }

    public updateLook() {
        this.disableSprite.visible = !this.affordable;
    }

    private genItem() {
        let board = this.game.board;

        if (board.state == states.GAMEPLAY) {
            if (this.affordable) {
                for (let i of Object.keys(this.cost)) {
                    board.inventory[i] -= this.cost[i];
                }
        
                let randomCell = Math.floor(Math.random() * board.size.x * board.size.y);
                let spell = new Spell();
                
                // spell.image = this.game.createImage(this.spriteSrc, board.cellToPos(randomCell));
                spell.image = this.game.createAnimation(this.spriteSrc, 18, board.cellToPos(randomCell), 10, false);
                
                this.game.removeObj(board.items[randomCell].image);
        
                Object.assign(spell, this.spell);
                board.items[randomCell] = spell;
        
                board.updateSpellbook();
            } else {
                board.recipe.showRecipe(this.spriteSrc, this.cost);
            }
        }
        
    }

    get affordable() : boolean {
        let board = this.game.board;
        let inv = board.inventory;
        
        for (let i of Object.keys(this.cost)) {
            if (!(i in inv)) {
                return false;
            } else if (inv[i] < this.cost[i]) {
                return false;
            }
        }
        return true;
    }
}