# 🌟 Sparkle Survivors

<p align="center">
  <strong>English</strong> | <a href="./README_ZH.md">中文</a>
</p>

> A high-performance Vampire Survivors-like action roguelike game built with React + TypeScript + Vite.

---

## ✨ Features

### Core Gameplay
- 🎮 **Survive the Horde** – Battle endless waves of monsters in a top-down action roguelike
- ⚔️ **27+ Weapons** – From Gatling Guns to Magic Missiles, each with unique mechanics
- 🔮 **16 Skills** – Active and passive abilities to customize your build
- 🧙 **6 Playable Characters** – Each with unique starting weapons and stats
- 🗺️ **2 Unique Maps** – Haunted Forest and Cursed Crypt with distinct enemy spawns

### Advanced Systems
- 💥 **Elemental Reactions** – Chain elemental effects for bonus damage (Overload, Thermal Shock)
- 🏗️ **Evolution System** – Upgrade weapons to their ultimate forms (18 evolution paths)
- 💎 **Meta-Progression** – Permanent upgrades persist across runs (Armory shop)
- 🎁 **Treasure System** – Loot chests, exploration points, and treasure goblins

### Technical Excellence
- ⚡ **High Performance** – Object pooling, spatial hash grid, 60 FPS with 300+ enemies
- 🌍 **Internationalization** – Full English and Chinese localization
- 🎵 **Retro Synth Audio** – Procedurally generated sound effects (Web Audio API)
- 📱 **Mobile Support** – Virtual joystick for touch controls

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/sparkle-survivors.git
cd sparkle-survivors

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The game will be available at `http://localhost:5173`

### Other Commands

```bash
# Run tests
pnpm run test

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

---

## 🏗️ Architecture Overview

Sparkle Survivors uses a **Data-Logic-View (DLV)** three-layer architecture:

```
┌─────────────────────────────────────────────────────┐
│                  🎨 View Layer                      │
│         React Components + HTML5 Canvas             │
├─────────────────────────────────────────────────────┤
│                  ⚙️ Logic Layer                     │
│  Game.ts │ EntityManager │ CollisionSystem │ Spawn  │
├─────────────────────────────────────────────────────┤
│                  📊 Data Layer                      │
│    weaponData │ enemyData │ skillData │ config     │
└─────────────────────────────────────────────────────┘
```

### Key Design Patterns

| Pattern | Purpose | Location |
|:--------|:--------|:---------|
| **Object Pool** | Reduce GC pauses | `EntityManager.ts` |
| **Spatial Hash Grid** | O(1) collision detection | `CollisionSystem.ts` |
| **Event Emitter** | Decouple Logic/UI | `Game.ts → events` |
| **Data-Driven** | "Edit config, not code" | `src/data/` |

---

## 📁 Project Structure

```
src/
├── index.tsx              # Application entry point
├── GameComponent.tsx      # Canvas wrapper + game loop
│
├── components/            # React UI components (21)
├── core/                  # Game engine core (12)
│   ├── Game.ts            # Main game loop
│   ├── EntityManager.ts   # Entity lifecycle
│   └── systems/           # Collision, Spawn, Map
├── entities/              # Game entities (20+)
├── data/                  # Static data configs (15+)
├── utils/                 # Utilities (Vector2D, ObjectPool)
└── styles/                # CSS stylesheets
```

See [FILE_MAP.md](./FILE_MAP.md) for a detailed code mapping.

---

## 📖 Documentation

Detailed reverse-engineering documentation is available in [`docs/reverse-engineering/`](./docs/reverse-engineering/):

| # | Document | Description |
|---|----------|-------------|
| 00 | Architecture Overview | DLV architecture, design patterns |
| 01 | Game Loop | Main update/draw cycle |
| 02 | Entity Management | Object pooling, lifecycle |
| 03 | Collision System | Spatial hash, damage calculation |
| 04 | Spawn System | Enemy waves, event timeline |
| 05 | Weapon Specs | All weapon parameters |
| 06 | Skill Specs | All skill parameters |
| 07 | Enemy Design | Monster types and spawn tables |
| 08 | Evolution Matrix | Weapon evolution paths |

### Architecture Diagrams

Visual Mermaid diagrams are available in [`docs/diagrams/`](./docs/diagrams/):

| # | Diagram | Description |
|---|---------|-------------|
| 01 | System Architecture | DLV three-layer architecture overview |
| 02 | Data Flow | Game loop data flow & event communication |
| 03 | Entity Relationships | Entity class inheritance & composition |
| 04 | Weapon Evolution | 18 weapon evolution paths visualization |
| 05 | Game State Machine | UI/Player/Enemy state transitions |
| 06 | Module Dependencies | src/ directory module dependency map |

## 🎮 Game Content

### Characters

| Character | Starting Weapon | Special Trait |
|:----------|:----------------|:--------------|
| Sparkle Knight | Bullet | Balanced stats |
| Shadow Ninja | Katana | High speed |
| Arcane Mage | Magic Missile | Strong projectiles |
| Sun Priest | Sunfire | Healing abilities |
| Leaf Ranger | Ice Shard | Never misses |
| Moon Warlock | Spirit Orb | Dark void magic |

### Enemy Types

| Monster | HP | Speed | Special |
|:--------|:--:|:-----:|:--------|
| Slime | Low | Slow | Basic enemy |
| Spider | Low | Fast | Swarm behavior |
| Bat | Low | Very Fast | Hard to hit |
| Mushroom | High | Slow | Tanky |
| Ghost | Medium | Medium | Phases through obstacles |
| Golem | Very High | Slow | Elite damage |
| Skeleton | Medium | Medium | Relentless pursuit |
| Treasure Goblin | Low | Fast | Drops gold, runs away! |

---

## 🛠️ Development

### Tech Stack
- **Frontend**: React 18, TypeScript 5, Vite 5
- **Testing**: Vitest with coverage
- **Rendering**: HTML5 Canvas 2D
- **Audio**: Web Audio API (procedural synthesis)
- **Storage**: localStorage for save data

### Running Tests

```bash
# Run all tests in watch mode
pnpm run test

# Run tests once with coverage
pnpm run test:coverage
```

---

## 🚢 Deployment

The project is configured for Vercel deployment:

```bash
# Build and deploy
vercel --prod
```

See `vercel.json` for configuration details.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

<p align="center">
  Made with ⚡ and ❤️
</p>
