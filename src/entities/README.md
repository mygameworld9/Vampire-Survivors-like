# Module: `entities` (Logic Layer - Game Objects)

This directory is a core part of the **Logic** layer. It contains the class definitions for all the individual "actors" or objects that exist and interact within the game world.

Each entity is responsible for its own state, behavior, and appearance. They follow a standard pattern:
-   A `constructor` to initialize state, often from a corresponding configuration object in the `../data` directory.
-   An `update(dt)` method that defines its logic for a single frame (e.g., movement, AI, timers).
-   A `draw(ctx)` method that handles rendering itself onto the HTML5 canvas.

---

## Entity Breakdown

### `Player.ts`
-   **Responsibility:** Represents the player character.
-   **Functionality:** Manages player state (HP, XP, position, stats), handles movement based on input, and owns the arrays of `Weapon` and `Skill` instances. Implements an 8-directional sprite animation system.

### `Weapon.ts`
-   **Responsibility:** Manages the logic for an equippable weapon.
-   **Functionality:** Tracks its own stats and level, manages its firing cooldown, and is responsible for creating projectiles. Contains the `levelUp()` method which applies the next upgrade from `upgradeData.ts`.

### `Skill.ts`
-   **Responsibility:** Represents an active or passive skill.
-   **Functionality:** Manages its own stats and level. Active skills handle their own cooldowns to create `SkillEffect` objects. Passive skills apply their effects directly to the player upon acquisition or level-up.

### `Enemy.ts`
-   **Responsibility:** A blueprint for hostile creatures.
-   **Functionality:** Manages its state (HP, position) and implements the core AI behavior: move directly towards the player. It also manages any active status effects applied to it.

### Projectiles (`Projectile.ts`, `BoomerangProjectile.ts`, `LaserProjectile.ts`)
-   **Responsibility:** Represent projectiles fired from weapons.
-   **Functionality:** These are self-contained objects that manage their own movement, collision logic (penetration), and lifetime.

### `XpOrb.ts`
-   **Responsibility:** Represents an experience point gem dropped by enemies. It is a static object until collected. It can be one of several tiers (Small, Medium, Large) with different values.

### `Item.ts`
-   **Responsibility:** Represents a collectible, consumable item on the ground, like a health potion.

### Visual Effects (`AuraEffect.ts`, `PulseEffect.ts`, `Particle.ts`)
-   **Responsibility:** These are purely visual entities.
-   **Functionality:**
    -   `AuraEffect` & `PulseEffect`: Render an expanding ring to visualize an area-of-effect attack.
    -   `Particle`: Represents a single, short-lived particle for effects like impacts or deaths. Managed by the `ParticleSystem`.
