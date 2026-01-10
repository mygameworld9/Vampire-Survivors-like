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

    // Hit cooldown to prevent hitting same enemy too fast
    hitTimers: Map<number, number> = new Map();
    hitInterval = 0.3; // seconds between hits on same enemy

    constructor(player: Player, initialAngle: number, weapon: Weapon) {
        // Position will be overwritten immediately in update
        super(player.pos.x, player.pos.y, new Vector2D(0, 0), weapon);

        this.player = player;
        this.orbitRadius = weapon.range; // Use range as orbit radius
        this.orbitSpeed = weapon.speed; // degrees per second, e.g. 90
        this.currentAngle = initialAngle;

        // CHANGED: Use weapon's penetration for hit count (not hardcoded 9999)
        // penetration=1 means disappear on first hit
        this.penetration = weapon.penetration;
        this.range = 99999; // Infinite flight range (controlled by hits, not distance)
    }

    update(dt: number) {
        // 1. Update Angle
        this.currentAngle += this.orbitSpeed * dt * (Math.PI / 180); // Convert deg to rad

        // 2. Update Position relative to player
        this.pos.x = this.player.pos.x + Math.cos(this.currentAngle) * this.orbitRadius;
        this.pos.y = this.player.pos.y + Math.sin(this.currentAngle) * this.orbitRadius;
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
        // NOTE: penetration is decremented by CollisionSystem, 
        // and shouldBeRemoved is set when penetration <= 0
    }
}

