
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
import { ChainProjectile } from "../../entities/ChainProjectile";
import { OrbitingProjectile } from "../../entities/OrbitingProjectile";
import { TrapProjectile } from "../../entities/TrapProjectile";
import { ITEM_DATA } from "../../data/itemData";
import { FloatingText } from "../../entities/FloatingText";
import { i18nManager } from "../i18n";
import { WeaponTag } from "../../utils/types";

export class CollisionSystem {
    // --- Local Flat Grid Config ---
    // 40x40 grid of 100px cells = 4000x4000px active area centered on player
    private readonly CELL_SIZE = 100;
    private readonly GRID_COLS = 40;
    private readonly GRID_ROWS = 40;
    private readonly HALF_COLS = 20;
    private readonly HALF_ROWS = 20;

    // The Flat Grid: 1D array of pre-allocated Enemy arrays
    // Index = row * GRID_COLS + col
    private grid: Enemy[][];

    // Shared reuse buffers to reduce GC
    private _queryResults: Enemy[] = [];
    private _scratchVec = new Vector2D(0, 0);

    constructor(private game: Game) {
        // Initialize Grid (One-time allocation)
        const size = this.GRID_COLS * this.GRID_ROWS;
        this.grid = new Array(size);
        for (let i = 0; i < size; i++) {
            this.grid[i] = [];
        }
    }

    update(dt: number) {
        this.rebuildGrid();
        this.handleProjectileToEnemy();
        this.handleProjectileToProp();
        this.handleEnemyToPlayer();
        this.handlePickups();
    }

    /**
     * Clears and repopulates the grid based on enemies' positions relative to the player.
     */
    private rebuildGrid() {
        // 1. Fast Reset (Do not deallocate arrays)
        const size = this.grid.length;
        for (let i = 0; i < size; i++) {
            this.grid[i].length = 0;
        }

        // 2. Populate
        const player = this.game.player;
        if (!player) return; // Safety check

        const px = player.pos.x;
        const py = player.pos.y;
        const enemies = this.game.entityManager.enemies;
        const count = enemies.length;

        for (let i = 0; i < count; i++) {
            const e = enemies[i];
            // Safety check: ensure enemy exists before accessing properties
            if (!e || !e.pos) continue;

            // Calculate grid coordinates relative to player
            // We offset by HALF_COLS/ROWS so the player is always at [20,20]
            const col = Math.floor((e.pos.x - px) / this.CELL_SIZE) + this.HALF_COLS;
            const row = Math.floor((e.pos.y - py) / this.CELL_SIZE) + this.HALF_ROWS;

            // Only insert if within the active physics window
            if (col >= 0 && col < this.GRID_COLS && row >= 0 && row < this.GRID_ROWS) {
                this.grid[row * this.GRID_COLS + col].push(e);
            }
        }
    }

    /**
     * Populates _queryResults with enemies in the rectangular area covering the circle.
     */
    private queryGrid(x: number, y: number, radius: number, out: Enemy[]) {
        const player = this.game.player;
        if (!player) return;

        const px = player.pos.x;
        const py = player.pos.y;

        // Convert query bounds to grid coordinates
        const minX = x - radius - px;
        const maxX = x + radius - px;
        const minY = y - radius - py;
        const maxY = y + radius - py;

        let startCol = Math.floor(minX / this.CELL_SIZE) + this.HALF_COLS;
        let endCol = Math.floor(maxX / this.CELL_SIZE) + this.HALF_COLS;
        let startRow = Math.floor(minY / this.CELL_SIZE) + this.HALF_ROWS;
        let endRow = Math.floor(maxY / this.CELL_SIZE) + this.HALF_ROWS;

        // Clamp to grid bounds
        if (startCol < 0) startCol = 0;
        if (endCol >= this.GRID_COLS) endCol = this.GRID_COLS - 1;
        if (startRow < 0) startRow = 0;
        if (endRow >= this.GRID_ROWS) endRow = this.GRID_ROWS - 1;

        for (let r = startRow; r <= endRow; r++) {
            const rowOffset = r * this.GRID_COLS;
            for (let c = startCol; c <= endCol; c++) {
                const cell = this.grid[rowOffset + c];
                if (!cell) continue;
                const len = cell.length;
                // Manual loop is faster than spread/concat
                for (let k = 0; k < len; k++) {
                    if (cell[k]) {
                        out.push(cell[k]);
                    }
                }
            }
        }
    }

    public getNeighbors(center: Vector2D, radius: number): Enemy[] {
        // Note: This returns a shared reference that changes next update/query.
        // If caller needs persistence, they must copy it. 
        // Current usage in Enemy.ts is immediate, so it's safe.
        this._queryResults.length = 0;
        this.queryGrid(center.x, center.y, radius, this._queryResults);
        return this._queryResults;
    }

    private handleProjectileToEnemy() {
        const projectiles = this.game.entityManager.projectiles;
        const pLen = projectiles.length;

        for (let i = 0; i < pLen; i++) {
            const p = projectiles[i];
            if (!p) continue;

            // Determine query parameters
            let qRadius = 0;
            let qX = 0;
            let qY = 0;

            if (p instanceof LaserProjectile) {
                // Check midpoint of laser
                qRadius = p.range / 2 + 60; // Buffer
                qX = p.p1.x + p.dir.x * (p.range / 2);
                qY = p.p1.y + p.dir.y * (p.range / 2);
            } else if (p instanceof LightningProjectile || p instanceof SlashProjectile) {
                qX = p.pos.x;
                qY = p.pos.y;
                qRadius = p.range + 50;
                qX = p.pos.x;
                qY = p.pos.y;
                qRadius = p.range + 50;
            } else if (p instanceof ChainProjectile) {
                // Chain projectile uses bounceRange for finding next target, but for collision it's just size
                qX = p.pos.x;
                qY = p.pos.y;
                qRadius = p.bounceRange + 50; // Query wider for chaining candidates
            } else if (p instanceof OrbitingProjectile) {
                qX = p.pos.x;
                qY = p.pos.y;
                qRadius = p.size + 50;
            } else if (p instanceof TrapProjectile) {
                qX = p.pos.x;
                qY = p.pos.y;
                qRadius = p.triggerRadius + 50;
            } else {
                qX = p.pos.x;
                qY = p.pos.y;
                qRadius = 80; // Generic projectile + max enemy size buffer
            }

            // 1. Query Grid
            this._queryResults.length = 0;
            this.queryGrid(qX, qY, qRadius, this._queryResults);
            const candidates = this._queryResults;
            const cLen = candidates.length;

            if (cLen === 0) continue;

            // 2. Narrow Phase
            if (p instanceof LaserProjectile) {
                for (let j = 0; j < cLen; j++) {
                    const e = candidates[j];
                    if (!e) continue;
                    if (p.hitEnemies.has(e.id)) continue;

                    // Scratch Vector Projection
                    this._scratchVec.set(e.pos.x, e.pos.y).sub(p.p1);
                    const V = this._scratchVec;
                    const D = p.dir;

                    // Project V onto D
                    let t = V.x * D.x + V.y * D.y;
                    t = t < 0 ? 0 : (t > p.range ? p.range : t);

                    const closestX = p.p1.x + t * D.x;
                    const closestY = p.p1.y + t * D.y;

                    const dx = e.pos.x - closestX;
                    const dy = e.pos.y - closestY;
                    const distSq = dx * dx + dy * dy;
                    const hitRad = e.size / 2 + p.width / 2;

                    if (distSq < hitRad * hitRad) {
                        this.applyDamageToEnemy(e, p.damage, p.statusEffect, p.tags);
                        this.game.particleSystem.emit(closestX, closestY, 3, e.color);
                        p.hitEnemies.add(e.id);
                    }
                }
            } else if (p instanceof LightningProjectile || p instanceof SlashProjectile) {
                for (let j = 0; j < cLen; j++) {
                    const e = candidates[j];
                    if (!e) continue;
                    if (p.hitEnemies.has(e.id)) continue;
                    const dx = p.pos.x - e.pos.x;
                    const dy = p.pos.y - e.pos.y;
                    const distSq = dx * dx + dy * dy;
                    const hitDist = p.range + e.size / 2;

                    if (distSq < hitDist * hitDist) {
                        this.applyDamageToEnemy(e, p.damage, p.statusEffect, p.tags);
                        this.game.particleSystem.emit(e.pos.x, e.pos.y, 4, '#fff');
                        p.hitEnemies.add(e.id);
                    }
                }
            } else if (p instanceof ChainProjectile) {
                // Chain Logic: Hit -> Damage -> Chain
                for (let j = 0; j < cLen; j++) {
                    const e = candidates[j];
                    if (!e) continue;
                    // Skip if already hit by this chain
                    if (p.hitEnemies.has(e.id)) continue;

                    const dx = p.pos.x - e.pos.x;
                    const dy = p.pos.y - e.pos.y;
                    const distSq = dx * dx + dy * dy;
                    const hitDist = p.size / 2 + e.size / 2;

                    if (distSq < hitDist * hitDist) {
                        this.applyDamageToEnemy(e, p.damage, p.statusEffect, p.tags);
                        this.game.particleSystem.emit(p.pos.x, p.pos.y, 3, e.color);
                        p.hitEnemies.add(e.id);

                        // Attempt to chain
                        const chained = p.chain(e, candidates);
                        if (!chained) {
                            p.shouldBeRemoved = true;
                        }
                        // If chained, p.pos and p.direction are updated to fly to next target
                        // We break this loop because the projectile has effectively "moved" or "consumed" this frame's hit
                        break;
                    }
                }
            } else if (p instanceof OrbitingProjectile) {
                for (let j = 0; j < cLen; j++) {
                    const e = candidates[j];
                    if (!e) continue;

                    const dx = p.pos.x - e.pos.x;
                    const dy = p.pos.y - e.pos.y;
                    const distSq = dx * dx + dy * dy;
                    const hitDist = p.size / 2 + e.size / 2;

                    if (distSq < hitDist * hitDist) {
                        if (p.canHit(e.id, this.game.gameTime)) {
                            this.applyDamageToEnemy(e, p.damage, p.statusEffect, p.tags);
                            this.game.particleSystem.emit(e.pos.x, e.pos.y, 2, '#CFD8DC');
                            p.onHit(e.id, this.game.gameTime);
                        }
                    }
                }
            } else if (p instanceof TrapProjectile) {
                if (p.isTriggered) continue; // Already triggered, waiting to disappear

                for (let j = 0; j < cLen; j++) {
                    const e = candidates[j];
                    if (!e) continue;

                    const dx = p.pos.x - e.pos.x;
                    const dy = p.pos.y - e.pos.y;
                    const distSq = dx * dx + dy * dy;
                    // Check against trigger radius
                    const hitDist = p.triggerRadius + e.size / 2;

                    if (distSq < hitDist * hitDist) {
                        // Trigger!
                        p.trigger();
                        // AOE Damage around trap
                        this.game.particleSystem.emit(p.pos.x, p.pos.y, 20, '#FF5252');
                        this.game.entityManager.effects.push(new PulseEffect(p.pos, p.triggerRadius * 1.5));

                        // Damage all enemies in explosion radius (slightly larger than trigger)
                        const neighbors = this.getNeighbors(p.pos, p.triggerRadius * 1.5);
                        for (const n of neighbors) {
                            const d2 = n.pos.distSq(p.pos);
                            if (d2 < (p.triggerRadius * 1.5) ** 2) {
                                this.applyDamageToEnemy(n, p.damage, p.statusEffect, p.tags);
                            }
                        }
                        break; // Trigger once
                    }
                }
            } else {
                for (let j = 0; j < cLen; j++) {
                    const e = candidates[j];
                    if (!e) continue;
                    if (p.hitEnemies.has(e.id)) continue;
                    const dx = p.pos.x - e.pos.x;
                    const dy = p.pos.y - e.pos.y;
                    const distSq = dx * dx + dy * dy;
                    const hitDist = p.size / 2 + e.size / 2;

                    if (distSq < hitDist * hitDist) {
                        this.applyDamageToEnemy(e, p.damage, p.statusEffect, p.tags);
                        this.game.particleSystem.emit(p.pos.x, p.pos.y, 5, e.color);

                        // Handle penetration
                        // All types here (Projectile, Boomerang, Homing) are guaranteed to have penetration
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
        // Props are sparse, linear check is fine
        const projectiles = this.game.entityManager.projectiles;
        const props = this.game.entityManager.props;

        for (const p of projectiles) {
            if (!p || p.shouldBeRemoved) continue;

            if (p instanceof LaserProjectile) {
                for (const prop of props) {
                    if (!prop) continue;
                    this._scratchVec.set(prop.pos.x, prop.pos.y).sub(p.p1);
                    const V = this._scratchVec;
                    const D = p.dir;
                    let t = V.x * D.x + V.y * D.y;
                    t = t < 0 ? 0 : (t > p.range ? p.range : t);
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
                for (const prop of props) {
                    if (!prop) continue;
                    const dx = p.pos.x - prop.pos.x;
                    const dy = p.pos.y - prop.pos.y;
                    const distSq = dx * dx + dy * dy;
                    const hitDist = prop.size + 10;

                    if (distSq < hitDist * hitDist) {
                        prop.takeDamage(10);
                        this.game.particleSystem.emit(prop.pos.x, prop.pos.y, 2, '#8D6E63');

                        if (p instanceof LightningProjectile || p instanceof SlashProjectile) {
                            // AOE don't stop
                        } else if ('penetration' in p) {
                            p.penetration--;
                            if (p.penetration <= 0) {
                                p.shouldBeRemoved = true;
                            }
                        } else {
                            (p as any).shouldBeRemoved = true;
                        }
                    }
                }
            }
        }
    }

    private handleEnemyToPlayer() {
        const player = this.game.player;
        if (!player) return;

        // Only check enemies near player
        this._queryResults.length = 0;
        this.queryGrid(player.pos.x, player.pos.y, 100, this._queryResults);
        const candidates = this._queryResults;

        for (const e of candidates) {
            if (!e) continue;
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
        if (!player) return;

        // XP Orbs
        for (const orb of this.game.entityManager.xpOrbs) {
            if (!orb) continue;
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
            if (!item) continue;
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
            if (!chest || chest.isBeingOpened) continue;
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
            if (!point) continue;
            const dx = point.pos.x - player.pos.x;
            const dy = point.pos.y - player.pos.y;
            const distSq = dx * dx + dy * dy;
            const hitDist = point.size + player.size;

            if (distSq < hitDist * hitDist) {
                point.shouldBeRemoved = true;
                this.game.soundManager.playSound('CHEST_OPEN');

                player.heal(1.0);
                if (player.gainXp(500)) {
                    this.game.onLevelUp();
                }
                const goldReward = 250;
                player.gainGold(goldReward);

                this.game.particleSystem.emit(point.pos.x, point.pos.y, 50, '#00BCD4');
                this.game.entityManager.floatingTexts.push(new FloatingText(player.pos.x, player.pos.y - 40, i18nManager.t('ui.shrine.found'), '#00BCD4', 2.5));
            }
        }
    }

    applyDamageToEnemy(e: Enemy, damage: number, statusEffect?: any, tags: WeaponTag[] = []) {
        if (!e) return;
        const wasAlive = e.hp > 0;

        // --- Chain Reaction Logic ---
        if (wasAlive) {
            // Overload: LIGHTNING on Burning Enemy
            if (tags.includes('LIGHTNING') && e.isBurning()) {
                const overloadDmg = damage * 2;
                e.takeDamage(overloadDmg);
                // AOE Blast
                this.game.particleSystem.emit(e.pos.x, e.pos.y, 10, '#FFEB3B');
                this.game.entityManager.effects.push(new PulseEffect(e.pos, 80));

                // Damage neighbors
                const blastRadius = 80;
                const neighbors = this.getNeighbors(e.pos, blastRadius);
                for (const neighbor of neighbors) {
                    if (neighbor && neighbor !== e) {
                        const dSq = neighbor.pos.distSq(e.pos);
                        if (dSq < blastRadius * blastRadius) {
                            neighbor.takeDamage(damage * 0.5);
                        }
                    }
                }
                this.game.entityManager.floatingTexts.push(new FloatingText(e.pos.x, e.pos.y - 30, "OVERLOAD!", '#FFEB3B', 1.5));
            }
            // Thermal Shock: ICE on Burning Enemy
            else if (tags.includes('ICE') && e.isBurning()) {
                const shockDamage = damage * 3;
                e.takeDamage(shockDamage);
                // Clear burn (TODO: Need method on Enemy to clear status, for now just deal huge damage)
                this.game.particleSystem.emit(e.pos.x, e.pos.y, 15, '#E0F7FA'); // Steam
                this.game.entityManager.floatingTexts.push(new FloatingText(e.pos.x, e.pos.y - 30, "THERMAL SHOCK!", '#E0F7FA', 1.5));
            }
            // Normal Damage
            else {
                e.takeDamage(damage);
            }
        } else {
            // Already dead (edge case), just apply damage
            e.takeDamage(damage);
        }

        if (statusEffect) {
            // Apply player's status effect duration multiplier (e.g., WARLOCK bonus)
            const modifiedEffect = this.game.player.statusEffectDurationMultiplier !== 1.0
                ? { ...statusEffect, duration: statusEffect.duration * this.game.player.statusEffectDurationMultiplier }
                : statusEffect;
            e.applyStatusEffect(modifiedEffect);
        }

        if (wasAlive) this.game.soundManager.playSound('ENEMY_HIT', 0.5);

        if (wasAlive && e.shouldBeRemoved) {
            this.onEnemyDefeated(e);
        }
    }

    onEnemyDefeated(enemy: Enemy) {
        if (!enemy) return;
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
        if (!prop) return;
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

        // Use Grid for Aura collision
        this._queryResults.length = 0;
        this.queryGrid(this.game.player.pos.x, this.game.player.pos.y, weapon.range + 50, this._queryResults);

        for (const e of this._queryResults) {
            if (!e) continue;
            const dx = this.game.player.pos.x - e.pos.x;
            const dy = this.game.player.pos.y - e.pos.y;
            const distSq = dx * dx + dy * dy;
            const hitDist = weapon.range + e.size / 2;

            if (distSq < hitDist * hitDist) {
                // Pass tags to aura damage
                this.applyDamageToEnemy(e, weapon.damage, weapon.statusEffect, weapon.tags);
                if (!isMax) {
                    this.game.particleSystem.emit(e.pos.x, e.pos.y, 2, e.color);
                } else if (Math.random() > 0.7) {
                    this.game.particleSystem.emit(e.pos.x, e.pos.y, 1, '#FFCC80');
                }
            }
        }

        // Props
        for (const prop of this.game.entityManager.props) {
            if (!prop) continue;
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
                this.applyAreaDamage(this.game.player.pos, effect.range, effect.damage * this.game.player.damageMultiplier, undefined, 5);
                break;
        }
    }

    public applyAreaDamage(center: Vector2D, radius: number, damage: number, color: string = '#FFFFFF', particleCount: number = 5) {
        // Use Grid
        this._queryResults.length = 0;
        this.queryGrid(center.x, center.y, radius + 50, this._queryResults);

        for (const e of this._queryResults) {
            if (!e) continue;
            const dx = center.x - e.pos.x;
            const dy = center.y - e.pos.y;
            const distSq = dx * dx + dy * dy;
            const hitDist = radius + e.size / 2;

            if (distSq < hitDist * hitDist) {
                this.applyDamageToEnemy(e, damage);
                this.game.particleSystem.emit(e.pos.x, e.pos.y, particleCount, e.color);
            }
        }

        for (const prop of this.game.entityManager.props) {
            if (!prop) continue;
            const dx = center.x - prop.pos.x;
            const dy = center.y - prop.pos.y;
            const distSq = dx * dx + dy * dy;
            const hitDist = radius + prop.size / 2;

            if (distSq < hitDist * hitDist) {
                prop.takeDamage(damage);
                this.game.particleSystem.emit(prop.pos.x, prop.pos.y, particleCount, '#8D6E63');
            }
        }
    }
}
