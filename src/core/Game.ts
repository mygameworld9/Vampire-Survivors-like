
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
import { UpgradeOption, IMapData, CreativeLoadout } from '../utils/types';
import { MapRenderer } from './systems/MapRenderer';
import { SpawnSystem } from './systems/SpawnSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { ObjectPool } from '../utils/ObjectPool';
import { Particle } from '../entities/Particle';
import { Vector2D } from '../utils/Vector2D';
import { Prop } from '../entities/Prop';

type AnyProjectile = Projectile | BoomerangProjectile | LaserProjectile | HomingProjectile | LightningProjectile | SlashProjectile;
type AnyEffect = AuraEffect | PulseEffect;

/**
 * The main class that orchestrates the entire game logic, state, and rendering.
 * It manages all game entities, systems (spawning, collision), and the main game loop.
 */
export class Game {
    /** The player character instance. */
    public player: Player;
    /** An array of all active enemies in the game. */
    public enemies: Enemy[] = [];
    /** An array of all active environmental props (e.g., destructible barrels). */
    public props: Prop[] = [];
    /** An array of all active projectiles. */
    public projectiles: AnyProjectile[] = [];
    /** An array of all active XP orbs on the ground. */
    public xpOrbs: XpOrb[] = [];
    /** An array of all active visual effects (e.g., auras, pulses). */
    public effects: AnyEffect[] = [];
    /** An array of all active items on the ground. */
    public items: Item[] = [];
    /** An array of all active chests. */
    public chests: Chest[] = [];
    /** An array of all active floating text elements (e.g., damage numbers, "+XP"). */
    public floatingTexts: FloatingText[] = [];
    /** An array of entities currently undergoing a special, blocking animation (e.g., a chest opening). */
    public animatingEntities: Chest[] = [];
    
    /** The game's camera instance for managing the viewport. */
    public camera: Camera;
    /** The handler for player input. */
    public input: InputHandler;
    /** The system for creating and managing particle effects. */
    public particleSystem: ParticleSystem;
    /** The total elapsed time since the game started, in seconds. */
    public gameTime = 0;
    /** The manager for all sound effects and music. */
    public soundManager: SoundManager;
    /** The data for the current map, including layout, colors, and spawn information. */
    public mapData: IMapData;
    /** The width of the game canvas. */
    public width: number;
    /** The height of the game canvas. */
    public height: number;
    /** A callback function to be executed when the player levels up. */
    public onLevelUp: () => void;
    /** A callback function to be executed when the player initiates opening a chest. */
    public onChestOpenStart: (chest: Chest) => void;

    // Subsystems
    /** @private The renderer for the game map. */
    private mapRenderer: MapRenderer;
    private spawnSystem: SpawnSystem;
    private collisionSystem: CollisionSystem;

    // Pools
    /** A pool for reusing enemy objects to improve performance. */
    public enemyPool: ObjectPool<Enemy>;
    /** A pool for reusing prop objects. */
    public propPool: ObjectPool<Prop>;
    /** A pool for reusing basic projectile objects. */
    public projectilePool: ObjectPool<Projectile>;
    /** A pool for reusing particle objects. */
    public particlePool: ObjectPool<Particle>;

    /**
     * Creates an instance of the Game.
     * @param {number} width - The width of the game canvas.
     * @param {number} height - The height of the game canvas.
     * @param {() => void} onLevelUp - A callback for when the player levels up.
     * @param {(chest: Chest) => void} onChestOpenStart - A callback for when a chest opening animation starts.
     * @param {SoundManager} soundManager - The shared sound manager instance.
     * @param {string} characterId - The ID of the character selected by the player.
     * @param {string} mapId - The ID of the map selected for the game.
     * @param {CreativeLoadout} [initialLoadout] - Optional loadout for creative/debug modes.
     */
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
            characterId
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

    /**
     * Spawns a treasure chest at a random location near the player.
     */
    public spawnChestNearPlayer() {
        this.spawnSystem.spawnChestNearPlayer();
    }
    
    /**
     * The main update loop for the game logic.
     * This method is called on every frame and is responsible for updating all game entities and systems.
     * @param {number} dt - The time elapsed since the last frame, in seconds.
     */
    update(dt: number) {
        this.gameTime += dt;

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
        const flockingRadius = 50; // Distance to search for neighbors
        
        while (i < this.enemies.length) {
            const e = this.enemies[i];
            const wasAlive = e.hp > 0;
            
            // Get neighbors for flocking behavior
            // Note: This uses the QuadTree state from the PREVIOUS frame, 
            // which is standard practice for this type of simulation.
            const neighbors = this.collisionSystem.getNeighbors(e.pos, flockingRadius);
            
            e.update(dt, this.player.pos, neighbors);
            
            if (wasAlive && e.shouldBeRemoved) {
                this.collisionSystem.onEnemyDefeated(e);
            }
            if (e.isBurning() && Math.random() < 0.5) {
                this.particleSystem.emit(e.pos.x + (Math.random() - 0.5) * e.size, e.pos.y + (Math.random() - 0.5) * e.size, 1, '#ff9800');
            }

            if (e.shouldBeRemoved) {
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
        this.particleSystem.update(dt);
        
        this.collisionSystem.update(dt);

        // Cleanup other entities (less frequent, can use filter for simplicity or refactor later)
        this.xpOrbs = this.xpOrbs.filter(o => !o.shouldBeRemoved);
        this.effects = this.effects.filter(e => !e.shouldBeRemoved);
        this.items = this.items.filter(i => !i.shouldBeRemoved);
        this.chests = this.chests.filter(c => !c.shouldBeRemoved);
        this.floatingTexts = this.floatingTexts.filter(t => !t.shouldBeRemoved);
    }

    /**
     * Updates entities that have special, non-gameplay animations.
     * This is typically run separately from the main update loop to ensure animations
     * continue even when the game is paused.
     * @param {number} dt - The time elapsed since the last frame, in seconds.
     */
    updateAnimations(dt: number) {
        this.animatingEntities.forEach(e => e.update(dt));
        this.chests.forEach(c => c.update(dt));
    }

    /**
     * Renders the entire game state to the canvas.
     * This method is called every frame after the `update` loop.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
     */
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.mapData.baseColors[0];
        ctx.fillRect(0, 0, this.width, this.height);
        
        this.mapRenderer.draw(ctx, this.camera, this.width, this.height);

        ctx.save();
        this.camera.applyTransform(ctx);
        
        this.props.forEach(p => p.draw(ctx));
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
    
    /**
     * Finalizes the chest opening sequence after the animation is complete.
     * This grants the rewards to the player and removes the chest from the animating entities list.
     * @param {Chest} chest - The chest that has finished its opening animation.
     */
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
