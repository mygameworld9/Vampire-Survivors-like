
import { Vector2D } from "../utils/Vector2D";

export class AuraEffect {
    pos: Vector2D;
    maxRange: number;
    currentRadius = 0;
    duration = 0.3; // seconds
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

        // Draw rotating fireballs instead of a simple line
        const count = 8;
        const angleStep = (Math.PI * 2) / count;
        const rotationOffset = this.lifeTimer * 8; // Fast spin

        for(let i=0; i<count; i++) {
            const angle = i * angleStep + rotationOffset;
            const x = this.pos.x + Math.cos(angle) * this.currentRadius;
            const y = this.pos.y + Math.sin(angle) * this.currentRadius;

            // Draw Fireball
            ctx.fillStyle = '#FF7043'; // Deep Orange
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI*2);
            ctx.fill();
            
            // Inner Yellow Core
            ctx.fillStyle = '#FFF176'; 
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI*2);
            ctx.fill();
        }
        
        // Faint ring to define the edge clearly
        ctx.strokeStyle = `rgba(255, 112, 67, 0.3)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.currentRadius, 0, Math.PI*2);
        ctx.stroke();
        
        ctx.globalAlpha = 1.0;
    }
}
