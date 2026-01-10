# 闪耀幸存者 (Sparkle Survivors)

<div align="center">

![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)
![Vite](https://img.shields.io/badge/Vite-6.0+-purple)
![Version](https://img.shields.io/badge/version-2.0-orange)
[![Twitter](https://img.shields.io/twitter/follow/icebeardsg?style=social)](https://twitter.com/icebeardsg)

**一款使用 React 和 HTML5 Canvas 构建的高性能、数据驱动的类吸血鬼幸存者 Roguelite 游戏。**

[English](./README.md) | [简体中文](./README.zh-CN.md)

</div>

---

## 📖 概述

**闪耀幸存者** 是一款快节奏的生存游戏，你需要击退一波又一波可爱但致命的怪物。它拥有一个基于 HTML5 Canvas API 构建的自定义游戏引擎，并由 React 负责 UI 层。

该项目展示了严格的 **数据-逻辑-视图 (DLV)** 架构，使其成为学习 Web 游戏开发或扩展为完整商业产品的绝佳模板。

---

## ✨ v2.0 更新亮点

### 🆕 海量新内容
- **29 把武器** — 新增毒系、召唤系、链式、陷阱系四大武器支线
- **15 个技能** — 新增吸血、暴击、护盾、动量等高级被动/主动技能
- **18 条进化路线** — 递归进化系统，Tier 1 → Tier 2 → Tier 3 完整成长链
- **6 位角色** — 骑士、盗贼、法师、牧师、女猎手、术士

### ⚔️ 新武器系统

| 系别 | Tier 1 → Tier 2 → Tier 3 | 特色 |
|:---|:---|:---|
| **毒系** | 毒匕首 → 毒牙 → 瘟疫镰刀 | 毒素持续伤害，击杀时扩散 |
| **召唤系** | 灵魂宝珠 → 幻影守卫 → 灵魂漩涡 | 环绕玩家的轨道武器 |
| **链式** | 链电 → 电击链 → 风暴编织者 | 弹跳攻击多个敌人 |
| **陷阱系** | 尖刺陷阱 → 寒霜地雷 → 虚空裂隙 | 放置陷阱控制区域 |

### 🛡️ 新技能系统

| 技能 | 类型 | 效果 |
|:---|:---|:---|
| **吸血** | 被动 | 击杀恢复 0.5% 最大生命 |
| **暴击** | 被动 | 8% 暴击率，1.8x 暴击伤害 |
| **护盾精通** | 被动 | 每 10 秒获得护盾，吸收伤害 |
| **动量** | 被动 | 移动积累能量，最高 +50% 伤害 |
| **闪现** | 主动 | 瞬移闪避危险 |
| **狂暴爆发** | 主动 | 30 秒冷却，大幅提升攻速 |
| **守护天使** | 主动 | 死亡时自动触发复活 |

---

## 🎮 玩法介绍

**在无尽的呆萌怪物潮中生存下来！**

1.  **自动战斗** — 角色会根据装备的武器自动攻击。你的主要任务是**走位**和**躲避**。
2.  **收集经验** — 击败敌人会掉落宝石。收集它们来填充你的经验条。
3.  **升级构筑** — 升级时，从 3 个随机选项中选择。通过组合武器和技能，进化出终极形态。
4.  **武器进化** — 当武器满级且拥有对应技能时，开启宝箱可进化为更强形态！
5.  **永久成长** — 即使失败，你也能保留获得的金币！在主菜单访问 **军械库**，购买永久属性提升。

---

## 🚀 快速开始

### 先决条件
*   **Node.js**: v18.0.0 或更高版本
*   **pnpm**: 推荐使用 (或 npm/yarn)

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/sparkle-survivors.git
cd sparkle-survivors

# 安装依赖 (推荐 pnpm)
pnpm install

# 启动开发服务器
pnpm run dev
```

打开浏览器并访问 `http://localhost:3000`

### 构建生产版本

```bash
pnpm run build
```

---

## 🎮 操作说明

| 按键 | 功能 |
|:---|:---|
| `W` `A` `S` `D` / 方向键 | 移动角色 |
| `ESC` | 暂停游戏 |
| 鼠标点击 | UI 交互 |
| 自动 | 拾取物品、打开宝箱、攻击 |

---

## 🏗️ 架构

代码库分为三个不同的层，以确保可维护性：

```
src/
├── data/           # 数据层 — 武器、敌人、技能配置
├── core/           # 逻辑层 — 游戏引擎、物理、碰撞
├── entities/       # 实体层 — 玩家、敌人、投射物
└── components/     # 视图层 — React UI 组件
```

| 层 | 路径 | 职责 |
|:---|:---|:---|
| **数据层** | `src/data/` | 纯配置，定义武器/敌人/升级属性 |
| **逻辑层** | `src/core/`, `src/entities/` | 游戏引擎，处理物理/碰撞/状态 |
| **视图层** | `src/components/` | React 组件，渲染 HUD/菜单/Canvas |

详细架构请查看 [FILE_MAP.md](./FILE_MAP.md)

---

## 🛠️ 技术栈

| 类别 | 技术 |
|:---|:---|
| **语言** | TypeScript |
| **UI 框架** | React 19 |
| **构建工具** | Vite 6 |
| **渲染** | HTML5 Canvas 2D |
| **样式** | CSS Modules |
| **国际化** | 自定义 i18n 系统 (中/英) |

---

## 📁 项目结构

```
sparkle-survivors/
├── src/
│   ├── components/     # React UI 组件
│   ├── core/           # 游戏引擎核心
│   ├── data/           # 数据配置文件
│   ├── entities/       # 游戏实体
│   ├── styles/         # CSS 样式
│   └── utils/          # 工具函数和类型
├── public/
│   └── locales/        # 国际化翻译文件
├── documentation/      # 设计文档
└── docs/               # 架构文档
```

---

## 🤝 贡献

我们欢迎贡献！请参阅 [贡献指南](./docs/CONTRIBUTING.zh-CN.md) 了解详情。

**添加新内容:**
- 武器: 编辑 `src/data/weaponData.ts`
- 技能: 编辑 `src/data/skillData.ts`
- 进化: 编辑 `src/data/evolutionData.ts`
- 敌人: 编辑 `src/data/enemyData.ts`

---

## 📄 许可证

本项目开源并遵循 [MIT License](LICENSE) 许可证。

---

<div align="center">

**Made with ❤️ and a lot of ☕**

</div>