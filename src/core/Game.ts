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
import { Chest } from '../entities/Chest';
import { FloatingText } from '../entities/FloatingText';
import { CHEST_LOOT_TABLE } from '../data/lootData';
import { XP_ORB_DATA } from '../data/xpOrbData';
import { i18nManager } from './i18n';
import { UpgradeOption, IMapData, CreativeLoadout } from '../utils/types';
import { MapRenderer } from './systems/MapRenderer';
import { SpawnSystem } from './systems/SpawnSystem';
import { CollisionSystem } from './systems/CollisionSystem';

type AnyProjectile = Projectile | BoomerangProjectile | LaserProjectile | HomingProjectile;
type AnyEffect = AuraEffect | PulseEffect;

export class Game {
    public player: Player;
    public enemies: Enemy[] = [];
    public projectiles: AnyProjectile[] = [];
    public xpOrbs: XpOrb[] = [];
    public effects: AnyEffect[] = [];
    public items: Item[] = [];
    public chests: Chest[] = [];
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

    // Subsystems
    private mapRenderer: MapRenderer;
    private spawnSystem: SpawnSystem;
    private collisionSystem: CollisionSystem;

    constructor(
        width: number, 
        height: number, 
        onLevelUp: () => void,
        onChestOpenStart: (chest: Chest) => void,
        soundManager: SoundManager,
        characterId: string,
        mapId: string,
        initialLoadout?: CreativeLoadout
    ) {
        this.width = width;
        this.height = height;
        this.onLevelUp = onLevelUp;
        this.onChestOpenStart = onChestOpenStart;
        this.soundManager = soundManager;
        
        // Initialize Systems
        this.input = new InputHandler();
        this.particleSystem = new ParticleSystem();
        this.collisionSystem = new CollisionSystem(this);
        this.spawnSystem = new SpawnSystem(this);
        
        this.player = new Player(
            width / 2, height / 2, 
            (w) => this.collisionSystem.applyAuraDamage(w), 
            this.soundManager, 
            characterId
        );
        this.camera = new Camera(this.player.pos.x, this.player.pos.y);
        
        this.mapData = MAP_DATA[mapId] || MAP_DATA['FOREST'];
        this.mapRenderer = new MapRenderer(this.mapData);

        if (initialLoadout) {
            this.applyCreativeLoadout(initialLoadout);
        }
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
        this.spawnSystem.update(dt);

        const { projectiles, skillEffects } = this.player.update(dt, this.input, this.enemies);
        this.projectiles.push(...projectiles);
        skillEffects.forEach(effect => this.collisionSystem.handleSkillEffect(effect));
        
        this.camera.update(this.player.pos);
        
        // Update entities
        this.enemies.forEach(e => {
            const wasAlive = e.hp > 0;
            e.update(dt, this.player.pos);
            if (wasAlive && e.shouldBeRemoved) {
                this.collisionSystem.onEnemyDefeated(e);
            }
            if (e.isBurning() && Math.random() < 0.5) {
                 this.particleSystem.emit(e.pos.x + (Math.random() - 0.5) * e.size, e.pos.y + (Math.random() - 0.5) * e.size, 1, '#ff9800');
            }
        });

        this.projectiles.forEach(p => p.update(dt));
        this.effects.forEach(e => e.update(dt));
        this.floatingTexts.forEach(t => t.update(dt));
        this.particleSystem.update(dt);
        
        this.collisionSystem.update(dt);

        // Cleanup
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
        this.chests.forEach(c => c.update(dt));
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.mapData.baseColors[0];
        ctx.fillRect(0, 0, this.width, this.height);
        
        this.mapRenderer.draw(ctx, this.camera, this.width, this.height);

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
    
    public finalizeChestOpening(chest: Chest) {
        this.grantChestRewards(chest);
        this.animatingEntities = this.animatingEntities.filter(e => e !== chest);
    }

    private grantChestRewards(chest: Chest) {
        chest.shouldBeRemoved = true;
        this.soundManager.playSound('CHEST_OPEN');
        this.particleSystem.emit(chest.pos.x, chest.pos.y, 50, '#ffd700'); 

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

        if (Math.random() < CHEST_LOOT_TABLE.upgrades.chance) {
            for (let i = 0; i < CHEST_LOOT_TABLE.upgrades.count; i++) {
                this._grantChestUpgrade();
            }
        }
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