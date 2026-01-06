# 🖥️ UI Components & Game Flow

> React component architecture and user interface flow.

---

## Screen Flow State Machine

```mermaid
stateDiagram-v2
    [*] --> StartScreen
    
    StartScreen --> CharacterSelect : "Play"
    StartScreen --> Armory : "Armory"
    StartScreen --> Codex : "Codex"
    
    CharacterSelect --> MapSelect : Select Hero
    MapSelect --> CreativeSetup : Hold Creative
    MapSelect --> InGame : Select Map
    CreativeSetup --> InGame : Start
    
    Armory --> StartScreen : Back
    Codex --> StartScreen : Back
    
    state InGame {
        [*] --> Playing
        Playing --> Paused : ESC
        Playing --> LevelUp : XP Full
        Playing --> ChestOpen : Open Chest
        Playing --> ReviveModal : HP <= 0
        
        Paused --> Playing : Resume
        Paused --> StartScreen : Quit
        
        LevelUp --> Playing : Select Upgrade
        ChestOpen --> Playing : Close
        
        ReviveModal --> Playing : Use Revive
        ReviveModal --> GameOver : No Revives
    }
    
    InGame --> GameOver : Game Ends
    GameOver --> StartScreen : Return
```

---

## Component Hierarchy

```mermaid
graph TD
    App[App / GameComponent]
    
    subgraph "Menu Screens"
        Start[StartScreen]
        CharSel[CharacterSelect]
        MapSel[MapSelect]
        Creative[CreativeSetup]
        Arm[Armory]
        Codex[Codex]
    end

    subgraph "In-Game Overlays"
        HUD[HUD]
        LvlUp[LevelUpModal]
        Pause[PauseMenu]
        Revive[ReviveModal]
        Treasure[TreasureSequence]
        Boss[BossBar]
    end

    subgraph "HUD Components"
        HP[Health Bar]
        XP[XP Bar]
        Time[Timer]
        Weapons[WeaponsPanel]
        Skills[SkillsPanel]
        Minimap[Minimap]
    end

    App --> Start
    App --> CharSel
    App --> MapSel
    App --> Creative
    App --> Arm
    App --> Codex
    App --> HUD
    App --> LvlUp
    App --> Pause
    App --> Revive
    App --> Treasure
    App --> Boss

    HUD --> HP
    HUD --> XP
    HUD --> Time
    HUD --> Weapons
    HUD --> Skills
    HUD --> Minimap

    style App fill:#61dafb,color:#000
    style HUD fill:#4caf50,color:#fff
```

---

## Level Up Modal Flow

```mermaid
sequenceDiagram
    participant Player
    participant Game
    participant GC as GameComponent
    participant Modal as LevelUpModal

    Player->>Player: gainXp(amount)
    Player->>Player: Check level threshold
    
    alt Level Up Triggered
        Player->>Game: events.emit('levelUp')
        Game->>GC: onLevelUp callback
        GC->>GC: pauseGame()
        GC->>Game: generateUpgradeOptions()
        Game-->>GC: UpgradeOption[3]
        GC->>Modal: show options
        
        Modal->>Modal: User selects option
        Modal->>GC: onSelectUpgrade(option)
        
        alt Weapon Upgrade
            GC->>Game: player.weapons[id].levelUp()
        else New Weapon
            GC->>Game: player.addWeapon(id)
        else Skill Upgrade
            GC->>Game: player.skills[id].levelUp()
        else New Skill
            GC->>Game: player.addSkill(id)
        end
        
        GC->>GC: resumeGame()
    end
```

---

## Component Props Reference

| Component | Key Props | State Managed |
|-----------|-----------|---------------|
| `HUD` | `playerState`, `gameTime` | None (stateless) |
| `LevelUpModal` | `options[]`, `rerolls`, `onSelect` | Hover state |
| `CharacterSelect` | `characters[]`, `onSelect` | Selected hero |
| `Armory` | `upgrades[]`, `gold`, `onPurchase` | Purchase status |
| `PauseMenu` | `onResume`, `onQuit` | None |
| `GameOverScreen` | `stats`, `gold`, `onReturn` | None |

---

## State Management Flow

```mermaid
flowchart TD
    subgraph "Game Engine State"
        GameState["Game Instance<br/>player, entities, systems"]
    end

    subgraph "React State (GameComponent)"
        Phase["gamePhase<br/>(menu/playing/paused)"]
        PlayerUI["playerState<br/>(hp, xp, level)"]
        Modal["modalState<br/>(levelUp, chest, revive)"]
        Gold["goldCount"]
    end

    subgraph "Callbacks (Engine → React)"
        OnLevelUp["onLevelUp()"]
        OnChest["onChestOpen()"]
        OnEvolve["onEvolution()"]
        OnDeath["onPlayerDeath()"]
    end

    GameState --> OnLevelUp
    GameState --> OnChest
    GameState --> OnEvolve
    GameState --> OnDeath

    OnLevelUp --> Modal
    OnChest --> Modal
    OnEvolve --> Modal
    OnDeath --> Modal

    GameState -.-> |"per frame"| PlayerUI

    style GameState fill:#3178c6,color:#fff
    style Phase fill:#61dafb,color:#000
```

---

## Styling Architecture

```
src/styles/
├── base.css          # Reset, variables, canvas
├── buttons.css       # Jelly/Capsule button styles
├── startScreen.css   # Candy Pop theme
├── gameOver.css      # Death screen
├── hud.css           # In-game overlay
├── menus.css         # Card containers
├── components.css    # Special components
└── animations.css    # @keyframes definitions
```

### CSS Variable Tokens

```css
/* Example from base.css */
:root {
  --color-primary: #ff6b6b;
  --color-secondary: #4ecdc4;
  --color-gold: #ffd700;
  --color-danger: #ff4757;
  --font-game: 'Nunito', sans-serif;
  --transition-fast: 0.15s ease;
}
```
