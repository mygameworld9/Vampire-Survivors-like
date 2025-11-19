# Module: `data` (Data Layer)

This directory is the **Data** layer of the application. It serves as the single source of truth for all game balance, content, and configuration.

The files here contain pure data objects with **no executable logic**. This separation allows game designers or developers to easily tweak stats, add new content, or rebalance the game without ever touching the core engine or entity behavior code.

---

## Configuration Files

### `playerData.ts`
-   **Purpose:** Defines the base statistics for the player character, including starting HP, speed, size, regeneration, and animation data.

### `enemyData.ts`
-   **Purpose:** A dictionary mapping enemy IDs (e.g., `SLIME`, `GOLEM`) to their base statistics, such as HP, speed, damage, and the type of XP orb they drop.

### `weaponData.ts`
-   **Purpose:** A dictionary defining the *base stats* for every weapon available in the game (damage, cooldown, status effects, etc.).

### `upgradeData.ts`
-   **Purpose:** A dictionary that defines the complete, multi-level **upgrade path** for each weapon.

### `skillData.ts`
-   **Purpose:** A dictionary defining the base stats and effects for every active and passive skill.

### `skillUpgradeData.ts`
-   **Purpose:** A dictionary defining the complete, multi-level upgrade path for each skill.

### `itemData.ts`
-   **Purpose:** Defines properties for consumable items that can be found in the game, such as health potions.

### `xpOrbData.ts`
-   **Purpose:** Defines the different tiers of XP orbs (Small, Medium, Large), specifying their XP value, size, and color.

### `soundData.ts`
-   **Purpose:** A dictionary mapping sound effect keys (e.g., `ENEMY_HIT`) to their corresponding audio file paths in the `/public` directory.

### `gameConfig.ts`
-   **Purpose:** Stores global gameplay rules and configurations.
-   **Content:**
    -   `SPAWN_SCHEDULE`: An array that dictates which enemies spawn and how frequently at different points in the game timer.
    -   `XP_LEVELS`: An array defining the experience points required to advance to each player level.

### `upgradeLoader.ts`
-   **Purpose:** A simple utility that provides clean, unified functions for the game engine to retrieve upgrade data for weapons and skills.
