# Module: `core` (Logic Layer - Engine)

This directory forms the heart of the **Logic** layer. It acts as the game engine, orchestrating the state, rules, and flow of the game. It is written in pure, framework-agnostic TypeScript and has no knowledge of React or the DOM.

---

## Core Classes

### `Game.ts`
-   **Responsibility:** The central controller of the entire game simulation. It is the "world" that contains all other entities.
-   **Functionality:**
    -   Manages collections of all active game objects (`enemies`, `projectiles`, `xpOrbs`).
    -   Implements the main `update(dt)` and `draw(ctx)` game loop methods, which are called every frame by `GameComponent`.
    -   Handles all collision detection logic between different entity types.
    -   Controls the enemy spawning system based on a timed schedule from `gameConfig.ts`.
    -   Manages core subsystems like the `ParticleSystem`.
    -   Communicates with the View layer (`GameComponent`) via a callback system (e.g., `onLevelUp`) to trigger UI changes.

### `Camera.ts`
-   **Responsibility:** Manages the game's viewport.
-   **Functionality:**
    -   Tracks the player's position.
    -   Implements a smooth "lerp" (linear interpolation) follow-camera to create a fluid viewing experience.
    -   Applies a `translate` transformation to the canvas rendering context, ensuring the player always remains at the center of the screen.

### `InputHandler.ts`
-   **Responsibility:** Captures and provides access to user keyboard input.
-   **Functionality:**
    -   Attaches global `keydown` and `keyup` event listeners to the window.
    -   Maintains a simple key-state map (e.g., `{ ArrowUp: true, ArrowLeft: false }`).
    -   This object is passed into the `Player.update()` method each frame to determine movement direction.

### `ParticleSystem.ts`
-   **Responsibility:** Manages the entire lifecycle of visual effect particles.
-   **Functionality:**
    -   Provides an `emit()` method to spawn bursts of particles at a specific location.
    -   Updates the position and lifetime of all active particles each frame.
    -   Removes expired particles to maintain performance.

### `SoundManager.ts`
-   **Responsibility:** Handles the loading and playback of all game audio.
-   **Functionality:**
    -   Must be initialized by a user gesture to comply with browser audio policies.
    -   Provides a `playSound()` method to play audio effects by key.
    -   Creates new `Audio` instances for each sound to allow for overlapping playback.
