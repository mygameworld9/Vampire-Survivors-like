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

    override draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        // Colors
        let coreColor = '#B2EBF2'; // Cyan 100
        let glowColor = '#00BCD4'; // Cyan 500
        let tailColor = 'rgba(0, 188, 212, 0.5)';

        if (this.tags.includes('DARK')) {
            coreColor = '#E1BEE7'; // Purple 100
            glowColor = '#9C27B0'; // Purple 500
            tailColor = 'rgba(156, 39, 176, 0.5)';
        } else if (this.tags.includes('FIRE')) {
            coreColor = '#FFCCBC';
            glowColor = '#FF5722';
            tailColor = 'rgba(255, 87, 34, 0.5)';
        }

        // 1. Draw Tail (Arc) - Simulated Trail without array
        const tailLength = Math.PI / 2; // Quarter circle tail
        const tailStart = this.currentAngle - tailLength;
        const cx = this.player.pos.x;
        const cy = this.player.pos.y;

        // Gradient for tail
        // Since we can't easily do angular gradient on path in 2D canvas without tricks,
        // we'll simulate it by drawing a few segments or just a solid fading line?
        // Let's do a simple stroke with globalAlpha or just a solid color for now.
        // Better: Stroke the arc.

        ctx.beginPath();
        // Arc from tailStart to currentAngle
        ctx.arc(cx, cy, this.orbitRadius, tailStart, this.currentAngle);

        ctx.lineWidth = 4;
        ctx.strokeStyle = tailColor;
        ctx.lineCap = 'round';
        // Fade effect workaround: strokeStyle gradient only works linearly or radially (not distinct along path)
        // We will just draw it.
        ctx.stroke();

        // 2. Draw Orb
        ctx.translate(this.pos.x, this.pos.y);

        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = glowColor;

        // Core
        const gradient = ctx.createRadialGradient(0, 0, 2, 0, 0, 8);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.4, coreColor);
        gradient.addColorStop(1, glowColor);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // Inner Eye / Core Detail (for "Spirit" feel)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

