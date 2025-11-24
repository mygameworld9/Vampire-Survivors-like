
import { Vector2D } from "../utils/Vector2D";

export class XpOrb {
    pos: Vector2D;
    value: number;
    size: number;
    color: string;
    shouldBeRemoved = false;
    
    constructor(x: number, y: number, value: number, size: number = 8, color: string = '#42a5f5') {
        this.pos = new Vector2D(x, y);
        this.value = value;
        this.size = size;
        this.color = color;
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}
