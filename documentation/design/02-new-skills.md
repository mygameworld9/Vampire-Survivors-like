# ✨ 新技能设计文档

> Sparkle Survivors v2.0 技能扩展提案
> 版本: 1.0 | 作者: AI Game Designer | 日期: 2026-01-06

---

## 📋 概述

本文档定义了 **8 个新技能**（5 被动 + 3 主动），丰富角色构建多样性。

### 现有技能回顾
| 类型 | 现有技能 |
|------|----------|
| 主动 | ENERGY_PULSE 💥、HOLY_NOVA 🌟 |
| 被动 | TOUGHNESS ❤️、REGENERATION ➕、SWIFTNESS 💨、ELEMENTAL_MASTERY 🔥、BALLISTICS 🎯 |

### 新增技能一览
| 类型 | 新增技能 |
|------|----------|
| 被动 | VAMPIRISM 🧛、GOLDEN_TOUCH 💰、CRITICAL_STRIKE ⚔️、SHIELD_MASTERY 🛡️、MOMENTUM 🏃 |
| 主动 | BLINK ✨、RAGE_BURST 😡、GUARDIAN_ANGEL 👼 |

---

## 🧛 被动技能

### VAMPIRISM 吸血本能

| 属性 | 值 |
|------|-----|
| **ID** | `VAMPIRISM` |
| **图标** | 🧛 |
| **类型** | PASSIVE |
| **效果** | 击杀敌人时恢复最大生命值的 1% |

```typescript
effects: {
    onKill_healPercent: { op: 'set', value: 0.01 }
}
```

**设计理念**: 
- 鼓励激进战斗风格
- 与高攻速武器（GATLING_GUN）形成组合
- 弥补缺乏主动回血手段的角色

**平衡考量**:
- 100HP玩家每次击杀回复1HP
- 精英怪多，回复量有限
- 不与 REGENERATION 冲突（一个是击杀触发，一个是持续回复）

---

### GOLDEN_TOUCH 点金术

| 属性 | 值 |
|------|-----|
| **ID** | `GOLDEN_TOUCH` |
| **图标** | 💰 |
| **类型** | PASSIVE |
| **效果** | 金币掉落量 +50% |

```typescript
effects: {
    goldMultiplier: { op: 'multiply', value: 1.5 }
}
```

**设计理念**: 
- 经济型天赋，加速 Meta 升级解锁
- 与 TREASURE_GOBLIN 猎杀策略形成组合

**平衡考量**:
- 不提供战斗力，是纯资源技能
- 适合刷金局

---

### CRITICAL_STRIKE 致命打击

| 属性 | 值 |
|------|-----|
| **ID** | `CRITICAL_STRIKE` |
| **图标** | ⚔️ |
| **类型** | PASSIVE |
| **效果** | 10% 暴击率，暴击造成 200% 伤害 |

```typescript
effects: {
    critChance: { op: 'set', value: 0.10 },
    critMultiplier: { op: 'set', value: 2.0 }
}
```

**设计理念**: 
- 引入暴击系统，增加战斗爽感
- 与高伤武器（DOOM_CANNON）形成爆发组合

**视觉效果**:
- 暴击时伤害数字放大 + 金色
- 敌人闪烁红光

**平衡考量**:
- 理论平均DPS提升 10%
- 可通过升级增加暴击率

**升级路径建议**:
| 等级 | 暴击率 | 暴击倍率 |
|------|--------|----------|
| Lv1 | 10% | 2.0x |
| Lv2 | 15% | 2.0x |
| Lv3 | 20% | 2.2x |
| Lv4 | 25% | 2.5x |
| Lv5 | 30% | 3.0x |

---

### SHIELD_MASTERY 护盾精通

| 属性 | 值 |
|------|-----|
| **ID** | `SHIELD_MASTERY` |
| **图标** | 🛡️ |
| **类型** | PASSIVE |
| **效果** | 每 10 秒获得一个吸收 1 次伤害的护盾 |

```typescript
effects: {
    shield_interval: { op: 'set', value: 10000 },
    shield_charges: { op: 'set', value: 1 }
}
```

**设计理念**: 
- 周期性免伤，适合高难度生存
- 与低生命角色（WARLOCK 75HP）形成保护组合

**视觉效果**:
- 护盾存在时玩家周围有蓝色光环
- 护盾破碎时有碎片飞散效果

**升级路径建议**:
| 等级 | 冷却时间 | 护盾层数 |
|------|----------|----------|
| Lv1 | 10s | 1 |
| Lv2 | 9s | 1 |
| Lv3 | 8s | 2 |
| Lv4 | 7s | 2 |
| Lv5 | 5s | 3 |

---

### MOMENTUM 动能蓄力

| 属性 | 值 |
|------|-----|
| **ID** | `MOMENTUM` |
| **图标** | 🏃 |
| **类型** | PASSIVE |
| **效果** | 移动时累积动能，静止时释放伤害波 |

```typescript
effects: {
    momentum_maxStacks: { op: 'set', value: 100 },
    momentum_damagePerStack: { op: 'set', value: 0.5 },
    momentum_radius: { op: 'set', value: 150 }
}
```

**机制详解**:
1. 玩家移动时每 100ms 累积 1 层动能（最多 100 层）
2. 玩家停止移动超过 0.5s 时释放动能波
3. 动能波伤害 = 层数 × 0.5（满层 50 伤害）
4. 释放后动能清零

**设计理念**: 
- 鼓励走位风筝打法
- 与 SWIFTNESS 形成移动流派

**视觉效果**:
- 移动时脚下有能量粒子积累
- 释放时向外扩散的蓝色冲击波

---

## ⚡ 主动技能

### BLINK 闪现

| 属性 | 值 |
|------|-----|
| **ID** | `BLINK` |
| **图标** | ✨ |
| **类型** | ACTIVE |
| **冷却** | 5000ms |
| **效果** | 向移动方向瞬移 150px |

```typescript
{
    id: 'BLINK',
    type: 'ACTIVE',
    icon: '✨',
    cooldown: 5000,
    effects: {
        teleport_distance: 150
    }
}
```

**触发条件**: 
- 自动触发：当被敌人包围（周围150px内超过5个敌人）时自动闪现
- 或：绑定快捷键手动触发

**设计理念**: 
- 逃生技能，增加操作上限
- 解决被围困无法脱身的问题

**视觉效果**:
- 闪现起点留下残影
- 闪现终点有光粒子爆发

**升级路径建议**:
| 等级 | 冷却 | 距离 |
|------|------|------|
| Lv1 | 5s | 150px |
| Lv2 | 4.5s | 175px |
| Lv3 | 4s | 200px |
| Lv4 | 3.5s | 225px |
| Lv5 | 3s | 250px |

---

### RAGE_BURST 狂暴爆发

| 属性 | 值 |
|------|-----|
| **ID** | `RAGE_BURST` |
| **图标** | 😡 |
| **类型** | ACTIVE |
| **冷却** | 30000ms |
| **持续** | 5000ms |
| **效果** | 5秒内 +50% 伤害，-30% 受到的治疗 |

```typescript
{
    id: 'RAGE_BURST',
    type: 'ACTIVE',
    icon: '😡',
    cooldown: 30000,
    duration: 5000,
    effects: {
        damageMultiplier: { op: 'multiply', value: 1.5 },
        healingReceived: { op: 'multiply', value: 0.7 }
    }
}
```

**触发条件**: 
- 生命值低于 30% 时自动触发

**设计理念**: 
- 高风险高收益的爆发技能
- 与高伤害武器形成斩杀组合

**视觉效果**:
- 玩家周围红色怒气光环
- 攻击动画加速 + 红色粒子

---

### GUARDIAN_ANGEL 守护天使

| 属性 | 值 |
|------|-----|
| **ID** | `GUARDIAN_ANGEL` |
| **图标** | 👼 |
| **类型** | ACTIVE |
| **冷却** | 120000ms |
| **效果** | 死亡时复活并恢复 50% 生命值 |

```typescript
{
    id: 'GUARDIAN_ANGEL',
    type: 'ACTIVE',
    icon: '👼',
    cooldown: 120000,
    effects: {
        revive_healthPercent: 0.5,
        revive_invincibility: 2000 // 2秒无敌
    }
}
```

**触发条件**: 
- 生命值归零时自动触发（如果不在冷却中）

**设计理念**: 
- 保险技能，允许更激进的打法
- 每局只能触发 1-2 次，不影响挑战性

**视觉效果**:
- 死亡瞬间金色光柱
- 复活后 2 秒内身体半透明 + 金色光环

**升级路径建议**:
| 等级 | 冷却 | 恢复生命 | 无敌时间 |
|------|------|----------|----------|
| Lv1 | 120s | 50% | 2s |
| Lv2 | 100s | 55% | 2.5s |
| Lv3 | 90s | 60% | 3s |
| Lv4 | 75s | 70% | 3.5s |
| Lv5 | 60s | 100% | 4s |

---

## 🔗 技能与进化联动建议

| 新武器进化 | 所需技能 |
|------------|----------|
| POISON_DAGGER → VENOM_FANG | TOUGHNESS |
| CHAIN_BOLT → SHOCK_CHAIN | ELEMENTAL_MASTERY |
| SPIRIT_ORB → PHANTOM_GUARD | (需要新技能) |
| SPIKE_TRAP → FROST_MINE | SWIFTNESS |

建议新增进化配方使用的技能:
- `VAMPIRISM` 可用于毒系T3进化
- `CRITICAL_STRIKE` 可用于链式T3进化
- `MOMENTUM` 可用于召唤系T3进化

---

## 🎨 UI 设计要点

### 技能图标规范
| 技能 | 主色调 | 风格 |
|------|--------|------|
| VAMPIRISM | 暗红色 | 滴血牙齿 |
| GOLDEN_TOUCH | 金色 | 金币堆叠 |
| CRITICAL_STRIKE | 红金色 | 交叉剑 |
| SHIELD_MASTERY | 蓝色 | 骑士盾 |
| MOMENTUM | 天蓝色 | 速度线 |
| BLINK | 紫色 | 星光闪烁 |
| RAGE_BURST | 红色 | 怒火/火焰 |
| GUARDIAN_ANGEL | 金白色 | 天使翅膀 |

### 技能升级界面
- 每个技能最多升级 5 级
- 升级选项显示当前等级效果对比下一级

---

## ✅ 开发 Checklist

- [ ] 实现暴击系统机制 (`Player.ts` / `Combat.ts`)
- [ ] 实现护盾系统机制
- [ ] 实现动能累积系统
- [ ] 实现闪现移动逻辑
- [ ] 实现复活机制
- [ ] 添加技能数据到 `skillData.ts`
- [ ] 添加技能升级到 `skillUpgradeData.ts`
- [ ] 绘制 8 个技能图标
- [ ] 绘制技能激活特效
