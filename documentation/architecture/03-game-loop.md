# 🔄 Game Loop & Core Systems

> Deep dive into the main game loop, update cycle, and system orchestration.

---

## Main Game Loop

```mermaid
stateDiagram-v2
    direction TB
    
    [*] --> Initialize
    Initialize --> Running
    
    state Running {
        direction LR
        Update --> Draw
        Draw --> Update
    }
    
    Running --> Paused : ESC Key
    Paused --> Running : Resume
    Running --> LevelUp : XP Threshold
    LevelUp --> Running : Select Upgrade
    Running --> ChestOpen : Open Chest
    ChestOpen --> Running : Close
    Running --> GameOver : HP <= 0
    GameOver --> [*]
```

---

## Update Cycle Sequence

```mermaid
sequenceDiagram
    participant RAF as requestAnimationFrame
    participant GC as GameComponent
    participant Game as Game.update()
    participant Player
    participant EM as EntityManager
    participant SS as SpawnSystem
    participant CS as CollisionSystem
    participant PS as ParticleSystem

    RAF->>GC: frame callback
    GC->>GC: Calculate deltaTime
    GC->>Game: update(dt)
    
    activate Game
    Game->>Game: gameTime += dt
    Game->>Player: update(dt, input, enemies)
    Player->>Player: Move based on input
    Player->>Player: Update weapons
    Player-->>Game: Return new projectiles
    
    Game->>SS: update(dt)
    SS->>SS: Check spawn schedule
    SS->>EM: Spawn enemies/items
    
    Game->>EM: update(dt, playerPos)
    EM->>EM: Update all enemies
    EM->>EM: Update all projectiles
    EM->>EM: Cleanup dead entities
    
    Game->>CS: update(dt)
    CS->>CS: Rebuild spatial grid
    CS->>CS: Projectile vs Enemy
    CS->>CS: Enemy vs Player
    CS->>CS: Player vs Pickups
    
    Game->>PS: update(dt)
    deactivate Game
    
    GC->>Game: draw(ctx)
```

---

## Collision System Architecture

```mermaid
graph TB
    subgraph "Spatial Hash Grid"
        direction TB
        Grid["40x40 Grid<br/>100px Cell Size"]
        Rebuild["rebuildGrid()<br/>O(n) per frame"]
        Query["queryGrid()<br/>O(1) lookup"]
    end

    subgraph "Collision Handlers"
        PvE["handleProjectileToEnemy()"]
        PvP["handleProjectileToProp()"]
        EvP["handleEnemyToPlayer()"]
        Pick["handlePickups()"]
    end

    subgraph "Updates"
        Update["update(dt)"]
    end

    Update --> Rebuild
    Rebuild --> Grid
    Query --> PvE
    Query --> PvP
    Query --> EvP
    Query --> Pick

    style Grid fill:#4caf50,color:#fff
    style Query fill:#2196f3,color:#fff
```

---

## Spawn System Timeline

```mermaid
gantt
    title Enemy Spawn Schedule (Forest Map)
    dateFormat X
    axisFormat %s

    section Wave 1
    SLIME low-rate      :0, 30
    
    section Wave 2
    SPIDER joins        :30, 60
    SLIME rate increase :30, 60
    
    section Wave 3
    BAT joins          :60, 120
    
    section Wave 4
    MUSHROOM joins     :120, 180
    
    section Elite Phase
    10% Elite Chance   :300, 600
```

---

## Entity Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pooled : Pre-allocated
    
    Pooled --> Active : pool.get()
    Active --> Active : update() per frame
    Active --> Dying : hp <= 0
    Dying --> Pooled : pool.release()
    
    note right of Active
        Entity is updated,
        rendered, and collides
    end note
    
    note right of Pooled
        Entity is reset,
        waiting for reuse
    end note
```

---

## Data Flow Diagram

```mermaid
flowchart LR
    subgraph Input
        KB[Keyboard]
        Touch[Touch/Joystick]
    end

    subgraph "Game State"
        Player[Player State]
        Entities[Entity Lists]
        Time[Game Timer]
    end

    subgraph Output
        Canvas[Canvas Render]
        UI[React UI]
        Audio[Sound Effects]
    end

    KB --> InputHandler
    Touch --> InputHandler
    InputHandler --> Player
    
    Time --> SpawnSystem
    SpawnSystem --> Entities
    
    Player --> CollisionSystem
    Entities --> CollisionSystem
    CollisionSystem --> Player
    CollisionSystem --> Entities
    
    Player --> Canvas
    Entities --> Canvas
    
    Player --> UI
    Time --> UI
    
    CollisionSystem --> Audio

    style Player fill:#ff9800,color:#000
    style Entities fill:#4caf50,color:#fff
    style CollisionSystem fill:#2196f3,color:#fff
```

---

## Key Performance Metrics

| System | Complexity | Optimization |
|--------|-----------|--------------|
| **Grid Rebuild** | O(n) enemies | Once per frame |
| **Grid Query** | O(1) average | Cell-based lookup |
| **Projectile Update** | O(m) projectiles | Object pooling |
| **Flocking** | O(k) neighbors | Staggered 10-frame cycle |
| **Rendering** | O(n+m) entities | Batched canvas calls |
