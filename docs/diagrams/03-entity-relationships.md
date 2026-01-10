# 🔗 实体关系图

> 本文档展示游戏中所有实体类的继承关系和组合关系。

---

## 📐 投射物类继承体系

```mermaid
classDiagram
    class Projectile {
        +Vector2D pos
        +Vector2D velocity
        +number damage
        +number penetration
        +number range
        +boolean shouldBeRemoved
        +update(dt) void
        +draw(ctx) void
        +reset(...) void
    }

    class BoomerangProjectile {
        +Vector2D startPos
        +boolean returning
        +update(dt) void
    }

    class LaserProjectile {
        +number width
        +number duration
        +Vector2D direction
        +draw(ctx) void
    }

    class HomingProjectile {
        +Enemy target
        +number turnSpeed
        +findTarget() Enemy
    }

    class LightningProjectile {
        +Enemy[] targets
        +number arcCount
        +instantHit() void
    }

    class SlashProjectile {
        +number arcAngle
        +number arcRadius
        +drawArc(ctx) void
    }

    class ChainProjectile {
        +number bounceCount
        +number bounceRange
        +Set~Enemy~ hitEnemies
        +findNextTarget() Enemy
    }

    class OrbitingProjectile {
        +number orbitRadius
        +number rotationSpeed
        +number angle
        +updateOrbit(dt) void
    }

    class TrapProjectile {
        +number triggerRadius
        +boolean triggered
        +checkTrigger(enemies) void
        +explode() void
    }

    Projectile <|-- BoomerangProjectile
    Projectile <|-- LaserProjectile
    Projectile <|-- HomingProjectile
    Projectile <|-- LightningProjectile
    Projectile <|-- SlashProjectile
    Projectile <|-- ChainProjectile
    Projectile <|-- OrbitingProjectile
    Projectile <|-- TrapProjectile
```

---

## 👾 核心实体类图

```mermaid
classDiagram
    class Player {
        +Vector2D pos
        +number hp
        +number maxHp
        +number speed
        +Weapon[] weapons
        +Skill[] skills
        +update(dt, input) UpdateResult
        +takeDamage(amount) void
        +heal(amount) void
        +addWeapon(data) void
        +addSkill(data) void
    }

    class Enemy {
        +Vector2D pos
        +number hp
        +number speed
        +number damage
        +boolean isElite
        +IStatusEffect[] effects
        +update(dt, playerPos) void
        +takeDamage(amount) void
        +applyStatusEffect(effect) void
        +reset(x, y, data) void
    }

    class Weapon {
        +string id
        +number damage
        +number cooldown
        +number level
        +number maxLevel
        +update(dt, playerPos, enemies) Projectile[]
        +levelUp() void
        +canFire() boolean
    }

    class Skill {
        +string id
        +SkillType type
        +number level
        +number cooldown
        +activate(player) SkillEffect
        +applyPassive(player) void
    }

    Player "1" *-- "0..6" Weapon : 携带
    Player "1" *-- "0..6" Skill : 拥有
    Weapon "1" --> "*" Projectile : 生成
    Enemy "1" --> "*" IStatusEffect : 拥有
```

---

## 📦 实体管理器组成

```mermaid
classDiagram
    class EntityManager {
        +Enemy[] enemies
        +Prop[] props
        +AnyProjectile[] projectiles
        +XpOrb[] xpOrbs
        +Effect[] effects
        +Item[] items
        +Chest[] chests
        +ExplorationPoint[] explorationPoints
        +FloatingText[] floatingTexts
        +ObjectPool~Enemy~ enemyPool
        +ObjectPool~Prop~ propPool
        +ProjectilePools projectilePools
        +update(dt, playerPos, collision) void
        +draw(ctx) void
    }

    class ObjectPool~T~ {
        -T[] inactive
        -Function factory
        +get() T
        +release(obj) void
    }

    class ProjectilePools {
        +ObjectPool~Projectile~ projectile
        +ObjectPool~BoomerangProjectile~ boomerang
        +ObjectPool~LaserProjectile~ laser
        +ObjectPool~HomingProjectile~ homing
        +ObjectPool~LightningProjectile~ lightning
        +ObjectPool~SlashProjectile~ slash
    }

    EntityManager *-- ObjectPool : 使用
    EntityManager *-- ProjectilePools : 包含
```

---

## 🎮 辅助实体类

```mermaid
classDiagram
    class XpOrb {
        +Vector2D pos
        +number value
        +number size
        +string color
        +boolean absorbed
        +update(dt, playerPos) void
    }

    class Chest {
        +Vector2D pos
        +boolean opened
        +number animFrame
        +open() LootResult
    }

    class Item {
        +Vector2D pos
        +string type
        +number value
        +apply(player) void
    }

    class Prop {
        +Vector2D pos
        +number hp
        +takeDamage(amount) void
        +drop() Item[]
    }

    class ExplorationPoint {
        +Vector2D pos
        +boolean collected
        +collect(player) void
    }

    class FloatingText {
        +Vector2D pos
        +string text
        +string color
        +number lifetime
        +update(dt) void
    }

    class Particle {
        +Vector2D pos
        +Vector2D velocity
        +number lifetime
        +string color
        +update(dt) void
    }

    class AuraEffect {
        +Vector2D pos
        +number radius
        +number alpha
        +draw(ctx) void
    }

    class PulseEffect {
        +Vector2D pos
        +number maxRadius
        +number currentRadius
        +update(dt) void
    }
```

---

## 🔗 类型接口关系

```mermaid
classDiagram
    class IWeaponData {
        <<interface>>
        +string id
        +string nameKey
        +WeaponType type
        +number damage
        +number cooldown
        +IWeaponStatusEffect statusEffect
        +WeaponTag[] tags
    }

    class IEnemyData {
        <<interface>>
        +string nameKey
        +number hp
        +number speed
        +number damage
        +EnemyAIBehavior aiBehavior
        +IEliteConfig elite
    }

    class ISkillData {
        <<interface>>
        +string id
        +SkillType type
        +number damage
        +number cooldown
        +SkillEffects effects
    }

    class IStatusEffect {
        <<interface>>
        +StatusEffectType type
        +number duration
        +number magnitude
        +number timer
    }

    Weapon ..|> IWeaponData : 实现
    Enemy ..|> IEnemyData : 实现
    Skill ..|> ISkillData : 实现
```

---

## 🔗 相关文档

- [02-entity-management.md](../reverse-engineering/02-entity-management.md) - 实体管理详解
- [14-type-system.md](../reverse-engineering/14-type-system.md) - 类型系统定义
- [16-ui-project-structure.md](../reverse-engineering/16-ui-project-structure.md) - 项目结构概览
