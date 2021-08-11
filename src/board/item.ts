import { CanvasImage } from "../engine/canvasImage.js";
import { Game } from "../engine/game.js";
import { GameBoard } from "./board.js";

export enum ELEMENTS {
    FIRE,
    WATER,
    AIR,
    EARTH,
    OTHER
}

export enum ITEMTYPES {
    RUNE,
    INGREDIENT,
    SPELL
}

export class Item {
    public src: string;
    public type: ELEMENTS;
    public matchable: ELEMENTS[] = [];
    public value = 10;
    public weight = 10;
    public image: CanvasImage;
    public targetCell: number;
    public animSpeed = 1;
    public moving = false;
    public toClearHorizontal = false;
    public toClearVertical = false;
}

export class Rune extends Item {
    constructor(type: ELEMENTS) {
        super();
        this.type = type;
        this.matchable = [type];
    }
}

export class Ingredient extends Item {
    public name: string;
}

export class Spell extends Item {
    public use: (board: GameBoard, pos: number, game: Game) => void;
}
