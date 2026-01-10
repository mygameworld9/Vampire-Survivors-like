
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
            if (p.shouldBeRemoved) {
                // Release to correct pool
                if (p instanceof BoomerangProjectile) this.boomerangPool.release(p);
                else if (p instanceof LaserProjectile) this.laserPool.release(p);
                else if (p instanceof HomingProjectile) this.homingPool.release(p);
                else if (p instanceof LightningProjectile) this.lightningPool.release(p);
                else if (p instanceof SlashProjectile) this.slashPool.release(p);
                else if (p instanceof Projectile) this.projectilePool.release(p);

                const last = this.projectiles[this.projectiles.length - 1];
                this.projectiles[j] = last;
                this.projectiles.pop();
            } else {
                j++;
            }
        }

        // Update Others
        this.effects.forEach(e => e.update(dt));
        this.floatingTexts.forEach(t => t.update(dt));
        this.explorationPoints.forEach(p => p.update(dt));

        // Cleanup lists
        this.xpOrbs = this.xpOrbs.filter(o => !o.shouldBeRemoved);
        this.effects = this.effects.filter(e => !e.shouldBeRemoved);
        this.items = this.items.filter(i => !i.shouldBeRemoved);
        this.chests = this.chests.filter(c => !c.shouldBeRemoved);
        this.explorationPoints = this.explorationPoints.filter(e => !e.shouldBeRemoved);
        this.floatingTexts = this.floatingTexts.filter(t => !t.shouldBeRemoved);
    }

    updateAnimations(dt: number) {
        this.animatingEntities.forEach(e => e.update(dt));
        this.chests.forEach(c => c.update(dt));
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.props.forEach(p => p.draw(ctx));
        this.explorationPoints.forEach(p => p.draw(ctx));
        this.xpOrbs.forEach(o => o.draw(ctx));
        this.items.forEach(i => i.draw(ctx));
        this.chests.forEach(c => c.draw(ctx));
        this.effects.forEach(e => e.draw(ctx));
        // Player is drawn by Game
        this.enemies.forEach(e => e.draw(ctx));
        this.projectiles.forEach(p => p.draw(ctx));
        // Particles drawn by Game.particleSystem
        this.floatingTexts.forEach(t => t.draw(ctx));
    }
}
