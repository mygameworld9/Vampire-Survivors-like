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

        this.penetration = 9999; // Infinite penetration
        this.range = 99999; // Infinite range (lifetime managed by weapon/player)
    }

    update(dt: number) {
        // 1. Update Angle
        this.currentAngle += this.orbitSpeed * dt * (Math.PI / 180); // Convert deg to rad

        // 2. Update Position relative to player
        this.pos.x = this.player.pos.x + Math.cos(this.currentAngle) * this.orbitRadius;
        this.pos.y = this.player.pos.y + Math.sin(this.currentAngle) * this.orbitRadius;

        // 3. Update Hit Timers
        // We iterate map keys to cleanup old entries if needed, or check in collision
        // Ideally handled in collision system, but we can prune here if map gets huge (unlikely)
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

    // Override draw to possibly rotate sprite based on angle?
    // Base draw is fine for now (circle)
}
