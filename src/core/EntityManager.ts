
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
    public projectilePool: ObjectPool<Projectile>;
    public particlePool: ObjectPool<Particle>;

    // Optimization
    private frameCount = 0;

    constructor() {
        // Initialize Object Pools
        this.enemyPool = new ObjectPool(() => new Enemy(0, 0, {} as any, 'SLIME', false));
        this.propPool = new ObjectPool(() => new Prop(0, 0, {} as any));
        this.projectilePool = new ObjectPool(() => new Projectile(0, 0, new Vector2D(0, 0), {} as any));
        this.particlePool = new ObjectPool(() => new Particle(0, 0, '#fff'));
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
            
            // Simple visual effect hook - ideally moved to a render/effect system but kept here for simplicity
            if (e.isBurning() && Math.random() < 0.5) {
                // Needs reference to particle system, handled in collision/render usually
                // For now, we skip direct visual creation here to decouple, or assume burning handled in Draw
            }

            if (e.shouldBeRemoved) {
                if (e.isElite) {
                    onBossRemoved(e);
                }
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
                if (p instanceof Projectile) {
                    this.projectilePool.release(p);
                }
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
