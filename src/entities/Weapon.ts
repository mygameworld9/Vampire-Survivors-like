
import { AnyUpgradeEffect, IWeaponData, IWeaponStatusEffect } from "../utils/types";
import { BoomerangProjectile } from "./BoomerangProjectile";
import { LaserProjectile } from "./LaserProjectile";
import { Player } from "./Player";
import { Projectile } from "./Projectile";
import { getUpgradeDataFor } from "../data/upgradeLoader";
import { SoundManager } from "../core/SoundManager";
import { i18nManager } from "../core/i18n";
import { Vector2D } from "../utils/Vector2D";
import { Enemy } from "./Enemy";
import { HomingProjectile } from "./HomingProjectile";
import { LightningProjectile } from "./LightningProjectile";
import { SlashProjectile } from "./SlashProjectile";
import { ObjectPool } from "../utils/ObjectPool";

type AnyProjectile = Projectile | BoomerangProjectile | LaserProjectile | HomingProjectile | LightningProjectile | SlashProjectile;

export class Weapon {
    id: string;
    nameKey: string;
    icon: string;
    type: 'PROJECTILE' | 'BOOMERANG' | 'AURA' | 'LASER' | 'HOMING_PROJECTILE' | 'LIGHTNING' | 'MELEE';
    baseDamage: number; // Store base damage separately
    cooldown: number;
    speed: number;
    penetration: number;
    range: number;
    level: number = 1;
    width?: number;
    statusEffect?: IWeaponStatusEffect;
    firePattern: 'forward' | 'forward_backward' | 'cardinal' | 'all_8';

    private cooldownTimer = 0;
    public onFireAura: ((weapon: Weapon) => void) | null = null;
    private soundManager: SoundManager;
    private fireSound?: string;

    constructor(data: IWeaponData, soundManager: SoundManager) {
        this.id = data.id;
        this.nameKey = data.nameKey;
        this.icon = data.icon;
        this.type = data.type || 'PROJECTILE';
        this.baseDamage = data.damage;
        this.cooldown = data.cooldown;
        this.speed = data.speed;
        this.penetration = data.penetration;
        this.range = data.range;
        this.width = data.width;
        this.fireSound = data.fireSound;
        this.statusEffect = data.statusEffect;
        this.firePattern = data.firePattern || 'forward';
        this.soundManager = soundManager;
        this.cooldownTimer = this.cooldown; // Fire immediately
    }

    get name(): string {
        return i18nManager.t(this.nameKey);
    }

    get damage(): number {
        return this.baseDamage;
    }

    update(dt: number, player: Player, enemies: Enemy[], projectilePool?: ObjectPool<Projectile>): AnyProjectile[] | null {
        this.cooldownTimer -= dt * 1000;
        if (this.cooldownTimer <= 0) {
            this.cooldownTimer = this.cooldown;
            
            if (this.fireSound) {
                // For Aura, if it is max level (persistent), do not play the sound every tick (100ms)
                // Otherwise it spams "whoosh" sounds constantly.
                const shouldPlaySound = !(this.type === 'AURA' && this.isMaxLevel());
                if (shouldPlaySound) {
                    this.soundManager.playSound(this.fireSound);
                }
            }

            if (this.type === 'AURA') {
                const boostedWeapon = { 
                    ...this, 
                    damage: this.baseDamage * player.damageMultiplier,
                    isMaxLevel: this.isMaxLevel.bind(this)
                } as any as Weapon;
                this.onFireAura?.(boostedWeapon);
                return null;
            }
            return this.fire(player, enemies, projectilePool);
        }
        return null;
    }

    fire(player: Player, enemies: Enemy[], projectilePool?: ObjectPool<Projectile>): AnyProjectile[] {
        const projectiles: AnyProjectile[] = [];
        const effectiveDamage = this.baseDamage * player.damageMultiplier;
        
        const firingState = { ...this, damage: effectiveDamage } as any as Weapon;

        if (this.type === 'HOMING_PROJECTILE') {
            let nearestEnemy: Enemy | null = null;
            let minDistance = Infinity;

            for (const enemy of enemies) {
                const dist = Math.hypot(player.pos.x - enemy.pos.x, player.pos.y - enemy.pos.y);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestEnemy = enemy;
                }
            }
            if (nearestEnemy) {
                const initialDirection = new Vector2D(nearestEnemy.pos.x - player.pos.x, nearestEnemy.pos.y - player.pos.y).normalize();
                projectiles.push(new HomingProjectile(player.pos.x, player.pos.y, initialDirection, firingState, nearestEnemy));
            }
        } else if (this.type === 'LIGHTNING') {
            // Find random enemies to strike
            const targets: Enemy[] = [];
            const available = [...enemies];
            // Use penetration as target count
            const count = this.penetration || 1;
            for(let i=0; i<count; i++) {
                if (available.length === 0) break;
                const idx = Math.floor(Math.random() * available.length);
                targets.push(available[idx]);
                available.splice(idx, 1);
            }
            targets.forEach(t => projectiles.push(new LightningProjectile(t.pos.x, t.pos.y, firingState)));

        } else if (this.type === 'MELEE') {
            projectiles.push(new SlashProjectile(player, firingState, this.firePattern === 'all_8'));

        } else if (this.type === 'LASER') {
            const directions: Vector2D[] = [];
            switch (this.firePattern) {
                case 'forward':
                    directions.push(player.facingDirection);
                    break;
                case 'forward_backward':
                    directions.push(player.facingDirection);
                    directions.push(new Vector2D(-player.facingDirection.x, -player.facingDirection.y).normalize());
                    break;
                case 'cardinal':
                    const { x, y } = player.facingDirection;
                    directions.push(new Vector2D(x, y), new Vector2D(-x, -y), new Vector2D(-y, x), new Vector2D(y, -x));
                    break;
                case 'all_8':
                    const diagonalMagnitude = Math.sqrt(0.5);
                    directions.push(
                        new Vector2D(0, 1), new Vector2D(0, -1), new Vector2D(1, 0), new Vector2D(-1, 0),
                        new Vector2D(diagonalMagnitude, diagonalMagnitude), new Vector2D(diagonalMagnitude, -diagonalMagnitude),
                        new Vector2D(-diagonalMagnitude, diagonalMagnitude), new Vector2D(-diagonalMagnitude, -diagonalMagnitude)
                    );
                    break;
            }
            for (const dir of directions) {
                projectiles.push(new LaserProjectile(player, firingState, dir));
            }
        } else if (this.type === 'BOOMERANG') {
            projectiles.push(new BoomerangProjectile(player.pos.x, player.pos.y, player, firingState));
        } else { // PROJECTILE
            if (projectilePool) {
                const p = projectilePool.get();
                p.reset(player.pos.x, player.pos.y, player.facingDirection, firingState);
                projectiles.push(p);
            } else {
                projectiles.push(new Projectile(player.pos.x, player.pos.y, player.facingDirection, firingState));
            }
        }

        return projectiles;
    }

    levelUp() {
        const upgradePath = getUpgradeDataFor(this.id);
        if (!upgradePath) return;

        const upgradeData = upgradePath[this.level - 1];
        if (upgradeData) {
            for (const key in upgradeData.effects) {
                const effect = upgradeData.effects[key] as AnyUpgradeEffect;
                
                switch (key) {
                    case 'damage':
                        if (effect.op === 'add') this.baseDamage += effect.value;
                        if (effect.op === 'multiply') this.baseDamage *= effect.value;
                        if (effect.op === 'set') this.baseDamage = effect.value as unknown as number;
                        break;
                    case 'cooldown':
                    case 'speed':
                    case 'penetration':
                    case 'range':
                    case 'width':
                        if (this[key] !== undefined) {
                             if (effect.op === 'add') (this as any)[key] += effect.value;
                             if (effect.op === 'multiply') (this as any)[key] *= effect.value;
                             if (effect.op === 'set') (this as any)[key] = effect.value;
                        }
                        break;
                    case 'firePattern':
                         if (effect.op === 'set') {
                            this.firePattern = effect.value as any;
                        }
                        break;
                }
            }
            this.level++;
        }
    }
    
    getCurrentUpgradeDescription(): string {
       const upgradePath = getUpgradeDataFor(this.id);
       if (!upgradePath || this.level > upgradePath.length) return i18nManager.t('ui.maxLevel');
       
       const descriptionKey = upgradePath[this.level - 1]?.descriptionKey;
       return descriptionKey ? i18nManager.t(descriptionKey) : i18nManager.t('ui.maxLevel');
    }

    isMaxLevel(): boolean {
        const upgradePath = getUpgradeDataFor(this.id);
        if (!upgradePath) return true;
        return this.level > upgradePath.length;
    }
}
