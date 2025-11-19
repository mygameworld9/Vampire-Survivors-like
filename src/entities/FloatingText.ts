import { Vector2D } from "../utils/Vector2D";

export class FloatingText {
    pos: Vector2D;
    text: string;
    color: string;
    duration: number;
    lifeTimer: number;
    shouldBeRemoved = false;

    constructor(x: number, y: number, text: string, color: string = '#ffffff', duration: number = 1.5) {
        this.pos = new Vector2D(x, y);
        this.text = text;
        this.color = color;
        this.duration = duration;
        this.lifeTimer = duration;
    }

    update(dt: number) {
        this.pos.y -= 20 * dt; // Move upwards
        this.lifeTimer -= dt;
        if (this.lifeTimer <= 0) {
            this.shouldBeRemoved = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        const opacity = Math.max(0, this.lifeTimer / this.duration);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 16px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 2;
        ctx.fillText(this.text, this.pos.x, this.pos.y);
        ctx.globalAlpha = 1.0;
        ctx.textAlign = 'start'; // Reset alignment
        ctx.shadowBlur = 0; // Reset shadow
    }
}
