# 🏗️ 系统架构总图

> 本文档展示 Sparkle Survivors 的 Data-Logic-View (DLV) 三层架构设计。

---

## 📐 DLV 三层架构全景

```mermaid
graph TB
    subgraph VIEW["🎨 视图层 (View)"]
        direction TB
        React["React 组件<br/>HUD / 菜单 / 弹窗"]
        Canvas["HTML5 Canvas<br/>游戏画面渲染"]
    end

    subgraph LOGIC["⚙️ 逻辑层 (Logic)"]
        direction TB
        Game["Game.ts<br/>游戏主控制器"]
        
        subgraph Systems["核心子系统"]
            EntityMgr["EntityManager<br/>实体池管理"]
            Collision["CollisionSystem<br/>空间哈希碰撞"]
            Spawn["SpawnSystem<br/>刷怪系统"]
            Map["MapRenderer<br/>地图渲染"]
        end
        
        subgraph Entities["游戏实体"]
            Player["Player<br/>玩家状态机"]
            Enemy["Enemy<br/>敌人AI"]
            Weapon["Weapon<br/>武器控制器"]
            Projectile["Projectile<br/>弹道族"]
        end
    end

    subgraph DATA["📊 数据层 (Data)"]
        direction TB
        WeaponData["weaponData.ts<br/>27种武器配置"]
        EnemyData["enemyData.ts<br/>8种怪物配置"]
        SkillData["skillData.ts<br/>16种技能配置"]
        SpawnData["spawnData.ts<br/>刷怪时间表"]
        UpgradeData["upgradeData.ts<br/>升级曲线"]
    end

    %% 数据流向
    WeaponData --> Game
    EnemyData --> Game
    SkillData --> Game
    SpawnData --> Spawn
    UpgradeData --> Weapon

    Game --> EntityMgr
    Game --> Collision
    Game --> Spawn
    Game --> Map

    EntityMgr --> Player
    EntityMgr --> Enemy
    EntityMgr --> Projectile
    Player --> Weapon

    Game --> React
    Game --> Canvas

    %% 样式
    style Game fill:#3178c6,color:#fff
    style React fill:#61dafb,color:#000
    style Canvas fill:#f0db4f,color:#000
    style VIEW fill:#e3f2fd,stroke:#1976d2
    style LOGIC fill:#fff3e0,stroke:#f57c00
    style DATA fill:#e8f5e9,stroke:#388e3c
```

---

## 🔗 核心类依赖关系

```mermaid
graph LR
    subgraph Entry["入口层"]
        index["index.tsx"]
        GC["GameComponent.tsx"]
    end

    subgraph Core["引擎核心 (src/core/)"]
        Game["Game.ts"]
        EM["EntityManager.ts"]
        Camera["Camera.ts"]
        Input["InputHandler.ts"]
        Sound["SoundManager.ts"]
        Particle["ParticleSystem.ts"]
        Progress["ProgressionManager.ts"]
        i18n["i18n.ts"]
    end

    subgraph Systems["子系统 (src/core/systems/)"]
        CS["CollisionSystem.ts"]
        SS["SpawnSystem.ts"]
        MR["MapRenderer.ts"]
    end

    subgraph Utils["工具类 (src/utils/)"]
        Vector["Vector2D.ts"]
        Pool["ObjectPool.ts"]
        Event["EventEmitter.ts"]
        Types["types.ts"]
    end

    index --> GC
    GC --> Game
    Game --> EM
    Game --> Camera
    Game --> Input
    Game --> Sound
    Game --> Particle
    Game --> Progress
    Game --> i18n
    Game --> CS
    Game --> SS
    Game --> MR

    EM --> Pool
    CS --> Vector
    Game --> Event
    Game --> Types

    style Game fill:#3178c6,color:#fff
    style GC fill:#61dafb,color:#000
```

---

## 📁 目录层级映射

| 层级 | 目录 | 职责 | 文件数 |
|:---|:---|:---|:---:|
| **数据层** | `src/data/` | 纯配置，不含逻辑 | 15+ |
| **逻辑层** | `src/core/` | 游戏引擎核心 | 12 |
| **逻辑层** | `src/core/systems/` | 碰撞/刷怪/地图 | 4 |
| **逻辑层** | `src/entities/` | 游戏对象行为 | 20+ |
| **视图层** | `src/components/` | React UI 组件 | 21 |
| **工具层** | `src/utils/` | 通用工具 | 4 |

---

## 🔑 核心设计模式

```mermaid
graph TB
    subgraph Patterns["设计模式"]
        OP["🔄 对象池<br/>ObjectPool"]
        SH["📍 空间哈希<br/>SpatialHashGrid"]
        EE["📡 事件发射器<br/>EventEmitter"]
        DD["📊 数据驱动<br/>Data-Driven"]
    end

    subgraph Benefits["解决问题"]
        GC["减少GC卡顿"]
        O1["O(1)碰撞检测"]
        Decouple["逻辑/UI解耦"]
        NoCode["改配置不改代码"]
    end

    OP --> GC
    SH --> O1
    EE --> Decouple
    DD --> NoCode

    style OP fill:#e1bee7
    style SH fill:#ffccbc
    style EE fill:#b3e5fc
    style DD fill:#c8e6c9
```

---

## 🔗 相关文档

- [00-architecture-overview.md](../reverse-engineering/00-architecture-overview.md) - 架构详细分析
- [01-game-loop.md](../reverse-engineering/01-game-loop.md) - 主循环深入
- [15-core-subsystems.md](../reverse-engineering/15-core-subsystems.md) - 子系统技术细节
