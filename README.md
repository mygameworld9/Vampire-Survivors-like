# Sparkle Survivors (Codename: Survivor)

<div align="center">

![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)
![Vite](https://img.shields.io/badge/Vite-6.0+-purple)
[![Twitter](https://img.shields.io/twitter/follow/icebeardsg?style=social)](https://twitter.com/icebeardsg)

**A high-performance, data-driven Vampire Survivors-like roguelite game built with React and HTML5 Canvas.**

[English](./README.md) | [简体中文](./README.zh-CN.md)

</div>

## 📖 Overview

**Sparkle Survivors** is a fast-paced survival game where you fight off endless waves of cute but deadly monsters. It features a custom-built game engine that runs on the HTML5 Canvas API, orchestrated by React for the UI layer.

The project demonstrates a strict **Data-Logic-View (DLV)** architecture, making it an excellent template for learning game development with web technologies or extending into a full commercial product.

### ✨ Key Features

*   **Custom Game Engine**: Zero dependency on heavy game libraries (like Phaser). Pure TypeScript physics and rendering logic.
*   **High Performance**: Optimized for 60 FPS using `requestAnimationFrame` and Canvas API.
*   **Data-Driven Design**: Weapons, enemies, and skills are defined in JSON-like objects. Add content without touching code.
*   **Meta-Progression**: Persistent "Armory" system to upgrade stats between runs using gold.
*   **Roguelite Elements**: Random level-ups, varied builds, and procedural enemy waves.
*   **Cute Aesthetic**: Procedurally drawn "Kawaii" style graphics (no external assets required by default).
*   **Localization**: Built-in i18n support (English & Chinese).

---

## 🎮 Gameplay Guide

**Survive against endless waves of cute but deadly monsters!**

1.  **Auto-Combat**: Your character attacks automatically based on your equipped weapons. Your primary job is to **move** and **dodge**.
2.  **Gather XP**: Defeated enemies drop gems. Collect them to fill your XP bar.
3.  **Level Up & Build**: When you level up, pick from 3 random upgrades. Synergize your weapons (offensive) and skills (passive/active) to create broken builds.
4.  **Treasure Chests**: Elite monsters and random drops provide chests containing Gold and major upgrades.
5.  **Meta-Progression**: Even if you die, you keep your Gold! Visit the **Armory** in the main menu to purchase permanent stat boosts like Damage, Speed, and Revival.

---

## 🚀 Quick Start

### Prerequisites
*   **Node.js**: v18.0.0 or higher.
*   **npm**: (Included with Node.js) or yarn/pnpm.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/mygameworld9/Vampire-Survivors-like.git
    cd sparkle-survivors
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start Development Server**
    ```bash
    npm run dev
    ```
    Open your browser and navigate to `http://localhost:3000`.

4.  **Build for Production**
    ```bash
    npm run build
    ```

---

## 🎮 Controls

*   **Movement**: `W`, `A`, `S`, `D` or `Arrow Keys`.
*   **Pause**: `ESC` or click the pause button.
*   **Interactions**: Automatic (picking up items, opening chests).
*   **Combat**: Attacks are automatic based on weapon cooldowns.

---

## 🏗️ Architecture

The codebase is organized into three distinct layers to ensure maintainability:

1.  **Data Layer (`src/data/`)**: Pure configuration. Defines stats for weapons, enemies, and upgrades.
2.  **Logic Layer (`src/core/`, `src/entities/`)**: The game engine. Handles physics, collisions, and state.
3.  **View Layer (`src/components/`)**: The UI. React components that render the HUD, menus, and the Canvas.

For a deep dive, check the [Architecture Documentation](./docs/Architecture.md).

---

## 🛠️ Tech Stack

*   **Language**: TypeScript
*   **UI Framework**: React 19
*   **Build Tool**: Vite
*   **Rendering**: HTML5 Canvas 2D Context
*   **Styling**: CSS Modules / Standard CSS

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details on how to add new weapons, enemies, or characters.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
