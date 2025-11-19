
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
    hitEnemies: Set<Enemy> = new Set();
    statusEffect?: IWeaponStatusEffect;
    
    private owner: Player;
    private state: 'outward' | 'returning' = 'outward';
    private distanceTraveled = 0;
    private direction: Vector2D;
    private rotationAngle = 0;

    constructor(x: number, y: number, owner: Player, weapon: Weapon) {
        this.pos = new Vector2D(x, y);
        this.owner = owner;
        this.direction = new Vector2D(owner.facingDirection.x, owner.facingDirection.y);
        this.damage = weapon.damage;
        this.speed = weapon.speed;
        this.penetration = weapon.penetration; // Used as a counter for hits
        this.range = weapon.range;
        this.statusEffect = weapon.statusEffect;
    }

    update(dt: number) {
        // Rotate continuously
        this.rotationAngle += 15 * dt;

        if (this.state === 'outward') {
            const moveDist = this.speed * dt;
            this.pos.x += this.direction.x * moveDist;
            this.pos.y += this.direction.y * moveDist;
            this.distanceTraveled += moveDist;

            if (this.distanceTraveled >= this.range) {
                this.state = 'returning';
                this.hitEnemies.clear(); // Allow hitting enemies again on return
            }
        } else { // returning
            const returnDirection = new Vector2D(this.owner.pos.x - this.pos.x, this.owner.pos.y - this.pos.y).normalize();
            const returnSpeed = this.speed * 1.5; // Comes back faster
            this.pos.x += returnDirection.x * returnSpeed * dt;
            this.pos.y += returnDirection.y * returnSpeed * dt;

            const distToPlayer = Math.hypot(this.pos.x - this.owner.pos.x, this.pos.y - this.owner.pos.y);
            if (distToPlayer < this.owner.size / 2) {
                this.shouldBeRemoved = true;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.rotationAngle);

        const s = this.size / 2;

        // Draw Cartoon Boomerang Shape
        ctx.fillStyle = '#4FC3F7'; // Pastel Cyan/Blue
        ctx.strokeStyle = '#0288D1'; // Darker Blue Outline
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        // V Shape logic
        ctx.moveTo(0, -s); 
        ctx.quadraticCurveTo(s, -s/2, s, s); // Right tip
        ctx.quadraticCurveTo(0, s/2, -s, s); // Left tip
        ctx.quadraticCurveTo(-s, -s/2, 0, -s); // Back to top
        ctx.fill();
        ctx.stroke();

        // White Stripes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(s * 0.7, s * 0.7, 3, 0, Math.PI * 2); // Dot on right tip
        ctx.arc(-s * 0.7, s * 0.7, 3, 0, Math.PI * 2); // Dot on left tip
        ctx.fill();

        ctx.restore();
    }
}
