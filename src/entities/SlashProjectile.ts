
import { Vector2D } from "../utils/Vector2D";
import { Weapon } from "./Weapon";
import { Enemy } from "./Enemy";
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
    private offsetDistance = 40;
    private angle: number;

    constructor(owner: Player, weapon: Weapon, isFullCircle: boolean) {
        this.owner = owner;
        this.damage = weapon.damage;
        this.range = weapon.range; 
        this.statusEffect = weapon.statusEffect;
        this.isFullCircle = isFullCircle;
        
        // Calculate initial pos based on player facing
        this.angle = Math.atan2(owner.facingDirection.y, owner.facingDirection.x);
        
        // If full circle, center on player. If slash, offset.
        if (this.isFullCircle) {
             this.pos = new Vector2D(owner.pos.x, owner.pos.y);
             this.duration = 0.25; // Slightly longer for full spin
        } else {
             this.pos = new Vector2D(
                owner.pos.x + owner.facingDirection.x * this.offsetDistance,
                owner.pos.y + owner.facingDirection.y * this.offsetDistance
             );
        }
    }

    update(dt: number) {
        this.lifeTimer += dt;
        // Follow player
        if (this.isFullCircle) {
             this.pos.x = this.owner.pos.x;
             this.pos.y = this.owner.pos.y;
        } else {
             // Keep relative position
             this.pos.x = this.owner.pos.x + Math.cos(this.angle) * this.offsetDistance;
             this.pos.y = this.owner.pos.y + Math.sin(this.angle) * this.offsetDistance;
        }

        if (this.lifeTimer >= this.duration) {
            this.shouldBeRemoved = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        const opacity = 1.0 - (this.lifeTimer / this.duration);
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = '#E0F7FA'; // Cyan slash
        ctx.lineWidth = 4;
        
        ctx.beginPath();
        if (this.isFullCircle) {
            // Draw a spinning effect using multiple arcs
            const spin = this.lifeTimer * 20;
            ctx.arc(this.pos.x, this.pos.y, this.range, spin, spin + Math.PI * 1.8);
            
            // Add a second inner ring
            ctx.moveTo(this.pos.x + this.range * 0.7, this.pos.y);
            ctx.arc(this.pos.x, this.pos.y, this.range * 0.7, spin + 1, spin + 1 + Math.PI * 1.5);
        } else {
            // Draw regular arc
            ctx.arc(this.pos.x, this.pos.y, this.range, this.angle - Math.PI/2, this.angle + Math.PI/2);
        }
        ctx.stroke();
        
        // Inner fill
        ctx.fillStyle = 'rgba(224, 247, 250, 0.3)';
        ctx.fill();

        ctx.globalAlpha = 1.0;
    }
}
