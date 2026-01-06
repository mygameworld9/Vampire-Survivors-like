
import { Vector2D } from "../utils/Vector2D";
import { Weapon } from "./Weapon";
import { Enemy } from "./Enemy";
import { IWeaponStatusEffect, WeaponTag } from "../utils/types";

export class LightningProjectile {
    pos: Vector2D; // Target position
    damage: number;
    range: number; // AOE Radius
    shouldBeRemoved = false;
    hitEnemies: Set<number> = new Set();
    statusEffect?: IWeaponStatusEffect;
    tags: WeaponTag[] = [];
    
    private lifeTimer = 0;
    private duration = 0.3; // Visual duration

    constructor(x: number, y: number, weapon: Weapon) {
        this.pos = new Vector2D(x, y);
        this.damage = weapon.damage;
        this.range = weapon.range; 
        this.statusEffect = weapon.statusEffect;
        this.tags = weapon.tags;
        this.reset(x, y, weapon);
    }

    reset(x: number, y: number, weapon: Weapon) {
        this.pos.x = x;
        this.pos.y = y;
        this.damage = weapon.damage;
        this.range = weapon.range;
        this.statusEffect = weapon.statusEffect;
        this.tags = weapon.tags;
        
        this.shouldBeRemoved = false;
        this.hitEnemies.clear();
        this.lifeTimer = 0;
    }

    update(dt: number) {
        this.lifeTimer += dt;
        if (this.lifeTimer >= this.duration) {
            this.shouldBeRemoved = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Draw Lightning
        const opacity = 1.0 - (this.lifeTimer / this.duration);
        ctx.globalAlpha = opacity;
        
        ctx.strokeStyle = '#FFF176';
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Simple zig zag from top
        let currX = this.pos.x;
        let currY = this.pos.y;
        ctx.moveTo(currX, currY);
        
        // Go up to the sky
        for(let i=0; i<5; i++) {
             currY -= 100;
             currX += (Math.random() - 0.5) * 50;
             ctx.lineTo(currX, currY);
        }
        ctx.stroke();

        // Explosion circle
        ctx.fillStyle = 'rgba(255, 241, 118, 0.5)';
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.range, 0, Math.PI*2);
        ctx.fill();

        ctx.globalAlpha = 1.0;
    }
}
