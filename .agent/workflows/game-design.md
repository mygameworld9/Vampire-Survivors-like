---
description: 将策划文档转化为精确的游戏数值设计（纯数学分析）
---

# /game-design - 游戏角色/武器/技能数值设计 Workflow

> 🎯 本 Workflow 激活一位**数值策划专家**，将策划文档中的设计意图转化为**可验证的数学公式和数据结构**。

## 核心原则

1. **数据驱动**: 所有设计必须基于现有游戏数据（`weaponData.ts`, `skillData.ts`, `characterData.ts`, `enemyData.ts`）进行对齐
2. **DPS 归一化**: 武器必须遵循 Tier 分层 DPS 目标（T1: ~15, T2: ~200, T3: ~250）
3. **TTK 验证**: 所有伤害值必须通过 Time-to-Kill 分析验证
4. **对标分析**: 新内容必须与现有同类内容进行数值对比

---

## Step 1: 策划文档解析

// turbo
1. 读取用户指定的策划设计文档
2. 识别设计类型：
   - `CHARACTER` - 角色设计
   - `WEAPON` - 武器设计
   - `SKILL` - 技能设计
   - `ENEMY` - 敌人设计
   - `EVOLUTION` - 进化配方设计

---

## Step 2: 上下文数据加载

// turbo
1. 读取现有数据文件以建立 Baseline:
   - `src/data/characterData.ts` → 角色 stats 对标
   - `src/data/weaponData.ts` → 武器 DPS Tier 对标
   - `src/data/skillData.ts` → 技能效果对标
   - `src/data/enemyData.ts` → 敌人 HP/Speed 对标进行 TTK 分析
   - `src/data/evolutionData.ts` → 进化配方规则

2. 读取已有 Balance 文档（如存在）:
   - `documentation/architecture/weapon_system.md`
   - KI: `sparkle_survivors_game_engine/balance/*`

---

## Step 3: 数值分析与验证

执行以下数学分析（按设计类型选择适用项）:

### 3.1 武器 DPS 分析

```
DPS = Damage × (1000 / Cooldown)
有效DPS = DPS × 命中率因子 × 穿透收益
```

**Tier DPS Targets:**
| Tier | DPS Range | 代表武器 |
|------|-----------|----------|
| T1   | 10-20     | BULLET (15 DPS) |
| T2   | 150-300   | GATLING_GUN (267 DPS) |
| T3   | 180-250   | DOOM_CANNON (188 DPS) |

### 3.2 TTK (Time-to-Kill) 分析

```
TTK = Enemy_HP / Effective_DPS
```

**参考敌人 HP:**
| 敌人 | HP | TTK 目标 (T1武器) |
|------|-----|-------------------|
| SLIME | 20 | 1.3s (2-shot) |
| BAT | 15 | 1.0s |
| MUSHROOM | 60 | 4.0s |
| GOLEM | 200 | 13.3s |

### 3.3 角色 Power Budget 分析

基础角色预算 = 100% (KNIGHT 为标准)

| Stat | 基准值 | 每 1% 变化权重 |
|------|--------|---------------|
| HP | 100 | 1.0 |
| Speed | 200 | 0.8 |
| Damage | 1.0x | 2.0 |
| Regen | 0.5/s | 0.5 |

**Power Budget 公式:**
```
PowerScore = (HP/100) × 1.0 + (Speed/200) × 0.8 + DamageMult × 2.0 + Regen × 0.5
目标: 所有角色 PowerScore ≈ 3.8 ± 0.3
```

### 3.4 技能效果量化

**被动技能效果权重:**
| 效果类型 | 价值系数 |
|----------|----------|
| +% MaxHP | 1.0 per 10% |
| +% Speed | 0.8 per 10% |
| +% Damage | 2.0 per 10% |
| HP Regen | 0.5 per 0.5/s |
| 暴击率 | 1.5 per 10% |
| 暴击倍率 | 1.0 per 0.5x |

---

## Step 4: 输出数值设计文档

创建或更新 `documentation/design/XX-numerical-spec.md`，包含:

1. **设计概述**: 目标与设计意图
2. **对标分析表**: 新设计 vs 现有类似内容
3. **数值验证表**: 
   - DPS 计算
   - TTK 验证
   - Power Budget 验证
4. **TypeScript 数据结构预览**: 符合 `IWeaponData` / `ISkillData` / `ICharacterData` 接口
5. **平衡风险评估**: 潜在的数值溢出/不足点

---

## Step 5: 输出格式示例

```markdown
## 🎯 数值验证报告: VAMPIRISM 技能

### 对标分析
| 指标 | VAMPIRISM | REGENERATION | 评估 |
|------|-----------|--------------|------|
| 效果类型 | onKill 回复 | 持续回复 | 不同触发条件 ✅ |
| 回复量 | 1% MaxHP/击杀 | 0.5 HP/sec | 对高攻速有利 |
| 理论回复 (GATLING) | ~6.6/s | 0.5/s | ⚠️ 需验证实际击杀率 |

### DPS/TTK 验证
- 假设场景: GATLING_GUN (267 DPS) vs SLIME wave (20 HP × 10只)
- 击杀频率: 1 kill / 0.075s = ~13 kills/sec
- 理论回复: 13 × 1HP = 13 HP/sec
- 结论: 高攻速场景下 VAMPIRISM 显著优于 REGENERATION

### 推荐调整
将 `onKill_healPercent` 从 1% 降至 0.5% 以平衡高攻速武器收益
```

---

## 约束条件

- ❌ **不生成任何代码** - 仅输出数值设计文档
- ❌ **不做主观判断** - 所有结论必须基于数学计算
- ✅ **必须引用现有数据** - 所有对标必须来自实际游戏数据
- ✅ **必须使用 SI 单位制** - 时间用 ms，距离用 px
