export var ELEMENTS;
(function (ELEMENTS) {
    ELEMENTS[ELEMENTS["FIRE"] = 0] = "FIRE";
    ELEMENTS[ELEMENTS["WATER"] = 1] = "WATER";
    ELEMENTS[ELEMENTS["AIR"] = 2] = "AIR";
    ELEMENTS[ELEMENTS["EARTH"] = 3] = "EARTH";
    ELEMENTS[ELEMENTS["OTHER"] = 4] = "OTHER";
})(ELEMENTS || (ELEMENTS = {}));
export var ITEMTYPES;
(function (ITEMTYPES) {
    ITEMTYPES[ITEMTYPES["RUNE"] = 0] = "RUNE";
    ITEMTYPES[ITEMTYPES["INGREDIENT"] = 1] = "INGREDIENT";
    ITEMTYPES[ITEMTYPES["SPELL"] = 2] = "SPELL";
})(ITEMTYPES || (ITEMTYPES = {}));
export class Item {
    constructor() {
        this.matchable = [];
        this.value = 10;
        this.weight = 10;
        this.animSpeed = 1;
        this.moving = false;
        this.toClearHorizontal = false;
        this.toClearVertical = false;
    }
}
export class Rune extends Item {
    constructor(type) {
        super();
        this.type = type;
        this.matchable = [type];
    }
}
export class Ingredient extends Item {
}
export class Spell extends Item {
}
