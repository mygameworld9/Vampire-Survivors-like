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

export class CollisionSystem {
    constructor(private game: Game) {}

    update(dt: number) {
        this.handleProjectileToEnemy();
        this.handleEnemyToPlayer();
        this.handlePickups();
        this.handleEffects();
    }

    private handleProjectileToEnemy() {
        for (const p of this.game.projectiles) {
            if (p instanceof LaserProjectile) {
                for (const e of this.game.enemies) {
                    if (p.hitEnemies.has(e)) continue;

                    const V = new Vector2D(e.pos.x - p.p1.x, e.pos.y - p.p1.y);
                    const D = p.dir;
                    let t = Math.max(0, Math.min(p.range, V.x * D.x + V.y * D.y));
                    const closestX = p.p1.x + t * D.x;
                    const closestY = p.p1.y + t * D.y;
                    const dist = Math.hypot(e.pos.x - closestX, e.pos.y - closestY);

                    if (dist < e.size / 2 + p.width / 2) {
                        this.applyDamageToEnemy(e, p.damage, p.statusEffect);
                        this.game.particleSystem.emit(closestX, closestY, 3, e.color);
                        p.hitEnemies.add(e);
                    }
                }
            } else { // Projectile, Boomerang, Homing
                for (const e of this.game.enemies) {
                    if (p.hitEnemies.has(e)) continue;
                    const dist = Math.hypot(p.pos.x - e.pos.x, p.pos.y - e.pos.y);
                    if (dist < p.size / 2 + e.size / 2) {
                        this.applyDamageToEnemy(e, p.damage, p.statusEffect);
                        this.game.particleSystem.emit(p.pos.x, p.pos.y, 5, e.color);
                        
                        p.penetration--;
                        p.hitEnemies.add(e);
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
        for (const e of this.game.enemies) {
            const dist = Math.hypot(e.pos.x - player.pos.x, e.pos.y - player.pos.y);
            if (dist < e.size / 2 + player.size / 2) {
                player.takeDamage(e.damage);
            }
        }
    }

    private handlePickups() {
        const player = this.game.player;

        // XP Orbs
        for (const orb of this.game.xpOrbs) {
             const dist = Math.hypot(orb.pos.x - player.pos.x, orb.pos.y - player.pos.y);
             if (dist < orb.size + player.size / 2 + 50) { 
                if (player.gainXp(orb.value)) {
                    this.game.soundManager.playSound('LEVEL_UP');
                    this.game.onLevelUp();
                }
                orb.shouldBeRemoved = true;
             }
        }

        // Items
        for (const item of this.game.items) {
             const dist = Math.hypot(item.pos.x - player.pos.x, item.pos.y - player.pos.y);
             if (dist < item.size / 2 + player.size / 2) {
                this.applyItemEffect(player, item);
                this.game.soundManager.playSound('ITEM_PICKUP');
                item.shouldBeRemoved = true;
             }
        }

        // Chests
        for (const chest of this.game.chests) {
            if (chest.isBeingOpened) continue;
            const dist = Math.hypot(chest.pos.x - player.pos.x, chest.pos.y - player.pos.y);
            if (dist < chest.size / 2 + player.size / 2) {
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
            this.game.xpOrbs.push(new XpOrb(enemy.pos.x, enemy.pos.y, orbData));
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
        this.game.effects.push(new AuraEffect(this.game.player.pos, weapon.range));
        for (const e of this.game.enemies) {
            const dist = Math.hypot(this.game.player.pos.x - e.pos.x, this.game.player.pos.y - e.pos.y);
            if (dist < weapon.range + e.size / 2) {
                this.applyDamageToEnemy(e, weapon.damage, weapon.statusEffect);
                this.game.particleSystem.emit(e.pos.x, e.pos.y, 2, e.color);
            }
        }
    }

    handleSkillEffect(effect: SkillEffect) {
        switch (effect.type) {
            case 'PULSE':
                this.game.effects.push(new PulseEffect(this.game.player.pos, effect.range));
                for (const e of this.game.enemies) {
                    const dist = Math.hypot(this.game.player.pos.x - e.pos.x, this.game.player.pos.y - e.pos.y);
                    if (dist < effect.range + e.size / 2) {
                        this.applyDamageToEnemy(e, effect.damage * this.game.player.damageMultiplier);
                        this.game.particleSystem.emit(e.pos.x, e.pos.y, 5, e.color);
                    }
                }
                break;
        }
    }
}