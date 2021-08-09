## Archived Code

Testing types of item generation
```ts
case 0:
    if (leftItem) {
        if (leftItem.type === item.type) {
            matching = true;
        }
    }
    if (upItem) {
        if (upItem.type === item.type) {
            matching = true;
        }
    }
    break;
case 1:
    let extraLeftItem = this.items[i - 2];
    let extraUpItem = this.items[i - 2 * this.size.x];

    if (leftItem && extraLeftItem) {
        if (leftItem.type === item.type && extraLeftItem.type === item.type) {
            matching = true;
        }
    }
    if (upItem && extraUpItem) {
        if (upItem.type === item.type && extraUpItem.type === item.type) {
            matching = true;
        }
    }
    break;
case 2:
    let topLeftItem = this.items[i - this.size.x - 1];
    let topRightItem = this.items[i - this.size.x + 1];

    if (leftItem) {
        if (leftItem.type === item.type) {
            matching = true;
        }
    }
    if (upItem) {
        if (upItem.type === item.type) {
            matching = true;
        }
    }
    if (topLeftItem && topRightItem) {
        if (topLeftItem.type === item.type && topRightItem.type === item.type) {
            matching = true;
        }
    }
    break;
```

![generation type 0](assets/readme/gen0.png "genType 0")
![generation type 1](assets/readme/gen1.png "genType 1")
![generation type 2](assets/readme/gen2.png "genType 2")


```ts
for (let n = 0; n < (this.size.x - 2) * (this.size.y - 2); n++) {
    let i = n + 1 + (Math.floor((n) / (this.size.x - 2)) * (2)) + this.size.x;
}
```
Iterates through all items except those at the sides.
Start with an extra (1 + width), one tile to the left and bottom of the top-right corner. Every (width - 2) tiles, add an extra 2 to skip the horizontal sides.

```ts
export class RenderRect {
    public position: Vector;
    public size: Vector;
    public doFill = true;
    public fillColor: string;
    public doStroke = false;
    public strokeColor: string;
    public visible = true;

    constructor(color: string, pos: Vector, size: Vector) {
        this.position = pos;
        this.size = size;
        this.fillColor = color;
    }

    public setStroke(color: string) {
        this.doStroke = true;
        this.strokeColor = color;
    }
}

renderRectangles() {
    for (let rect of this.renderRects) {
        if (rect.visible) {
            this.ctx.rect(rect.position.x, rect.position.y, rect.size.x, rect.size.y);
            if (rect.doFill) {
                this.ctx.fillStyle = rect.fillColor;
                this.ctx.fill();
            }

            if (rect.doStroke) {
                this.ctx.strokeStyle = rect.strokeColor;
                this.ctx.stroke();
            }
        }
    }
}
```
Rendering rectangles seemed to cause a lot of lag for whatever reason. I wasn't going to use it outside of debugging so instead of fixing it I scrapped the code.
