# ⚔️ Weapon & Combat System

> Complete reference for the weapon architecture, combat flow, and status effects.

---

## Weapon Type Matrix

```mermaid
mindmap
    root((Weapons))
        Projectile Based
            🔫 BULLET
            🦾 GATLING_GUN
            👹 DOOM_CANNON
        Returning
            🥏 BOOMERANG
            💿 SONIC_DISC
            🌌 VOID_EATER
        Area Effect
            🔥 SUNFIRE
            🌞 SUPERNOVA
            🕳️ BLACK_HOLE
        Instant Hit
            ❄️ ICE_SHARD (Laser)
            ⚡ THUNDER_STAFF (Lightning)
        Seeking
            🔮 MAGIC_MISSILE
        Melee
            🗡️ KATANA
```

---

## Weapon Fire Flow

```mermaid
sequenceDiagram
    participant Player
    participant Weapon
    participant Fire as fire()
    participant Pool as ProjectilePool
    participant EM as EntityManager

    Player->>Weapon: update(dt, enemies)
    Weapon->>Weapon: cooldownTimer += dt
    
    alt cooldownTimer >= cooldown
        Weapon->>Fire: fire(player, enemies)
        
        alt type == PROJECTILE
            Fire->>Pool: pool.get()
            Pool-->>Fire: Projectile
            Fire->>Fire: projectile.reset(pos, velocity)
        else type == BOOMERANG
            Fire->>Pool: boomerangPool.get()
            Fire->>Fire: Set return callback
        else type == AURA
            Fire->>EM: Mark aura active
            Note over Fire: Damage applied via CollisionSystem
        else type == LASER
            Fire->>Pool: laserPool.get()
            Fire->>Fire: Calculate line endpoints
        else type == HOMING
            Fire->>Fire: Find nearest enemy target
            Fire->>Pool: homingPool.get()
        else type == LIGHTNING
            Fire->>Fire: Find random enemy
            Fire->>Pool: lightningPool.get()
        else type == MELEE
            Fire->>Pool: slashPool.get()
        end
        
        Fire-->>Weapon: Projectile[]
        Weapon-->>Player: Add to entity list
    end
```

---

## Weapon Stats Comparison

| Weapon | Type | Damage | Cooldown | Penetration | Special |
|--------|------|--------|----------|-------------|---------|
| 🔫 Bullet | PROJECTILE | 36 | 800ms | 1 | - |
| 🦾 Gatling Gun | PROJECTILE | 40 | 100ms | 2 | Very Fast |
| 👹 Doom Cannon | PROJECTILE | 150 | 80ms | 5 | Extreme |
| 🥏 Boomerang | BOOMERANG | 75 | 3000ms | ∞ | Returns |
| 💿 Sonic Disc | BOOMERANG | 120 | 2000ms | ∞ | Fast Return |
| 🌌 Void Eater | BOOMERANG | 250 | 1500ms | ∞ | Evolved |
| 🔥 Sunfire | AURA | 15/tick | 1000ms | ∞ | Burn |
| 🌞 Supernova | AURA | 30/tick | 500ms | ∞ | Evolved |
| 🕳️ Black Hole | AURA | 100/tick | 250ms | ∞ | 80% Slow |
| ❄️ Ice Shard | LASER | 24 | 1200ms | ∞ | 50% Slow |
| 🔮 Magic Missile | HOMING | 36 | 1500ms | 1 | Auto-aim |
| ⚡ Thunder Staff | LIGHTNING | 50 | 3000ms | 1 | AoE |
| 🗡️ Katana | MELEE | 45 | 1500ms | ∞ | Arc Slash |

---

## Status Effect System

```mermaid
stateDiagram-v2
    [*] --> Normal : Enemy spawns
    
    Normal --> Burning : BURN applied
    Normal --> Slowed : SLOW applied
    
    Burning --> Normal : Duration expires
    Burning --> Burning : Tick damage
    Burning --> Slowed : SLOW applied
    
    Slowed --> Normal : Duration expires
    Slowed --> Burning : BURN applied
    
    state Burning {
        [*] --> ActiveBurn
        ActiveBurn --> ActiveBurn : -N HP/sec
    }
    
    state Slowed {
        [*] --> ReducedSpeed
        ReducedSpeed : speed * magnitude
    }
```

---

## Status Effects Reference

| Effect | Source | Duration | Magnitude | Visual |
|--------|--------|----------|-----------|--------|
| **BURN** | Sunfire, Supernova | 3-4s | 5-20 DPS | Orange tint |
| **SLOW** | Ice Shard, Black Hole | 1-2s | 20-50% speed | Blue tint |

---

## Upgrade Path System

```mermaid
graph TB
    subgraph "Weapon Evolution"
        W1[🔫 Bullet Lv1]
        W5[🔫 Bullet Lv5]
        W9[🔫 Bullet Lv9 MAX]
        
        W1 -->|Level Up| W5
        W5 -->|Level Up| W9
    end

    subgraph "Upgrade Effects"
        Damage["⬆️ +Damage"]
        Cooldown["⬇️ -Cooldown"]
        Penetration["⬆️ +Penetration"]
        Range["⬆️ +Range"]
        Speed["⬆️ +Speed"]
    end

    W5 --> Damage
    W5 --> Cooldown
    W5 --> Penetration
    W5 --> Range
    W5 --> Speed

    style W9 fill:#ffd700,color:#000
```

---

## Combat Damage Flow

```mermaid
flowchart TD
    subgraph "Damage Sources"
        Projectile[Projectile Hit]
        Aura[Aura Tick]
        StatusDot[Status DoT]
        Skill[Skill Effect]
    end

    subgraph "Damage Calculation"
        BaseDmg[Base Damage]
        Modifiers[Player Modifiers]
        FinalDmg[Final Damage]
    end

    subgraph "Target"
        Enemy[Enemy HP]
        Death{HP <= 0?}
        XP[Drop XP Orb]
        Gold[Drop Gold]
    end

    Projectile --> BaseDmg
    Aura --> BaseDmg
    StatusDot --> BaseDmg
    Skill --> BaseDmg

    BaseDmg --> Modifiers
    Modifiers --> FinalDmg
    FinalDmg --> Enemy
    Enemy --> Death
    
    Death -->|Yes| XP
    Death -->|Yes| Gold
    Death -->|No| Enemy

    style FinalDmg fill:#f44336,color:#fff
    style XP fill:#4caf50,color:#fff
    style Gold fill:#ffd700,color:#000
```
