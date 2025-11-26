


import { Vector2D } from "../utils/Vector2D";

export class ExplorationPoint {
    pos: Vector2D;
    size: number = 40;
    shouldBeRemoved = false;
    
    // Visuals
    private globalTime = 0;
    private color = '#00BCD4'; // Cyan

    constructor(x: number, y: number) {
        this.pos = new Vector2D(x, y);
    }

    update(dt: number) {
        this.globalTime += dt;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        // Pulsating scale
        const scale = 1 + Math.sin(this.globalTime * 3) * 0.1;
        ctx.scale(scale, scale);

        // Outer Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        // Diamond Shape (Monolith)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -20); // Top
        ctx.lineTo(15, 0);  // Right
        ctx.lineTo(0, 20);  // Bottom
        ctx.lineTo(-15, 0); // Left
        ctx.closePath();
        ctx.fill();

        // Inner Detail
        ctx.fillStyle = '#E0F7FA';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(5, 0);
        ctx.lineTo(0, 10);
        ctx.lineTo(-5, 0);
        ctx.closePath();
        ctx.fill();

        // Floating Ring
        ctx.rotate(this.globalTime);
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 1.5); // Broken ring
        ctx.stroke();

        ctx.restore();
        
        // Reset shadow
        ctx.shadowBlur = 0;
    }
}