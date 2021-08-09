import { Vector } from "./vector.js";
;
export class TouchManager {
    constructor() {
        this.activeTracking = false;
        this.swipeTreshold = 7;
        // true if a tap was detected this frame (same for swipe/move)
        this.justTapped = false;
        this.justMoved = false;
        this.justDown = false;
        this.offset = Vector.ZERO();
        this.resMult = 1;
    }
    onTouchEventDown(e) {
        this.onTouchDown(e.changedTouches[0]);
    }
    // only triggers if no other touch is currently being tracked
    onTouchDown(e) {
        if (!this.activeTracking) {
            this.downTouch = e;
            this.trackId = e.identifier;
            this.activeTracking = true;
            this.justDown = true;
        }
    }
    onTouchEventUp(e) {
        e.preventDefault();
        for (let t of e.changedTouches) {
            if (t.identifier === this.trackId) {
                this.onTouchUp(t);
            }
        }
    }
    // only triggers if touch has the same id as the one being kept track of
    onTouchUp(e) {
        let vUp = new Vector(e.pageX, e.pageY).subtract(this.offset).divide(this.resMult);
        this.lastTap = vUp;
        this.justTapped = true;
        this.activeTracking = false;
    }
    onTouchEventMove(e) {
        e.preventDefault();
        for (let t of e.changedTouches) {
            if (t.identifier == this.trackId) {
                this.onTouchMove(t);
            }
        }
    }
    // converts a mouseEvent to a Touch
    fakeTouchEvent(e) {
        return {
            identifier: -1,
            target: e.target,
            pageX: e.pageX,
            pageY: e.pageY
        };
    }
    initListeners(div = document) {
        div.addEventListener('touchstart', (e) => { this.onTouchDown(e.changedTouches[0]); }, false);
        div.addEventListener('touchend', (e) => { this.onTouchEventUp(e); }, false);
        div.addEventListener('touchmove', (e) => { this.onTouchEventMove(e); }, false);
        div.addEventListener('mousedown', (e) => { this.onTouchDown(this.fakeTouchEvent(e)); }, false);
        div.addEventListener('mouseup', (e) => { this.onTouchUp(this.fakeTouchEvent(e)); }, false);
        div.addEventListener('mousemove', (e) => { this.onTouchMove(this.fakeTouchEvent(e)); }, false);
    }
    // tracks any form of movement from the tracked touch
    onTouchMove(e) {
        this.justMoved = true;
        this.lastMove = new Vector(e.pageX, e.pageY).subtract(this.offset).divide(this.resMult);
    }
    update() {
        this.justTapped = false;
        this.justMoved = false;
        this.justDown = false;
    }
    get touchDown() {
        return this.activeTracking;
    }
}
