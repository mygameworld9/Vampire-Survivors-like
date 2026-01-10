# 📦 模块依赖图

> 本文档展示 src/ 目录的模块间导入依赖关系。

---

## 📐 顶层模块依赖

```mermaid
graph TB
    subgraph Entry["🚀 入口"]
        index["index.tsx"]
        GameComp["GameComponent.tsx"]
    end

    subgraph Core["⚙️ 核心引擎"]
        Game["Game.ts"]
        EM["EntityManager"]
        Camera["Camera"]
        Input["InputHandler"]
        Sound["SoundManager"]
        Particle["ParticleSystem"]
        Progress["ProgressionManager"]
        i18n["i18n"]
    end

    subgraph Systems["🔧 子系统"]
        Collision["CollisionSystem"]
        Spawn["SpawnSystem"]
        MapRender["MapRenderer"]
        Minimap["MinimapRenderer"]
    end

    subgraph Components["🎨 UI组件"]
        HUD["HUD"]
        LevelUp["LevelUpModal"]
        Pause["PauseMenu"]
        GameOver["GameOverScreen"]
        Start["StartScreen"]
        CharSelect["CharacterSelect"]
    end

    index --> GameComp
    GameComp --> Game
    GameComp --> Components

    Game --> EM
    Game --> Camera
    Game --> Input
    Game --> Sound
    Game --> Particle
    Game --> Progress
    Game --> i18n
    Game --> Collision
    Game --> Spawn
    Game --> MapRender

    style Game fill:#3178c6,color:#fff
    style GameComp fill:#61dafb,color:#000
```

---

## 📊 数据层依赖

```mermaid
graph LR
    subgraph DataFiles["📊 数据文件 (src/data/)"]
        weaponData["weaponData.ts"]
        skillData["skillData.ts"]
        enemyData["enemyData.ts"]
        characterData["characterData.ts"]
        upgradeData["upgradeData.ts"]
        skillUpgrade["skillUpgradeData.ts"]
        evolutionData["evolutionData.ts"]
        spawnData["spawnData.ts"]
        mapData["mapData.ts"]
        gameConfig["gameConfig.ts"]
        lootData["lootData.ts"]
        metaUpgrade["metaUpgradeData.ts"]
    end

    subgraph Consumers["消费者"]
        Weapon["Weapon.ts"]
        Skill["Skill.ts"]
        Enemy["Enemy.ts"]
        Player["Player.ts"]
        SpawnSys["SpawnSystem.ts"]
        Game["Game.ts"]
        Progress["ProgressionManager.ts"]
    end

    weaponData --> Weapon
    skillData --> Skill
    enemyData --> Enemy
    characterData --> Player
    upgradeData --> Weapon
    skillUpgrade --> Skill
    evolutionData --> Game
    spawnData --> SpawnSys
    mapData --> Game
    gameConfig --> Game
    lootData --> Game
    metaUpgrade --> Progress
```

---

## 👾 实体层依赖

```mermaid
graph TB
    subgraph Entities["🎮 实体类 (src/entities/)"]
        Player["Player.ts"]
        Enemy["Enemy.ts"]
        Weapon["Weapon.ts"]
        Skill["Skill.ts"]
        
        subgraph Projectiles["弹道族"]
            Proj["Projectile.ts"]
            Boom["BoomerangProjectile"]
            Laser["LaserProjectile"]
            Homing["HomingProjectile"]
            Lightning["LightningProjectile"]
            Slash["SlashProjectile"]
            Chain["ChainProjectile"]
            Orbit["OrbitingProjectile"]
            Trap["TrapProjectile"]
        end
        
        subgraph Items["物品族"]
            XpOrb["XpOrb.ts"]
            Chest["Chest.ts"]
            Item["Item.ts"]
            Prop["Prop.ts"]
        end
        
        subgraph Effects["特效族"]
            Particle["Particle.ts"]
            FloatText["FloatingText.ts"]
            Aura["AuraEffect.ts"]
            Pulse["PulseEffect.ts"]
        end
    end

    subgraph Utils["🔧 工具类"]
        Vector["Vector2D.ts"]
        Pool["ObjectPool.ts"]
        Types["types.ts"]
    end

    Player --> Weapon
    Player --> Skill
    Weapon --> Projectiles
    
    Proj --> Vector
    Enemy --> Vector
    Player --> Vector
    
    Enemy --> Types
    Weapon --> Types
    Skill --> Types

    style Player fill:#4caf50,color:#fff
    style Enemy fill:#f44336,color:#fff
```

---

## 🎨 UI 组件依赖

```mermaid
graph TB
    subgraph Screens["📱 屏幕组件"]
        Start["StartScreen"]
        CharSelect["CharacterSelect"]
        MapSelect["MapSelect"]
        Creative["CreativeSetup"]
        GameOver["GameOverScreen"]
        Armory["Armory"]
        Codex["Codex"]
    end

    subgraph Overlays["🎯 覆盖层组件"]
        HUD["HUD"]
        BossBar["BossBar"]
        LevelUp["LevelUpModal"]
        Pause["PauseMenu"]
        Revive["ReviveModal"]
        Evolution["EvolutionNotification"]
        Treasure["TreasureSequence"]
    end

    subgraph Shared["🔗 共享依赖"]
        i18n["i18n.ts"]
        Types["types.ts"]
        Data["data/*.ts"]
    end

    Start --> i18n
    CharSelect --> characterData
    CharSelect --> i18n
    MapSelect --> mapData
    HUD --> i18n
    LevelUp --> i18n
    LevelUp --> Types

    GameComp["GameComponent"] --> Screens
    GameComp --> Overlays
```

---

## 🔧 工具类依赖

```mermaid
graph LR
    subgraph Utils["🔧 工具类 (src/utils/)"]
        Vector["Vector2D.ts<br/>2D向量运算"]
        Pool["ObjectPool.ts<br/>对象池"]
        Event["EventEmitter.ts<br/>事件系统"]
        Types["types.ts<br/>类型定义"]
    end

    subgraph Dependents["依赖方"]
        Game["Game.ts"]
        EM["EntityManager"]
        Collision["CollisionSystem"]
        AllEntities["所有实体类"]
    end

    Vector --> AllEntities
    Vector --> Collision
    Pool --> EM
    Event --> Game
    Types --> AllEntities
    Types --> Game
```

---

## 📁 目录结构导入热力图

| 目录 | 被导入次数 | 主要消费者 |
|:---|:---:|:---|
| `src/data/` | 🔥🔥🔥 | Game, 所有实体类, UI组件 |
| `src/utils/` | 🔥🔥🔥 | 全项目通用 |
| `src/core/` | 🔥🔥 | GameComponent, 子系统 |
| `src/entities/` | 🔥🔥 | EntityManager, Game |
| `src/components/` | 🔥 | GameComponent |
| `src/core/systems/` | 🔥 | Game |

---

## 🔗 相关文档

- [FILE_MAP.md](../../FILE_MAP.md) - 文件功能映射
- [16-ui-project-structure.md](../reverse-engineering/16-ui-project-structure.md) - 项目结构详解
- [01-system-architecture.md](./01-system-architecture.md) - 系统架构图
