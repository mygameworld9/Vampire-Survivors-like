import { Projectile } from "./Projectile";
import { Weapon } from "./Weapon";
import { Vector2D } from "../utils/Vector2D";
import { ProjectileKind } from "../utils/types";

export class TrapProjectile extends Projectile {
    override readonly KIND = ProjectileKind.TRAP;
    duration: number;
    timer: number = 0;
    triggerRadius: number;
    isTriggered: boolean = false;
    triggeredDuration: number = 500; // How long visualization lasts after trigger
    triggerTimer: number = 0;

    constructor(x: number, y: number, weapon: Weapon) {
        super(x, y, new Vector2D(0, 0), weapon);
        this.speed = 0; // Traps don't move
        this.duration = 10000; // 10 seconds default, or from weapon data
        // We might want to pass duration via weapon definition if we add it to IWeaponData
        // For now hardcode or assume range is duration? No range is usually distance.
        // Let's assume weapon.range is TRAP RADIUS. Duration is fixed or logic based.

        // Actually weapon.statusEffect.duration is often used for effect, 
        // but let's use a standard 15s for traps unless specified.

        this.triggerRadius = weapon.range || 40;
        this.penetration = 1; // 1 Trigger limit usually
    }

    update(dt: number) {
        if (this.isTriggered) {
            this.triggerTimer += dt * 1000;
            if (this.triggerTimer >= this.triggeredDuration) {
                this.shouldBeRemoved = true;
            }
            return;
        }

        this.timer += dt * 1000;
        if (this.timer >= this.duration) {
            this.shouldBeRemoved = true;
        }
    }

    trigger() {
        if (this.isTriggered) return;
        this.isTriggered = true;
        // Visuals handled by particle system in collision system
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.shouldBeRemoved) return;

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        if (this.isTriggered) {
            // Explosion / Trigger visual
            ctx.fillStyle = '#FF5252';
            ctx.beginPath();
            ctx.arc(0, 0, this.triggerRadius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Idle Trap Visual
            const pulse = Math.sin(this.timer * 0.005) * 0.2 + 1; // Pulse size

            // Outer ring
            ctx.strokeStyle = '#BDBDBD';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.triggerRadius * 0.8 * pulse, 0, Math.PI * 2);
            ctx.stroke();

            // Inner core
            ctx.fillStyle = '#FF5252'; // Red danger
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();

            // Spikes
            for (let i = 0; i < 4; i++) {
                ctx.rotate(Math.PI / 2);
                ctx.beginPath();
                ctx.moveTo(0, 5);
                ctx.lineTo(-5, 15);
                ctx.lineTo(5, 15);
                ctx.fill();
            }
        }

        ctx.restore();
    }
}
