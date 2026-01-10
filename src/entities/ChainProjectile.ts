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
}

function enzymeIsValid(enemy: Enemy, currentTarget: Enemy, hitEnemies: Set<number>): boolean {
    if (!enemy || enemy.hp <= 0) return false;
    if (enemy === currentTarget) return false;
    if (hitEnemies.has(enemy.id)) return false; // Don't hit same enemy twice in one chain
    return true;
}
