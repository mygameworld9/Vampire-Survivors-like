# 🧪 测试模块文档

> 本文档为测试人员提供项目测试架构的完整概览，便于快速上手和维护。

---

## 📌 测试概览

| 维度 | 数据 |
|:---|:---:|
| 测试框架 | **Vitest** |
| 测试文件总数 | 6 |
| 单元测试 | 5 |
| 集成测试 | 1 |
| 总测试用例 | ~65 |

---

## 📁 目录结构

```
tests/
├── setup.ts                    # 全局测试配置
├── __mocks__/                  # Mock 模块
│   ├── localStorage.ts         # localStorage Mock
│   └── SoundManager.ts         # 音效管理器 Mock
├── fixtures/                   # 测试数据夹具
├── core/                       # 核心系统测试
│   └── EntityManager.test.ts   # 实体管理器 (154行)
├── entities/                   # 实体类测试
│   ├── Player.test.ts          # 玩家系统 (325行)
│   ├── Enemy.test.ts           # 敌人系统 (244行)
│   ├── Weapon.test.ts          # 武器系统 (193行)
│   └── IceShard.test.ts        # 冰晶碎片 (162行)
└── integration/                # 集成测试
    └── ProjectileIsolation.test.ts  # 弹道隔离 (176行)
```

---

## 🔧 全局配置 (setup.ts)

### Mock 环境

| Mock 对象 | 说明 |
|:---|:---|
| `localStorage` | 模拟浏览器存储 API |
| `AudioContext` | 模拟 Web Audio API (音效系统) |

### 生命周期钩子

```typescript
beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
});

afterEach(() => {
    vi.restoreAllMocks();
});
```

---

## 📊 测试模块详情

### 1. EntityManager.test.ts (核心系统)

**测试范围**: 实体管理器的生命周期管理

| 测试套件 | 用例数 | 覆盖功能 |
|:---|:---:|:---|
| Initialization | 1 | 初始化空数组 |
| Enemy Management | 2 | 敌人存储与多实体管理 |
| Entity Removal | 6 | `shouldBeRemoved` 标记、Swap-and-Pop 算法 |
| 其他管理 | 5 | XP球/投射物/特效/物品/宝箱 |

**关键验证点**:
- ✅ O(1) 交换删除算法 (同引用验证)
- ✅ 标记清除机制正确性
- ✅ 边界情况处理 (空数组、全删除)

---

### 2. Player.test.ts (玩家系统)

**测试范围**: 玩家实体完整状态机

| 测试套件 | 用例数 | 覆盖功能 |
|:---|:---:|:---|
| Initialization | 2 | 位置初始化、角色属性加载 |
| Movement | 3 | 方向键移动、面向方向更新 |
| Damage & Health | 4 | 受伤、无敌帧、死亡、复活扣除 |
| Healing | 4 | 百分比治疗、上限保护、升级回血 |
| Gold | 1 | 金币倍率计算 |
| Crit System | 1 | 暴击伤害公式 |
| Momentum System | 2 | 层数积累、停止爆发 |
| Vampirism System | 2 | 击杀回血、死亡状态保护 |
| Revive System | 2 | 正常复活、无复活次数处理 |
| Weapon/Skill Management | 4 | 添加武器/技能、检测拥有 |

**关键验证点**:
- ✅ 8方向移动归一化
- ✅ 战斗子系统公式 (暴击/护盾/动量/吸血)
- ✅ 角色属性差异化 (KNIGHT +10% 伤害)

---

### 3. Enemy.test.ts (敌人系统)

**测试范围**: 敌人实体 AI 与状态效果

| 测试套件 | 用例数 | 覆盖功能 |
|:---|:---:|:---|
| Initialization | 4 | 位置、属性加载、精英变体、移除标记 |
| Movement AI | 2 | 追踪玩家、速度差异 |
| Damage & Death | 3 | 伤害计算、死亡标记、HP 下限 |
| Status Effects | 7 | BURN/POISON/STUN/FREEZE 效果应用与持续 |
| Reset | 1 | 对象池复用状态重置 |
| Elite Variants | 3 | HP/伤害倍率、XP球类型 |
| Flee AI | 1 | 哥布林逃跑行为 |

**关键验证点**:
- ✅ 5种状态效果正确应用
- ✅ 眩晕时禁止移动
- ✅ 精英变体属性计算
- ✅ 对象池 `reset()` 方法

---

### 4. Weapon.test.ts (武器系统)

**测试范围**: 武器实体与发射机制

| 测试套件 | 用例数 | 覆盖功能 |
|:---|:---:|:---|
| Initialization | 2 | 属性初始化、类型识别 |
| Cooldown Mechanics | 3 | 首次发射、冷却阻断、冷却恢复 |
| Damage Calculation | 2 | 基础伤害、升级加成 |
| Level Up | 3 | 等级递增、满级检测、描述获取 |
| Projectile Creation | 2 | 投射物生成、音效播放 |
| Weapon Name | 1 | 名称键返回 |
| AURA Type | 1 | 光环武器类型 |
| BOOMERANG Mechanics | 1 | 回旋镖生成 |

**关键验证点**:
- ✅ 冷却机制精确性
- ✅ 升级曲线正确应用
- ✅ 多武器类型 (PROJECTILE/BOOMERANG/AURA)

---

### 5. IceShard.test.ts (冰晶碎片武器)

**测试范围**: LASER 类型武器特化测试

| 覆盖功能 |
|:---|
| 激光即时创建 |
| 多方向发射模式 (forward → all_8) |
| SLOW 状态效果附加 |
| 升级后范围/伤害增长 |

---

### 6. ProjectileIsolation.test.ts (集成测试)

**测试范围**: 弹道与玩家状态隔离

| 测试套件 | 用例数 | 覆盖功能 |
|:---|:---:|:---|
| LASER direction isolation | 3 | 发射后方向不受玩家影响 |
| BOOMERANG state isolation | 1 | 起点位置锁定 |
| Multi-frame simulation | 1 | 60fps 10秒发射模拟 |

**关键验证点**:
- ✅ "Fire and Forget" 原则
- ✅ 方向向量深拷贝
- ✅ 多帧循环方向稳定性

---

## 🚀 运行测试

### 命令

```bash
# 运行所有测试
pnpm run test

# 监听模式
pnpm run test:watch

# 生成覆盖率报告
pnpm run test:coverage

# 运行单个文件
pnpm run test tests/entities/Player.test.ts
```

### 预期输出

```
 ✓ tests/core/EntityManager.test.ts (14 tests)
 ✓ tests/entities/Enemy.test.ts (21 tests)
 ✓ tests/entities/Player.test.ts (25 tests)
 ✓ tests/entities/Weapon.test.ts (15 tests)
 ✓ tests/integration/ProjectileIsolation.test.ts (5 tests)
```

---

## 📝 编写新测试指南

### 1. Mock 依赖

```typescript
import { vi } from 'vitest';
import { mockSoundManager } from '../__mocks__/SoundManager';

// Mock ProgressionManager (元进度系统)
vi.mock('../../src/core/ProgressionManager', () => ({
    progressionManager: {
        getGold: vi.fn(() => 0),
        getPlayerBonuses: vi.fn(() => ({
            damageMultiplier: 0, maxHpAdd: 0, speedMultiplier: 0,
            hpRegenAdd: 0, goldMultiplier: 0, revivesAdd: 0
        }))
    }
}));

// Mock Image (精灵图加载)
vi.stubGlobal('Image', class {
    src = '';
    onload = () => { };
});
```

### 2. 创建测试实体

```typescript
function createEnemy(x = 0, y = 0): Enemy {
    return new Enemy(x, y, ENEMY_DATA.SLIME, 'SLIME', false);
}

function createPlayer(): Player {
    return new Player(0, 0, () => {}, mockSoundManager, 'KNIGHT', () => {});
}
```

### 3. 测试私有方法

```typescript
// 使用 TypeScript 类型断言访问私有方法
(manager as any).removeMarked(manager.enemies);
```

---

## 📊 覆盖率目标

| 模块 | 目标覆盖率 |
|:---|:---:|
| `core/Game.ts` | > 80% |
| `entities/Player.ts` | > 85% |
| `entities/Enemy.ts` | > 80% |
| `entities/Weapon.ts` | > 75% |
| `core/systems/CollisionSystem.ts` | > 70% |

---

## 📝 源代码位置

```
tests/                          # 测试根目录
vitest.config.ts                # Vitest 配置文件
package.json → scripts.test     # 测试脚本定义
```
