# 📋 类型系统与接口定义

> 本文档完整记录项目的 TypeScript 类型系统，为复刻提供精确的数据结构定义。

---

## 📌 概述

| 分类 | 数量 |
|:---|:---:|
| 核心接口 | 18 |
| 联合类型 | 8 |
| 枚举类型 | 6 |

---

## 🔧 升级效果类型

### 操作符定义

```typescript
type UpgradeOperation = 'add' | 'multiply' | 'set';

interface NumericUpgradeEffect {
    op: 'add' | 'multiply' | 'set';
    value: number;
}

interface StringUpgradeEffect {
    op: 'set';
    value: string;
}

type AnyUpgradeEffect = NumericUpgradeEffect | StringUpgradeEffect;
```

### 升级等级定义

```typescript
interface UpgradeLevel {
    descriptionKey: string;
    effects: {
        [key: string]: AnyUpgradeEffect;
    };
}
```

---

## ⚔️ 武器接口

### 武器数据

```typescript
interface IWeaponData {
    id: string;
    nameKey: string;
    icon: string;
    type?: 'PROJECTILE' | 'BOOMERANG' | 'AURA' | 'LASER' | 
           'HOMING_PROJECTILE' | 'LIGHTNING' | 'MELEE' | 
           'ORBITING' | 'CHAIN' | 'TRAP';
    damage: number;
    cooldown: number;      // ms
    speed: number;         // px/s
    penetration: number;
    range: number;         // px
    width?: number;        // 激光宽度
    fireSound?: string;
    statusEffect?: IWeaponStatusEffect;
    firePattern?: FirePattern;
    tags?: WeaponTag[];
}
```

### 武器标签

```typescript
type WeaponTag = 
    | 'PROJECTILE' | 'AREA' | 'MELEE' | 'LASER' 
    | 'FIRE' | 'ICE' | 'LIGHTNING' | 'DARK' 
    | 'PHYSICAL' | 'MAGIC' | 'EXPLOSIVE' 
    | 'POISON' | 'SUMMON' | 'TRAP';
```

### 发射模式

```typescript
type FirePattern = 'forward' | 'forward_backward' | 'cardinal' | 'all_8';
```

---

## 🌟 状态效果接口

```typescript
type StatusEffectType = 'BURN' | 'SLOW' | 'POISON' | 'STUN' | 'FREEZE';

interface IWeaponStatusEffect {
    type: StatusEffectType;
    chance: number;     // 0~1
    duration: number;   // ms
    magnitude: number;  // DPS 或速度倍率
}

interface IStatusEffect extends IWeaponStatusEffect {
    timer: number;      // 剩余持续时间
}
```

---

## 💫 技能接口

```typescript
type SkillType = 'ACTIVE' | 'PASSIVE';

interface ISkillData {
    id: string;
    nameKey: string;
    type: SkillType;
    descriptionKey: string;
    icon: string;
    
    // ACTIVE 专用
    damage?: number;
    cooldown?: number;
    range?: number;
    
    // PASSIVE 专用
    effects?: {
        [key: string]: UpgradeEffect;
    };
}
```

---

## 👹 敌人接口

```typescript
type EnemyAIBehavior = 'CHASE' | 'FLEE';

interface IEnemyData {
    nameKey: string;
    descriptionKey: string;
    icon: string;
    hp: number;
    speed: number;
    damage: number;
    size: number;
    xpOrbType: string;
    color: string;
    goldDrop?: [number, number];  // [min, max]
    spriteSheet?: string;
    spriteWidth?: number;
    spriteHeight?: number;
    animation?: { maxFrames: number };
    aiBehavior?: EnemyAIBehavior;  // 默认 CHASE
    chestDropChance?: number;
    
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
```

---

## 🎮 玩家接口

```typescript
interface IPlayerData {
    hp: number;
    speed: number;
    size: number;
    revives: number;
    hpRegen?: number;
}

interface IPlayerState {
    hp: number;
    maxHp: number;
    xp: number;
    xpToNext: number;
    level: number;
    gold: number;
    rerolls: number;
    banishes: number;
    skips: number;
}
```

---

## 🧙 角色接口

```typescript
type AnimationState = {
    frameY: number;
    maxFrames: number;
};

interface ICharacterData {
    id: string;
    nameKey: string;
    descriptionKey: string;
    startingWeaponId: string;
    startingSkillId?: string;
    spriteSheet: string;
    spriteWidth: number;
    spriteHeight: number;
    animations: {
        [key: string]: AnimationState;  // 8方向动画
    };
    stats?: {
        hp?: number;
        speed?: number;
        hpRegen?: number;
        damageMultiplier?: number;
        statusEffectDuration?: number;
    };
}
```

---

## 🔄 进化配方

```typescript
interface EvolutionRecipe {
    baseWeaponId: string;
    requiredSkillId: string;
    evolvedWeaponId: string;
}
```

---

## 🗺️ 地图接口

```typescript
interface IMapData {
    id: string;
    nameKey: string;
    descriptionKey: string;
    tileSize: number;
    baseColors: string[];    // 棋盘格双色
    decoration: 'none' | 'flower' | 'crack' | 'pebble';
    backgroundColor: string;
    spawnScheduleId: string;
}
```

---

## 📦 生成系统接口

```typescript
interface ISpawnEvent {
    time: number;      // 触发时间 (秒)
    enemyType: string;
    rate: number;      // 生成间隔 (ms)
}

interface ISpawnSchedule {
    id: string;
    events: ISpawnEvent[];
}
```

---

## 🎁 掉落与物品接口

```typescript
interface ILootTable {
    gold: { min: number, max: number };
    xpOrbs: { type: string, count: [number, number] }[];
    upgrades: { chance: number, count: number };
}

type ItemRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
type ItemEffectType = 'HEAL_PERCENT' | 'GOLD_ADD';

interface IItemData {
    id: string;
    nameKey: string;
    rarity: ItemRarity;
    effect: {
        type: ItemEffectType;
        value: number;
    };
    color: string;
}

interface IXpOrbData {
    value: number;
    size: number;
    color: string;
}
```

---

## 📊 元进度接口

```typescript
interface IMetaUpgradeData {
    id: string;
    nameKey: string;
    descriptionKey: string;
    icon: string;
    maxLevel: number;
    baseCost: number;
    costMultiplier: number;
    stat: 'damage' | 'maxHp' | 'speed' | 'hpRegen' | 'goldGain' | 'revives';
    valuePerLevel: number;
}

interface ISaveData {
    totalGold: number;
    upgrades: { [key: string]: number };  // upgradeId -> level
}
```

---

## 🎯 升级选项联合类型

```typescript
type UpgradeOption =
    | { type: 'upgrade'; weapon: Weapon }
    | { type: 'new'; weaponData: IWeaponData }
    | { type: 'upgrade'; skill: Skill }
    | { type: 'new'; skillData: ISkillData }
    | { type: 'heal'; amount: number }
    | { type: 'gold'; amount: number };
```

---

## 📈 游戏配置

### 生成时间表

```typescript
const SPAWN_SCHEDULE = [
    { time: 0, enemyType: 'SLIME', rate: 500 },
    { time: 30, enemyType: 'SLIME', rate: 400 },
    { time: 45, enemyType: 'SPIDER', rate: 600 },
    { time: 60, enemyType: 'GHOST', rate: 800 },
    { time: 90, enemyType: 'BAT', rate: 600 },
    { time: 100, enemyType: 'MUSHROOM', rate: 1500 },
    { time: 120, enemyType: 'SLIME', rate: 300 },
    { time: 120, enemyType: 'SKELETON', rate: 1000 },
    { time: 150, enemyType: 'GOLEM', rate: 5000 },
    { time: 180, enemyType: 'GHOST', rate: 500 },
    { time: 180, enemyType: 'BAT', rate: 400 },
    { time: 180, enemyType: 'SPIDER', rate: 300 },
    { time: 240, enemyType: 'GOLEM', rate: 3000 },
];
```

### 升级经验曲线

```typescript
// 公式: 50 + level × 30 + min(level² × 0.5, 500)
// Level 1→2: 80 XP
// Level 10→11: 380 XP  
// Level 50→51: 2080 XP

const XP_LEVELS = Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;
    return 50 + level * 30 + Math.min(level * level * 0.5, 500);
});
```

---

## 📝 源代码位置

```
src/utils/types.ts      # 所有类型定义 (281行)
src/data/gameConfig.ts  # 游戏配置常量
```
