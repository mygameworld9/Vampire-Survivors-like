
import { Vector2D } from "../utils/Vector2D";
import { Weapon } from "./Weapon";
import { Enemy } from "./Enemy";
import { IWeaponStatusEffect, WeaponTag, ProjectileKind } from "../utils/types";

export class HomingProjectile {
    readonly KIND = ProjectileKind.HOMING;
    pos: Vector2D;

    direction: Vector2D;
    speed: number;
    damage: number;
    penetration: number;
    range: number;
    distanceTraveled = 0;
    size = 16;
    shouldBeRemoved = false;
    hitEnemies: Set<number> = new Set();
    statusEffect?: IWeaponStatusEffect;
    tags: WeaponTag[] = [];

    private target!: Enemy;
    private rotation = 0;

    // Scratch object for calculation
    private _tempVector = new Vector2D(0, 0);

    constructor(x: number, y: number, direction: Vector2D, weapon: Weapon, target: Enemy) {
        this.pos = new Vector2D(x, y);
        this.direction = direction;
        this.speed = weapon.speed;
        this.damage = weapon.damage;
        this.penetration = weapon.penetration;
        this.range = weapon.range;
        this.reset(x, y, direction, weapon, target);
    }

    reset(x: number, y: number, direction: Vector2D, weapon: Weapon, target: Enemy) {
        this.pos.x = x;
        this.pos.y = y;
        this.direction = direction;
        this.speed = weapon.speed;
        this.damage = weapon.damage;
        this.penetration = weapon.penetration;
        this.range = weapon.range;
        this.statusEffect = weapon.statusEffect;
        this.tags = weapon.tags;
        this.target = target;

        this.distanceTraveled = 0;
        this.rotation = 0;
        this.shouldBeRemoved = false;
        this.hitEnemies.clear();
    }

    update(dt: number) {
        this.rotation += dt * 10; // Spin

        // If the target is still valid, home in on it.
        // Check target.id as extra safety although ref checks work if instance is alive
        if (this.target && !this.target.shouldBeRemoved && this.target.pos) {
            // Use scratch vector to avoid creating new Vector2D every frame
            this._tempVector.set(this.target.pos.x, this.target.pos.y)
                .sub(this.pos)
                .normalize();

            // Update direction in place
            this.direction.copy(this._tempVector);
        }

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

        // Trail effect (simple back stars)
        ctx.fillStyle = 'rgba(225, 190, 231, 0.5)'; // Faint purple
        for (let i = 1; i <= 2; i++) {
            ctx.beginPath();
            ctx.arc(-this.direction.x * i * 10, -this.direction.y * i * 10, this.size / 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Rotate the main star
        ctx.rotate(this.rotation);

        // Draw Star Shape
        this.drawStar(ctx, 0, 0, 5, this.size / 2, this.size / 4, '#E1BEE7', '#8E24AA');

        ctx.restore();
    }

    private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, fill: string, stroke: string) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = stroke;
        ctx.stroke();
        ctx.fillStyle = fill;
        ctx.fill();
    }
}
