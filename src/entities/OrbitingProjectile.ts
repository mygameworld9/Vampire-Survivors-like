import { Projectile } from "./Projectile";
import { Weapon } from "./Weapon";
import { Vector2D } from "../utils/Vector2D";
import { Player } from "./Player";
import { ProjectileKind } from "../utils/types";

export class OrbitingProjectile extends Projectile {
    override readonly KIND = ProjectileKind.ORBITING;
    orbitRadius: number;
    orbitSpeed: number; // degrees per second
    currentAngle: number;
    player: Player;

    // === NEW: Lifetime management (v2.1 Balance) ===
    lifetime: number = 0;           // Current elapsed time in ms
    maxLifetime: number;            // Maximum lifetime in ms (from weapon.duration)

    // Cooldown management for hitting enemies multiple times
    // Map<EnemyID, TimeTimestamp>
    hitTimers: Map<number, number> = new Map();
    hitInterval = 500; // ms between hits on same enemy

    constructor(player: Player, initialAngle: number, weapon: Weapon) {
        // Position will be overwritten immediately in update
        super(player.pos.x, player.pos.y, new Vector2D(0, 0), weapon);

        this.player = player;
        this.orbitRadius = weapon.range; // Use range as orbit radius
        this.orbitSpeed = weapon.speed; // degrees per second, e.g. 90
        this.currentAngle = initialAngle;

        // === CHANGED: Use weapon.duration if available, otherwise infinite ===
        this.maxLifetime = (weapon as any).duration || 999999;
        this.lifetime = 0;

        this.penetration = 9999; // Infinite penetration (hits many enemies)
        this.range = 99999; // Infinite range (lifetime managed by maxLifetime)
    }

    update(dt: number) {
        // === NEW: Track lifetime ===
        this.lifetime += dt * 1000;

        // 1. Update Angle
        this.currentAngle += this.orbitSpeed * dt * (Math.PI / 180); // Convert deg to rad

        // 2. Update Position relative to player
        this.pos.x = this.player.pos.x + Math.cos(this.currentAngle) * this.orbitRadius;
        this.pos.y = this.player.pos.y + Math.sin(this.currentAngle) * this.orbitRadius;

        // 3. Update Hit Timers (cleanup handled elsewhere if needed)
    }

    /**
     * NEW: Check if this orbiting projectile has expired
     * Called by EntityManager to determine if it should be removed
     */
    isExpired(): boolean {
        return this.lifetime >= this.maxLifetime;
    }

    canHit(enemyId: number, time: number): boolean {
        const lastHit = this.hitTimers.get(enemyId);
        if (!lastHit || (time - lastHit > this.hitInterval)) {
            return true;
        }
        return false;
    }

    onHit(enemyId: number, time: number) {
        this.hitTimers.set(enemyId, time);
    }
}
