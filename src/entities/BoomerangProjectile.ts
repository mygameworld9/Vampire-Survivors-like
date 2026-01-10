
import { Vector2D } from "../utils/Vector2D";
import { Weapon } from "./Weapon";
import { Enemy } from "./Enemy";
import { Player } from "./Player";
import { IWeaponStatusEffect, WeaponTag, ProjectileKind } from "../utils/types";

export class BoomerangProjectile {
    readonly KIND = ProjectileKind.BOOMERANG;
    pos: Vector2D;

    damage: number;
    speed: number;
    penetration: number;
    range: number;
    size = 32; // Increased size to match player (was 20)
    shouldBeRemoved = false;
    hitEnemies: Set<number> = new Set(); // Stores Enemy IDs
    statusEffect?: IWeaponStatusEffect;
    tags: WeaponTag[] = [];

    private owner!: Player; // Definite assignment via reset
    private state: 'outward' | 'returning' = 'outward';
    private distanceTraveled = 0;
    private direction: Vector2D;
    private rotationAngle = 0;
    private catchCooldown = 0.2; // Seconds before player can catch it
    private onReturn?: () => void;

    constructor(x: number, y: number, owner: Player, weapon: Weapon, onReturn?: () => void) {
        this.pos = new Vector2D(x, y);
        this.direction = new Vector2D(0, 0);
        this.reset(x, y, owner, weapon, onReturn);
    }

    reset(x: number, y: number, owner: Player, weapon: Weapon, onReturn?: () => void) {
        this.pos.x = x;
        this.pos.y = y;
        this.owner = owner;
        this.onReturn = onReturn;

        // Ensure valid direction
        if (owner.facingDirection && Math.abs(owner.facingDirection.x) < 0.01 && Math.abs(owner.facingDirection.y) < 0.01) {
            this.direction.x = 1;
            this.direction.y = 0;
        } else if (owner.facingDirection) {
            this.direction.x = owner.facingDirection.x;
            this.direction.y = owner.facingDirection.y;
        } else {
            this.direction.x = 1;
            this.direction.y = 0;
        }

        this.damage = weapon.damage;
        this.speed = weapon.speed;
        this.penetration = weapon.penetration;
        this.range = weapon.range;
        this.statusEffect = weapon.statusEffect;
        this.tags = weapon.tags;

        this.state = 'outward';
        this.distanceTraveled = 0;
        this.rotationAngle = 0;
        this.catchCooldown = 0.2;
        this.shouldBeRemoved = false;
        this.hitEnemies.clear();
    }

    update(dt: number) {
        this.rotationAngle += 15 * dt;
        if (this.catchCooldown > 0) this.catchCooldown -= dt;

        if (this.state === 'outward') {
            const moveDist = this.speed * dt;
            this.pos.x += this.direction.x * moveDist;
            this.pos.y += this.direction.y * moveDist;
            this.distanceTraveled += moveDist;

            if (this.distanceTraveled >= this.range) {
                this.state = 'returning';
                this.hitEnemies.clear();
                this.penetration = 999; // Reset penetration for return trip
            }
        } else { // returning
            if (!this.owner || !this.owner.pos) {
                this.shouldBeRemoved = true;
                if (this.onReturn) this.onReturn();
                return;
            }

            const returnDirection = new Vector2D(this.owner.pos.x - this.pos.x, this.owner.pos.y - this.pos.y).normalize();
            const returnSpeed = this.speed * 1.5; // Comes back faster
            this.pos.x += returnDirection.x * returnSpeed * dt;
            this.pos.y += returnDirection.y * returnSpeed * dt;

            const distToPlayer = Math.hypot(this.pos.x - this.owner.pos.x, this.pos.y - this.owner.pos.y);
            if (distToPlayer < this.owner.size && this.catchCooldown <= 0) {
                this.shouldBeRemoved = true;
                if (this.onReturn) this.onReturn();
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        // Shadow (Draw before rotation)
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, this.size / 2 + 4, this.size / 2, this.size / 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spin the frisbee
        ctx.rotate(this.rotationAngle);

        const radius = this.size / 2;

        // Main Body (Soft Pastel Pink)
        ctx.fillStyle = '#F8BBD0';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Rim (Vibrant Pink)
        ctx.strokeStyle = '#E91E63';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius - 1.5, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Ring (Darker Pink dashed)
        ctx.strokeStyle = '#880E4F';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Cute Face (Scale factor for positioning)
        const s = radius / 16;

        // Eyes (Dark Purple/Pink)
        ctx.fillStyle = '#880E4F';
        ctx.beginPath();
        ctx.ellipse(-5 * s, -3 * s, 3 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.ellipse(5 * s, -3 * s, 3 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlights
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-4 * s, -5 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.arc(6 * s, -5 * s, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();

        // Mouth (:D shape)
        ctx.fillStyle = '#880E4F';
        ctx.beginPath();
        ctx.arc(0, 0, 6 * s, 0.1, Math.PI - 0.1);
        ctx.lineTo(0, 0 + 6 * s);
        ctx.fill();
        // Tongue
        ctx.fillStyle = '#FF4081';
        ctx.beginPath();
        ctx.arc(0, 3 * s, 3 * s, 0, Math.PI);
        ctx.fill();

        // Cheeks
        ctx.fillStyle = 'rgba(233, 30, 99, 0.4)';
        ctx.beginPath();
        ctx.arc(-9 * s, 3 * s, 3.5 * s, 0, Math.PI * 2);
        ctx.arc(9 * s, 3 * s, 3.5 * s, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
