
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
import { Prop } from "../../entities/Prop";
import { LightningProjectile } from "../../entities/LightningProjectile";
import { SlashProjectile } from "../../entities/SlashProjectile";
import { QuadTree, Rectangle } from "../../utils/QuadTree";
import { ITEM_DATA } from "../../data/itemData";
import { FloatingText } from "../../entities/FloatingText";
import { i18nManager } from "../i18n";

export class CollisionSystem {
    private enemyQuadTree: QuadTree<Enemy>;

    constructor(private game: Game) {
        this.enemyQuadTree = new QuadTree({ x: 0, y: 0, w: 2500, h: 2500 }, 8);
    }

    update(dt: number) {
        this.rebuildQuadTree();
        this.handleProjectileToEnemy();
        this.handleProjectileToProp();
        this.handleEnemyToPlayer();
        this.handlePickups();
    }

    public getNeighbors(center: Vector2D, radius: number): Enemy[] {
        const range: Rectangle = { x: center.x, y: center.y, w: radius, h: radius };
        return this.enemyQuadTree.query(range);
    }

    private rebuildQuadTree() {
        const player = this.game.player;
        this.enemyQuadTree.clear();
        this.enemyQuadTree.boundary.x = player.pos.x;
        this.enemyQuadTree.boundary.y = player.pos.y;
        
        // Access via EntityManager
        for (const e of this.game.entityManager.enemies) {
            this.enemyQuadTree.insert(e);
        }
    }

    private handleProjectileToEnemy() {
        for (const p of this.game.entityManager.projectiles) {
            let range: Rectangle;

            if (p instanceof LaserProjectile) {
                const midX = p.p1.x + p.dir.x * (p.range / 2);
                const midY = p.p1.y + p.dir.y * (p.range / 2);
                const halfSize = p.range / 2 + 50; 
                range = { x: midX, y: midY, w: halfSize, h: halfSize };
            } else {
                range = { x: p.pos.x, y: p.pos.y, w: 150, h: 150 };
            }
            
            const candidates = this.enemyQuadTree.query(range);

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
            } else { 
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

    private handleProjectileToProp() {
        for (const p of this.game.entityManager.projectiles) {
            if (p.shouldBeRemoved) continue;

            if (p instanceof LaserProjectile) {
                 for (const prop of this.game.entityManager.props) {
                    const V = new Vector2D(prop.pos.x - p.p1.x, prop.pos.y - p.p1.y);
                    const D = p.dir;
                    let t = Math.max(0, Math.min(p.range, V.x * D.x + V.y * D.y));
                    const closestX = p.p1.x + t * D.x;
                    const closestY = p.p1.y + t * D.y;
                    
                    const dx = prop.pos.x - closestX;
                    const dy = prop.pos.y - closestY;
                    const distSq = dx * dx + dy * dy;
                    
                    const hitDist = prop.size + p.width / 2;

                    if (distSq < hitDist * hitDist) {
                        prop.takeDamage(10);
                        this.game.particleSystem.emit(prop.pos.x, prop.pos.y, 2, '#8D6E63');
                    }
                }
            } else {
                for (const prop of this.game.entityManager.props) {
                    const dx = p.pos.x - prop.pos.x;
                    const dy = p.pos.y - prop.pos.y;
                    const distSq = dx * dx + dy * dy;
                    const hitDist = prop.size + 10; 

                    if (distSq < hitDist * hitDist) {
                         prop.takeDamage(10); 
                         this.game.particleSystem.emit(prop.pos.x, prop.pos.y, 2, '#8D6E63');
                         
                         if (!(p instanceof LightningProjectile || p instanceof SlashProjectile || p.statusEffect)) {
                             p.shouldBeRemoved = true;
                         }
                    }
                }
            }
        }
    }

    private handleEnemyToPlayer() {
        const player = this.game.player;
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
        for (const orb of this.game.entityManager.xpOrbs) {
             const dx = orb.pos.x - player.pos.x;
             const dy = orb.pos.y - player.pos.y;
             const distSq = dx * dx + dy * dy;
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
        for (const item of this.game.entityManager.items) {
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
        for (const chest of this.game.entityManager.chests) {
            if (chest.isBeingOpened) continue;
            const dx = chest.pos.x - player.pos.x;
            const dy = chest.pos.y - player.pos.y;
            const distSq = dx * dx + dy * dy;
            const hitDist = chest.size / 2 + player.size / 2;

            if (distSq < hitDist * hitDist) {
                chest.isBeingOpened = true;
                this.game.onChestOpenStart(chest);
                this.game.entityManager.animatingEntities.push(chest);
            }
        }

        // Exploration Points
        for (const point of this.game.entityManager.explorationPoints) {
            const dx = point.pos.x - player.pos.x;
            const dy = point.pos.y - player.pos.y;
            const distSq = dx * dx + dy * dy;
            const hitDist = point.size + player.size;

            if (distSq < hitDist * hitDist) {
                point.shouldBeRemoved = true;
                this.game.soundManager.playSound('CHEST_OPEN');
                
                player.heal(1.0);
                if(player.gainXp(500)) {
                    this.game.onLevelUp();
                }
                const goldReward = 250;
                player.gainGold(goldReward);

                this.game.particleSystem.emit(point.pos.x, point.pos.y, 50, '#00BCD4');
                this.game.entityManager.floatingTexts.push(new FloatingText(player.pos.x, player.pos.y - 40, i18nManager.t('ui.shrine.found'), '#00BCD4', 2.5));
            }
        }
    }

    applyDamageToEnemy(e: Enemy, damage: number, statusEffect?: any) {
        const wasAlive = e.hp > 0;
        e.takeDamage(damage);
        if (statusEffect) e.applyStatusEffect(statusEffect);
        
        if (wasAlive) this.game.soundManager.playSound('ENEMY_HIT', 0.5);
        
        if (wasAlive && e.shouldBeRemoved) {
            this.onEnemyDefeated(e);
        }
    }

    onEnemyDefeated(enemy: Enemy) {
        this.game.soundManager.playSound('ENEMY_DIE');
        this.game.particleSystem.emit(enemy.pos.x, enemy.pos.y, 15, enemy.color);
        
        const orbData = XP_ORB_DATA[enemy.xpOrbType];
        if (orbData) {
            this.game.entityManager.xpOrbs.push(new XpOrb(enemy.pos.x, enemy.pos.y, orbData.value, orbData.size, orbData.color));
        }

        if (enemy.goldDrop) {
            const [min, max] = enemy.goldDrop;
            const amount = Math.floor(Math.random() * (max - min + 1)) + min;
            if (amount > 0) {
                this.game.player.gainGold(amount);
            }
        }
        
        if (enemy.chestDropChance && Math.random() < enemy.chestDropChance) {
            this.game.entityManager.chests.push(new Chest(enemy.pos.x, enemy.pos.y, CHEST_DATA));
        }
    }

    onPropDestroyed(prop: Prop) {
        this.game.soundManager.playSound('ENEMY_HIT'); 
        this.game.particleSystem.emit(prop.pos.x, prop.pos.y, 10, '#8D6E63'); 

        const dropRoll = Math.random();
        let cumulative = 0;
        
        for (const drop of prop.data.dropTable) {
            cumulative += drop.chance;
            if (dropRoll <= cumulative) {
                const itemData = ITEM_DATA[drop.itemId];
                if (itemData) {
                     this.game.entityManager.items.push(new Item(prop.pos.x, prop.pos.y, itemData));
                }
                break; 
            }
        }
    }

    applyItemEffect(player: Player, item: Item) {
        const { effect } = item.data;
        switch (effect.type) {
            case 'HEAL_PERCENT':
                player.heal(effect.value);
                this.game.entityManager.floatingTexts.push(new FloatingText(player.pos.x, player.pos.y - 20, `Heal!`, '#e57373'));
                break;
            case 'GOLD_ADD':
                const amount = Math.ceil(effect.value * player.goldMultiplier);
                player.gainGold(amount);
                this.game.entityManager.floatingTexts.push(new FloatingText(player.pos.x, player.pos.y - 20, `+${amount} Gold`, '#ffd700'));
                break;
            default:
                console.warn(`Unknown item effect type: ${effect.type}`);
        }
    }

    applyAuraDamage(weapon: Weapon) {
        const isMax = weapon.isMaxLevel();
        
        if (isMax) {
            const persistentAura = this.game.entityManager.effects.find(e => e instanceof AuraEffect && e.isPersistent) as AuraEffect | undefined;
            if (!persistentAura) {
                this.game.entityManager.effects.push(new AuraEffect(this.game.player, weapon.range, true));
            } else {
                persistentAura.maxRange = weapon.range;
            }
        } else {
            this.game.entityManager.effects.push(new AuraEffect(this.game.player, weapon.range, false));
        }

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

        for (const prop of this.game.entityManager.props) {
            const dx = this.game.player.pos.x - prop.pos.x;
            const dy = this.game.player.pos.y - prop.pos.y;
            const distSq = dx * dx + dy * dy;
            const hitDist = weapon.range + prop.size / 2;

            if (distSq < hitDist * hitDist) {
                prop.takeDamage(weapon.damage * 0.1); 
                if (Math.random() > 0.9) {
                     this.game.particleSystem.emit(prop.pos.x, prop.pos.y, 1, '#8D6E63');
                }
            }
        }
    }

    handleSkillEffect(effect: SkillEffect) {
        switch (effect.type) {
            case 'PULSE':
                this.game.entityManager.effects.push(new PulseEffect(this.game.player.pos, effect.range));
                
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

                for (const prop of this.game.entityManager.props) {
                    const dx = this.game.player.pos.x - prop.pos.x;
                    const dy = this.game.player.pos.y - prop.pos.y;
                    const distSq = dx * dx + dy * dy;
                    const hitDist = effect.range + prop.size / 2;

                    if (distSq < hitDist * hitDist) {
                        prop.takeDamage(100);
                        this.game.particleSystem.emit(prop.pos.x, prop.pos.y, 5, '#8D6E63');
                    }
                }

                break;
        }
    }
}
