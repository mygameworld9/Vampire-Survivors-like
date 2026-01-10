
import { Vector2D } from "../utils/Vector2D";
import { Weapon } from "./Weapon";
import { Enemy } from "./Enemy";
import { Player } from "./Player";
import { IWeaponStatusEffect, WeaponTag, ProjectileKind } from "../utils/types";

export class LaserProjectile {
    readonly KIND = ProjectileKind.LASER;
    p1: Vector2D;         // Start point (player pos)

    dir: Vector2D;        // Direction (normalized)
    range: number;
    width: number;
    damage: number;
    statusEffect?: IWeaponStatusEffect;
    tags: WeaponTag[] = [];

    shouldBeRemoved = false;
    hitEnemies: Set<number> = new Set();

    private lifetime = 0.15; // seconds

    // PERF: Static scratch vector for draw calculations (zero alloc)
    private static _scratchP2 = new Vector2D(0, 0);
    private lifeTimer = 0;

    constructor(owner: Player, weapon: Weapon, direction: Vector2D) {
        // Initialize with safe defaults for ObjectPool factory (which passes {} as any)
        const ownerX = owner?.pos?.x ?? 0;
        const ownerY = owner?.pos?.y ?? 0;
        this.p1 = new Vector2D(ownerX, ownerY);
        this.dir = new Vector2D(direction?.x ?? 0, direction?.y ?? 0);
        this.range = weapon?.range ?? 0;
        this.width = weapon?.width ?? 10;
        this.damage = weapon?.damage ?? 0;
        this.statusEffect = weapon?.statusEffect;
        this.tags = weapon?.tags ?? [];
    }

    reset(owner: Player, weapon: Weapon, direction: Vector2D) {
        this.p1.x = owner.pos.x;
        this.p1.y = owner.pos.y;
        // Copy direction values instead of reference to prevent mutation issues
        this.dir.x = direction.x;
        this.dir.y = direction.y;
        this.range = weapon.range;
        this.width = weapon.width || 10;
        this.damage = weapon.damage;
        this.statusEffect = weapon.statusEffect;
        this.tags = weapon.tags;

        this.shouldBeRemoved = false;
        this.hitEnemies.clear();
        this.lifeTimer = 0;
    }

    update(dt: number) {
        this.lifeTimer += dt;
        if (this.lifeTimer >= this.lifetime) {
            this.shouldBeRemoved = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // PERF: Reuse static scratch vector instead of new Vector2D()
        const p2 = LaserProjectile._scratchP2.set(
            this.p1.x + this.dir.x * this.range,
            this.p1.y + this.dir.y * this.range
        );

        // Calculate fade
        const opacity = 1.0 - (this.lifeTimer / this.lifetime);
        ctx.globalAlpha = opacity;

        // Draw "Frost Breath" / Ice Beam style
        const distance = this.range;
        const steps = Math.ceil(distance / (this.width * 0.8));
        const halfWidth = this.width * 0.5;
        const baseSize = this.width / 2;

        // PERF: Pre-calculate p2-p1 delta to avoid repeated subtraction
        const deltaX = p2.x - this.p1.x;
        const deltaY = p2.y - this.p1.y;

        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const x = this.p1.x + deltaX * t;
            const y = this.p1.y + deltaY * t;

            // PERF: Deterministic jitter based on index (avoids Math.random() overhead)
            const jitterX = ((i * 7) % 10 - 5) * halfWidth * 0.1;
            const jitterY = ((i * 11) % 10 - 5) * halfWidth * 0.1;
            const size = baseSize * (0.8 + ((i * 3) % 5) * 0.1);

            ctx.beginPath();
            if ((i % 3) === 0) {
                // Diamond shape (Sparkle)
                ctx.fillStyle = '#E1F5FE';
                ctx.moveTo(x + jitterX, y + jitterY - size);
                ctx.lineTo(x + jitterX + size, y + jitterY);
                ctx.lineTo(x + jitterX, y + jitterY + size);
                ctx.lineTo(x + jitterX - size, y + jitterY);
            } else {
                // Circle shape (Mist)
                ctx.fillStyle = '#81D4FA';
                ctx.arc(x + jitterX, y + jitterY, size, 0, Math.PI * 2);
            }
            ctx.fill();
        }

        ctx.globalAlpha = 1.0;
    }
}
