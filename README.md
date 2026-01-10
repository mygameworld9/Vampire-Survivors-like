# Sparkle Survivors

<div align="center">

![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)
![Vite](https://img.shields.io/badge/Vite-6.0+-purple)
![Version](https://img.shields.io/badge/version-2.0-orange)
[![Twitter](https://img.shields.io/twitter/follow/icebeardsg?style=social)](https://twitter.com/icebeardsg)

**A high-performance, data-driven Vampire Survivors-like roguelite game built with React and HTML5 Canvas.**

[English](./README.md) | [简体中文](./README.zh-CN.md)

</div>

---

## 📖 Overview

**Sparkle Survivors** is a fast-paced survival game where you fight off endless waves of cute but deadly monsters. It features a custom-built game engine that runs on the HTML5 Canvas API, orchestrated by React for the UI layer.

The project demonstrates a strict **Data-Logic-View (DLV)** architecture, making it an excellent template for learning game development with web technologies or extending into a full commercial product.

---

## ✨ v2.0 Highlights

### 🆕 Massive Content Update
- **29 Weapons** — New Poison, Summoning, Chain, and Trap weapon lines
- **15 Skills** — New Vampirism, Critical Strike, Shield Mastery, Momentum, and more
- **18 Evolution Paths** — Recursive evolution system: Tier 1 → Tier 2 → Tier 3 progression
- **6 Characters** — Knight, Rogue, Mage, Cleric, Huntress, Warlock

### ⚔️ New Weapon Systems

| Line | Tier 1 → Tier 2 → Tier 3 | Feature |
|:---|:---|:---|
| **Poison** | Poison Dagger → Venom Fang → Plague Scythe | Stacking DOT, spreads on kill |
| **Summoning** | Spirit Orb → Phantom Guard → Soul Vortex | Orbiting weapons |
| **Chain** | Chain Bolt → Shock Chain → Storm Weaver | Bouncing multi-target attacks |
| **Trap** | Spike Trap → Frost Mine → Void Rift | Area denial deployables |

### 🛡️ New Skill System

| Skill | Type | Effect |
|:---|:---|:---|
| **Vampirism** | Passive | Heal 0.5% max HP on kill |
| **Critical Strike** | Passive | 8% crit chance, 1.8x crit damage |
| **Shield Mastery** | Passive | Gain shield every 10s |
| **Momentum** | Passive | Movement builds damage, up to +50% |
| **Blink** | Active | Teleport to dodge |
| **Rage Burst** | Active | 30s cooldown, massive attack speed boost |
| **Guardian Angel** | Active | Auto-revive on death |

---

## 🎮 Gameplay Guide

**Survive against endless waves of cute but deadly monsters!**

1.  **Auto-Combat** — Your character attacks automatically based on equipped weapons. Your primary job is to **move** and **dodge**.
2.  **Gather XP** — Defeated enemies drop gems. Collect them to fill your XP bar.
3.  **Level Up & Build** — Pick from 3 random upgrades per level. Synergize weapons and skills to evolve ultimate forms.
4.  **Weapon Evolution** — Max-level weapons with matching skills can evolve when opening chests!
5.  **Meta-Progression** — Keep your Gold even after death! Visit the **Armory** for permanent stat upgrades.

---

## 🚀 Quick Start

### Prerequisites
*   **Node.js**: v18.0.0 or higher
*   **pnpm**: Recommended (or npm/yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/sparkle-survivors.git
cd sparkle-survivors

# Install dependencies (pnpm recommended)
pnpm install

# Start development server
pnpm run dev
```

Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
pnpm run build
```

---

## 🎮 Controls

| Key | Action |
|:---|:---|
| `W` `A` `S` `D` / Arrow Keys | Move character |
| `ESC` | Pause game |
| Mouse Click | UI interaction |
| Automatic | Pick up items, open chests, attack |

---

## 🏗️ Architecture

The codebase is organized into three distinct layers:

```
src/
├── data/           # Data Layer — Weapons, enemies, skill configs
├── core/           # Logic Layer — Game engine, physics, collision
├── entities/       # Entity Layer — Player, enemies, projectiles
└── components/     # View Layer — React UI components
```

| Layer | Path | Responsibility |
|:---|:---|:---|
| **Data** | `src/data/` | Pure configuration for weapons/enemies/upgrades |
| **Logic** | `src/core/`, `src/entities/` | Game engine: physics, collisions, state |
| **View** | `src/components/` | React components: HUD, menus, Canvas |

For detailed file mapping, see [FILE_MAP.md](./FILE_MAP.md)

---

## 🛠️ Tech Stack

| Category | Technology |
|:---|:---|
| **Language** | TypeScript |
| **UI Framework** | React 19 |
| **Build Tool** | Vite 6 |
| **Rendering** | HTML5 Canvas 2D |
| **Styling** | CSS Modules |
| **i18n** | Custom i18n system (EN/ZH) |

---

## 📁 Project Structure

```
sparkle-survivors/
├── src/
│   ├── components/     # React UI components
│   ├── core/           # Game engine core
│   ├── data/           # Data configuration files
│   ├── entities/       # Game entities
│   ├── styles/         # CSS styles
│   └── utils/          # Utility functions and types
├── public/
│   └── locales/        # i18n translation files
├── documentation/      # Design documents
└── docs/               # Architecture docs
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details.

**Adding New Content:**
- Weapons: Edit `src/data/weaponData.ts`
- Skills: Edit `src/data/skillData.ts`
- Evolutions: Edit `src/data/evolutionData.ts`
- Enemies: Edit `src/data/enemyData.ts`

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Made with ❤️ and a lot of ☕**

</div>