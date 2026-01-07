---
description: 将数值设计文档转化为 TypeScript 代码实现
---

# /implement-design - 游戏设计代码实现 Workflow (TypeScript)

> 🛠️ 本 Workflow 激活一位 **TypeScript 游戏开发专家**，将数值设计文档转化为**符合项目架构的生产代码**。

## 核心原则

1. **接口优先**: 所有数据必须符合 `src/utils/types.ts` 中定义的接口
2. **DLV 架构**: 遵循 Data-Logic-View 分层，本 Workflow 专注 Data 层
3. **增量修改**: 使用 `replace_file_content` 而非覆盖整个文件
4. **类型安全**: 所有属性必须有明确类型，禁止 `any`

---

## Step 1: 设计文档解析

// turbo
1. 读取用户指定的数值设计文档 (由 `/game-design` workflow 生成)
2. 识别需要实现的数据类型:
   - `CHARACTER` → 修改 `src/data/characterData.ts`
   - `WEAPON` → 修改 `src/data/weaponData.ts`
   - `SKILL` → 修改 `src/data/skillData.ts`
   - `ENEMY` → 修改 `src/data/enemyData.ts`
   - `EVOLUTION` → 修改 `src/data/evolutionData.ts`

---

## Step 2: 类型接口验证

// turbo
1. 读取 `src/utils/types.ts` 获取接口定义
2. 验证设计文档中的数据结构是否符合接口
3. 如有新字段需求，先修改 interface 定义

**关键接口:**

```typescript
// IWeaponData 关键字段
interface IWeaponData {
    id: string;
    nameKey: string;
    icon: string;
    type: 'PROJECTILE' | 'BOOMERANG' | 'AURA' | 'LASER' | 'HOMING_PROJECTILE' | 'LIGHTNING' | 'MELEE';
    damage: number;
    cooldown: number; // ms
    speed: number;
    penetration: number;
    range: number;
    tags: string[];
    fireSound?: string;
    statusEffect?: IStatusEffect;
    firePattern?: string;
}

// ISkillData 关键字段
interface ISkillData {
    id: string;
    nameKey: string;
    type: 'ACTIVE' | 'PASSIVE';
    descriptionKey: string;
    icon: string;
    effects?: { [key: string]: { op: 'add' | 'multiply' | 'set'; value: number } };
    damage?: number;
    cooldown?: number;
    range?: number;
}

// ICharacterData 关键字段
interface ICharacterData {
    id: string;
    nameKey: string;
    descriptionKey: string;
    startingWeaponId: string;
    startingSkillId: string;
    stats: {
        hp?: number;
        speed?: number;
        damageMultiplier?: number;
        hpRegen?: number;
        statusEffectDuration?: number;
    };
}
```

---

## Step 3: 代码生成策略

### 3.1 数据文件修改

使用 **增量插入** 策略，在现有对象末尾添加新条目:

```typescript
// 查找目标文件中的最后一个条目
// 在其后插入新数据，保持格式一致
```

### 3.2 命名规范

| 类型 | ID 格式 | nameKey 格式 |
|------|---------|--------------|
| 武器 | `SCREAMING_CASE` | `weapon.{lowercase}.name` |
| 技能 | `SCREAMING_CASE` | `skill.{lowercase}.name` |
| 角色 | `SCREAMING_CASE` | `character.{lowercase}.name` |
| 敌人 | `SCREAMING_CASE` | `enemy.{lowercase}.name` |

### 3.3 值格式化

- 时间: 整数 ms (如 `cooldown: 1500`)
- 百分比: 小数 (如 `0.10` 表示 10%)
- 乘数: 小数 (如 `1.5` 表示 150%)

---

## Step 4: 实现执行

1. **修改数据文件**:
   - 使用 `replace_file_content` 插入新条目
   - 保持现有代码风格（缩进、逗号等）

2. **添加本地化 Key** (如需要):
   - 修改 `src/locales/en.json`
   - 修改 `src/locales/zh.json`

3. **更新类型定义** (如需要):
   - 修改 `src/utils/types.ts`

---

## Step 5: 验证

// turbo
1. 运行 TypeScript 编译器检查类型错误:
```bash
npx tsc --noEmit
```

2. 检查开发服务器是否正常运行:
```bash
npm run dev
```

---

## 输出示例

新增 VAMPIRISM 技能到 `skillData.ts`:

```typescript
VAMPIRISM: {
    id: 'VAMPIRISM',
    nameKey: 'skill.vampirism.name',
    type: 'PASSIVE',
    descriptionKey: 'skill.vampirism.desc',
    icon: '🧛',
    effects: {
        onKill_healPercent: { op: 'set', value: 0.01 } // 1% max HP on kill
    }
},
```

---

## 约束条件

- ❌ **不修改逻辑层代码** - 仅修改 `src/data/*` 数据文件
- ❌ **不创建新文件** - 仅修改现有文件
- ✅ **必须通过类型检查** - 运行 `npx tsc --noEmit` 验证
- ✅ **保持代码风格一致** - 缩进使用 4 空格，trailing comma
- ✅ **包含注释** - 关键数值需要注释解释设计意图
