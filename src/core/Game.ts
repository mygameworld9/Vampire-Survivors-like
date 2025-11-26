import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { XpOrb } from '../entities/XpOrb';
import { Camera } from './Camera';
import { InputHandler } from './InputHandler';
import { BoomerangProjectile } from '../entities/BoomerangProjectile';
import { LaserProjectile } from '../entities/LaserProjectile';
import { AuraEffect } from '../entities/AuraEffect';
import { Item } from '../entities/Item';
import { SoundManager } from './SoundManager';
import { PulseEffect } from '../entities/PulseEffect';
import { ParticleSystem } from './ParticleSystem';
import { MAP_DATA } from '../data/mapData';
import { HomingProjectile } from '../entities/HomingProjectile';
import { LightningProjectile } from '../entities/LightningProjectile';
import { SlashProjectile } from '../entities/SlashProjectile';
import { Chest } from '../entities/Chest';
import { FloatingText } from '../entities/FloatingText';
import { CHEST_LOOT_TABLE } from '../data/lootData';
import { XP_ORB_DATA } from '../data/xpOrbData';
import { i18nManager } from './i18n';
import { UpgradeOption, IMapData, CreativeLoadout, IPlayerState, BossData } from '../utils/types';
import { MapRenderer } from './systems/MapRenderer';
import { SpawnSystem } from './systems/SpawnSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { ObjectPool } from '../utils/ObjectPool';
import { Particle } from '../entities/Particle';
import { Vector2D } from '../utils/Vector2D';
import { Prop } from '../entities/Prop';
import { EVOLUTION_RECIPES } from '../data/evolutionData';
import { Weapon } from '../entities/Weapon';
import { ExplorationPoint } from '../entities/ExplorationPoint';
import { EventEmitter } from '../utils/EventEmitter';
import { SKILL_DATA } from '../data/skillData';
import { WEAPON_DATA } from '../data/weaponData';
import { XP_LEVELS } from '../data/gameConfig';

type AnyProjectile = Projectile | BoomerangProjectile | LaserProjectile | HomingProjectile | LightningProjectile | SlashProjectile;
type AnyEffect = AuraEffect | PulseEffect;

export class Game {
    // Event Emitter for UI Communication
    public events = new EventEmitter();

    public player: Player;
    public enemies: Enemy[] = [];
    public props: Prop[] = [];
    public projectiles: AnyProjectile[] = [];
    public xpOrbs: XpOrb[] = [];
    public effects: AnyEffect[] = [];
    public items: Item[] = [];
    public chests: Chest[] = [];
    public explorationPoints: ExplorationPoint[] = [];
    public floatingTexts: FloatingText[] = [];
    public animatingEntities: Chest[] = [];
    
    public camera: Camera;
    public input: InputHandler;
    public particleSystem: ParticleSystem;
    public gameTime = 0;
    public soundManager: SoundManager;
    public mapData: IMapData;
    public width: number;
    public height: number;
    public onLevelUp: () => void;
    public onChestOpenStart: (chest: Chest) => void;
    public onEvolution: (weapon: Weapon) => void;

    // Build Control
    public banishedItemIds: Set<string> = new Set();

    // Boss Tracking
    public activeBosses: Enemy[] = [];

    // Subsystems
    private mapRenderer: MapRenderer;
    private spawnSystem: SpawnSystem;
    private collisionSystem: CollisionSystem;

    // Pools
    public enemyPool: ObjectPool<Enemy>;
    public propPool: ObjectPool<Prop>;
    public projectilePool: ObjectPool<Projectile>;
    public particlePool: ObjectPool<Particle>;

    // Optimization: Frame counter for staggered updates
    private frameCount = 0;

    constructor(
        width: number, 
        height: number, 
        onLevelUp: () => void,
        onChestOpenStart: (chest: Chest) => void,
        onEvolution: (weapon: Weapon) => void,
        soundManager: SoundManager,
        characterId: string,
        mapId: string,
        initialLoadout?: CreativeLoadout
    ) {
        this.width = width;
        this.height = height;
        this.onLevelUp = onLevelUp;
        this.onChestOpenStart = onChestOpenStart;
        this.onEvolution = onEvolution;
        this.soundManager = soundManager;

        // Initialize Object Pools
        this.enemyPool = new ObjectPool(() => new Enemy(0, 0, {} as any, 'SLIME', false));
        this.propPool = new ObjectPool(() => new Prop(0, 0, {} as any));
        this.projectilePool = new ObjectPool(() => new Projectile(0, 0, new Vector2D(0, 0), {} as any));
        this.particlePool = new ObjectPool(() => new Particle(0, 0, '#fff'));
        
        // Initialize Systems
        this.input = new InputHandler();
        this.particleSystem = new ParticleSystem(this.particlePool);
        this.collisionSystem = new CollisionSystem(this);
        this.spawnSystem = new SpawnSystem(this);
        
        this.player = new Player(
            width / 2, height / 2, 
            (w) => this.collisionSystem.applyAuraDamage(w), 
            this.soundManager, 
            characterId,
            (stats) => this.events.emit('player-update', stats) // Forward Player stats to Game Events
        );
        this.camera = new Camera(this.player.pos.x, this.player.pos.y);
        
        this.mapData = MAP_DATA[mapId] || MAP_DATA['FOREST'];
        this.mapRenderer = new MapRenderer(this.mapData);

        if (initialLoadout) {
            this.applyCreativeLoadout(initialLoadout);
        }

        // Start BGM
        this.soundManager.startBGM();
    }

    private applyCreativeLoadout(loadout: CreativeLoadout) {
        loadout.weapons.forEach(w => {
            this.player.addWeapon(w.id);
            const weapon = this.player.weapons.find(wp => wp.id === w.id);
            if (weapon) {
                for (let i = 1; i < w.level; i++) {
                    weapon.levelUp();
                }
            }
        });
        loadout.skills.forEach(s => {
            this.player.addSkill(s.id);
            const skill = this.player.skills.find(sk => sk.id === s.id);
            if (skill) {
                for (let i = 1; i < s.level; i++) {
                    skill.levelUp(this.player);
                }
            }
        });
    }

    public spawnChestNearPlayer() {
        this.spawnSystem.spawnChestNearPlayer();
    }
    
    update(dt: number) {
        this.gameTime += dt;
        this.frameCount++;

        // Update BGM Intensity based on time (0 to 1 over 300 seconds)
        const intensity = Math.min(1.0, this.gameTime / 300);
        this.soundManager.setBGMIntensity(intensity);

        this.spawnSystem.update(dt);

        const { projectiles, skillEffects } = this.player.update(dt, this.input, this.enemies);
        this.projectiles.push(...projectiles);
        skillEffects.forEach(effect => this.collisionSystem.handleSkillEffect(effect));
        
        this.camera.update(dt, this.player.pos);
        
        // Update entities using zero-allocation loops
        let i = 0;
        const flockingRadius = 50; 
        const updateStride = 10;
        const frameMod = this.frameCount % updateStride;

        while (i < this.enemies.length) {
            const e = this.enemies[i];
            const wasAlive = e.hp > 0;
            
            const shouldUpdateFlocking = (e.id % updateStride) === frameMod;
            let neighbors: Enemy[] | null = null;
            if (shouldUpdateFlocking) {
                neighbors = this.collisionSystem.getNeighbors(e.pos, flockingRadius);
            }
            
            e.update(dt, this.player.pos, neighbors);
            
            if (wasAlive && e.shouldBeRemoved) {
                this.collisionSystem.onEnemyDefeated(e);
            }
            if (e.isBurning() && Math.random() < 0.5) {
                this.particleSystem.emit(e.pos.x + (Math.random() - 0.5) * e.size, e.pos.y + (Math.random() - 0.5) * e.size, 1, '#ff9800');
            }

            if (e.shouldBeRemoved) {
                // Boss Check
                if (e.isElite) {
                    this.removeActiveBoss(e);
                }
                // Return to pool and swap with last element
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
                this.collisionSystem.onPropDestroyed(p);
                this.propPool.release(p);
                const last = this.props[this.props.length - 1];
                this.props[k] = last;
                this.props.pop();
            } else {
                k++;
            }
        }

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

        this.effects.forEach(e => e.update(dt));
        this.floatingTexts.forEach(t => t.update(dt));
        this.explorationPoints.forEach(p => p.update(dt));
        this.particleSystem.update(dt);
        
        this.collisionSystem.update(dt);

        // Cleanup other entities
        this.xpOrbs = this.xpOrbs.filter(o => !o.shouldBeRemoved);
        this.effects = this.effects.filter(e => !e.shouldBeRemoved);
        this.items = this.items.filter(i => !i.shouldBeRemoved);
        this.chests = this.chests.filter(c => !c.shouldBeRemoved);
        this.explorationPoints = this.explorationPoints.filter(e => !e.shouldBeRemoved);
        this.floatingTexts = this.floatingTexts.filter(t => !t.shouldBeRemoved);
        
        // Emit Boss Update (Optimization: throttle this if needed, but for single boss it's fine)
        if (this.activeBosses.length > 0) {
            const closestBoss = this.activeBosses[0]; // Simple logic: just take first
            const bossData: BossData = {
                id: closestBoss.id,
                name: i18nManager.t(closestBoss.data.nameKey),
                hp: Math.ceil(closestBoss.hp),
                maxHp: Math.ceil(closestBoss.data.hp * (closestBoss.data.elite?.hpMultiplier || 1)) // Approximation if not stored perfectly
            };
            this.events.emit('boss-update', bossData);
        } else {
            this.events.emit('boss-update', null);
        }
    }

    updateAnimations(dt: number) {
        this.animatingEntities.forEach(e => e.update(dt));
        this.chests.forEach(c => c.update(dt));
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.mapData.baseColors[0];
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Pass gameTime for Day/Night cycle
        this.mapRenderer.draw(ctx, this.camera, this.width, this.height, this.gameTime);

        ctx.save();
        this.camera.applyTransform(ctx);
        
        this.props.forEach(p => p.draw(ctx));
        this.explorationPoints.forEach(p => p.draw(ctx));
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
    
    // --- Meta / Build Controls ---

    public registerActiveBoss(enemy: Enemy) {
        this.activeBosses.push(enemy);
        // Warning Sound
        this.soundManager.playSound('GAME_OVER'); // Use heavy sound
        this.floatingTexts.push(new FloatingText(this.player.pos.x, this.player.pos.y - 100, "WARNING!", "#FF0000", 3));
    }

    public removeActiveBoss(enemy: Enemy) {
        this.activeBosses = this.activeBosses.filter(b => b.id !== enemy.id);
    }

    public generateUpgradeOptions(): UpgradeOption[] {
        const player = this.player;
        const MAX_SLOTS = 6;

        const availableWeaponUpgrades = player.weapons
            .filter(w => !w.isMaxLevel() && !this.banishedItemIds.has(w.id))
            .map(w => ({ type: 'upgrade', weapon: w } as UpgradeOption));

        let availableNewWeapons: UpgradeOption[] = [];
        if (player.weapons.length < MAX_SLOTS) {
            const ownedWeaponIds = new Set(player.weapons.map(w => w.id));
            availableNewWeapons = Object.values(WEAPON_DATA)
                .filter(wd => !ownedWeaponIds.has(wd.id) && !this.banishedItemIds.has(wd.id))
                .map(wd => ({ type: 'new', weaponData: wd } as UpgradeOption));
        }
        
        const availableSkillUpgrades = player.skills
            .filter(s => !s.isMaxLevel() && !this.banishedItemIds.has(s.id))
            .map(s => ({ type: 'upgrade', skill: s } as UpgradeOption));

        let availableNewSkills: UpgradeOption[] = [];
        if (player.skills.length < MAX_SLOTS) {
            const ownedSkillIds = new Set(player.skills.map(s => s.id));
            availableNewSkills = Object.values(SKILL_DATA)
                .filter(sd => !ownedSkillIds.has(sd.id) && !this.banishedItemIds.has(sd.id))
                .map(sd => ({ type: 'new', skillData: sd } as UpgradeOption));
            
            if (player.level === 2) {
                availableNewSkills = [];
            }
        }

        const optionsPool = [
            ...availableWeaponUpgrades,
            ...availableNewWeapons,
            ...availableSkillUpgrades,
            ...availableNewSkills
        ];

        if (optionsPool.length === 0) {
            return [
                { type: 'heal', amount: 0.5 },
                { type: 'gold', amount: 50 }
            ];
        }

        // Fisher-Yates shuffle inline
        for (let i = optionsPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionsPool[i], optionsPool[j]] = [optionsPool[j], optionsPool[i]];
        }
        return optionsPool.slice(0, 3);
    }

    public performReroll(): UpgradeOption[] | null {
        if (this.player.rerolls > 0) {
            this.player.rerolls--;
            // Notify UI of stat change
            this.events.emit('player-update', { rerolls: this.player.rerolls });
            return this.generateUpgradeOptions();
        }
        return null;
    }

    public performBanish(option: UpgradeOption): UpgradeOption[] | null {
        if (this.player.banishes > 0) {
            let idToBanish = '';
            if (option.type === 'upgrade') {
                if ('weapon' in option) idToBanish = option.weapon.id;
                else idToBanish = option.skill.id;
            } else if (option.type === 'new') {
                if ('weaponData' in option) idToBanish = option.weaponData.id;
                else idToBanish = option.skillData.id;
            }

            if (idToBanish) {
                this.banishedItemIds.add(idToBanish);
                this.player.banishes--;
                this.events.emit('player-update', { banishes: this.player.banishes });
                return this.generateUpgradeOptions(); // Regenerate all
            }
        }
        return null;
    }

    public performSkip() {
        if (this.player.skips > 0) {
            this.player.skips--;
            this.player.gainXp(XP_LEVELS[this.player.level - 1] * 0.25); // 25% XP Refund
            this.events.emit('player-update', { skips: this.player.skips });
        }
    }

    // --- Chest & Evolution ---

    public finalizeChestOpening(chest: Chest) {
        this.grantChestRewards(chest);
        this.animatingEntities = this.animatingEntities.filter(e => e !== chest);
    }

    private grantChestRewards(chest: Chest) {
        chest.shouldBeRemoved = true;
        this.soundManager.playSound('CHEST_OPEN');
        this.particleSystem.emit(chest.pos.x, chest.pos.y, 50, '#ffd700'); 
        
        const evolutionPerformed = this.checkAndPerformEvolution();
        
        const goldAmount = Math.floor(Math.random() * (CHEST_LOOT_TABLE.gold.max - CHEST_LOOT_TABLE.gold.min + 1)) + CHEST_LOOT_TABLE.gold.min;
        this.player.gainGold(goldAmount);
        this.floatingTexts.push(new FloatingText(chest.pos.x, chest.pos.y, `+${Math.ceil(goldAmount * this.player.goldMultiplier)} Gold`, '#ffd700'));
        
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

        if (!evolutionPerformed && Math.random() < CHEST_LOOT_TABLE.upgrades.chance) {
            for (let i = 0; i < CHEST_LOOT_TABLE.upgrades.count; i++) {
                this._grantChestUpgrade();
            }
        }
    }

    private checkAndPerformEvolution(): boolean {
        for (const recipe of EVOLUTION_RECIPES) {
            const weapon = this.player.weapons.find(w => w.id === recipe.baseWeaponId);
            if (!weapon || !weapon.isMaxLevel()) continue;

            const hasSkill = this.player.hasSkill(recipe.requiredSkillId);
            if (!hasSkill) continue;

            const alreadyHasEvolved = this.player.weapons.find(w => w.id === recipe.evolvedWeaponId);
            if (alreadyHasEvolved) continue;

            const newWeapon = this.player.evolveWeapon(recipe.baseWeaponId, recipe.evolvedWeaponId);
            if (newWeapon) {
                this.onEvolution(newWeapon);
                return true;
            }
        }
        return false;
    }

    private _grantChestUpgrade() {
        const player = this.player;

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