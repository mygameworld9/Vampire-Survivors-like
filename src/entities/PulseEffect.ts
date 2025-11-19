
import { Vector2D } from "../utils/Vector2D";

export class PulseEffect {
    pos: Vector2D;
    maxRange: number;
    currentRadius = 0;
    duration = 0.4; // seconds
    lifeTimer = 0;
    shouldBeRemoved = false;
    
    constructor(pos: Vector2D, range: number) {
        this.pos = new Vector2D(pos.x, pos.y);
        this.maxRange = range;
    }

    update(dt: number) {
        this.lifeTimer += dt;
        this.currentRadius = (this.lifeTimer / this.duration) * this.maxRange;

        if (this.lifeTimer >= this.duration) {
            this.shouldBeRemoved = true;
        }
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        const opacity = 1.0 - (this.lifeTimer / this.duration);
        ctx.globalAlpha = opacity;
        
        // Filled Shockwave
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(66, 165, 245, 0.15)'; // Light fill
        ctx.fill();
        
        // Thick Outer Ring
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#42A5F5'; // Blue
        ctx.stroke();
        
        // Thin Inner Ring
        if (this.currentRadius > 10) {
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.currentRadius - 8, 0, Math.PI * 2);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#90CAF9'; // Lighter Blue
            ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
    }
}
