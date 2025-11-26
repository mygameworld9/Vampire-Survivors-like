
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
    size = 32; // Increased size to match player (was 20)
    shouldBeRemoved = false;
    hitEnemies: Set<number> = new Set(); // Stores Enemy IDs
    statusEffect?: IWeaponStatusEffect;
    
    private owner: Player;
    private state: 'outward' | 'returning' = 'outward';
    private distanceTraveled = 0;
    private direction: Vector2D;
    private rotationAngle = 0;
    private catchCooldown = 0.2; // Seconds before player can catch it
    private onReturn?: () => void;

    constructor(x: number, y: number, owner: Player, weapon: Weapon, onReturn?: () => void) {
        this.pos = new Vector2D(x, y);
        this.owner = owner;
        this.onReturn = onReturn;
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
        ctx.ellipse(0, 6, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spin the frisbee
        ctx.rotate(this.rotationAngle);
        
        const scale = this.size / 20; 
        ctx.scale(scale, scale);

        // Frisbee Body
        ctx.fillStyle = '#76FF03'; // Light Green
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Rings
        ctx.strokeStyle = '#33691E'; // Dark Green
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2); // Outer rim
        ctx.stroke();
        
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#64DD17';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2); // Inner ridge
        ctx.stroke();

        // Pattern to show spin
        ctx.fillStyle = '#1B5E20';
        for(let i=0; i<3; i++) {
            ctx.beginPath();
            ctx.arc(6, 0, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.rotate((Math.PI * 2) / 3);
        }

        ctx.restore();
    }
}