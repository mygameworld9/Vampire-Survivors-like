
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
    hitEnemies: Set<number> = new Set(); // Stores Enemy IDs
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
        
        const isReturning = this.state === 'returning';

        // Rotating Energy Trail
        ctx.rotate(this.rotationAngle);
        
        // Dynamic arc trail
        ctx.beginPath();
        // Draw an arc trailing the rotation
        ctx.arc(0, 0, this.size * 0.9, Math.PI, Math.PI + 2); 
        ctx.strokeStyle = `rgba(0, 229, 255, ${isReturning ? 0.6 : 0.3})`;
        ctx.lineWidth = 4;
        ctx.stroke();

        const s = this.size / 2;

        // Body Style - Cool Blue/Cyan
        ctx.fillStyle = '#29B6F6'; // Light Blue 400
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#0277BD'; // Light Blue 800
        
        ctx.beginPath();
        // Rounded V-shape
        ctx.moveTo(-s, -s/2);
        ctx.quadraticCurveTo(0, 0, s, -s/2); // Top
        ctx.quadraticCurveTo(0, s, -s, -s/2); // Bottom
        ctx.fill();
        ctx.stroke();

        // Highlight
        ctx.strokeStyle = '#E1F5FE'; // Almost white blue
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-s * 0.5, -s/4);
        ctx.quadraticCurveTo(0, 0, s * 0.5, -s/4);
        ctx.stroke();
        
        // Central Core/Gem
        ctx.fillStyle = isReturning ? '#FFFFFF' : '#80D8FF';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI*2);
        ctx.fill();

        // Emanating Particles (When returning)
        if (isReturning) {
            // Draw orbiting energy bits
            for(let i=0; i<4; i++) {
                // Determine position based on rotation to make them spin around
                const angle = (Math.PI / 2 * i) - (this.rotationAngle * 2); 
                const dist = this.size; 
                const px = Math.cos(angle) * dist;
                const py = Math.sin(angle) * dist;
                
                ctx.fillStyle = '#18FFFF'; // High intensity Cyan
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI*2);
                ctx.fill();
                
                // Trail line connecting to center
                ctx.strokeStyle = 'rgba(24, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0,0);
                ctx.lineTo(px, py);
                ctx.stroke();
            }
        }

        ctx.restore();
    }
}
