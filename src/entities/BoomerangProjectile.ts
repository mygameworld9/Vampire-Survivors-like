
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
    size = 20; // Reduced size for cuteness
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
        // We keep rotationAngle updating just in case, though we calculate facing direction in draw
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
        // Remove rounding to prevent jitter
        ctx.translate(this.pos.x, this.pos.y);
        
        // Calculate facing angle based on movement state
        let angle = 0;
        if (this.state === 'outward') {
             angle = Math.atan2(this.direction.y, this.direction.x);
        } else {
             // Face the owner when returning
             const dx = this.owner.pos.x - this.pos.x;
             const dy = this.owner.pos.y - this.pos.y;
             angle = Math.atan2(dy, dx);
        }
        
        ctx.rotate(angle);
        
        // Visual Scale adjustment
        const scale = this.size / 20; 
        ctx.scale(scale, scale);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 6, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // --- Draw Cute Flying Squirrel (Compacted Length) ---
        
        // 1. Patagium (Gliding Membrane) - Compacted
        ctx.fillStyle = '#D7CCC8'; // Light Beige
        ctx.beginPath();
        // Left wing
        ctx.moveTo(2, -4);   
        ctx.lineTo(-4, -10); 
        ctx.quadraticCurveTo(0, -7, 2, -4);
        ctx.fill();
        
        // Right wing
        ctx.beginPath();
        ctx.moveTo(2, 4);
        ctx.lineTo(-4, 10);
        ctx.quadraticCurveTo(0, 7, 2, 4);
        ctx.fill();

        // 2. Tail (Bushy - Shortened)
        ctx.fillStyle = '#5D4037'; // Dark Brown
        ctx.beginPath();
        ctx.ellipse(-7, 0, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3. Body (Shortened)
        ctx.fillStyle = '#8D6E63'; // Brown
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4. Head (Closer to body)
        ctx.beginPath();
        ctx.arc(5, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.moveTo(6, -3);
        ctx.lineTo(8, -7);
        ctx.lineTo(4, -3);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(6, 3);
        ctx.lineTo(8, 7);
        ctx.lineTo(4, 3);
        ctx.fill();

        // Face
        ctx.fillStyle = '#212121'; // Eyes
        ctx.beginPath();
        ctx.arc(6.5, -2, 1.2, 0, Math.PI*2);
        ctx.arc(6.5, 2, 1.2, 0, Math.PI*2);
        ctx.fill();
        
        ctx.fillStyle = '#FFAB91'; // Nose
        ctx.beginPath();
        ctx.arc(8, 0, 0.8, 0, Math.PI*2);
        ctx.fill();

        // Eye Shine
        ctx.fillStyle = 'white'; 
        ctx.beginPath();
        ctx.arc(7, -2.2, 0.5, 0, Math.PI * 2);
        ctx.arc(7, 1.8, 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Speed Lines / Wind Effect
        if (this.state === 'outward' || this.distanceTraveled > 20) {
             ctx.strokeStyle = 'rgba(255,255,255,0.5)';
             ctx.lineWidth = 1.5;
             ctx.beginPath();
             ctx.moveTo(-10, -3); ctx.lineTo(-15, -3);
             ctx.moveTo(-10, 3); ctx.lineTo(-15, 3);
             ctx.stroke();
        }

        ctx.restore();
    }
}
