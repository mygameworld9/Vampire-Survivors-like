import { Projectile } from "./Projectile";
import { Weapon } from "./Weapon";
import { Vector2D } from "../utils/Vector2D";
import { Enemy } from "./Enemy";
import { ProjectileKind } from "../utils/types";

export class ChainProjectile extends Projectile {
    override readonly KIND = ProjectileKind.CHAIN;
    bounceCount: number;
    maxBounces: number;
    bounceRange: number;

    constructor(x: number, y: number, direction: Vector2D, weapon: Weapon) {
        super(x, y, direction, weapon);
        // === CHANGED: Prefer bounceCount field, fallback to penetration for backward compat ===
        this.maxBounces = (weapon as any).bounceCount ?? weapon.penetration;
        this.bounceCount = 0;
        this.bounceRange = weapon.range; // Use range as bounce search radius

        // Chain projectiles don't pierce in the traditional sense, they bounce
        this.penetration = 999;
    }

    /**
     * Attempts to chain to a new target.
     * @returns true if a valid target was found and projectile was redirected, false otherwise.
     */
    chain(currentTarget: Enemy, allEnemies: Enemy[]): boolean {
        this.bounceCount++;
        if (this.bounceCount >= this.maxBounces) {
            return false;
        }

        let bestTarget: Enemy | null = null;
        let minDistSq = this.bounceRange * this.bounceRange;

        for (const enemy of allEnemies) {
            if (!enzymeIsValid(enemy, currentTarget, this.hitEnemies)) continue;

            const distSq = this.pos.distSq(enemy.pos);
            if (distSq < minDistSq) {
                minDistSq = distSq;
                bestTarget = enemy;
            }
        }

        if (bestTarget) {
            // Redirect towards new target
            const dir = new Vector2D(bestTarget.pos.x - this.pos.x, bestTarget.pos.y - this.pos.y).normalize();
            this.direction = dir;
            // Reset distance traveled so it can reach the new target
            this.distanceTraveled = 0;
            // Reduce damage for next bounce? (Optional, maybe 10% decay)
            this.damage *= 0.9;
            return true;
        }

        return false;
    }

    private trail: { x: number, y: number }[] = [];
    private maxTrailLength = 10;

    override update(dt: number) {
        // Update trail
        this.trail.push({ x: this.pos.x, y: this.pos.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        super.update(dt);
    }

    override draw(ctx: CanvasRenderingContext2D) {
        if (this.trail.length < 2) return;

        const isLightning = this.tags.includes('LIGHTNING');

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (isLightning) {
            // == LIGHTNING STYLE ==
            // Core White
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#FFEB3B'; // Yellow Glow (or Blue if Storm)
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;

            if (this.tags.includes('AREA')) { // Storm Weaver (removed STORM check)
                ctx.shadowColor = '#00B0FF';
            }

            // Draw Jagged Path
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);

            for (let i = 1; i < this.trail.length; i++) {
                const p1 = this.trail[i - 1];
                const p2 = this.trail[i];
                // Add jitter
                const midX = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 10;
                const midY = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 10;
                ctx.lineTo(midX, midY);
                ctx.lineTo(p2.x, p2.y);
            }
            ctx.stroke();

            // Draw Head spark
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, 5, 0, Math.PI * 2);
            ctx.fill();

        } else {
            // == PHYSICAL CHAIN STYLE ==
            ctx.strokeStyle = '#B0BEC5'; // Silver
            ctx.lineWidth = 4;

            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();

            // Draw Links
            ctx.fillStyle = '#607D8B';
            for (let i = 0; i < this.trail.length; i += 2) { // Every other point
                ctx.beginPath();
                ctx.arc(this.trail[i].x, this.trail[i].y, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            // Head Hook
            ctx.strokeStyle = '#CFD8DC';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, 6, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}

function enzymeIsValid(enemy: Enemy, currentTarget: Enemy, hitEnemies: Set<number>): boolean {
    if (!enemy || enemy.hp <= 0) return false;
    if (enemy === currentTarget) return false;
    if (hitEnemies.has(enemy.id)) return false; // Don't hit same enemy twice in one chain
    return true;
}
