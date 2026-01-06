# 👾 Entity & Enemy System

> Complete reference for enemy types, behavior patterns, and entity management.

---

## Enemy Type Gallery

```mermaid
mindmap
    root((Enemy Types))
        Common
            🟢 SLIME
                HP: 30
                Speed: 100
                Damage: 10
            🕷️ SPIDER
                HP: 15
                Speed: 180
                Damage: 8
            🦇 BAT
                HP: 20
                Speed: 150
                Damage: 5
        Mid-tier
            🍄 MUSHROOM
                HP: 60
                Speed: 60
                Damage: 12
            👻 GHOST
                HP: 15
                Speed: 220
                Damage: 4
            💀 SKELETON
                HP: 40
                Speed: 80
                Damage: 15
        Tank
            🗿 GOLEM
                HP: 150
                Speed: 50
                Damage: 25
```

---

## Enemy Behavior FSM

```mermaid
stateDiagram-v2
    [*] --> Idle : Spawn
    Idle --> Chasing : Player in range
    
    state Chasing {
        direction LR
        [*] --> MoveToPlayer
        MoveToPlayer --> ApplySeparation : Check neighbors
        ApplySeparation --> MoveToPlayer
    }
    
    Chasing --> Attacking : Contact with player
    Attacking --> Chasing : Player moves away
    Chasing --> Dying : HP <= 0
    Dying --> [*] : Return to pool
    
    note right of Chasing
        Separation prevents
        enemy overlap
    end note
```

---

## Elite Enemy System

```mermaid
graph TB
    subgraph "Spawn Condition"
        Time["gameTime >= 300s"]
        Chance["10% Random Chance"]
    end

    subgraph "Elite Modifiers"
        HP["HP × 2.0-3.0"]
        Damage["Damage × 1.5-2.0"]
        Size["Size × 1.1-1.3"]
        Speed["Speed × 1.0-1.2"]
        Color["Red Tint"]
    end

    subgraph "Rewards"
        XP2["Medium/Large XP Orb"]
        Gold2["5-40 Gold"]
        Chest["25-75% Chest Drop"]
    end

    Time --> Chance
    Chance -->|Yes| HP
    HP --> Damage
    Damage --> Size
    Size --> Speed
    Speed --> Color
    Color --> XP2
    XP2 --> Gold2
    Gold2 --> Chest

    style Color fill:#ef5350,color:#fff
    style Chest fill:#ffd700,color:#000
```

---

## Enemy Stats Comparison Table

| Enemy | HP | Speed | Damage | XP Type | Gold | Elite Chest% |
|-------|-----|-------|--------|---------|------|--------------|
| 🟢 Slime | 30 | 100 | 10 | SMALL | 1-3 | - |
| 🕷️ Spider | 15 | 180 | 8 | SMALL | 1-3 | - |
| 🦇 Bat | 20 | 150 | 5 | SMALL | 1-2 | - |
| 🍄 Mushroom | 60 | 60 | 12 | MEDIUM | 2-5 | - |
| 👻 Ghost | 15 | 220 | 4 | SMALL | 1-2 | - |
| 💀 Skeleton | 40 | 80 | 15 | SMALL | 2-5 | - |
| 🗿 Golem | 150 | 50 | 25 | MEDIUM | 5-10 | 25% |

---

## Entity Update Flow

```mermaid
sequenceDiagram
    participant EM as EntityManager
    participant Enemy
    participant CS as CollisionSystem
    participant Pool as EnemyPool

    loop Every Frame
        EM->>Enemy: update(dt, playerPos, neighbors)
        
        alt Frame % 10 == Enemy.id % 10
            Enemy->>CS: getNeighbors()
            CS-->>Enemy: neighbors[]
            Enemy->>Enemy: Calculate separation
        end
        
        Enemy->>Enemy: Move toward player
        Enemy->>Enemy: Handle status effects
        Enemy->>Enemy: Update animation
        
        alt enemy.shouldBeRemoved
            EM->>CS: onEnemyDefeated()
            CS->>CS: Spawn XP orbs
            CS->>CS: Spawn gold
            CS->>CS: Maybe spawn chest
            EM->>Pool: release(enemy)
        end
    end
```

---

## Flocking Behavior

```mermaid
flowchart LR
    subgraph "Separation Algorithm"
        Query["Query Grid<br/>radius=50px"]
        Neighbors["Get Neighbors"]
        Calculate["Calculate Separation<br/>Vector"]
        Apply["Apply to Velocity"]
    end

    subgraph "Optimization"
        Stagger["Staggered Updates<br/>10-frame cycle"]
        Cache["Cache Separation<br/>Between Updates"]
    end

    Query --> Neighbors
    Neighbors --> Calculate
    Calculate --> Apply
    
    Stagger --> Cache
    Cache --> Apply

    style Stagger fill:#4caf50,color:#fff
    style Cache fill:#2196f3,color:#fff
```

---

## XP Orb Types

| Type | XP Value | Visual | Source |
|------|----------|--------|--------|
| SMALL | 5 | 💚 Green | Common enemies |
| MEDIUM | 15 | 💙 Blue | Mushroom, Elite basic |
| LARGE | 50 | 💜 Purple | Elite tanks |

---

## Entity Memory Layout

```mermaid
classDiagram
    class Enemy {
        +number id
        +Vector2D pos
        +number hp
        +number maxHp
        +number speed
        +number damage
        +number size
        +string type
        +boolean isElite
        +boolean shouldBeRemoved
        +StatusEffect[] activeEffects
        +Vector2D cachedSeparation
        +number animFrame
        +reset()
        +update()
        +draw()
    }

    class ObjectPool~Enemy~ {
        -Enemy[] available
        -Enemy[] active
        +get(): Enemy
        +release(e: Enemy)
    }

    ObjectPool --> Enemy : manages
```
