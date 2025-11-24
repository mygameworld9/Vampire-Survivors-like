
import { Vector2D } from "../utils/Vector2D";
import { Weapon } from "./Weapon";
import { Enemy } from "./Enemy";
import { Player } from "./Player";
import { IWeaponStatusEffect } from "../utils/types";

export class BoomerangProjectile {
    pos: Vector2D;
    damage: number;
    speed: number;
    penetration: number;
    range: number;
    size = 32;
    shouldBeRemoved = false;
    hitEnemies: Set<number> = new Set();
    statusEffect?: IWeaponStatusEffect;
    
    private owner: Player;
    private state: 'outward' | 'returning' = 'outward';
    private distanceTraveled = 0;
    private direction: Vector2D;
    private rotationAngle = 0;
    private catchCooldown = 0.2; // Seconds before player can catch it

    constructor(x: number, y: number, owner: Player, weapon: Weapon) {
        this.pos = new Vector2D(x, y);
        this.owner = owner;
        // Ensure valid direction
        if (Math.abs(owner.facingDirection.x) < 0.01 && Math.abs(owner.facingDirection.y) < 0.01) {
            this.direction = new Vector2D(1, 0);
        } else {
            this.direction = new Vector2D(owner.facingDirection.x, owner.facingDirection.y);
        }
        this.damage = weapon.damage;
        this.speed = weapon.speed;
        this.penetration = weapon.penetration;
        this.range = weapon.range;
        this.statusEffect = weapon.statusEffect;
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
            const returnDirection = new Vector2D(this.owner.pos.x - this.pos.x, this.owner.pos.y - this.pos.y).normalize();
            const returnSpeed = this.speed * 1.5; // Comes back faster
            this.pos.x += returnDirection.x * returnSpeed * dt;
            this.pos.y += returnDirection.y * returnSpeed * dt;

            const distToPlayer = Math.hypot(this.pos.x - this.owner.pos.x, this.pos.y - this.owner.pos.y);
            if (distToPlayer < this.owner.size && this.catchCooldown <= 0) {
                this.shouldBeRemoved = true;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        
        // Glow Effect
        const isReturning = this.state === 'returning';
        ctx.shadowBlur = isReturning ? 20 : 10;
        ctx.shadowColor = '#F48FB1'; // Pink Glow

        // Motion blur trail
        ctx.rotate(this.rotationAngle);
        
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#F8BBD0';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        const s = this.size / 2;

        // Cute Rounded Boomerang Body
        ctx.fillStyle = '#F06292'; // Darker Pink
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#F48FB1'; // Light Pink Stroke
        
        ctx.beginPath();
        // Draw a soft curve V shape
        ctx.moveTo(-s, -s/2);
        ctx.quadraticCurveTo(0, 0, s, -s/2); // Top curve
        ctx.quadraticCurveTo(0, s, -s, -s/2); // Bottom curve
        ctx.fill();
        ctx.stroke();

        // White Highlight / Stripe
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-s * 0.5, -s/4);
        ctx.quadraticCurveTo(0, 0, s * 0.5, -s/4);
        ctx.stroke();
        
        // Center Gem
        ctx.fillStyle = '#BA68C8'; // Purple
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    }
}
