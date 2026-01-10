# 🔄 数据流图

> 本文档展示游戏主循环的数据流向和事件通信机制。

---

## 📐 主循环时序图

```mermaid
sequenceDiagram
    participant RAF as requestAnimationFrame
    participant Game as Game.update()
    participant Spawn as SpawnSystem
    participant Player as Player
    participant Entity as EntityManager
    participant Collision as CollisionSystem
    participant Draw as Game.draw()
    participant Events as EventEmitter
    participant React as React UI

    RAF->>Game: dt (帧时间差)
    Game->>Game: gameTime += dt
    
    Note over Game: 1. 更新阶段
    Game->>Spawn: update(dt) → 刷怪
    Spawn-->>Entity: 新敌人加入池
    
    Game->>Player: update(dt) → 移动/攻击
    Player-->>Entity: 新投射物加入池
    
    Game->>Entity: update(dt) → 更新所有实体
    Game->>Collision: update(dt) → 碰撞检测
    Collision-->>Player: 敌人伤害/拾取物
    Collision-->>Entity: 标记死亡实体
    
    Note over Game: 2. 渲染阶段
    Game->>Draw: 渲染画面
    
    Note over Game: 3. UI 通信
    Game->>Events: emit('player-update', stats)
    Events->>React: 触发状态更新
    
    Draw-->>RAF: 请求下一帧
```

---

## 🔄 Update 阶段详细流程

```mermaid
flowchart TB
    A["update(dt)"] --> B["gameTime += dt"]
    B --> C["soundManager.setBGMIntensity()"]
    C --> D["SpawnSystem.update()"]
    
    D --> E["Player.update()"]
    E --> F{"返回数据"}
    F --> G["projectiles[]"]
    F --> H["skillEffects[]"]
    F --> I["momentumBlast?"]
    
    G --> J["EntityManager.projectiles.push()"]
    H --> K["CollisionSystem.handleSkillEffect()"]
    I --> L["CollisionSystem.applyAreaDamage()"]
    
    J --> M["Camera.update()"]
    K --> M
    L --> M
    
    M --> N["EntityManager.update()"]
    N --> O["ParticleSystem.update()"]
    O --> P["CollisionSystem.update()"]
    
    P --> Q{"activeBosses.length > 0?"}
    Q -->|是| R["emit('boss-update', {...})"]
    Q -->|否| S["emit('boss-update', null)"]
    
    R --> T["emit('player-update', stats)"]
    S --> T

    style A fill:#3178c6,color:#fff
    style T fill:#61dafb,color:#000
```

---

## 📡 事件通信机制

```mermaid
graph LR
    subgraph GameLogic["⚙️ 游戏逻辑层"]
        Game["Game.ts"]
        Player["Player.ts"]
        Collision["CollisionSystem.ts"]
    end

    subgraph EventBus["📡 事件总线"]
        Events["EventEmitter"]
    end

    subgraph ReactUI["🎨 React UI 层"]
        HUD["HUD.tsx"]
        BossBar["BossBar.tsx"]
        LevelUp["LevelUpModal.tsx"]
    end

    Game -->|"player-update"| Events
    Game -->|"boss-update"| Events
    Game -->|"level-up"| Events
    Game -->|"evolution"| Events

    Events -->|"useEffect 订阅"| HUD
    Events -->|"useEffect 订阅"| BossBar
    Events -->|"回调触发"| LevelUp

    style Events fill:#ffeb3b,color:#000
```

---

## 🎯 事件类型清单

| 事件名 | 触发时机 | 数据结构 | 订阅者 |
|:---|:---|:---|:---|
| `player-update` | 玩家状态变化 | `{ hp, maxHp, xp, level, gold, ... }` | HUD |
| `boss-update` | Boss状态变化 | `{ id, name, hp, maxHp }` / `null` | BossBar |
| `level-up` | 玩家升级 | `upgradeOptions[]` | LevelUpModal |
| `evolution` | 武器进化 | `{ weaponId, evolvedId }` | EvolutionNotification |

---

## 📦 实体数据流

```mermaid
flowchart LR
    subgraph Input["输入源"]
        Keyboard["键盘 WASD"]
        Joystick["虚拟摇杆"]
    end

    subgraph Processing["处理层"]
        InputHandler["InputHandler"]
        Player["Player"]
        Weapon["Weapon[]"]
    end

    subgraph Output["输出"]
        Movement["玩家移动"]
        Projectiles["投射物生成"]
        SkillFX["技能效果"]
    end

    Keyboard --> InputHandler
    Joystick --> InputHandler
    InputHandler --> Player
    Player --> Movement
    Player --> Weapon
    Weapon --> Projectiles
    Player --> SkillFX
```

---

## 🔗 碰撞数据流

```mermaid
flowchart TB
    subgraph Rebuild["每帧重建"]
        Grid["空间哈希网格<br/>40×40 = 1600格"]
        Enemies["敌人列表"]
    end

    Enemies -->|"按位置分配"| Grid

    subgraph Query["碰撞查询"]
        Proj["投射物位置"]
        QueryResult["相邻格敌人"]
    end

    Grid -->|"O(1)查询"| QueryResult
    Proj --> QueryResult

    subgraph Resolve["碰撞处理"]
        Distance["距离计算"]
        Damage["伤害应用"]
        Status["状态效果"]
        Death["死亡检查"]
    end

    QueryResult --> Distance
    Distance -->|"< hitRadius"| Damage
    Damage --> Status
    Status --> Death

    style Grid fill:#ffccbc
```

---

## 🔗 相关文档

- [01-game-loop.md](../reverse-engineering/01-game-loop.md) - 主循环详细分析
- [03-collision-system.md](../reverse-engineering/03-collision-system.md) - 碰撞系统深入
- [15-core-subsystems.md](../reverse-engineering/15-core-subsystems.md) - 子系统技术细节
