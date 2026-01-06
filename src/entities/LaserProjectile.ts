
import { Vector2D } from "../utils/Vector2D";
import { Weapon } from "./Weapon";
import { Enemy } from "./Enemy";
import { Player } from "./Player";
import { IWeaponStatusEffect, WeaponTag } from "../utils/types";

export class LaserProjectile {
    p1: Vector2D;         // Start point (player pos)
    dir: Vector2D;        // Direction (normalized)
    range: number;
    width: number;
    damage: number;
    statusEffect?: IWeaponStatusEffect;
    tags: WeaponTag[] = [];
    
    shouldBeRemoved = false;
    hitEnemies: Set<number> = new Set();
    
    private lifetime = 0.15; // seconds
    private lifeTimer = 0;

    constructor(owner: Player, weapon: Weapon, direction: Vector2D) {
        this.p1 = new Vector2D(owner.pos.x, owner.pos.y);
        this.dir = new Vector2D(0, 0);
        this.range = 0;
        this.width = 0;
        this.damage = 0;
        this.reset(owner, weapon, direction);
    }

    reset(owner: Player, weapon: Weapon, direction: Vector2D) {
        this.p1.x = owner.pos.x;
        this.p1.y = owner.pos.y;
        this.dir = direction; // Usually passed as a new vector or reused ref, but caller passes new usually
        this.range = weapon.range;
        this.width = weapon.width || 10;
        this.damage = weapon.damage;
        this.statusEffect = weapon.statusEffect;
        this.tags = weapon.tags;
        
        this.shouldBeRemoved = false;
        this.hitEnemies.clear();
        this.lifeTimer = 0;
    }

    update(dt: number) {
        this.lifeTimer += dt;
        if (this.lifeTimer >= this.lifetime) {
            this.shouldBeRemoved = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        const p2 = new Vector2D(
            this.p1.x + this.dir.x * this.range,
            this.p1.y + this.dir.y * this.range
        );

        // Calculate fade
        const opacity = 1.0 - (this.lifeTimer / this.lifetime);
        ctx.globalAlpha = opacity;

        // Draw "Frost Breath" / Ice Beam style
        // Instead of a straight line, we draw multiple overlapping circles/diamonds along the path
        const distance = this.range;
        // Step size roughly equals width to ensure overlap
        const steps = Math.ceil(distance / (this.width * 0.8)); 

        for(let i = 0; i < steps; i++) {
            const t = i / steps;
            const x = this.p1.x + (p2.x - this.p1.x) * t;
            const y = this.p1.y + (p2.y - this.p1.y) * t;

            // Add slight jitter for organic feel
            const jitterX = (Math.random() - 0.5) * (this.width * 0.5);
            const jitterY = (Math.random() - 0.5) * (this.width * 0.5);

            // Randomize size slightly
            const size = (this.width / 2) * (Math.random() * 0.5 + 0.8);

            ctx.beginPath();
            if (Math.random() > 0.7) {
                // Diamond shape (Sparkle)
                ctx.fillStyle = '#E1F5FE'; // Almost white
                ctx.moveTo(x + jitterX, y + jitterY - size);
                ctx.lineTo(x + jitterX + size, y + jitterY);
                ctx.lineTo(x + jitterX, y + jitterY + size);
                ctx.lineTo(x + jitterX - size, y + jitterY);
            } else {
                // Circle shape (Mist)
                ctx.fillStyle = '#81D4FA'; // Light Blue
                ctx.arc(x + jitterX, y + jitterY, size, 0, Math.PI * 2);
            }
            ctx.fill();
        }

        ctx.globalAlpha = 1.0;
    }
}
