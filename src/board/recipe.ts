import { CanvasImage, Button } from "../engine/canvasObject.js";
import { Game } from "../engine/game.js";
import { Vector } from "../engine/vector.js";
import { states } from "./board.js";

const ITEMS = {
    "batwings" : {
        "enabled": "batwings.png",
        "disabled": "batwingsDisabled.png"
    },
    "pumpkin" : {
        "enabled": "pumpkin.png",
        "disabled": "pumpkinDisabled.png"
    },
    "firebolt": "firebolt.png",
    "poison": "poison.png"
}

// shows details of a recipe, different class bc it might be used in a few different places
export class Recipe {
    private game: Game;
    private bg: CanvasImage;
    private items: CanvasImage[] = [];
    private offset = new Vector(33, 192);
    private returnState: states;
    private btn: Button;

    constructor(game: Game) {
        this.game = game;
        this.bg = game.createImage('recipePopup.png', this.offset);
        this.bg.visible = false;
        this.bg.zIndex = 25;
    }

    public showRecipe(itemSrc: string, recipe: Object) {
        this.bg.zIndex = 20;
        this.bg.visible = true;
        let inv = this.game.board.inventory;
        let itemSprite = this.game.createAnimation(itemSrc, 18, new Vector(38, 5).add(this.offset), 10, false);
        this.items.push(itemSprite);
        itemSprite.zIndex = 30;
        for (let i = 0; i < Object.keys(recipe).length; i++) {
            let key = Object.keys(recipe)[i];
            let x = 6 + i * 32;
            // startY = 32
            let invIndex = 0;
            if (key in inv) {
                invIndex = inv[key];
            }
            let total = recipe[key];
            for (let j = 0; j < total; j++) {
                // if less than 3 items, diff = 16. Else, diff = 48 / itemCount. ||| 6 items -> 8px diff
                let y = (total <= 3) ? 32 + j * 16 : 32 + j * (48 / total);
                // use enabled sprite if j < amount in inventory, else use disabled sprite
                let src = ITEMS[key][(j < invIndex) ? 'enabled' : 'disabled'];
                let img = this.game.createImage(src, new Vector(x, y).add(this.offset))
                this.items.push(img);
                img.zIndex = 30 + j;
            }
        }
        this.returnState = this.game.board.state;
        this.game.board.state = states.STOP;

        this.btn = this.game.createButton('recipeClose.png',
        new Vector(78, 0).add(this.offset), new Vector(16, 17), () => {this.hide();});
        this.btn.zIndex = 40;
    }

    public hide() {
        this.bg.visible = false;
        for (let i of this.items) {
            this.game.removeObj(i);
        }
        this.items = [];
        this.game.board.state = this.returnState;
        this.game.removeObj(this.btn);
    }
}