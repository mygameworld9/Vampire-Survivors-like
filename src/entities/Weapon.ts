
import { AnyUpgradeEffect, IWeaponData, IWeaponStatusEffect, WeaponTag } from "../utils/types";
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
import { ChainProjectile } from "./ChainProjectile";
import { OrbitingProjectile } from "./OrbitingProjectile";
import { TrapProjectile } from "./TrapProjectile";
import { ObjectPool } from "../utils/ObjectPool";

type AnyProjectile = Projectile | BoomerangProjectile | LaserProjectile | HomingProjectile | LightningProjectile | SlashProjectile;

export interface ProjectilePools {
    projectile: ObjectPool<Projectile>;
    boomerang: ObjectPool<BoomerangProjectile>;
    laser: ObjectPool<LaserProjectile>;
    homing: ObjectPool<HomingProjectile>;
    lightning: ObjectPool<LightningProjectile>;
    slash: ObjectPool<SlashProjectile>;
}

export class Weapon {
    id: string;
    nameKey: string;
    icon: string;
    type: 'PROJECTILE' | 'BOOMERANG' | 'AURA' | 'LASER' | 'HOMING_PROJECTILE' | 'LIGHTNING' | 'MELEE' | 'ORBITING' | 'CHAIN' | 'TRAP';
    baseDamage: number; // Store base damage separately
    cooldown: number;
    speed: number;
    penetration: number;
    range: number;
    level: number = 1;
    width?: number;
    statusEffect?: IWeaponStatusEffect;
    firePattern: 'forward' | 'forward_backward' | 'cardinal' | 'all_8';
    tags: WeaponTag[];

    private cooldownTimer = 0;
    private activeProjectileCount = 0; // Track projectiles for mechanics like Boomerang return
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
        this.tags = data.tags || [];
        this.soundManager = soundManager;
        this.cooldownTimer = this.cooldown; // Fire immediately
    }

    get name(): string {
        return i18nManager.t(this.nameKey);
    }

    get damage(): number {
        return this.baseDamage;
    }

    update(dt: number, player: Player, enemies: Enemy[], projectilePools?: ProjectilePools): AnyProjectile[] | null {
        // Boomerang Logic: If the squirrel is out (active), do not cool down.
        // The cooldown should start *after* it returns.
        if (this.type === 'BOOMERANG' && this.activeProjectileCount > 0) {
            return null;
        }

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
                // Aura damage also needs to calculate effective damage
                const tagMult = player.getTagDamageMultiplier(this.tags);
                const boostedWeapon = {
                    ...this,
                    damage: this.baseDamage * player.damageMultiplier * tagMult,
                    isMaxLevel: this.isMaxLevel.bind(this)
                } as any as Weapon;
                this.onFireAura?.(boostedWeapon);
                return null;
            }
            return this.fire(player, enemies, projectilePools);
        }
        return null;
    }

    fire(player: Player, enemies: Enemy[], projectilePools?: ProjectilePools): AnyProjectile[] {
        const projectiles: AnyProjectile[] = [];

        // Calculate Effective Damage with Tag Multipliers
        const tagMult = player.getTagDamageMultiplier(this.tags);
        const effectiveDamage = this.baseDamage * player.damageMultiplier * tagMult;

        // Calculate Penetration Bonus
        const penBonus = player.getTagPenetrationBonus(this.tags);
        const effectivePenetration = this.penetration + penBonus;

        const firingState = {
            ...this,
            damage: effectiveDamage,
            penetration: effectivePenetration
        } as any as Weapon;

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
                if (projectilePools) {
                    const p = projectilePools.homing.get();
                    p.reset(player.pos.x, player.pos.y, initialDirection, firingState, nearestEnemy);
                    projectiles.push(p);
                } else {
                    projectiles.push(new HomingProjectile(player.pos.x, player.pos.y, initialDirection, firingState, nearestEnemy));
                }
            }
        } else if (this.type === 'LIGHTNING') {
            // Find random enemies to strike
            const targets: Enemy[] = [];
            const available = [...enemies];
            // Use penetration as target count
            const count = firingState.penetration || 1;
            for (let i = 0; i < count; i++) {
                if (available.length === 0) break;
                const idx = Math.floor(Math.random() * available.length);
                targets.push(available[idx]);
                available.splice(idx, 1);
            }
            targets.forEach(t => {
                if (projectilePools) {
                    const p = projectilePools.lightning.get();
                    p.reset(t.pos.x, t.pos.y, firingState);
                    projectiles.push(p);
                } else {
                    projectiles.push(new LightningProjectile(t.pos.x, t.pos.y, firingState));
                }
            });

        } else if (this.type === 'MELEE') {
            if (projectilePools) {
                const p = projectilePools.slash.get();
                p.reset(player, firingState, this.firePattern === 'all_8');
                projectiles.push(p);
            } else {
                projectiles.push(new SlashProjectile(player, firingState, this.firePattern === 'all_8'));
            }

        } else if (this.type === 'LASER') {
            const directions: Vector2D[] = [];
            switch (this.firePattern) {
                case 'forward':
                    directions.push(new Vector2D(player.facingDirection.x, player.facingDirection.y));
                    break;
                case 'forward_backward':
                    directions.push(new Vector2D(player.facingDirection.x, player.facingDirection.y));
                    directions.push(new Vector2D(-player.facingDirection.x, -player.facingDirection.y));
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
                if (projectilePools) {
                    const p = projectilePools.laser.get();
                    p.reset(player, firingState, dir);
                    projectiles.push(p);
                } else {
                    projectiles.push(new LaserProjectile(player, firingState, dir));
                }
            }
        } else if (this.type === 'BOOMERANG') {
            this.activeProjectileCount++;
            const onReturn = () => {
                this.activeProjectileCount = Math.max(0, this.activeProjectileCount - 1);
            };
            if (projectilePools) {
                const p = projectilePools.boomerang.get();
                p.reset(player.pos.x, player.pos.y, player, firingState, onReturn);
                projectiles.push(p);
            } else {
                projectiles.push(new BoomerangProjectile(player.pos.x, player.pos.y, player, firingState, onReturn));
            }

        } else if (this.type === 'ORBITING') {
            // ORBITING: Spawn orbiting projectiles around player
            // Count depends on specific weapon ID for now, or use penetration level or similar data
            const orbCount = this.id === 'SOUL_VORTEX' ? 6 : (this.id === 'PHANTOM_GUARD' ? 4 : 2);
            const spacing = 360 / orbCount;

            for (let i = 0; i < orbCount; i++) {
                const angle = (this.level * 45) + (i * spacing);
                projectiles.push(new OrbitingProjectile(player, angle, this));
            }
            return projectiles;

        } else if (this.type === 'CHAIN') {
            // CHAIN: ChainProjectile
            const weaponStats = firingState;
            if (projectilePools) {
                // TODO: Add pool support later
                projectiles.push(new ChainProjectile(player.pos.x, player.pos.y, player.facingDirection, weaponStats));
            } else {
                projectiles.push(new ChainProjectile(player.pos.x, player.pos.y, player.facingDirection, weaponStats));
            }

        } else if (this.type === 'TRAP') {
            // TRAP: TrapProjectile
            const weaponStats = firingState;
            if (projectilePools) {
                // TODO: Add pool support later
                projectiles.push(new TrapProjectile(player.pos.x, player.pos.y, weaponStats));
            } else {
                projectiles.push(new TrapProjectile(player.pos.x, player.pos.y, weaponStats));
            }
        } else { // PROJECTILE
            if (projectilePools) {
                const p = projectilePools.projectile.get();
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
