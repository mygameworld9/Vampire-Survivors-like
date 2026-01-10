
import { Enemy } from "../entities/Enemy";
import { Prop } from "../entities/Prop";
import { Projectile } from "../entities/Projectile";
import { XpOrb } from "../entities/XpOrb";
import { Chest } from "../entities/Chest";
import { Item } from "../entities/Item";
import { ExplorationPoint } from "../entities/ExplorationPoint";
import { FloatingText } from "../entities/FloatingText";
import { AuraEffect } from "../entities/AuraEffect";
import { PulseEffect } from "../entities/PulseEffect";
import { ObjectPool } from "../utils/ObjectPool";
import { Vector2D } from "../utils/Vector2D";
import { CollisionSystem } from "./systems/CollisionSystem";
import { BoomerangProjectile } from "../entities/BoomerangProjectile";
import { LaserProjectile } from "../entities/LaserProjectile";
import { HomingProjectile } from "../entities/HomingProjectile";
import { LightningProjectile } from "../entities/LightningProjectile";
import { SlashProjectile } from "../entities/SlashProjectile";
import { OrbitingProjectile } from "../entities/OrbitingProjectile";
import { Particle } from "../entities/Particle";
import { ProjectilePools } from "../entities/Weapon";
import { EnemyRegistry } from "./EnemyRegistry";

type AnyProjectile = Projectile | BoomerangProjectile | LaserProjectile | HomingProjectile | LightningProjectile | SlashProjectile;
type AnyEffect = AuraEffect | PulseEffect;

export class EntityManager {
    // Lists
    public enemies: Enemy[] = [];
    public props: Prop[] = [];
    public projectiles: AnyProjectile[] = [];
    public xpOrbs: XpOrb[] = [];
    public effects: AnyEffect[] = [];
    public items: Item[] = [];
    public chests: Chest[] = [];
    public explorationPoints: ExplorationPoint[] = [];
    public floatingTexts: FloatingText[] = [];
    public animatingEntities: Chest[] = []; // Entities that need update even if logical state changes

    // Pools
    public enemyPool: ObjectPool<Enemy>;
    public propPool: ObjectPool<Prop>;
    public particlePool: ObjectPool<Particle>;

    // Specific Projectile Pools
    public projectilePool: ObjectPool<Projectile>;
    public boomerangPool: ObjectPool<BoomerangProjectile>;
    public laserPool: ObjectPool<LaserProjectile>;
    public homingPool: ObjectPool<HomingProjectile>;
    public lightningPool: ObjectPool<LightningProjectile>;
    public slashPool: ObjectPool<SlashProjectile>;

    // Aggregated Pool Interface
    public projectilePools: ProjectilePools;

    // Optimization
    private frameCount = 0;

    constructor() {
        // Initialize Object Pools
        this.enemyPool = new ObjectPool(() => new Enemy(0, 0, {} as any, 'SLIME', false));
        this.propPool = new ObjectPool(() => new Prop(0, 0, {} as any));
        this.particlePool = new ObjectPool(() => new Particle(0, 0, '#fff'));

        this.projectilePool = new ObjectPool(() => new Projectile(0, 0, new Vector2D(0, 0), {} as any));
        this.boomerangPool = new ObjectPool(() => new BoomerangProjectile(0, 0, {} as any, {} as any));
        this.laserPool = new ObjectPool(() => new LaserProjectile({} as any, {} as any, new Vector2D(0, 0)));
        this.homingPool = new ObjectPool(() => new HomingProjectile(0, 0, new Vector2D(0, 0), {} as any, {} as any));
        this.lightningPool = new ObjectPool(() => new LightningProjectile(0, 0, {} as any));
        this.slashPool = new ObjectPool(() => new SlashProjectile({} as any, {} as any, false));

        this.projectilePools = {
            projectile: this.projectilePool,
            boomerang: this.boomerangPool,
            laser: this.laserPool,
            homing: this.homingPool,
            lightning: this.lightningPool,
            slash: this.slashPool
        };
    }

    update(dt: number, playerPos: Vector2D, collisionSystem: CollisionSystem, onBossRemoved: (e: Enemy) => void) {
        this.frameCount++;

        // Update Enemies
        let i = 0;
        const flockingRadius = 50;
        const updateStride = 10;
        const frameMod = this.frameCount % updateStride;

        while (i < this.enemies.length) {
            const e = this.enemies[i];
            const wasAlive = e.hp > 0;

            // Optimization: Staggered Flocking Update
            const shouldUpdateFlocking = (e.id % updateStride) === frameMod;
            let neighbors: Enemy[] | null = null;
            if (shouldUpdateFlocking) {
                neighbors = collisionSystem.getNeighbors(e.pos, flockingRadius);
            }

            e.update(dt, playerPos, neighbors);

            if (wasAlive && e.shouldBeRemoved) {
                collisionSystem.onEnemyDefeated(e);
            }

            if (e.shouldBeRemoved) {
                if (e.isElite) {
                    onBossRemoved(e);
                }
                // PERF: Unregister from O(1) lookup table before releasing to pool
                EnemyRegistry.unregister(e);
                this.enemyPool.release(e);
                const last = this.enemies[this.enemies.length - 1];
                this.enemies[i] = last;
                this.enemies.pop();
            } else {
                i++;
            }
        }

        // Update Props
        let k = 0;
        while (k < this.props.length) {
            const p = this.props[k];
            p.update(dt);
            if (p.shouldBeRemoved) {
                collisionSystem.onPropDestroyed(p);
                this.propPool.release(p);
                const last = this.props[this.props.length - 1];
                this.props[k] = last;
                this.props.pop();
            } else {
                k++;
            }
        }

        // Update Projectiles
        let j = 0;
        while (j < this.projectiles.length) {
            const p = this.projectiles[j];
            p.update(dt);

            // === NEW: Check OrbitingProjectile expiration (v2.1 Balance) ===
            let shouldRemove = p.shouldBeRemoved;
            if (!shouldRemove && p instanceof OrbitingProjectile && p.isExpired()) {
                shouldRemove = true;
            }

            if (shouldRemove) {
                // Release to correct pool
                if (p instanceof BoomerangProjectile) this.boomerangPool.release(p);
                else if (p instanceof LaserProjectile) this.laserPool.release(p);
                else if (p instanceof HomingProjectile) this.homingPool.release(p);
                else if (p instanceof LightningProjectile) this.lightningPool.release(p);
                else if (p instanceof SlashProjectile) this.slashPool.release(p);
                // Note: OrbitingProjectile not pooled, no release needed
                else if (p instanceof Projectile) this.projectilePool.release(p);

                const last = this.projectiles[this.projectiles.length - 1];
                this.projectiles[j] = last;
                this.projectiles.pop();
            } else {
                j++;
            }
        }

        // Update Others (for loop for perf)
        for (let i = 0; i < this.effects.length; i++) this.effects[i].update(dt);
        for (let i = 0; i < this.floatingTexts.length; i++) this.floatingTexts[i].update(dt);
        for (let i = 0; i < this.explorationPoints.length; i++) this.explorationPoints[i].update(dt);

        // PERF: Zero-alloc in-place removal (swap-and-pop)
        this.removeMarked(this.xpOrbs);
        this.removeMarked(this.effects);
        this.removeMarked(this.items);
        this.removeMarked(this.chests);
        this.removeMarked(this.explorationPoints);
        this.removeMarked(this.floatingTexts);
    }

    updateAnimations(dt: number) {
        for (let i = 0; i < this.animatingEntities.length; i++) this.animatingEntities[i].update(dt);
        for (let i = 0; i < this.chests.length; i++) this.chests[i].update(dt);
    }

    /**
     * PERF: Zero-alloc in-place removal. O(N) with no array allocation.
     * Uses swap-and-pop pattern to avoid filter() GC pressure.
     */
    private removeMarked<T extends { shouldBeRemoved: boolean }>(arr: T[]): void {
        let writeIdx = 0;
        for (let readIdx = 0; readIdx < arr.length; readIdx++) {
            if (!arr[readIdx].shouldBeRemoved) {
                if (writeIdx !== readIdx) {
                    arr[writeIdx] = arr[readIdx];
                }
                writeIdx++;
            }
        }
        arr.length = writeIdx;
    }

    draw(ctx: CanvasRenderingContext2D) {
        // PERF: for loops instead of forEach (no closure allocation)
        for (let i = 0; i < this.props.length; i++) this.props[i].draw(ctx);
        for (let i = 0; i < this.explorationPoints.length; i++) this.explorationPoints[i].draw(ctx);
        for (let i = 0; i < this.xpOrbs.length; i++) this.xpOrbs[i].draw(ctx);
        for (let i = 0; i < this.items.length; i++) this.items[i].draw(ctx);
        for (let i = 0; i < this.chests.length; i++) this.chests[i].draw(ctx);
        for (let i = 0; i < this.effects.length; i++) this.effects[i].draw(ctx);
        // Player is drawn by Game
        for (let i = 0; i < this.enemies.length; i++) this.enemies[i].draw(ctx);
        for (let i = 0; i < this.projectiles.length; i++) this.projectiles[i].draw(ctx);
        // Particles drawn by Game.particleSystem
        for (let i = 0; i < this.floatingTexts.length; i++) this.floatingTexts[i].draw(ctx);
    }
}
