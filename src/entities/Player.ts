
import { Vector2D } from "../utils/Vector2D";
import { InputHandler } from "../core/InputHandler";
import { PLAYER_DATA } from "../data/playerData";
import { XP_LEVELS } from "../data/gameConfig";
import { WEAPON_DATA } from "../data/weaponData";
import { Weapon } from "./Weapon";
import { BoomerangProjectile } from "./BoomerangProjectile";
import { LaserProjectile } from "./LaserProjectile";
import { Projectile } from "./Projectile";
import { SoundManager } from "../core/SoundManager";
import { Skill, SkillEffect } from "./Skill";
import { SKILL_DATA } from "../data/skillData";
import { UpgradeEffect, AnimationState } from "../utils/types";
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
    
    // Multipliers from Meta Progression
    public damageMultiplier = 1.0;
    public goldMultiplier = 1.0;

    state: 'Idle' | 'Moving' | 'Damaged' | 'Dead' = 'Idle';
    facingDirection = new Vector2D(0, 1);
    isInvincible = false;

    weapons: Weapon[] = [];
    skills: Skill[] = [];
    private onAuraDamage: (weapon: Weapon) => void;
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

    constructor(x: number, y: number, onAuraDamage: (weapon: Weapon) => void, soundManager: SoundManager, characterId: string) {
        this.pos = new Vector2D(x, y);
        this.onAuraDamage = onAuraDamage;
        this.soundManager = soundManager;
        this.characterId = characterId;
        
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
    
    update(dt: number, input: InputHandler, enemies: Enemy[]): { projectiles: AnyProjectile[], skillEffects: SkillEffect[] } {
        this.globalTime += dt;
        const moveVector = new Vector2D(0, 0);
        if (input.keys.ArrowLeft || input.keys.a) moveVector.x -= 1;
        if (input.keys.ArrowRight || input.keys.d) moveVector.x += 1;
        if (input.keys.ArrowUp || input.keys.w) moveVector.y -= 1;
        if (input.keys.ArrowDown || input.keys.s) moveVector.y += 1;

        if (moveVector.x !== 0 || moveVector.y !== 0) {
            this.state = 'Moving';
            this.facingDirection = moveVector.normalize();
            // Speed is integer, but position remains float for smooth physics
            this.pos.x += this.facingDirection.x * this.speed * dt;
            this.pos.y += this.facingDirection.y * this.speed * dt;
        } else {
            this.state = 'Idle';
        }

        // Note: We keep updateAnimation for internal frame logic, even if drawing procedurally
        this.updateAnimation(dt);
        
        // Health Regeneration
        if (this.hp > 0 && this.hp < this.maxHp) {
            this.hp += this.hpRegen * dt;
            this.hp = Math.min(this.maxHp, this.hp);
        }

        const newProjectiles: AnyProjectile[] = [];
        this.weapons.forEach(w => {
            const projectiles = w.update(dt, this, enemies);
            if (projectiles) {
                newProjectiles.push(...projectiles);
            }
        });

        const skillEffects: SkillEffect[] = [];
        this.skills.forEach(s => {
            const effect = s.update(dt);
            if (effect) {
                skillEffects.push(effect);
            }
        });

        return { projectiles: newProjectiles, skillEffects };
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
        this.soundManager.playSound('PLAYER_HURT');
        this.hp = Math.max(0, this.hp - amount);
        if (this.hp === 0) {
             // Logic for death/revive is now handled in GameComponent update loop
             // based on hp === 0 state.
             if (this.revives <= 0) {
                 this.soundManager.playSound('GAME_OVER');
                 this.state = 'Dead';
             }
        } else {
            this.setInvincible(500);
        }
    }

    // Manual revive triggered by UI
    revive() {
        if (this.revives > 0) {
            this.revives--;
            this.hp = this.maxHp / 2;
            this.setInvincible(2000);
            this.state = 'Idle'; // Reset state from potential death
        }
    }

    setInvincible(duration: number) {
        this.isInvincible = true;
        setTimeout(() => this.isInvincible = false, duration);
    }
    
    heal(percent: number) {
        const healAmount = this.maxHp * percent;
        this.hp = Math.min(this.maxHp, this.hp + healAmount);
    }

    gainXp(amount: number) {
        this.xp += amount;
        if (this.xp >= XP_LEVELS[this.level - 1]) {
            this.level++;
            this.xp = 0;
            // Restore some health on level up
            this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.2);
            return true;
        }
        return false;
    }

    gainGold(amount: number) {
        // Apply Meta Greed Multiplier
        this.gold += Math.ceil(amount * this.goldMultiplier);
    }

    applyPassiveEffect(effects: { [key: string]: UpgradeEffect }) {
        const oldMaxHp = this.maxHp;
        for (const key in effects) {
            const effect = effects[key];
            switch(key) {
                case 'maxHp':
                    if (effect.op === 'multiply') this.maxHp *= effect.value;
                    if (effect.op === 'add') this.maxHp += effect.value;
                    break;
                case 'speed':
                     if (effect.op === 'multiply') this.speed *= effect.value;
                     if (effect.op === 'add') this.speed += effect.value;
                     // Force integer speed logic update, but movement remains float
                     this.speed = Math.round(this.speed);
                     break;
                case 'hpRegen':
                     if (effect.op === 'multiply') this.hpRegen *= effect.value;
                     if (effect.op === 'add') this.hpRegen += effect.value;
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
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = this.isInvincible ? 0.5 : 1.0;

        // Use float coordinates for drawing to match camera interpolation.
        // Rounding here causes jitter against the background.
        const drawX = this.pos.x;
        const drawY = this.pos.y;

        // Draw Shadow (Cute round shadow)
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(drawX, drawY + this.size / 2 - 4, this.size / 2, this.size / 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Use Procedural Cute Rendering exclusively for the requested design
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
                ctx.arc(xOffset + 4, yOffset - 1, 1, 0, Math.PI*2);
                ctx.arc(xOffset + 14, yOffset - 1, 1, 0, Math.PI*2);
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
                ctx.moveTo(-radius*0.7, 2);
                ctx.quadraticCurveTo(0, 8, radius*0.7, 2);
                ctx.lineTo(radius*0.7, radius*0.6);
                ctx.quadraticCurveTo(0, radius, -radius*0.7, radius*0.6);
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
                ctx.arc(0, -20, 3, 0, Math.PI*2);
                ctx.fill();
                // Hat Rim
                ctx.fillStyle = '#1565C0';
                ctx.beginPath();
                ctx.ellipse(0, -8, 18, 5, 0, 0, Math.PI*2);
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
                ctx.arc(0, -6, 4, 0, Math.PI*2); // Top loop
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
                ctx.ellipse(-8, -15, 4, 10, -Math.PI/5, 0, Math.PI*2);
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
