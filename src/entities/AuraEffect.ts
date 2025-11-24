
import { Vector2D } from "../utils/Vector2D";
import { Player } from "./Player";

export class AuraEffect {
    pos: Vector2D;
    owner: Player;
    maxRange: number;
    isPersistent: boolean;
    
    // Timer for base effect life
    lifeTimer = 0;
    duration = 0.5; 
    shouldBeRemoved = false;
    
    // Visual state
    private rotation = 0;
    private particleOffsets: number[] = [];

    constructor(owner: Player, range: number, isPersistent: boolean) {
        this.owner = owner;
        this.pos = new Vector2D(owner.pos.x, owner.pos.y);
        this.maxRange = range;
        this.isPersistent = isPersistent;

        // Initialize random offsets for particles if base mode
        if (!isPersistent) {
            for(let i=0; i<3; i++) {
                this.particleOffsets.push((Math.PI * 2 / 3) * i + Math.random() * 0.5);
            }
        }
    }

    update(dt: number) {
        // Always follow owner
        this.pos.x = this.owner.pos.x;
        this.pos.y = this.owner.pos.y;
        
        this.lifeTimer += dt;
        this.rotation += dt * 2; // Continuous rotation

        if (!this.isPersistent) {
            if (this.lifeTimer >= this.duration) {
                this.shouldBeRemoved = true;
            }
        }
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        if (this.isPersistent) {
            this.drawMaxLevel(ctx);
        } else {
            this.drawBaseLevel(ctx);
        }

        ctx.restore();
    }

    private drawBaseLevel(ctx: CanvasRenderingContext2D) {
        const opacity = 1.0 - (this.lifeTimer / this.duration);
        ctx.globalAlpha = opacity;

        // 1. Dashed Magic Ring (Cooler Base)
        ctx.rotate(this.rotation);
        ctx.strokeStyle = `rgba(255, 167, 38, ${opacity * 0.5})`; // Light Orange
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 15]); // Dashed effect
        ctx.beginPath();
        ctx.arc(0, 0, this.maxRange * 0.85, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]); // Reset

        // 2. Heat Glow Center
        const gradient = ctx.createRadialGradient(0, 0, this.maxRange * 0.1, 0, 0, this.maxRange * 0.8);
        gradient.addColorStop(0, `rgba(255, 87, 34, ${opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(255, 87, 34, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.maxRange, 0, Math.PI * 2);
        ctx.fill();

        // 3. Orbiting Fireballs with Trails
        for (const offset of this.particleOffsets) {
            const angle = offset; 
            const dist = this.maxRange * 0.85;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;
            
            // Trail (Comet tail)
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 193, 7, ${opacity})`;
            ctx.lineWidth = 4;
            // Draw a small arc behind the ball
            ctx.arc(0, 0, dist, angle - 0.3, angle); 
            ctx.stroke();

            // Core
            ctx.fillStyle = '#FFF176'; // Bright Yellow Core
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Outer Flame
            ctx.fillStyle = '#FF5722'; // Deep Orange
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    private drawMaxLevel(ctx: CanvasRenderingContext2D) {
        // Max Level: Infinite smooth rotation, no fade out
        
        // 1. Heat Floor
        const gradient = ctx.createRadialGradient(0, 0, this.maxRange * 0.5, 0, 0, this.maxRange);
        gradient.addColorStop(0, `rgba(255, 160, 0, 0.2)`);  // Amber
        gradient.addColorStop(1, `rgba(255, 87, 34, 0)`);     // Fade
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.maxRange, 0, Math.PI * 2);
        ctx.fill();

        // 2. Rotating Rune Ring
        ctx.rotate(this.rotation); // Slow smooth rotation
        
        ctx.strokeStyle = '#FF6F00'; // Amber 900
        ctx.lineWidth = 2;
        const ringRadius = this.maxRange * 0.9;
        
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Runes / Symbols on the ring
        const symbols = 8;
        for (let i = 0; i < symbols; i++) {
            const angle = (i / symbols) * Math.PI * 2;
            const x = Math.cos(angle) * ringRadius;
            const y = Math.sin(angle) * ringRadius;
            
            ctx.fillStyle = '#FFD54F'; // Amber 200
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // 3. Inner Fire Geometries (Counter-rotating)
        ctx.rotate(-this.rotation * 2.5);
        ctx.fillStyle = 'rgba(255, 87, 34, 0.3)';
        const spikes = 6;
        const innerRadius = this.maxRange * 0.5;
        ctx.beginPath();
        for(let i=0; i<spikes * 2; i++){
            const r = (i % 2 === 0) ? innerRadius : innerRadius / 2;
            const a = (Math.PI * i) / spikes;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
    }
}
