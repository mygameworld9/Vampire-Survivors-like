
import { Vector2D } from "../utils/Vector2D";
import { Weapon } from "./Weapon";
import { Enemy } from "./Enemy";
import { IWeaponStatusEffect } from "../utils/types";

export class Projectile {
    pos: Vector2D;
    direction: Vector2D;
    speed: number;
    damage: number;
    penetration: number;
    range: number;
    distanceTraveled = 0;
    size = 14;
    shouldBeRemoved = false;
    hitEnemies: Set<number> = new Set(); // Store Enemy IDs
    statusEffect?: IWeaponStatusEffect;

    constructor(x: number, y: number, direction: Vector2D, weapon: Weapon) {
        this.pos = new Vector2D(x, y);
        this.direction = new Vector2D(direction.x, direction.y);
        this.speed = weapon.speed;
        this.damage = weapon.damage;
        this.penetration = weapon.penetration;
        this.range = weapon.range;
        this.statusEffect = weapon.statusEffect;
    }

    reset(x: number, y: number, direction: Vector2D, weapon: Weapon) {
        this.pos.x = x;
        this.pos.y = y;
        this.direction.x = direction.x;
        this.direction.y = direction.y;
        this.speed = weapon.speed;
        this.damage = weapon.damage;
        this.penetration = weapon.penetration;
        this.range = weapon.range;
        this.statusEffect = weapon.statusEffect;
        
        this.distanceTraveled = 0;
        this.shouldBeRemoved = false;
        this.hitEnemies.clear();
    }

    update(dt: number) {
        const moveDist = this.speed * dt;
        this.pos.x += this.direction.x * moveDist;
        this.pos.y += this.direction.y * moveDist;
        this.distanceTraveled += moveDist;

        if (this.distanceTraveled >= this.range) {
            this.shouldBeRemoved = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        // Outer Glow/Outline
        ctx.shadowBlur = 0;
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#F9A825'; // Darker Yellow/Orange border
        
        // Main Body
        ctx.fillStyle = '#FFF176'; // Light Pastel Yellow
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Shine/Highlight
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-this.size / 5, -this.size / 5, this.size / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
