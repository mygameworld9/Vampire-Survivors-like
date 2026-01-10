
import { Vector2D } from "../utils/Vector2D";
import { InputHandler } from "../core/InputHandler";
import { PLAYER_DATA } from "../data/playerData";
import { XP_LEVELS } from "../data/gameConfig";
import { WEAPON_DATA } from "../data/weaponData";
import { Weapon, ProjectilePools } from "./Weapon";
import { BoomerangProjectile } from "./BoomerangProjectile";
import { LaserProjectile } from "./LaserProjectile";
import { Projectile } from "./Projectile";
import { SoundManager } from "../core/SoundManager";
import { Skill, SkillEffect } from "./Skill";
import { SKILL_DATA } from "../data/skillData";
import { UpgradeEffect, AnimationState, IPlayerState, WeaponTag } from "../utils/types";
import { CHARACTER_DATA } from "../data/characterData";
import { HomingProjectile } from "./HomingProjectile";
import { Enemy } from "./Enemy";
import { progressionManager } from "../core/ProgressionManager";
import { LightningProjectile } from "./LightningProjectile";
import { SlashProjectile } from "./SlashProjectile";

type AnyProjectile = Projectile | BoomerangProjectile | LaserProjectile | HomingProjectile | LightningProjectile | SlashProjectile;

export class Player {
    pos: Vector2D;
    size = PLAYER_DATA.size;
    speed = PLAYER_DATA.speed;
    maxHp = PLAYER_DATA.hp;
    hp = PLAYER_DATA.hp;
    hpRegen = PLAYER_DATA.hpRegen || 0;
    xp = 0;
    level = 1;
    revives = PLAYER_DATA.revives;
    gold = 0;

    // Build Control Resources
    rerolls = 1;
    banishes = 1;
    skips = 1;

    // Multipliers from Meta Progression and Character
    public damageMultiplier = 1.0;
    public goldMultiplier = 1.0;
    public statusEffectDurationMultiplier = 1.0; // Affects duration of applied status effects

    // Tag Bonuses
    public tagDamageMultipliers: Map<string, number> = new Map();
    public tagPenetrationBonuses: Map<string, number> = new Map();

    // === NEW v2.0 SYSTEMS ===
    // Critical Strike System
    public critChance = 0; // 0-1
    public critMultiplier = 1.0; // 1.0 = no bonus

    // Shield System
    public shieldCharges = 0;
    private shieldMaxCharges = 0;
    private shieldInterval = 0; // ms
    private shieldTimer = 0;

    // Momentum System
    public momentumStacks = 0;
    private momentumMaxStacks = 0;
    private momentumDamagePerStack = 0;
    private momentumRadius = 0;
    private wasMovingLastFrame = false;

    // Vampirism System
    public onKillHealPercent = 0; // % of max HP healed per kill

    // Gold Multiplier from skills
    private skillGoldMultiplier = 1.0;

    state: 'Idle' | 'Moving' | 'Damaged' | 'Dead' = 'Idle';
    facingDirection = new Vector2D(0, 1);
    isInvincible = false;

    weapons: Weapon[] = [];
    skills: Skill[] = [];
    private onAuraDamage: (weapon: Weapon) => void;
    private onStatsChange?: (stats: Partial<IPlayerState>) => void;
    private soundManager: SoundManager;
    private characterId: string;

    // Animation properties
    private image: HTMLImageElement;
    private spriteWidth: number;
    private spriteHeight: number;
    private animations: { [key: string]: AnimationState };
    private frameX = 0;
    private frameY = 0;
    private maxFrames: number;
    private frameTimer = 0;
    private frameInterval = 100; // ms per frame
    private globalTime = 0;

    // PERF: Scratch vectors to avoid per-frame allocations
    private static _scratchMoveVec = new Vector2D(0, 0);
    private static _scratchFaceVec = new Vector2D(0, 0);

    constructor(
        x: number,
        y: number,
        onAuraDamage: (weapon: Weapon) => void,
        soundManager: SoundManager,
        characterId: string,
        onStatsChange?: (stats: Partial<IPlayerState>) => void
    ) {
        this.pos = new Vector2D(x, y);
        this.onAuraDamage = onAuraDamage;
        this.soundManager = soundManager;
        this.characterId = characterId;
        this.onStatsChange = onStatsChange;

        const charData = CHARACTER_DATA[characterId];
        if (!charData) {
            throw new Error(`Character data not found for ID: ${characterId}`);
        }

        // Load visual assets from character data
        this.image = new Image();
        this.image.src = charData.spriteSheet;
        this.spriteWidth = charData.spriteWidth;
        this.spriteHeight = charData.spriteHeight;
        this.animations = charData.animations;
        this.maxFrames = this.animations.walkDown.maxFrames;

        // Apply base stats
        this.maxHp = PLAYER_DATA.hp;
        this.hp = PLAYER_DATA.hp;
        this.speed = PLAYER_DATA.speed;
        this.hpRegen = PLAYER_DATA.hpRegen || 0;
        this.revives = PLAYER_DATA.revives;

        // Apply stat overrides from character data
        if (charData.stats?.hp) this.maxHp = this.hp = charData.stats.hp;
        if (charData.stats?.speed) this.speed = charData.stats.speed;
        if (charData.stats?.hpRegen) this.hpRegen = charData.stats.hpRegen;
        if (charData.stats?.damageMultiplier) this.damageMultiplier *= charData.stats.damageMultiplier;
        if (charData.stats?.statusEffectDuration) this.statusEffectDurationMultiplier *= charData.stats.statusEffectDuration;

        // --- Apply Meta Progression Bonuses ---
        const metaBonuses = progressionManager.getPlayerBonuses();

        this.maxHp += metaBonuses.maxHpAdd;
        this.hp = this.maxHp; // Fill up new max HP
        this.speed *= (1 + metaBonuses.speedMultiplier);
        this.hpRegen += metaBonuses.hpRegenAdd;
        this.revives += metaBonuses.revivesAdd;
        this.damageMultiplier += metaBonuses.damageMultiplier;
        this.goldMultiplier += metaBonuses.goldMultiplier;

        // Ensure speed is integer from start
        this.speed = Math.round(this.speed);

        // Add starting weapon and skill
        this.addWeapon(charData.startingWeaponId);
        if (charData.startingSkillId) {
            this.addSkill(charData.startingSkillId);
        }
    }

    private notifyStatsChange() {
        if (this.onStatsChange) {
            this.onStatsChange({
                hp: Math.round(this.hp),
                maxHp: Math.round(this.maxHp),
                xp: this.xp,
                xpToNext: XP_LEVELS[this.level - 1],
                level: this.level,
                gold: this.gold,
                rerolls: this.rerolls,
                banishes: this.banishes,
                skips: this.skips
            });
        }
    }

    addWeapon(weaponId: string) {
        if (this.weapons.find(w => w.id === weaponId)) return;
        const data = WEAPON_DATA[weaponId];
        if (data) {
            const newWeapon = new Weapon(data, this.soundManager);
            if (newWeapon.type === 'AURA') {
                newWeapon.onFireAura = this.onAuraDamage;
            }
            this.weapons.push(newWeapon);
        }
    }

    evolveWeapon(baseWeaponId: string, evolvedWeaponId: string) {
        const index = this.weapons.findIndex(w => w.id === baseWeaponId);
        if (index !== -1) {
            const data = WEAPON_DATA[evolvedWeaponId];
            if (data) {
                const newWeapon = new Weapon(data, this.soundManager);
                if (newWeapon.type === 'AURA') {
                    newWeapon.onFireAura = this.onAuraDamage;
                }
                // Replace in place to maintain order
                this.weapons[index] = newWeapon;
                return newWeapon;
            }
        }
        return null;
    }

    addSkill(skillId: string) {
        if (this.skills.find(s => s.id === skillId)) return;
        const data = SKILL_DATA[skillId];
        if (data) {
            const newSkill = new Skill(data);
            this.skills.push(newSkill);
            if (newSkill.type === 'PASSIVE' && newSkill.effects) {
                this.applyPassiveEffect(newSkill.effects);
            }
        }
    }

    hasSkill(skillId: string): boolean {
        return this.skills.some(s => s.id === skillId);
    }

    update(dt: number, input: InputHandler, enemies: Enemy[], projectilePools?: ProjectilePools): { projectiles: AnyProjectile[], skillEffects: SkillEffect[], momentumBlast: { damage: number, radius: number } | null } {
        this.globalTime += dt;
        // PERF: Reuse scratch vector instead of new Vector2D() every frame
        const moveVector = Player._scratchMoveVec.set(0, 0);

        // Keyboard Input
        if (input.keys.ArrowLeft || input.keys.a) moveVector.x -= 1;
        if (input.keys.ArrowRight || input.keys.d) moveVector.x += 1;
        if (input.keys.ArrowUp || input.keys.w) moveVector.y -= 1;
        if (input.keys.ArrowDown || input.keys.s) moveVector.y += 1;

        // Joystick Input (overrides/adds to keyboard)
        if (input.joystickVector.x !== 0 || input.joystickVector.y !== 0) {
            moveVector.x = input.joystickVector.x;
            moveVector.y = input.joystickVector.y;
        }

        if (moveVector.x !== 0 || moveVector.y !== 0) {
            this.state = 'Moving';

            // Normalize
            const lenSq = moveVector.x * moveVector.x + moveVector.y * moveVector.y;
            if (lenSq > 0) {
                moveVector.normalize();
                // PERF: Reuse scratch vector for facing direction update
                this.facingDirection.set(moveVector.x, moveVector.y);
            }

            // Speed is integer, but position remains float for smooth physics
            this.pos.x += moveVector.x * this.speed * dt;
            this.pos.y += moveVector.y * this.speed * dt;
        } else {
            this.state = 'Idle';
        }

        this.updateAnimation(dt);

        // Health Regeneration
        if (this.hp > 0 && this.hp < this.maxHp) {
            this.hp += this.hpRegen * dt;
            this.hp = Math.min(this.maxHp, this.hp);
            // Optimize: Don't notify every frame of regen, maybe every 1s or when int changes?
            // For smoothness, let's notify on integer change or large steps
            // this.notifyStatsChange(); 
        }

        // v2.0 Systems Update
        this.updateShield(dt);
        const isMoving = moveVector.x !== 0 || moveVector.y !== 0;
        const momentumDamage = this.updateMomentum(isMoving, dt);
        let momentumBlast: { damage: number, radius: number } | null = null;

        if (momentumDamage !== null) {
            momentumBlast = { damage: momentumDamage, radius: this.momentumRadius };
        }

        const newProjectiles: AnyProjectile[] = [];
        // PERF: for loop instead of forEach (no closure allocation)
        for (let i = 0; i < this.weapons.length; i++) {
            const projectiles = this.weapons[i].update(dt, this, enemies, projectilePools);
            if (projectiles) {
                newProjectiles.push(...projectiles);
            }
        }

        const skillEffects: SkillEffect[] = [];
        // PERF: for loop instead of forEach
        for (let i = 0; i < this.skills.length; i++) {
            const effect = this.skills[i].update(dt);
            if (effect) {
                skillEffects.push(effect);
            }
        }

        return { projectiles: newProjectiles, skillEffects, momentumBlast };
    }

    updateAnimation(dt: number) {
        const angle = Math.atan2(this.facingDirection.y, this.facingDirection.x);
        const PI_8 = Math.PI / 8;

        let anim = this.animations.walkDown; // Default

        if (angle > -PI_8 && angle <= PI_8) {
            anim = this.animations.walkRight;
        } else if (angle > PI_8 && angle <= 3 * PI_8) {
            anim = this.animations.walkDownRight;
        } else if (angle > 3 * PI_8 && angle <= 5 * PI_8) {
            anim = this.animations.walkDown;
        } else if (angle > 5 * PI_8 && angle <= 7 * PI_8) {
            anim = this.animations.walkDownLeft;
        } else if (angle > 7 * PI_8 || angle <= -7 * PI_8) {
            anim = this.animations.walkLeft;
        } else if (angle > -7 * PI_8 && angle <= -5 * PI_8) {
            anim = this.animations.walkUpLeft;
        } else if (angle > -5 * PI_8 && angle <= -3 * PI_8) {
            anim = this.animations.walkUp;
        } else if (angle > -3 * PI_8 && angle <= -PI_8) {
            anim = this.animations.walkUpRight;
        }

        this.frameY = anim.frameY;
        this.maxFrames = anim.maxFrames;

        if (this.state === 'Moving') {
            this.frameTimer += dt * 1000;
            if (this.frameTimer > this.frameInterval) {
                this.frameTimer = 0;
                this.frameX = (this.frameX + 1) % this.maxFrames;
            }
        } else {
            this.frameX = 0; // Idle frame
        }
    }

    takeDamage(amount: number) {
        if (this.isInvincible) return;

        // Shield absorbs damage first
        if (this.shieldCharges > 0) {
            this.shieldCharges--;
            // Visual/sound feedback could be added here
            return; // Damage fully absorbed
        }

        this.soundManager.playSound('PLAYER_HURT');
        this.hp = Math.max(0, this.hp - amount);
        this.notifyStatsChange();

        if (this.hp === 0) {
            if (this.revives <= 0) {
                this.soundManager.playSound('GAME_OVER');
                this.state = 'Dead';
            }
        } else {
            this.setInvincible(500);
        }
    }

    revive() {
        if (this.revives > 0) {
            this.revives--;
            this.hp = this.maxHp / 2;
            this.setInvincible(2000);
            this.state = 'Idle';
            this.notifyStatsChange();
        }
    }

    setInvincible(duration: number) {
        this.isInvincible = true;
        setTimeout(() => this.isInvincible = false, duration);
    }

    heal(percent: number) {
        const healAmount = this.maxHp * percent;
        this.hp = Math.min(this.maxHp, this.hp + healAmount);
        this.notifyStatsChange();
    }

    gainXp(amount: number) {
        this.xp += amount;
        this.notifyStatsChange();

        if (this.xp >= XP_LEVELS[this.level - 1]) {
            this.level++;
            this.xp = 0;
            // Restore some health on level up
            this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.2);
            this.notifyStatsChange();
            return true;
        }
        return false;
    }

    gainGold(amount: number) {
        // Apply Meta Greed Multiplier + Skill Gold Multiplier
        this.gold += Math.ceil(amount * this.goldMultiplier * this.skillGoldMultiplier);
        this.notifyStatsChange();
    }

    // === NEW v2.0 METHODS ===

    /**
     * Called when player kills an enemy. Handles vampirism healing.
     */
    onEnemyKill() {
        if (this.onKillHealPercent > 0) {
            const healAmount = this.maxHp * this.onKillHealPercent;
            this.hp = Math.min(this.maxHp, this.hp + healAmount);
            // Don't spam notify, integer check
        }
    }

    /**
     * Calculate critical hit. Returns { damage, isCrit }
     */
    calculateCritDamage(baseDamage: number): { damage: number, isCrit: boolean } {
        if (this.critChance > 0 && Math.random() < this.critChance) {
            return { damage: baseDamage * this.critMultiplier, isCrit: true };
        }
        return { damage: baseDamage, isCrit: false };
    }

    /**
     * Update shield regeneration timer.
     */
    updateShield(dt: number) {
        if (this.shieldInterval > 0 && this.shieldCharges < this.shieldMaxCharges) {
            this.shieldTimer -= dt * 1000;
            if (this.shieldTimer <= 0) {
                this.shieldCharges = Math.min(this.shieldMaxCharges, this.shieldCharges + 1);
                this.shieldTimer = this.shieldInterval;
            }
        }
    }

    /**
     * Update momentum system. Returns damage if released, null otherwise.
     */
    updateMomentum(isMoving: boolean, dt: number): number | null {
        if (this.momentumMaxStacks === 0) return null;

        if (isMoving) {
            // Accumulate stacks while moving (1 per 100ms)
            this.momentumStacks = Math.min(this.momentumMaxStacks, this.momentumStacks + dt * 10);
            this.wasMovingLastFrame = true;
        } else if (this.wasMovingLastFrame && this.momentumStacks > 0) {
            // Just stopped moving - release momentum wave
            const damage = this.momentumStacks * this.momentumDamagePerStack;
            const radius = this.momentumRadius;
            this.momentumStacks = 0;
            this.wasMovingLastFrame = false;
            return damage; // Caller should deal AOE damage
        } else {
            this.wasMovingLastFrame = false;
        }
        return null;
    }

    /**
     * Get momentum wave radius for AOE.
     */
    getMomentumRadius(): number {
        return this.momentumRadius;
    }

    applyPassiveEffect(effects: { [key: string]: UpgradeEffect }) {
        const oldMaxHp = this.maxHp;
        for (const key in effects) {
            const effect = effects[key];

            // Check for Tag Bonuses (e.g. damage_FIRE, penetration_PROJECTILE)
            if (key.startsWith('damage_')) {
                const tag = key.split('_')[1];
                const current = this.tagDamageMultipliers.get(tag) || 1.0;
                if (effect.op === 'multiply') this.tagDamageMultipliers.set(tag, current * effect.value);
                if (effect.op === 'add') this.tagDamageMultipliers.set(tag, current + effect.value);
                continue;
            }
            if (key.startsWith('penetration_')) {
                const tag = key.split('_')[1];
                const current = this.tagPenetrationBonuses.get(tag) || 0;
                if (effect.op === 'add') this.tagPenetrationBonuses.set(tag, current + effect.value);
                continue;
            }

            switch (key) {
                case 'maxHp':
                    if (effect.op === 'multiply') this.maxHp *= effect.value;
                    if (effect.op === 'add') this.maxHp += effect.value;
                    break;
                case 'speed':
                    if (effect.op === 'multiply') this.speed *= effect.value;
                    if (effect.op === 'add') this.speed += effect.value;
                    this.speed = Math.round(this.speed);
                    break;
                case 'hpRegen':
                    if (effect.op === 'multiply') this.hpRegen *= effect.value;
                    if (effect.op === 'add') this.hpRegen += effect.value;
                    break;
                // === NEW v2.0 PASSIVE EFFECTS ===
                case 'critChance':
                    if (effect.op === 'add') this.critChance += effect.value;
                    break;
                case 'critMultiplier':
                    if (effect.op === 'add') this.critMultiplier += effect.value;
                    break;
                case 'shield_interval':
                    if (effect.op === 'add') {
                        this.shieldInterval = effect.value;
                        this.shieldTimer = effect.value; // Start timer
                    }
                    break;
                case 'shield_charges':
                    if (effect.op === 'add') {
                        this.shieldMaxCharges += effect.value;
                        this.shieldCharges = this.shieldMaxCharges;
                    }
                    break;
                case 'momentum_maxStacks':
                    if (effect.op === 'add') this.momentumMaxStacks += effect.value;
                    break;
                case 'momentum_damagePerStack':
                    if (effect.op === 'add') this.momentumDamagePerStack += effect.value;
                    break;
                case 'momentum_radius':
                    if (effect.op === 'add') this.momentumRadius += effect.value;
                    break;
                case 'onKill_healPercent':
                    if (effect.op === 'add') this.onKillHealPercent += effect.value;
                    break;
                case 'goldMultiplier':
                    if (effect.op === 'multiply') this.skillGoldMultiplier *= effect.value;
                    break;
            }
        }
        // Heal the player by the amount of HP they gained
        const hpGained = this.maxHp - oldMaxHp;
        if (hpGained > 0) {
            this.hp += hpGained;
        }
        this.hp = Math.round(this.hp);
        this.maxHp = Math.round(this.maxHp);
        this.notifyStatsChange();
    }

    getTagDamageMultiplier(tags: WeaponTag[]): number {
        let mult = 1.0;
        if (!tags) return mult;
        for (const tag of tags) {
            mult *= (this.tagDamageMultipliers.get(tag) || 1.0);
        }
        return mult;
    }

    getTagPenetrationBonus(tags: WeaponTag[]): number {
        let bonus = 0;
        if (!tags) return bonus;
        for (const tag of tags) {
            bonus += (this.tagPenetrationBonuses.get(tag) || 0);
        }
        return bonus;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = this.isInvincible ? 0.5 : 1.0;
        const drawX = this.pos.x;
        const drawY = this.pos.y;

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(drawX, drawY + this.size / 2 - 4, this.size / 2, this.size / 5, 0, 0, Math.PI * 2);
        ctx.fill();

        this.drawCuteCharacter(ctx, drawX, drawY);
        ctx.globalAlpha = 1.0;
    }

    private drawCuteCharacter(ctx: CanvasRenderingContext2D, x: number, y: number) {
        // Cute bounce animation
        const bounce = this.state === 'Moving' ? Math.abs(Math.sin(this.globalTime * 12)) * 4 : 0;
        const drawY = y - bounce;
        const drawX = x;
        const radius = this.size / 2;
        const isLeft = this.facingDirection.x < 0;

        ctx.save();
        ctx.translate(drawX, drawY);

        // Flip horizontally if facing left
        if (isLeft) {
            ctx.scale(-1, 1);
        }

        // Helper for eyes
        const drawEyes = (xOffset: number, yOffset: number, color: string = '#333') => {
            // Blinking logic
            if (Math.floor(this.globalTime * 2) % 5 === 0 && Math.random() > 0.9) {
                // Blink (closed line)
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(xOffset, yOffset);
                ctx.lineTo(xOffset + 6, yOffset);
                ctx.moveTo(xOffset + 10, yOffset);
                ctx.lineTo(xOffset + 16, yOffset);
                ctx.stroke();
            } else {
                // Open (dots/ovals)
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.ellipse(xOffset + 3, yOffset, 2.5, 3.5, 0, 0, Math.PI * 2); // Left
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(xOffset + 13, yOffset, 2.5, 3.5, 0, 0, Math.PI * 2); // Right
                ctx.fill();

                // Shine
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(xOffset + 4, yOffset - 1, 1, 0, Math.PI * 2);
                ctx.arc(xOffset + 14, yOffset - 1, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        switch (this.characterId) {
            case 'KNIGHT':
                // Body (Silver Armor - Pastel)
                ctx.fillStyle = '#CFD8DC';
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();
                // Visor area
                ctx.fillStyle = '#546E7A';
                ctx.beginPath();
                ctx.roundRect(-radius + 4, -6, radius * 2 - 8, 10, 5);
                ctx.fill();
                // Plume (Pastel Red)
                ctx.fillStyle = '#EF9A9A';
                ctx.beginPath();
                ctx.moveTo(0, -radius + 2);
                ctx.quadraticCurveTo(10, -radius - 10, 0, -radius - 12);
                ctx.quadraticCurveTo(-10, -radius - 10, 0, -radius + 2);
                ctx.fill();
                // Detail
                ctx.fillStyle = '#B0BEC5';
                ctx.fillRect(-2, -6, 4, 10);
                break;

            case 'ROGUE':
                // Hood (Pastel Green)
                ctx.fillStyle = '#A5D6A7';
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();
                // Face shadow inside hood
                ctx.fillStyle = '#2E7D32'; // Darker green for depth
                ctx.beginPath();
                ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
                ctx.fill();
                // Bandana Mask
                ctx.fillStyle = '#4CAF50';
                ctx.beginPath();
                ctx.moveTo(-radius * 0.7, 2);
                ctx.quadraticCurveTo(0, 8, radius * 0.7, 2);
                ctx.lineTo(radius * 0.7, radius * 0.6);
                ctx.quadraticCurveTo(0, radius, -radius * 0.7, radius * 0.6);
                ctx.fill();
                // Fierce Eyes
                drawEyes(-3, -2, '#FFF');
                break;

            case 'MAGE':
                // Robe (Pastel Blue)
                ctx.fillStyle = '#90CAF9';
                ctx.beginPath();
                ctx.arc(0, 4, radius - 2, 0, Math.PI * 2);
                ctx.fill();
                // Face (Pale)
                ctx.fillStyle = '#FFE0B2';
                ctx.beginPath();
                ctx.arc(0, -2, 10, 0, Math.PI * 2);
                ctx.fill();
                drawEyes(-8, -2);
                // Hat (Pointy Dark Blue)
                ctx.fillStyle = '#1976D2';
                ctx.beginPath();
                ctx.moveTo(-16, -8);
                ctx.lineTo(16, -8);
                ctx.quadraticCurveTo(0, -35, 0, -35); // Pointy tip
                ctx.lineTo(-16, -8);
                ctx.fill();
                // Star on Hat
                ctx.fillStyle = '#FFEB3B';
                ctx.beginPath();
                ctx.arc(0, -20, 3, 0, Math.PI * 2);
                ctx.fill();
                // Hat Rim
                ctx.fillStyle = '#1565C0';
                ctx.beginPath();
                ctx.ellipse(0, -8, 18, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'CLERIC':
                // Hood/Robe (Pastel Yellow)
                ctx.fillStyle = '#FFF59D';
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();
                // White trim
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
                ctx.stroke();
                // Gold Symbol (Ankh-like)
                ctx.fillStyle = '#FFB74D';
                ctx.beginPath();
                ctx.arc(0, -6, 4, 0, Math.PI * 2); // Top loop
                ctx.fill();
                ctx.fillRect(-2, -4, 4, 10); // Vertical
                ctx.fillRect(-6, 0, 12, 4); // Horizontal
                drawEyes(-2, -4, '#5D4037');
                break;

            case 'HUNTRESS':
                // Hood (Pastel Brown)
                ctx.fillStyle = '#BCAAA4';
                ctx.beginPath();
                ctx.arc(0, -5, 11, 0, Math.PI * 2);
                ctx.fill();
                // Body (Pastel Green)
                ctx.fillStyle = '#C5E1A5';
                ctx.beginPath();
                ctx.arc(0, 7, 11, 0, Math.PI * 2);
                ctx.fill();
                drawEyes(-8, -4);
                // Feather
                ctx.fillStyle = '#FFAB91';
                ctx.beginPath();
                ctx.ellipse(-8, -15, 4, 10, -Math.PI / 5, 0, Math.PI * 2);
                ctx.fill();
                // Quiver strap
                ctx.strokeStyle = '#8D6E63';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-8, 0);
                ctx.lineTo(8, 14);
                ctx.stroke();
                break;

            case 'WARLOCK':
                // Robe (Pastel Purple)
                ctx.fillStyle = '#CE93D8';
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();
                // Dark aura face
                ctx.fillStyle = '#4A148C';
                ctx.beginPath();
                ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
                ctx.fill();
                // Glowing Eyes
                drawEyes(-4, 0, '#69F0AE');
                // Third Eye Rune
                ctx.fillStyle = '#E040FB';
                ctx.beginPath();
                ctx.moveTo(0, -8);
                ctx.lineTo(-2, -10);
                ctx.lineTo(2, -10);
                ctx.fill();
                // Horns
                ctx.fillStyle = '#EEEEEE';
                ctx.beginPath();
                ctx.moveTo(-8, -8);
                ctx.quadraticCurveTo(-12, -16, -6, -14);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(8, -8);
                ctx.quadraticCurveTo(12, -16, 6, -14);
                ctx.fill();
                break;

            default:
                // Default Cute Blob
                ctx.fillStyle = '#EEEEEE';
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();
                drawEyes(-8, -2);
                break;
        }

        ctx.restore();
    }
}
