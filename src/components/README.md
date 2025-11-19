# Module: `components` (View Layer)

This directory is the **View** layer of the application, as defined by the Data-Logic-View (DLV) architecture. Its sole responsibility is to render the User Interface (UI) using React.

Components in this module are generally "dumb," meaning they receive data as props and render it without containing complex game logic themselves. They communicate user actions back to the main `GameComponent` via callback functions.

---

## Component Breakdown

### `HUD.tsx`
-   **Responsibility:** Renders the Heads-Up Display, the primary in-game interface.
-   **Displays:** Player HP and XP bars, current level, game timer, and inventory slots for weapons and skills.

### `LevelUpModal.tsx`
-   **Responsibility:** Renders the modal window that appears when the player levels up.
-   **Functionality:** Displays three randomized upgrade options and communicates the player's choice back to the game engine.

### `PauseMenu.tsx`
-   **Responsibility:** Renders the menu that appears when the game is paused.
-   **Functionality:** Provides options to resume, view weapon/skill info, restart the game, or return to the main menu.

### `WeaponsPanel.tsx` & `SkillsPanel.tsx`
-   **Responsibility:** Informational panels accessible from the pause menu.
-   **Functionality:**
    -   `WeaponsPanel`: Displays detailed statistics for all currently equipped weapons.
    -   `SkillsPanel`: Displays detailed information for all acquired active and passive skills.
