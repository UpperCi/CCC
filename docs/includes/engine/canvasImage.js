export class CanvasImage extends Image {
    constructor() {
        super(...arguments);
        this.visible = true;
    }
}
export class CanvasAnimation extends CanvasImage {
    constructor() {
        super(...arguments);
        this.selfDestruct = false;
    }
}
