import { Vector } from "./vector.js";

interface Touch {
    identifier: number;
    target: EventTarget;
    pageX: number;
    pageY: number;
};

export class TouchManager {
    // id of touch that's being followed (-1 if mouse)
    private trackId: number;
    private activeTracking: boolean = false;
    private swipeTreshold: number = 7;
    // can be used to get position, target of last press
    public downTouch: Touch;
    // true if a tap was detected this frame (same for swipe/move)
    public justTapped: boolean = false;
    public justMoved: boolean = false;
    public justDown: boolean = false;
    // position of last tap/movement, direction of last swipe
    public lastTap: Vector;
    public lastMove: Vector;

    public offset = Vector.ZERO();

    public resMult = 1;

    constructor() { }

    public onTouchEventDown(e: TouchEvent) {
        this.onTouchDown(e.changedTouches[0]);
    }

    // only triggers if no other touch is currently being tracked
    public onTouchDown(e: Touch) {
        if (!this.activeTracking) {
            this.downTouch = e;
            this.trackId = e.identifier;
            this.activeTracking = true;
            this.justDown = true;
        }
    }

    public onTouchEventUp(e: TouchEvent) {
        e.preventDefault();
        for (let t of e.changedTouches) {
            if (t.identifier === this.trackId) {
                this.onTouchUp(t);
            }
        }
    }

    // only triggers if touch has the same id as the one being kept track of
    public onTouchUp(e: Touch) {
        let vUp = new Vector(e.pageX, e.pageY).subtract(this.offset).divide(this.resMult);

        this.lastTap = vUp;
        this.lastMove = vUp;

        this.justTapped = true;
        this.activeTracking = false;
    }

    public onTouchEventMove(e: TouchEvent) {
        e.preventDefault();
        for (let t of e.changedTouches) {
            if (t.identifier == this.trackId) {
                this.onTouchMove(t);
            }
        }
    }

    // converts a mouseEvent to a Touch
    public fakeTouchEvent(e: MouseEvent) {
        return {
            identifier: -1,
            target: e.target,
            pageX: e.pageX,
            pageY: e.pageY
        }
    }

    public initListeners(div= document) {
        div.addEventListener('touchstart', (e) => { this.onTouchDown(e.changedTouches[0]) }, false);
        div.addEventListener('touchend', (e) => { this.onTouchEventUp(e) }, false);
        div.addEventListener('touchmove', (e) => { this.onTouchEventMove(e) }, false);
        div.addEventListener('mousedown', (e) => { this.onTouchDown(this.fakeTouchEvent(e)) }, false);
        div.addEventListener('mouseup', (e) => { this.onTouchUp(this.fakeTouchEvent(e)) }, false);
        div.addEventListener('mousemove', (e) => { this.onTouchMove(this.fakeTouchEvent(e)) }, false);
    }

    // tracks any form of movement from the tracked touch
    public onTouchMove(e: Touch) {
        this.justMoved = true;
        this.lastMove = new Vector(e.pageX, e.pageY).subtract(this.offset).divide(this.resMult);
    }

    public update() {
        this.justTapped = false;
        this.justMoved = false;
        this.justDown = false;
    }

    public get touchDown() {
        return this.activeTracking;
    }
}
