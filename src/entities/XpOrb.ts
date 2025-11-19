import { Vector2D } from "../utils/Vector2D";
import { IXpOrbData } from "../utils/types";

export class XpOrb {
    pos: Vector2D;
    value: number;
    size: number;
    color: string;
    shouldBeRemoved = false;
    
    constructor(x: number, y: number, data: IXpOrbData) {
        this.pos = new Vector2D(x, y);
        this.value = data.value;
        this.size = data.size;
        this.color = data.color;
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
