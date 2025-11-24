
import { Game } from "../Game";
import { LaserProjectile } from "../../entities/LaserProjectile";
import { Vector2D } from "../../utils/Vector2D";
import { XP_ORB_DATA } from "../../data/xpOrbData";
import { XpOrb } from "../../entities/XpOrb";
import { Chest } from "../../entities/Chest";
import { CHEST_DATA } from "../../data/chestData";
import { AuraEffect } from "../../entities/AuraEffect";
import { PulseEffect } from "../../entities/PulseEffect";
import { SkillEffect } from "../../entities/Skill";
import { Player } from "../../entities/Player";
import { Item } from "../../entities/Item";
import { Weapon } from "../../entities/Weapon";
import { Enemy } from "../../entities/Enemy";
import { LightningProjectile } from "../../entities/LightningProjectile";
import { SlashProjectile } from "../../entities/SlashProjectile";
import { QuadTree, Rectangle } from "../../utils/QuadTree";

export class CollisionSystem {
    private enemyQuadTree: QuadTree<Enemy>;

    constructor(private game: Game) {
        // Initialize with the standard game size bound.
        // We will update x/y dynamically, but w/h stays constant (2500)
        this.enemyQuadTree = new QuadTree({ x: 0, y: 0, w: 2500, h: 2500 }, 8);
    }

    update(dt: number) {
        this.rebuildQuadTree();
        this.handleProjectileToEnemy();
        this.handleEnemyToPlayer();
        this.handlePickups();
        this.handleEffects();
    }

    private rebuildQuadTree() {
        const player = this.game.player;
        
        // Optimization 1: GC Reduction
        // Instead of creating a new QuadTree every frame, clear and update the existing one.
        this.enemyQuadTree.clear();
        
        // Update boundary center to match player position
        this.enemyQuadTree.boundary.x = player.pos.x;
        this.enemyQuadTree.boundary.y = player.pos.y;
        // w and h remain 2500 as initialized
        
        for (const e of this.game.enemies) {
            this.enemyQuadTree.insert(e);
        }
    }

    private handleProjectileToEnemy() {
        for (const p of this.game.projectiles) {
            let range: Rectangle;

            if (p instanceof LaserProjectile) {
                // Center the query box in the middle of the laser beam
                const midX = p.p1.x + p.dir.x * (p.range / 2);
                const midY = p.p1.y + p.dir.y * (p.range / 2);
                const halfSize = p.range / 2 + 50; 
                range = { x: midX, y: midY, w: halfSize, h: halfSize };
            } else {
                range = { x: p.pos.x, y: p.pos.y, w: 150, h: 150 };
            }
            
            const candidates = this.enemyQuadTree.query(range);

            // Optimization 2: Math Performance
            // Replace Math.hypot (sqrt) with squared distance comparisons.
            // d < r  <=>  d^2 < r^2

            if (p instanceof LaserProjectile) {
                for (const e of candidates) {
                    if (p.hitEnemies.has(e.id)) continue;

                    const V = new Vector2D(e.pos.x - p.p1.x, e.pos.y - p.p1.y);
                    const D = p.dir;
                    let t = Math.max(0, Math.min(p.range, V.x * D.x + V.y * D.y));
                    const closestX = p.p1.x + t * D.x;
                    const closestY = p.p1.y + t * D.y;
                    
                    const dx = e.pos.x - closestX;
                    const dy = e.pos.y - closestY;
                    const distSq = dx * dx + dy * dy;
                    
                    const hitRad = e.size / 2 + p.width / 2;

                    if (distSq < hitRad * hitRad) {
                        this.applyDamageToEnemy(e, p.damage, p.statusEffect);
                        this.game.particleSystem.emit(closestX, closestY, 3, e.color);
                        p.hitEnemies.add(e.id);
                    }
                }
            } else if (p instanceof LightningProjectile || p instanceof SlashProjectile) {
                for (const e of candidates) {
                    if (p.hitEnemies.has(e.id)) continue;
                    const dx = p.pos.x - e.pos.x;
                    const dy = p.pos.y - e.pos.y;
                    const distSq = dx * dx + dy * dy;
                    const hitDist = p.range + e.size / 2;

                    if (distSq < hitDist * hitDist) {
                         this.applyDamageToEnemy(e, p.damage, p.statusEffect);
                         this.game.particleSystem.emit(e.pos.x, e.pos.y, 4, '#fff');
                         p.hitEnemies.add(e.id);
                    }
                }
            } else { // Projectile, Boomerang, Homing
                for (const e of candidates) {
                    if (p.hitEnemies.has(e.id)) continue;
                    const dx = p.pos.x - e.pos.x;
                    const dy = p.pos.y - e.pos.y;
                    const distSq = dx * dx + dy * dy;
                    const hitDist = p.size / 2 + e.size / 2;

                    if (distSq < hitDist * hitDist) {
                        this.applyDamageToEnemy(e, p.damage, p.statusEffect);
                        this.game.particleSystem.emit(p.pos.x, p.pos.y, 5, e.color);
                        
                        p.penetration--;
                        p.hitEnemies.add(e.id);
                        if (p.penetration <= 0) {
                            p.shouldBeRemoved = true;
                            break; 
                        }
                    }
                }
            }
        }
    }

    private handleEnemyToPlayer() {
        const player = this.game.player;
        // Optimization: Reuse range object? (Future todo), for now standard query
        const range: Rectangle = { x: player.pos.x, y: player.pos.y, w: 100, h: 100 };
        const candidates = this.enemyQuadTree.query(range);

        for (const e of candidates) {
            const dx = e.pos.x - player.pos.x;
            const dy = e.pos.y - player.pos.y;
            const distSq = dx * dx + dy * dy;
            const hitDist = e.size / 2 + player.size / 2;

            if (distSq < hitDist * hitDist) {
                player.takeDamage(e.damage);
            }
        }
    }

    private handlePickups() {
        const player = this.game.player;

        // XP Orbs
        for (const orb of this.game.xpOrbs) {
             const dx = orb.pos.x - player.pos.x;
             const dy = orb.pos.y - player.pos.y;
             const distSq = dx * dx + dy * dy;
             // Magnet range: orb.size + player.size/2 + 50
             const pickupRange = orb.size + player.size / 2 + 50;

             if (distSq < pickupRange * pickupRange) { 
                if (player.gainXp(orb.value)) {
                    this.game.soundManager.playSound('LEVEL_UP');
                    this.game.onLevelUp();
                }
                orb.shouldBeRemoved = true;
             }
        }

        // Items
        for (const item of this.game.items) {
             const dx = item.pos.x - player.pos.x;
             const dy = item.pos.y - player.pos.y;
             const distSq = dx * dx + dy * dy;
             const hitDist = item.size / 2 + player.size / 2;

             if (distSq < hitDist * hitDist) {
                this.applyItemEffect(player, item);
                this.game.soundManager.playSound('ITEM_PICKUP');
                item.shouldBeRemoved = true;
             }
        }

        // Chests
        for (const chest of this.game.chests) {
            if (chest.isBeingOpened) continue;
            const dx = chest.pos.x - player.pos.x;
            const dy = chest.pos.y - player.pos.y;
            const distSq = dx * dx + dy * dy;
            const hitDist = chest.size / 2 + player.size / 2;

            if (distSq < hitDist * hitDist) {
                chest.isBeingOpened = true;
                this.game.onChestOpenStart(chest);
                this.game.animatingEntities.push(chest);
            }
        }
    }

    private handleEffects() {
        // Only internal update logic here if any, mostly handled by Game triggering callbacks
    }

    // --- Actions ---

    applyDamageToEnemy(e: Enemy, damage: number, statusEffect?: any) {
        const wasAlive = e.hp > 0;
        e.takeDamage(damage);
        if (statusEffect) e.applyStatusEffect(statusEffect);
        
        if (wasAlive) this.game.soundManager.playSound('ENEMY_HIT', 0.5); // Lower volume for spam hits
        
        if (wasAlive && e.shouldBeRemoved) {
            this.onEnemyDefeated(e);
        }
    }

    onEnemyDefeated(enemy: Enemy) {
        this.game.soundManager.playSound('ENEMY_DIE');
        this.game.particleSystem.emit(enemy.pos.x, enemy.pos.y, 15, enemy.color);
        
        const orbData = XP_ORB_DATA[enemy.xpOrbType];
        if (orbData) {
            this.game.xpOrbs.push(new XpOrb(enemy.pos.x, enemy.pos.y, orbData.value, orbData.size, orbData.color));
        }

        if (enemy.goldDrop) {
            const [min, max] = enemy.goldDrop;
            const amount = Math.floor(Math.random() * (max - min + 1)) + min;
            if (amount > 0) {
                this.game.player.gainGold(amount);
            }
        }
        
        if (enemy.chestDropChance && Math.random() < enemy.chestDropChance) {
            this.game.chests.push(new Chest(enemy.pos.x, enemy.pos.y, CHEST_DATA));
        }
    }

    applyItemEffect(player: Player, item: Item) {
        const { effect } = item.data;
        switch (effect.type) {
            case 'HEAL_PERCENT':
                player.heal(effect.value);
                break;
            default:
                console.warn(`Unknown item effect type: ${effect.type}`);
        }
    }

    applyAuraDamage(weapon: Weapon) {
        const isMax = weapon.isMaxLevel();
        
        // --- Visual Logic ---
        if (isMax) {
            const persistentAura = this.game.effects.find(e => e instanceof AuraEffect && e.isPersistent) as AuraEffect | undefined;
            if (!persistentAura) {
                this.game.effects.push(new AuraEffect(this.game.player, weapon.range, true));
            } else {
                persistentAura.maxRange = weapon.range;
            }
        } else {
            this.game.effects.push(new AuraEffect(this.game.player, weapon.range, false));
        }

        // --- Damage Logic ---
        const range: Rectangle = { x: this.game.player.pos.x, y: this.game.player.pos.y, w: weapon.range + 50, h: weapon.range + 50 };
        const candidates = this.enemyQuadTree.query(range);

        for (const e of candidates) {
            const dx = this.game.player.pos.x - e.pos.x;
            const dy = this.game.player.pos.y - e.pos.y;
            const distSq = dx * dx + dy * dy;
            const hitDist = weapon.range + e.size / 2;

            if (distSq < hitDist * hitDist) {
                this.applyDamageToEnemy(e, weapon.damage, weapon.statusEffect);
                if (!isMax) {
                    this.game.particleSystem.emit(e.pos.x, e.pos.y, 2, e.color);
                } else if (Math.random() > 0.7) {
                     this.game.particleSystem.emit(e.pos.x, e.pos.y, 1, '#FFCC80');
                }
            }
        }
    }

    handleSkillEffect(effect: SkillEffect) {
        switch (effect.type) {
            case 'PULSE':
                this.game.effects.push(new PulseEffect(this.game.player.pos, effect.range));
                const range: Rectangle = { x: this.game.player.pos.x, y: this.game.player.pos.y, w: effect.range + 50, h: effect.range + 50 };
                const candidates = this.enemyQuadTree.query(range);
                
                for (const e of candidates) {
                    const dx = this.game.player.pos.x - e.pos.x;
                    const dy = this.game.player.pos.y - e.pos.y;
                    const distSq = dx * dx + dy * dy;
                    const hitDist = effect.range + e.size / 2;

                    if (distSq < hitDist * hitDist) {
                        this.applyDamageToEnemy(e, effect.damage * this.game.player.damageMultiplier);
                        this.game.particleSystem.emit(e.pos.x, e.pos.y, 5, e.color);
                    }
                }
                break;
        }
    }
}
