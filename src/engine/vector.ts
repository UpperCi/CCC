export class Vector {
    public x: number = 0;
    public y: number = 0;

    static ZERO() {
        return new Vector(0 , 0);
    };

    constructor(x: number | string, y: number | string) {
        if (typeof (x) == "string") x = parseFloat(x);
        if (typeof (y) == "string") y = parseFloat(y);
        this.x = x;
        this.y = y;
    }

    public add(v: Vector): Vector {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    public subtract(v: Vector): Vector {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    public multiply(n: number | Vector): Vector {
        if (typeof(n) == 'number') return new Vector(this.x * n, this.y * n);
        else return new Vector(this.x * n.x, this.y * n.y);
    }

    public divide(n: number | Vector): Vector {
        if (typeof(n) == 'number') return new Vector(this.x / n, this.y / n);
        else return new Vector(this.x / n.x, this.y / n.y);
    }
    
    public normalize(): Vector {
        let l = this.length;
        return new Vector(this.x / l, this.y / l)
    }

    public get length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}