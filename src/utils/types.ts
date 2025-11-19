
import { Weapon } from "../entities/Weapon";
import { Skill } from "../entities/Skill";

export type UpgradeOperation = 'add' | 'multiply' | 'set';

export interface NumericUpgradeEffect {
    op: 'add' | 'multiply';
    value: number;
}

export interface StringUpgradeEffect {
    op: 'set';
    value: string;
}

export type AnyUpgradeEffect = NumericUpgradeEffect | StringUpgradeEffect;

export interface UpgradeLevel {
    descriptionKey: string;
    effects: {
        [key: string]: AnyUpgradeEffect;
    };
}

export type StatusEffectType = 'BURN' | 'SLOW';

export interface IWeaponStatusEffect {
    type: StatusEffectType;
    chance: number; // 0 to 1
    duration: number; // ms
    magnitude: number; // e.g., damage for burn, speed multiplier for slow
}

export interface IStatusEffect extends IWeaponStatusEffect {
    timer: number; // ms, tracks remaining duration
}

export type FirePattern = 'forward' | 'forward_backward' | 'cardinal' | 'all_8';

export interface IWeaponData {
    id: string;
    nameKey: string;
    icon: string;
    type?: 'PROJECTILE' | 'BOOMERANG' | 'AURA' | 'LASER' | 'HOMING_PROJECTILE';
    damage: number;
    cooldown: number;
    speed: number;
    penetration: number;
    range: number;
    width?: number;
    fireSound?: string;
    statusEffect?: IWeaponStatusEffect;
    firePattern?: FirePattern;
}

export type SkillType = 'ACTIVE' | 'PASSIVE';

export interface ISkillData {
    id: string;
    nameKey: string;
    type: SkillType;
    descriptionKey: string;
    icon: string;
    // For ACTIVE skills
    damage?: number;
    cooldown?: number; // ms
    range?: number;
    // For PASSIVE skills
    effects?: {
        [key: string]: UpgradeEffect;
    }
}


export interface IEnemyData {
    hp: number;
    speed: number;
    damage: number;
    size: number;
    xpOrbType: string;
    color: string;
    goldDrop?: [number, number]; // [min, max]
    spriteSheet?: string;
    spriteWidth?: number;
    spriteHeight?: number;
    animation?: {
        maxFrames: number;
    };
    chestDropChance?: number; // Chance from 0 to 1
    elite?: {
        hpMultiplier: number;
        damageMultiplier: number;
        speedMultiplier?: number;
        sizeMultiplier?: number;
        color?: string;
        xpOrbType?: string;
        goldDrop?: [number, number];
        chestDropChance?: number;
    };
}

export interface IPlayerState {
    hp: number;
    maxHp: number;
    xp: number;
    xpToNext: number;
    level: number;
    gold: number;
}

export type AnimationState = {
    frameY: number;
    maxFrames: number;
};

export interface IPlayerData {
    hp: number;
    speed: number;
    size: number;
    revives: number;
    hpRegen?: number; // HP per second
}


export type UpgradeOption =
    | { type: 'upgrade'; weapon: Weapon }
    | { type: 'new'; weaponData: IWeaponData }
    | { type: 'upgrade'; skill: Skill }
    | { type: 'new'; skillData: ISkillData };

export type ItemRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type ItemEffectType = 'HEAL_PERCENT';

export interface IItemData {
    id: string;
    nameKey: string;
    rarity: ItemRarity;
    effect: {
        type: ItemEffectType;
        value: number;
    };
    color: string;
}

export interface IXpOrbData {
    value: number;
    size: number;
    color: string;
}

// Re-defining this for passive skill effects which are simpler for now
export interface UpgradeEffect {
    op: 'add' | 'multiply';
    value: number;
}

export interface ICharacterData {
    id: string;
    nameKey: string;
    descriptionKey: string;
    startingWeaponId: string;
    startingSkillId?: string;
    spriteSheet: string;
    spriteWidth: number;
    spriteHeight: number;
    animations: {
        [key: string]: AnimationState;
    };
    stats?: {
        hp?: number;
        speed?: number;
        hpRegen?: number;
    };
}

export interface IMapData {
    id: string;
    nameKey: string;
    descriptionKey: string;
    tileSize: number;
    baseColors: string[]; // 2 colors for checkerboard
    decoration: 'none' | 'flower' | 'crack' | 'pebble';
    backgroundColor: string;
}

export interface IChestData {
    spriteSheet: string;
    spriteWidth: number;
    spriteHeight: number;
    size: number;
    animations: {
        closed: { frameY: number, maxFrames: number };
        opening: { frameY: number, maxFrames: number, interval: number };
        opened: { frameY: number, maxFrames: number };
    };
}

export interface ILootTable {
    gold: { min: number, max: number };
    xpOrbs: { type: string, count: [number, number] }[];
    upgrades: { chance: number, count: number };
}

// Meta Progression Types
export interface IMetaUpgradeData {
    id: string;
    nameKey: string;
    descriptionKey: string;
    icon: string;
    maxLevel: number;
    baseCost: number;
    costMultiplier: number; // How much cost increases per level
    stat: 'damage' | 'maxHp' | 'speed' | 'hpRegen' | 'goldGain' | 'revives';
    valuePerLevel: number;
}

export interface ISaveData {
    totalGold: number;
    upgrades: { [key: string]: number }; // upgradeId -> level
}
