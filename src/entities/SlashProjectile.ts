
import { Vector2D } from "../utils/Vector2D";
import { Weapon } from "./Weapon";
import { Player } from "./Player";
import { IWeaponStatusEffect } from "../utils/types";

export class SlashProjectile {
    pos: Vector2D;
    owner: Player;
    damage: number;
    range: number; // Radius of slash
    isFullCircle: boolean;
    shouldBeRemoved = false;
    hitEnemies: Set<number> = new Set();
    statusEffect?: IWeaponStatusEffect;
    
    private lifeTimer = 0;
    private duration = 0.2; 
    private angle: number;

    constructor(owner: Player, weapon: Weapon, isFullCircle: boolean) {
        this.owner = owner;
        this.pos = new Vector2D(0, 0);
        this.damage = 0;
        this.range = 0;
        this.isFullCircle = false;
        this.angle = 0;
        this.reset(owner, weapon, isFullCircle);
    }

    reset(owner: Player, weapon: Weapon, isFullCircle: boolean) {
        this.owner = owner;
        this.damage = weapon.damage;
        this.range = weapon.range; 
        this.statusEffect = weapon.statusEffect;
        this.isFullCircle = isFullCircle;
        
        this.angle = Math.atan2(owner.facingDirection.y, owner.facingDirection.x);
        this.pos.x = owner.pos.x;
        this.pos.y = owner.pos.y;
        
        this.lifeTimer = 0;
        this.duration = isFullCircle ? 0.4 : 0.2;
        this.shouldBeRemoved = false;
        this.hitEnemies.clear();
    }

    update(dt: number) {
        this.lifeTimer += dt;
        // Follow player tightly
        this.pos.x = this.owner.pos.x;
        this.pos.y = this.owner.pos.y;

        if (this.lifeTimer >= this.duration) {
            this.shouldBeRemoved = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        const progress = this.lifeTimer / this.duration;
        // Fade out quickly at the end
        const opacity = 1.0 - Math.pow(progress, 4); 
        
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        
        if (this.isFullCircle) {
            this.drawSpin(ctx, progress, opacity);
        } else {
            this.drawSlash(ctx, progress, opacity);
        }
        
        ctx.restore();
    }

    private drawSlash(ctx: CanvasRenderingContext2D, progress: number, opacity: number) {
        ctx.rotate(this.angle);
        
        // Visual shift forward to make it look like a projectile leaving the weapon
        const offset = 20 + (progress * 10); 
        ctx.translate(offset, 0);

        // Scale up slightly during animation
        const scale = 0.8 + (progress * 0.4);
        ctx.scale(scale, scale);

        ctx.globalAlpha = opacity;

        const radius = this.range;

        // 1. Main Crescent Body (Pastel Cyan/White)
        const gradient = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.6, '#B2EBF2'); // Cyan 100
        gradient.addColorStop(1, 'rgba(79, 195, 247, 0)'); // Light Blue fade

        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        // Draw a crescent shape using arcs
        // Outer arc
        ctx.arc(0, 0, radius, -Math.PI/2.5, Math.PI/2.5, false);
        // Inner curve to close the shape
        ctx.bezierCurveTo(
            radius * 0.2, Math.PI/4, 
            radius * 0.2, -Math.PI/4, 
            radius * Math.cos(-Math.PI/2.5), radius * Math.sin(-Math.PI/2.5)
        );
        ctx.fill();

        // 2. Sharp Edge Line (Anime style streak)
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.9, -Math.PI/3, Math.PI/3, false);
        ctx.stroke();

        // 3. Little sparkly bits at the edge
        ctx.fillStyle = '#FFFFFF';
        if (progress < 0.5) {
            ctx.beginPath();
            ctx.arc(radius, -10, 3, 0, Math.PI*2);
            ctx.arc(radius * 0.9, 15, 2, 0, Math.PI*2);
            ctx.fill();
        }
    }

    private drawSpin(ctx: CanvasRenderingContext2D, progress: number, opacity: number) {
        // Rotate continuously
        const rotation = progress * Math.PI * 3; 
        ctx.rotate(rotation);
        
        ctx.globalAlpha = opacity;
        
        const radius = this.range;

        // Draw a whirlwind (3 arms)
        for(let i=0; i<3; i++) {
            ctx.rotate((Math.PI * 2) / 3);
            
            // Wind swoosh
            ctx.fillStyle = 'rgba(128, 222, 234, 0.6)'; // Cyan 200
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 0.6);
            ctx.quadraticCurveTo(radius * 0.5, radius * 0.5, radius, 0);
            ctx.fill();
            
            // Speed line
            ctx.strokeStyle = '#E0F7FA';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.9, 0.1, Math.PI * 0.5);
            ctx.stroke();
        }
        
        // Center glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
}
