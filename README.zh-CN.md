# 闪耀幸存者 (Sparkle Survivors)

<div align="center">

![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)
![Vite](https://img.shields.io/badge/Vite-6.0+-purple)
[![Twitter](https://img.shields.io/twitter/follow/icebeardsg?style=social)](https://twitter.com/icebeardsg)

**一款使用 React 和 HTML5 Canvas 构建的高性能、数据驱动的类吸血鬼幸存者 Roguelike 游戏。**

[English](./README.md) | [简体中文](./README.zh-CN.md)

</div>

## 📖 概述

**闪耀幸存者 (Sparkle Survivors)** 是一款快节奏的生存游戏，你需要击退一波又一波可爱但致命的怪物。它拥有一个基于 HTML5 Canvas API 构建的自定义游戏引擎，并由 React 负责 UI 层。

该项目展示了严格的 **数据-逻辑-视图 (DLV)** 架构，使其成为学习 Web 游戏开发或扩展为完整商业产品的绝佳模板。

### ✨ 核心特性

*   **自定义游戏引擎**: 零依赖重型游戏库（如 Phaser）。纯 TypeScript 编写的物理和渲染逻辑。
*   **高性能**: 使用 `requestAnimationFrame` 和 Canvas API 针对 60 FPS 进行了优化。
*   **数据驱动设计**: 武器、敌人和技能均定义在 JSON 格式的对象中。无需修改代码即可添加内容。
*   **元进程 (Meta-Progression)**: 持久的“军械库”系统，使用金币在游戏局外升级属性。
*   **Roguelike 元素**: 随机升级、多样的构筑 (Build) 和程序化的敌人波次。
*   **可爱画风**: 程序化生成的“卡哇伊”风格图形（默认不需要外部素材）。
*   **多语言支持**: 内置 i18n 支持（英语和中文）。

---

## 🎮 玩法介绍

**在无尽的呆萌怪物潮中生存下来！**

1.  **自动战斗**: 角色会根据装备的武器自动攻击。你的主要任务是**走位**和**躲避**。
2.  **收集经验**: 击败敌人会掉落宝石。收集它们来填充你的经验条。
3.  **升级构筑**: 升级时，从3个随机选项中选择。通过组合不同的武器（攻击）和技能（被动/辅助），打造强力的流派。
4.  **宝箱奖励**: 精英怪物和随机掉落会提供宝箱，开启可获得大量金币或强力升级。
5.  **永久成长**: 即使失败，你也能保留获得的金币！在主菜单访问 **军械库 (Armory)**，购买永久属性提升，如伤害、速度和复活次数。

---

## 🚀 快速开始

### 先决条件
*   **Node.js**: v18.0.0 或更高版本。
*   **npm**: (包含在 Node.js 中) 或 yarn/pnpm。

### 安装

1.  **克隆仓库**
    ```bash
    git clone https://github.com/your-username/sparkle-survivors.git
    cd sparkle-survivors
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    打开浏览器并访问 `http://localhost:3000`。

4.  **构建生产版本**
    ```bash
    npm run build
    ```

---

## 🎮 操作说明

*   **移动**: `W`, `A`, `S`, `D` 或 `方向键`。
*   **暂停**: `ESC` 键或点击暂停按钮。
*   **交互**: 自动（拾取物品、打开宝箱）。
*   **战斗**: 武器根据冷却时间自动攻击。

---

## 🏗️ 架构

代码库分为三个不同的层，以确保可维护性：

1.  **数据层 (`src/data/`)**: 纯配置。定义武器、敌人和升级的属性。
2.  **逻辑层 (`src/core/`, `src/entities/`)**: 游戏引擎。处理物理、碰撞和状态。
3.  **视图层 (`src/components/`)**: UI。渲染 HUD、菜单和 Canvas 的 React 组件。

欲了解深入内容，请查看 [架构文档](./docs/Architecture.zh-CN.md)。

---

## 🛠️ 技术栈

*   **语言**: TypeScript
*   **UI 框架**: React 19
*   **构建工具**: Vite
*   **渲染**: HTML5 Canvas 2D Context
*   **样式**: CSS Modules / Standard CSS

---

## 🤝 贡献

我们欢迎贡献！请参阅 [贡献指南 (CONTRIBUTING.zh-CN.md)](./docs/CONTRIBUTING.zh-CN.md) 了解有关如何添加新武器、敌人或角色的详细信息。

## 📄 许可证

本项目开源并遵循 [MIT License](LICENSE) 许可证。