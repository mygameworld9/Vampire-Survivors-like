
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { XpOrb } from '../entities/XpOrb';
import { Camera } from './Camera';
import { InputHandler } from './InputHandler';
import { SPAWN_SCHEDULE } from '../data/gameConfig';
import { ENEMY_DATA } from '../data/enemyData';
import { BoomerangProjectile } from '../entities/BoomerangProjectile';
import { LaserProjectile } from '../entities/LaserProjectile';
import { Weapon } from '../entities/Weapon';
import { AuraEffect } from '../entities/AuraEffect';
import { Vector2D } from '../utils/Vector2D';
import { Item } from '../entities/Item';
import { ITEM_DATA } from '../data/itemData';
import { SoundManager } from './SoundManager';
import { SkillEffect } from '../entities/Skill';
import { PulseEffect } from '../entities/PulseEffect';
import { ParticleSystem } from './ParticleSystem';
import { XP_ORB_DATA } from '../data/xpOrbData';
import { MAP_DATA } from '../data/mapData';
import { HomingProjectile } from '../entities/HomingProjectile';
import { Chest } from '../entities/Chest';
import { FloatingText } from '../entities/FloatingText';
import { CHEST_DATA } from '../data/chestData';
import { CHEST_LOOT_TABLE } from '../data/lootData';
import { WEAPON_DATA } from '../data/weaponData';
import { SKILL_DATA } from '../data/skillData';
import { i18nManager } from './i18n';
import { UpgradeOption, IMapData } from '../utils/types';

type AnyProjectile = Projectile | BoomerangProjectile | LaserProjectile | HomingProjectile;
type AnyEffect = AuraEffect | PulseEffect;

const ELITE_SPAWN_START_TIME = 300; // 5 minutes
const ELITE_SPAWN_CHANCE = 0.1; // 10% chance

export class Game {
    player: Player;
    enemies: Enemy[] = [];
    projectiles: AnyProjectile[] = [];
    xpOrbs: XpOrb[] = [];
    effects: AnyEffect[] = [];
    items: Item[] = [];
    chests: Chest[] = [];
    floatingTexts: FloatingText[] = [];
    camera: Camera;
    input: InputHandler;
    particleSystem: ParticleSystem;
    gameTime = 0;
    soundManager: SoundManager;
    mapData: IMapData;
    public animatingEntities: Chest[] = [];

    private spawnManager: { [type: string]: { rate: number, timer: number } } = {};
    private nextSpawnEventIndex = 0;
    private itemSpawnTimer = 0;
    private readonly ITEM_SPAWN_INTERVAL = 15; // seconds
    private onChestOpenStart: (chest: Chest) => void;
    
    constructor(
        private width: number, 
        private height: number, 
        private onLevelUp: () => void,
        onChestOpenStart: (chest: Chest) => void,
        soundManager: SoundManager,
        characterId: string,
        mapId: string
    ) {
        this.soundManager = soundManager;
        this.onChestOpenStart = onChestOpenStart;
        this.player = new Player(width / 2, height / 2, this.applyAuraDamage.bind(this), this.soundManager, characterId);
        this.camera = new Camera(this.player.pos.x, this.player.pos.y);
        this.input = new InputHandler();
        this.particleSystem = new ParticleSystem();
        this.mapData = MAP_DATA[mapId] || MAP_DATA['FOREST'];
    }

    addProjectile(p: AnyProjectile) {
        this.projectiles.push(p);
    }

    spawnEnemy(type: string, isElite: boolean = false) {
        const data = ENEMY_DATA[type];
        if (!data) return;

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(this.width, this.height) / 2 + 50;
        const x = this.player.pos.x + Math.cos(angle) * radius;
        const y = this.player.pos.y + Math.sin(angle) * radius;
        this.enemies.push(new Enemy(x, y, data, type, isElite));
    }

    spawnItem() {
        // For now, just spawn the health potion
        const itemType = 'HEALTH_POTION';
        const data = ITEM_DATA[itemType];
        if (!data) return;

        // Spawn in a random direction, within the screen view but not too close
        const angle = Math.random() * Math.PI * 2;
        const radius = (Math.random() * (this.width / 3)) + 100; // Random radius from player
        const x = this.player.pos.x + Math.cos(angle) * radius;
        const y = this.player.pos.y + Math.sin(angle) * radius;
        this.items.push(new Item(x, y, data));
    }

    public spawnChestNearPlayer() {
        if (this.player) {
            this.chests.push(new Chest(this.player.pos.x + 80, this.player.pos.y, CHEST_DATA));
        }
    }
    
    update(dt: number) {
        this.gameTime += dt;

        // --- Handle Spawning ---
        while (this.nextSpawnEventIndex < SPAWN_SCHEDULE.length && this.gameTime >= SPAWN_SCHEDULE[this.nextSpawnEventIndex].time) {
            const event = SPAWN_SCHEDULE[this.nextSpawnEventIndex];
            this.spawnManager[event.enemyType] = { rate: event.rate, timer: 0 };
            this.nextSpawnEventIndex++;
        }
        
        for (const type in this.spawnManager) {
            const manager = this.spawnManager[type];
            manager.timer += dt * 1000;
            if (manager.timer >= manager.rate) {
                const amountToSpawn = Math.floor(manager.timer / manager.rate);
                for (let i = 0; i < amountToSpawn; i++) {
                     const canBeElite = this.gameTime >= ELITE_SPAWN_START_TIME;
                     const isElite = canBeElite && Math.random() < ELITE_SPAWN_CHANCE;
                     this.spawnEnemy(type, isElite);
                }
                manager.timer %= manager.rate;
            }
        }
        // --- End Spawning ---

        // --- Handle Item Spawning ---
        this.itemSpawnTimer += dt;
        if (this.itemSpawnTimer >= this.ITEM_SPAWN_INTERVAL) {
            this.itemSpawnTimer = 0;
            this.spawnItem();
        }

        const { projectiles, skillEffects } = this.player.update(dt, this.input, this.enemies);
        this.projectiles.push(...projectiles);
        skillEffects.forEach(effect => this.handleSkillEffect(effect));
        
        this.camera.update(this.player.pos);
        
        // Update enemies and check for deaths from status effects
        for (const e of this.enemies) {
            const wasAlive = e.hp > 0;
            e.update(dt, this.player.pos);
            
            // Check if the enemy died during its update cycle (e.g., from burn)
            if (wasAlive && e.shouldBeRemoved) {
                this._onEnemyDefeated(e);
            }

            // Visual effect for burning
            if (e.isBurning() && Math.random() < 0.5) {
                 this.particleSystem.emit(
                    e.pos.x + (Math.random() - 0.5) * e.size,
                    e.pos.y + (Math.random() - 0.5) * e.size,
                    1, '#ff9800' // Orange for fire
                );
            }
        }

        this.projectiles.forEach(p => p.update(dt));
        this.effects.forEach(e => e.update(dt));
        this.floatingTexts.forEach(t => t.update(dt));
        this.particleSystem.update(dt);
        
        this.handleCollisions();

        // Filter out all removed entities
        this.enemies = this.enemies.filter(e => !e.shouldBeRemoved);
        this.projectiles = this.projectiles.filter(p => !p.shouldBeRemoved);
        this.xpOrbs = this.xpOrbs.filter(o => !o.shouldBeRemoved);
        this.effects = this.effects.filter(e => !e.shouldBeRemoved);
        this.items = this.items.filter(i => !i.shouldBeRemoved);
        this.chests = this.chests.filter(c => !c.shouldBeRemoved);
        this.floatingTexts = this.floatingTexts.filter(t => !t.shouldBeRemoved);
    }

    updateAnimations(dt: number) {
        this.animatingEntities.forEach(e => e.update(dt));
        this.chests.forEach(c => c.update(dt)); // Also update regular chests to ensure their state machine runs if needed
    }
    
    private _onEnemyDefeated(enemy: Enemy) {
        this.soundManager.playSound('ENEMY_DIE');
        this.particleSystem.emit(enemy.pos.x, enemy.pos.y, 15, enemy.color);
        
        const orbData = XP_ORB_DATA[enemy.xpOrbType];
        if (orbData) {
            this.xpOrbs.push(new XpOrb(enemy.pos.x, enemy.pos.y, orbData));
        }

        if (enemy.goldDrop) {
            const [min, max] = enemy.goldDrop;
            const amount = Math.floor(Math.random() * (max - min + 1)) + min;
            if (amount > 0) {
                this.player.gainGold(amount);
            }
        }
        
        if (enemy.chestDropChance && Math.random() < enemy.chestDropChance) {
            this.chests.push(new Chest(enemy.pos.x, enemy.pos.y, CHEST_DATA));
        }
    }

    handleSkillEffect(effect: SkillEffect) {
        switch (effect.type) {
            case 'PULSE':
                this.effects.push(new PulseEffect(this.player.pos, effect.range));
                // Apply damage
                 for (const e of this.enemies) {
                    const dist = Math.hypot(this.player.pos.x - e.pos.x, this.player.pos.y - e.pos.y);
                    if (dist < effect.range + e.size / 2) {
                        const wasAlive = e.hp > 0;
                        e.takeDamage(effect.damage * this.player.damageMultiplier); // Use player multiplier
                        this.particleSystem.emit(e.pos.x, e.pos.y, 5, e.color);
                        if (wasAlive && e.shouldBeRemoved) {
                            this._onEnemyDefeated(e);
                        }
                    }
                }
                break;
        }
    }

    applyAuraDamage(weapon: Weapon) {
        this.effects.push(new AuraEffect(this.player.pos, weapon.range));
        for (const e of this.enemies) {
            const dist = Math.hypot(this.player.pos.x - e.pos.x, this.player.pos.y - e.pos.y);
            if (dist < weapon.range + e.size / 2) {
                const wasAlive = e.hp > 0;
                e.takeDamage(weapon.damage); // Weapon.damage already includes multiplier in the proxy passed to this callback
                if (weapon.statusEffect) {
                    e.applyStatusEffect(weapon.statusEffect);
                }
                this.particleSystem.emit(e.pos.x, e.pos.y, 2, e.color);
                if (wasAlive && e.shouldBeRemoved) {
                    this._onEnemyDefeated(e);
                }
            }
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

    handleCollisions() {
        // Projectile -> Enemy
        for (const p of this.projectiles) {
            if (p instanceof LaserProjectile) {
                for (const e of this.enemies) {
                    if (p.hitEnemies.has(e)) continue;

                    const V = new Vector2D(e.pos.x - p.p1.x, e.pos.y - p.p1.y);
                    const D = p.dir;
                    let t = Math.max(0, Math.min(p.range, V.x * D.x + V.y * D.y));
                    const closestX = p.p1.x + t * D.x;
                    const closestY = p.p1.y + t * D.y;
                    const dist = Math.hypot(e.pos.x - closestX, e.pos.y - closestY);

                    if (dist < e.size / 2 + p.width / 2) {
                        const wasAlive = e.hp > 0;
                        e.takeDamage(p.damage);
                        if (p.statusEffect) e.applyStatusEffect(p.statusEffect);
                        
                        this.particleSystem.emit(closestX, closestY, 3, e.color);
                        if (wasAlive) this.soundManager.playSound('ENEMY_HIT', 0.5);
                        
                        if (wasAlive && e.shouldBeRemoved) {
                           this._onEnemyDefeated(e);
                        }
                        p.hitEnemies.add(e);
                    }
                }
            } else { // Handle Projectile, BoomerangProjectile, HomingProjectile
                for (const e of this.enemies) {
                    if (p.hitEnemies.has(e)) continue;
                    const dist = Math.hypot(p.pos.x - e.pos.x, p.pos.y - e.pos.y);
                    if (dist < p.size / 2 + e.size / 2) {
                        const wasAlive = e.hp > 0;
                        e.takeDamage(p.damage);
                        if (p.statusEffect) e.applyStatusEffect(p.statusEffect);
                        
                        this.particleSystem.emit(p.pos.x, p.pos.y, 5, e.color);
                        if (wasAlive) this.soundManager.playSound('ENEMY_HIT');
                        
                        if (wasAlive && e.shouldBeRemoved) {
                            this._onEnemyDefeated(e);
                        }
                        
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
        
        // Enemy -> Player
        for (const e of this.enemies) {
            const dist = Math.hypot(e.pos.x - this.player.pos.x, e.pos.y - this.player.pos.y);
            if (dist < e.size / 2 + this.player.size / 2) {
                this.player.takeDamage(e.damage);
            }
        }

        // XP Orb -> Player
        for (const orb of this.xpOrbs) {
             const dist = Math.hypot(orb.pos.x - this.player.pos.x, orb.pos.y - this.player.pos.y);
             if (dist < orb.size + this.player.size / 2 + 50) { // Larger pickup radius
                if (this.player.gainXp(orb.value)) {
                    this.soundManager.playSound('LEVEL_UP');
                    this.onLevelUp();
                }
                orb.shouldBeRemoved = true;
             }
        }

        // Item -> Player
        for (const item of this.items) {
             const dist = Math.hypot(item.pos.x - this.player.pos.x, item.pos.y - this.player.pos.y);
             if (dist < item.size / 2 + this.player.size / 2) {
                this.applyItemEffect(this.player, item);
                this.soundManager.playSound('ITEM_PICKUP');
                item.shouldBeRemoved = true;
             }
        }

        // Player -> Chest
        for (const chest of this.chests) {
            if (chest.isBeingOpened) continue;
            const dist = Math.hypot(chest.pos.x - this.player.pos.x, chest.pos.y - this.player.pos.y);
            if (dist < chest.size / 2 + this.player.size / 2) {
                chest.isBeingOpened = true;
                this.onChestOpenStart(chest);
                this.animatingEntities.push(chest);
            }
        }
    }

    drawMapBackground(ctx: CanvasRenderingContext2D) {
        // Calculate visible tile range
        const camX = this.camera.pos.x;
        const camY = this.camera.pos.y;
        const viewW = ctx.canvas.width;
        const viewH = ctx.canvas.height;
        const tileSize = this.mapData.tileSize;

        // Top-left visible world coordinate
        const startX = camX - viewW / 2;
        const startY = camY - viewH / 2;
        
        // Bottom-right visible world coordinate
        const endX = startX + viewW;
        const endY = startY + viewH;

        // Convert to tile indices (add buffer to prevent flickering at edges)
        const startCol = Math.floor(startX / tileSize) - 1;
        const endCol = Math.ceil(endX / tileSize) + 1;
        const startRow = Math.floor(startY / tileSize) - 1;
        const endRow = Math.ceil(endY / tileSize) + 1;

        ctx.save();
        this.camera.applyTransform(ctx);

        for (let col = startCol; col < endCol; col++) {
            for (let row = startRow; row < endRow; row++) {
                const x = col * tileSize;
                const y = row * tileSize;

                // Checkerboard pattern
                const colorIndex = Math.abs(col + row) % 2;
                ctx.fillStyle = this.mapData.baseColors[colorIndex];
                ctx.fillRect(x, y, tileSize, tileSize);

                // Procedural Decoration
                // Use a pseudo-random seed based on tile position so it stays consistent
                const seed = Math.sin(col * 1234 + row * 5678);
                
                if (seed > 0.7) { // 15% chance for decoration
                    if (this.mapData.decoration === 'flower') {
                        this.drawFlower(ctx, x + tileSize/2, y + tileSize/2, seed);
                    } else if (this.mapData.decoration === 'crack') {
                        this.drawCrack(ctx, x + tileSize/2, y + tileSize/2, seed);
                    }
                }
            }
        }

        ctx.restore();
    }

    drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number) {
        const flowerColor = seed > 0.85 ? '#F48FB1' : '#FFF59D'; // Pink or Yellow
        const size = 4 + (seed * 2); // Vary size slightly
        
        ctx.fillStyle = '#81C784'; // Stem/Leaves
        ctx.beginPath();
        ctx.arc(x, y + 2, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = flowerColor;
        ctx.beginPath();
        // Simple 5-petal flower
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            ctx.arc(x + Math.cos(angle) * size, y + Math.sin(angle) * size, size/1.5, 0, Math.PI * 2);
        }
        ctx.fill();
        
        // Center
        ctx.fillStyle = '#FFF'; 
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCrack(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number) {
        ctx.strokeStyle = '#78909C'; // Darker grey
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Simple random lines
        ctx.moveTo(x - 10, y - 5);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 8, y - 8);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 2, y + 10);
        ctx.stroke();
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Clear screen with a solid fallback color just in case
        ctx.fillStyle = this.mapData.baseColors[0];
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw the procedural infinite map
        this.drawMapBackground(ctx);

        ctx.save();
        this.camera.applyTransform(ctx);
        
        this.xpOrbs.forEach(o => o.draw(ctx));
        this.items.forEach(i => i.draw(ctx));
        this.chests.forEach(c => c.draw(ctx));
        this.effects.forEach(e => e.draw(ctx));
        this.player.draw(ctx);
        this.enemies.forEach(e => e.draw(ctx));
        this.projectiles.forEach(p => p.draw(ctx));
        this.particleSystem.draw(ctx);
        this.floatingTexts.forEach(t => t.draw(ctx));

        ctx.restore();
    }

    private grantChestRewards(chest: Chest) {
        chest.shouldBeRemoved = true;
        this.soundManager.playSound('CHEST_OPEN');
        // The animation component handles the visual burst, but we can add a logical one too.
        this.particleSystem.emit(chest.pos.x, chest.pos.y, 50, '#ffd700'); 

        // Grant Gold
        const goldAmount = Math.floor(Math.random() * (CHEST_LOOT_TABLE.gold.max - CHEST_LOOT_TABLE.gold.min + 1)) + CHEST_LOOT_TABLE.gold.min;
        this.player.gainGold(goldAmount); // gainGold handles the multiplier
        this.floatingTexts.push(new FloatingText(chest.pos.x, chest.pos.y, `+${Math.ceil(goldAmount * this.player.goldMultiplier)} Gold`, '#ffd700'));
        
        // Grant XP (Instant Collection)
        let totalXp = 0;
        for (const orbDrop of CHEST_LOOT_TABLE.xpOrbs) {
            const orbCount = Math.floor(Math.random() * (orbDrop.count[1] - orbDrop.count[0] + 1)) + orbDrop.count[0];
            const orbData = XP_ORB_DATA[orbDrop.type];
            if (orbData) {
                totalXp += orbData.value * orbCount;
            }
        }
        if (totalXp > 0) {
            if (this.player.gainXp(totalXp)) {
                this.soundManager.playSound('LEVEL_UP');
                this.onLevelUp();
            }
            this.floatingTexts.push(new FloatingText(chest.pos.x, chest.pos.y - 20, `+${totalXp} XP`, '#42a5f5'));
        }

        // Grant Upgrades
        if (Math.random() < CHEST_LOOT_TABLE.upgrades.chance) {
            for (let i = 0; i < CHEST_LOOT_TABLE.upgrades.count; i++) {
                this._grantChestUpgrade();
            }
        }
    }
    
    public finalizeChestOpening(chest: Chest) {
        this.grantChestRewards(chest);
        this.animatingEntities = this.animatingEntities.filter(e => e !== chest);
    }

    private _grantChestUpgrade() {
        const player = this.player;

        // Only existing items that are NOT max level
        const availableWeaponUpgrades = player.weapons
            .filter(w => !w.isMaxLevel())
            .map(w => ({ type: 'upgrade', weapon: w } as UpgradeOption));

        const availableSkillUpgrades = player.skills
            .filter(s => !s.isMaxLevel())
            .map(s => ({ type: 'upgrade', skill: s } as UpgradeOption));
        
        const optionsPool = [
            ...availableWeaponUpgrades,
            ...availableSkillUpgrades
        ];

        // Fallback: Limit Break (Extra Gold) if everything is maxed
        if (optionsPool.length === 0) {
            const limitBreakGold = 100;
            player.gainGold(limitBreakGold);
            this.floatingTexts.push(new FloatingText(
                player.pos.x, 
                player.pos.y - 40, 
                i18nManager.t('ui.chest.limitBreak', { amount: Math.ceil(limitBreakGold * player.goldMultiplier) }), 
                '#e040fb', 
                2.5
            ));
            return;
        }

        const chosenOption = optionsPool[Math.floor(Math.random() * optionsPool.length)];

        let upgradeText = 'Power Up!';
        if (chosenOption.type === 'upgrade') {
            if ('weapon' in chosenOption) {
                upgradeText = `${chosenOption.weapon.name} Lvl ${chosenOption.weapon.level + 1}!`;
                chosenOption.weapon.levelUp();
            } else { // skill
                upgradeText = `${chosenOption.skill.name} Lvl ${chosenOption.skill.level + 1}!`;
                chosenOption.skill.levelUp(player);
            }
        }
        
        this.floatingTexts.push(new FloatingText(player.pos.x, player.pos.y - player.size, upgradeText, '#69f0ae', 2.5));
    }
}
