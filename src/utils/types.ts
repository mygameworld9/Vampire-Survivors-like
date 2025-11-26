
import { Weapon } from "../entities/Weapon";
import { Skill } from "../entities/Skill";

export type UpgradeOperation = 'add' | 'multiply' | 'set';

export interface NumericUpgradeEffect {
    op: 'add' | 'multiply' | 'set';
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

export interface EvolutionRecipe {
    baseWeaponId: string;
    requiredSkillId: string;
    evolvedWeaponId: string;
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
    type?: 'PROJECTILE' | 'BOOMERANG' | 'AURA' | 'LASER' | 'HOMING_PROJECTILE' | 'LIGHTNING' | 'MELEE';
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
    nameKey: string;
    descriptionKey: string;
    icon: string;
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

export interface IPropData {
    type: 'CRATE' | 'BARREL';
    hp: number;
    size: number;
    dropTable: {
        itemId: string;
        chance: number;
    }[];
    color: string;
}

export interface IPlayerState {
    hp: number;
    maxHp: number;
    xp: number;
    xpToNext: number;
    level: number;
    gold: number;
    // Build Control Resources
    rerolls: number;
    banishes: number;
    skips: number;
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
    | { type: 'new'; skillData: ISkillData }
    | { type: 'heal'; amount: number }
    | { type: 'gold'; amount: number };

export type ItemRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type ItemEffectType = 'HEAL_PERCENT' | 'GOLD_ADD';

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

// Spawn System Types
export interface ISpawnEvent {
    time: number;
    enemyType: string;
    rate: number; // ms per spawn
}

export interface ISpawnSchedule {
    id: string;
    events: ISpawnEvent[];
}

export interface IMapData {
    id: string;
    nameKey: string;
    descriptionKey: string;
    tileSize: number;
    baseColors: string[]; // 2 colors for checkerboard
    decoration: 'none' | 'flower' | 'crack' | 'pebble';
    backgroundColor: string;
    spawnScheduleId: string;
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

export interface CreativeLoadout {
    weapons: { id: string, level: number }[];
    skills: { id: string, level: number }[];
}

export interface BossData {
    id: number;
    name: string;
    hp: number;
    maxHp: number;
}
