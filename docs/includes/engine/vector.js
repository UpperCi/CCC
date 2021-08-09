export class Vector {
    constructor(x, y) {
        this.x = 0;
        this.y = 0;
        if (typeof (x) == "string")
            x = parseFloat(x);
        if (typeof (y) == "string")
            y = parseFloat(y);
        this.x = x;
        this.y = y;
    }
    static ZERO() {
        return new Vector(0, 0);
    }
    ;
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }
    subtract(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }
    multiply(n) {
        if (typeof (n) == 'number')
            return new Vector(this.x * n, this.y * n);
        else
            return new Vector(this.x * n.x, this.y * n.y);
    }
    divide(n) {
        if (typeof (n) == 'number')
            return new Vector(this.x / n, this.y / n);
        else
            return new Vector(this.x / n.x, this.y / n.y);
    }
    normalize() {
        let l = this.length;
        return new Vector(this.x / l, this.y / l);
    }
    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}
