# Module: `utils` (Utilities)

This directory contains shared helper code, type definitions, and utility classes that are used across multiple modules of the application. It does not contain any core game logic itself but provides essential tools that support the rest of the codebase.

---

## Utility Files

### `types.ts`
-   **Responsibility:** Provides centralized TypeScript interface and type definitions for the entire project.
-   **Purpose:**
    -   Ensures type safety and consistency. For example, the `IWeaponData` interface guarantees that all weapon configuration objects in `data/weaponData.ts` have the same shape that the `Weapon.ts` entity class expects.
    -   Defines the shape of complex objects used throughout the engine, such as `UpgradeOption`, `UpgradeLevel`, and `IPlayerState`.

### `Vector2D.ts`
-   **Responsibility:** A simple mathematical class for performing 2D vector operations.
-   **Purpose:**
    -   Provides a clean and reusable API for handling position, direction, and velocity.
    -   Includes essential vector methods like `normalize()`, which is crucial for calculating movement direction.
    -   This class is used extensively by nearly all game entities for position and movement calculations.
