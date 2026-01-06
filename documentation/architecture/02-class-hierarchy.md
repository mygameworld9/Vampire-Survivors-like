# 📐 Class Hierarchy & Entity Relationships

> Detailed class structure and inheritance patterns in Sparkle Survivors.

---

## Complete Class Diagram

```mermaid
classDiagram
    direction TB

    class Game {
        +EntityManager entityManager
        +Player player
        +Camera camera
        +ParticleSystem particleSystem
        +SoundManager soundManager
        +CollisionSystem collisionSystem
        +SpawnSystem spawnSystem
        +MapRenderer mapRenderer
        +update(dt: number)
        +draw(ctx: Context2D)
        +generateUpgradeOptions()
    }

    class EntityManager {
        +Enemy[] enemies
        +Projectile[] projectiles
        +XpOrb[] xpOrbs
        +Chest[] chests
        +ObjectPool~Enemy~ enemyPool
        +ObjectPool~Projectile~ projectilePool
        +update(dt, playerPos)
        +draw(ctx)
    }

    class Player {
        +Vector2D pos
        +number hp, maxHp
        +number xp, level
        +Weapon[] weapons
        +Skill[] skills
        +update(dt, input, enemies)
        +takeDamage(amount)
        +gainXp(amount)
        +draw(ctx)
    }

    class Enemy {
        +Vector2D pos
        +number hp, speed, damage
        +boolean isElite
        +StatusEffect[] effects
        +update(dt, playerPos)
        +takeDamage(amount)
        +applyStatusEffect(effect)
        +draw(ctx)
    }

    class Weapon {
        +string id, type
        +number damage, cooldown
        +number level
        +fire(player, enemies): Projectile[]
        +update(dt, player, enemies)
        +levelUp()
    }

    class Projectile {
        +Vector2D pos, velocity
        +number damage, penetration
        +update(dt)
        +draw(ctx)
    }

    class BoomerangProjectile {
        +number phase
        +Vector2D origin
        +onReturn()
    }

    class LaserProjectile {
        +number width
        +Vector2D startPos, endPos
    }

    class HomingProjectile {
        +Enemy target
        +number turnSpeed
    }

    class LightningProjectile {
        +number explosionRadius
        +number chainCount
    }

    class SlashProjectile {
        +number arcAngle
        +boolean isForward
    }

    Game --> EntityManager
    Game --> Player
    Game --> CollisionSystem
    Game --> SpawnSystem

    EntityManager --> Enemy
    EntityManager --> Projectile

    Player --> Weapon
    Player --> Skill

    Weapon ..> Projectile : creates

    Projectile <|-- BoomerangProjectile
    Projectile <|-- LaserProjectile
    Projectile <|-- HomingProjectile
    Projectile <|-- LightningProjectile
    Projectile <|-- SlashProjectile
```

---

## Entity Type Hierarchy

```mermaid
graph LR
    subgraph "Projectile Types"
        Projectile --> BoomerangProjectile
        Projectile --> LaserProjectile
        Projectile --> HomingProjectile
        Projectile --> LightningProjectile
        Projectile --> SlashProjectile
    end

    subgraph "Effect Types"
        AuraEffect
        PulseEffect
    end

    subgraph "Pickup Types"
        XpOrb
        Item
        Chest
    end

    subgraph "Environment"
        Prop
        ExplorationPoint
    end

    style Projectile fill:#3178c6,color:#fff
    style BoomerangProjectile fill:#61dafb,color:#000
    style LaserProjectile fill:#61dafb,color:#000
    style HomingProjectile fill:#61dafb,color:#000
    style LightningProjectile fill:#61dafb,color:#000
    style SlashProjectile fill:#61dafb,color:#000
```

---

## Weapon Type Architecture

```mermaid
graph TB
    subgraph "Weapon Types"
        direction LR
        PROJECTILE["🔫 PROJECTILE<br/>Bullet, Gatling, Doom Cannon"]
        BOOMERANG["🥏 BOOMERANG<br/>Boomerang, Sonic Disc, Void Eater"]
        AURA["🔥 AURA<br/>Sunfire, Supernova, Black Hole"]
        LASER["❄️ LASER<br/>Ice Shard"]
        HOMING["🔮 HOMING<br/>Magic Missile"]
        LIGHTNING["⚡ LIGHTNING<br/>Thunder Staff"]
        MELEE["🗡️ MELEE<br/>Katana"]
    end

    Weapon --> PROJECTILE
    Weapon --> BOOMERANG
    Weapon --> AURA
    Weapon --> LASER
    Weapon --> HOMING
    Weapon --> LIGHTNING
    Weapon --> MELEE

    style Weapon fill:#ff9800,color:#000
```

---

## Object Pool Pattern

```mermaid
classDiagram
    class ObjectPool~T~ {
        -T[] pool
        -Function createFn
        +get(): T
        +release(item: T)
    }

    class EntityManager {
        +ObjectPool~Enemy~ enemyPool
        +ObjectPool~Prop~ propPool
        +ObjectPool~Projectile~ projectilePool
        +ObjectPool~BoomerangProjectile~ boomerangPool
        +ObjectPool~LaserProjectile~ laserPool
        +ObjectPool~HomingProjectile~ homingPool
        +ObjectPool~LightningProjectile~ lightningPool
        +ObjectPool~SlashProjectile~ slashPool
    }

    EntityManager --> ObjectPool
```

---

## Systems Dependency Graph

```mermaid
graph TD
    Game["Game<br/>(Orchestrator)"]
    
    subgraph "Core Systems"
        CS[CollisionSystem]
        SS[SpawnSystem]
        MR[MapRenderer]
        PS[ParticleSystem]
    end

    subgraph "Managers"
        EM[EntityManager]
        SM[SoundManager]
        PM[ProgressionManager]
    end

    Game --> CS
    Game --> SS
    Game --> MR
    Game --> PS
    Game --> EM
    Game --> SM
    Game --> PM

    CS --> EM
    SS --> EM
    MR --> Game

    style Game fill:#3178c6,color:#fff
    style CS fill:#4caf50,color:#fff
    style SS fill:#4caf50,color:#fff
```
