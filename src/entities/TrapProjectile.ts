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

        // Determine Trap Style
        const isMagic = this.tags.includes('MAGIC');
        const isIce = this.tags.includes('ICE');
        const isDark = this.tags.includes('DARK');

        // Pulse animation
        const pulse = Math.sin(this.timer * 0.005) * 0.1 + 1; // 0.9 to 1.1

        if (this.isTriggered) {
            // == TRIGGERED EFFECT ==
            const progress = Math.min(1, this.triggerTimer / 200); // Quick expansion
            const explosionRadius = this.triggerRadius * (1 + progress * 0.5);

            ctx.globalAlpha = 1.0 - (this.triggerTimer / this.triggeredDuration);

            if (isIce) {
                // Frost Nova
                ctx.fillStyle = '#29B6F6'; // Light Blue
                ctx.beginPath();
                ctx.arc(0, 0, explosionRadius, 0, Math.PI * 2);
                ctx.fill();
            } else if (isDark) {
                // Void Implosion
                ctx.fillStyle = '#000000';
                ctx.strokeStyle = '#9C27B0';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(0, 0, explosionRadius, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                // Physical Snap / Explosion
                ctx.fillStyle = '#FF5252';
                ctx.beginPath();
                ctx.arc(0, 0, explosionRadius, 0, Math.PI * 2);
                ctx.fill();
            }

        } else {
            // == IDLE STATE ==
            if (isMagic) {
                // == RUNE CIRCLE STYLE ==
                ctx.rotate(this.timer * 0.001); // Slow rotation

                const color = isIce ? '#4FC3F7' : (isDark ? '#AB47BC' : '#FFD700');
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.shadowBlur = 5;
                ctx.shadowColor = color;

                // Outer Ring
                ctx.beginPath();
                ctx.arc(0, 0, this.triggerRadius * pulse, 0, Math.PI * 2);
                ctx.stroke();

                // Inner Geometric Pattern (Triangle)
                ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                    const angle = (Math.PI * 2 / 3) * i;
                    const r = this.triggerRadius * 0.7 * pulse;
                    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                }
                ctx.closePath();
                ctx.stroke();

            } else {
                // == MECHANICAL BEAR TRAP STYLE ==
                const jawGap = Math.abs(Math.sin(this.timer * 0.002)) * 0.2; // Jaws breathing slightly

                // Frame
                ctx.strokeStyle = '#795548'; // Brown/Rusty
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(0, 0, this.triggerRadius * 0.8, 0, Math.PI * 2);
                ctx.stroke();

                // Jaws (Spikes)
                ctx.fillStyle = '#BDBDBD'; // Silver
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 / 8) * i;
                    ctx.save();
                    ctx.rotate(angle);
                    ctx.beginPath();
                    // Draw a spike pointing inward
                    ctx.moveTo(this.triggerRadius * 0.8, -5);
                    ctx.lineTo(this.triggerRadius * 0.4, 0);
                    ctx.lineTo(this.triggerRadius * 0.8, 5);
                    ctx.fill();
                    ctx.restore();
                }

                // Red sensor/mechanism in center
                ctx.fillStyle = '#FF5252';
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }
}
