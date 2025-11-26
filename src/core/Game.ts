
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Camera } from './Camera';
import { InputHandler } from './InputHandler';
import { SoundManager } from './SoundManager';
import { ParticleSystem } from './ParticleSystem';
import { MAP_DATA } from '../data/mapData';
import { Chest } from '../entities/Chest';
import { FloatingText } from '../entities/FloatingText';
import { CHEST_LOOT_TABLE } from '../data/lootData';
import { XP_ORB_DATA } from '../data/xpOrbData';
import { i18nManager } from './i18n';
import { UpgradeOption, IMapData, CreativeLoadout, IPlayerState, BossData } from '../utils/types';
import { MapRenderer } from './systems/MapRenderer';
import { SpawnSystem } from './systems/SpawnSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { Weapon } from '../entities/Weapon';
import { EventEmitter } from '../utils/EventEmitter';
import { SKILL_DATA } from '../data/skillData';
import { WEAPON_DATA } from '../data/weaponData';
import { XP_LEVELS } from '../data/gameConfig';
import { EntityManager } from './EntityManager';
import { EVOLUTION_RECIPES } from '../data/evolutionData';

export class Game {
    // Event Emitter for UI Communication
    public events = new EventEmitter();

    // Systems
    public entityManager: EntityManager;
    public player: Player;
    public camera: Camera;
    public input: InputHandler;
    public particleSystem: ParticleSystem;
    public soundManager: SoundManager;
    
    // Map & Render
    public mapData: IMapData;
    public mapRenderer: MapRenderer;
    
    // Subsystems
    private spawnSystem: SpawnSystem;
    private collisionSystem: CollisionSystem;

    // Game State
    public gameTime = 0;
    public width: number;
    public height: number;
    public onLevelUp: () => void;
    public onChestOpenStart: (chest: Chest) => void;
    public onEvolution: (weapon: Weapon) => void;

    // Build Control
    public banishedItemIds: Set<string> = new Set();

    // Boss Tracking
    public activeBosses: Enemy[] = [];

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

        // Initialize Manager
        this.entityManager = new EntityManager();
        
        // Initialize Systems
        this.input = new InputHandler();
        this.particleSystem = new ParticleSystem(this.entityManager.particlePool);
        this.collisionSystem = new CollisionSystem(this);
        
        // Load Map Data
        this.mapData = MAP_DATA[mapId] || MAP_DATA['FOREST'];
        this.spawnSystem = new SpawnSystem(this, this.mapData.spawnScheduleId);
        this.mapRenderer = new MapRenderer(this.mapData);
        
        // Initialize Player
        this.player = new Player(
            width / 2, height / 2, 
            (w) => this.collisionSystem.applyAuraDamage(w), 
            this.soundManager, 
            characterId,
            (stats) => this.events.emit('player-update', stats) 
        );
        this.camera = new Camera(this.player.pos.x, this.player.pos.y);
        
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

        const intensity = Math.min(1.0, this.gameTime / 300);
        this.soundManager.setBGMIntensity(intensity);

        this.spawnSystem.update(dt);

        const { projectiles, skillEffects } = this.player.update(dt, this.input, this.entityManager.enemies);
        this.entityManager.projectiles.push(...projectiles);
        skillEffects.forEach(effect => this.collisionSystem.handleSkillEffect(effect));
        
        this.camera.update(dt, this.player.pos);
        
        this.entityManager.update(dt, this.player.pos, this.collisionSystem, (enemy) => {
            if (enemy.isElite) {
                this.removeActiveBoss(enemy);
            }
        });

        this.particleSystem.update(dt);
        
        this.collisionSystem.update(dt);
        
        if (this.activeBosses.length > 0) {
            const closestBoss = this.activeBosses[0]; 
            const bossData: BossData = {
                id: closestBoss.id,
                name: i18nManager.t(closestBoss.data.nameKey),
                hp: Math.ceil(closestBoss.hp),
                maxHp: Math.ceil(closestBoss.data.hp * (closestBoss.data.elite?.hpMultiplier || 1))
            };
            this.events.emit('boss-update', bossData);
        } else {
            this.events.emit('boss-update', null);
        }
    }

    updateAnimations(dt: number) {
        this.entityManager.updateAnimations(dt);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.mapData.baseColors[0];
        ctx.fillRect(0, 0, this.width, this.height);
        
        this.mapRenderer.draw(ctx, this.camera, this.width, this.height, this.gameTime);

        ctx.save();
        this.camera.applyTransform(ctx);
        
        this.entityManager.draw(ctx);
        this.player.draw(ctx);
        this.particleSystem.draw(ctx);

        ctx.restore();
    }
    
    // --- Meta / Build Controls ---

    public registerActiveBoss(enemy: Enemy) {
        this.activeBosses.push(enemy);
        this.soundManager.playSound('GAME_OVER'); // Use heavy sound
        this.entityManager.floatingTexts.push(new FloatingText(this.player.pos.x, this.player.pos.y - 100, "WARNING!", "#FF0000", 3));
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

        const evolvedWeaponIds = new Set(EVOLUTION_RECIPES.map(r => r.evolvedWeaponId));

        let availableNewWeapons: UpgradeOption[] = [];
        if (player.weapons.length < MAX_SLOTS) {
            const ownedWeaponIds = new Set(player.weapons.map(w => w.id));
            availableNewWeapons = Object.values(WEAPON_DATA)
                .filter(wd => 
                    !ownedWeaponIds.has(wd.id) && 
                    !this.banishedItemIds.has(wd.id) &&
                    !evolvedWeaponIds.has(wd.id) // Exclude evolved weapons from random pool
                )
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

        for (let i = optionsPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionsPool[i], optionsPool[j]] = [optionsPool[j], optionsPool[i]];
        }
        return optionsPool.slice(0, 3);
    }

    public performReroll(): UpgradeOption[] | null {
        if (this.player.rerolls > 0) {
            this.player.rerolls--;
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
                return this.generateUpgradeOptions();
            }
        }
        return null;
    }

    public performSkip() {
        if (this.player.skips > 0) {
            this.player.skips--;
            this.player.gainXp(XP_LEVELS[this.player.level - 1] * 0.25); 
            this.events.emit('player-update', { skips: this.player.skips });
        }
    }

    // --- Chest & Evolution ---

    public finalizeChestOpening(chest: Chest) {
        this.grantChestRewards(chest);
        this.entityManager.animatingEntities = this.entityManager.animatingEntities.filter(e => e !== chest);
    }

    private grantChestRewards(chest: Chest) {
        chest.shouldBeRemoved = true;
        this.soundManager.playSound('CHEST_OPEN');
        this.particleSystem.emit(chest.pos.x, chest.pos.y, 50, '#ffd700'); 
        
        const evolutionPerformed = this.checkAndPerformEvolution();
        
        const goldAmount = Math.floor(Math.random() * (CHEST_LOOT_TABLE.gold.max - CHEST_LOOT_TABLE.gold.min + 1)) + CHEST_LOOT_TABLE.gold.min;
        this.player.gainGold(goldAmount);
        this.entityManager.floatingTexts.push(new FloatingText(chest.pos.x, chest.pos.y, `+${Math.ceil(goldAmount * this.player.goldMultiplier)} Gold`, '#ffd700'));
        
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
            this.entityManager.floatingTexts.push(new FloatingText(chest.pos.x, chest.pos.y - 20, `+${totalXp} XP`, '#42a5f5'));
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
            this.entityManager.floatingTexts.push(new FloatingText(
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
            } else { 
                upgradeText = `${chosenOption.skill.name} Lvl ${chosenOption.skill.level + 1}!`;
                chosenOption.skill.levelUp(player);
            }
        }
        
        this.entityManager.floatingTexts.push(new FloatingText(player.pos.x, player.pos.y - player.size, upgradeText, '#69f0ae', 2.5));
    }
}
