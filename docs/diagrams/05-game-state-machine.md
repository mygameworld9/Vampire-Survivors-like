# 🔁 游戏状态机图

> 本文档展示游戏 UI 流程、玩家状态和敌人 AI 状态机。

---

## 🎮 游戏 UI 状态流转

```mermaid
stateDiagram-v2
    [*] --> StartScreen
    
    StartScreen --> CharacterSelect: 开始游戏
    StartScreen --> Armory: 武器图鉴
    StartScreen --> Codex: 游戏百科
    
    CharacterSelect --> MapSelect: 选择角色
    MapSelect --> CreativeSetup: 创意模式
    MapSelect --> Playing: 开始游戏
    CreativeSetup --> Playing: 开始游戏
    
    Playing --> Paused: ESC/暂停
    Paused --> Playing: 继续
    Paused --> StartScreen: 退出
    
    Playing --> LevelUp: 升级
    LevelUp --> Playing: 选择完成
    
    Playing --> TreasureSeq: 开箱
    TreasureSeq --> Evolution: 触发进化
    TreasureSeq --> Playing: 无进化
    Evolution --> Playing: 动画结束
    
    Playing --> ReviveModal: 死亡
    ReviveModal --> Playing: 复活
    ReviveModal --> GameOver: 无复活次数
    
    GameOver --> StartScreen: 返回主菜单
    
    Armory --> StartScreen: 返回
    Codex --> StartScreen: 返回
```

---

## 🧙 玩家状态机

```mermaid
stateDiagram-v2
    [*] --> Idle: 游戏开始
    
    Idle --> Moving: 检测到移动输入
    Moving --> Idle: 停止移动
    
    state Moving {
        [*] --> Normal
        Normal --> Momentum: 拥有动量技能
        Momentum --> MomentumMax: 达到100层
        MomentumMax --> Momentum: 继续移动
    }
    
    Moving --> Damaged: 受到伤害
    Idle --> Damaged: 受到伤害
    
    Damaged --> Invincible: 进入无敌帧
    Invincible --> Idle: 无敌结束
    Invincible --> Moving: 无敌结束且有输入
    
    Damaged --> Dead: HP <= 0 且无护盾
    
    state Dead {
        [*] --> CheckRevive
        CheckRevive --> Reviving: 有复活次数
        CheckRevive --> GameOver: 无复活次数
        Reviving --> [*]: 复活完成
    }
    
    Dead --> Idle: 复活成功
```

---

## 👾 敌人 AI 状态机

```mermaid
stateDiagram-v2
    [*] --> Spawned: 从对象池获取

    state Spawned {
        [*] --> Chase: 默认AI
        [*] --> Flee: 哥布林AI
    }
    
    Chase --> Pursuing: 追踪玩家
    Flee --> Escaping: 远离玩家
    
    state Pursuing {
        [*] --> Normal
        Normal --> Slowed: SLOW效果
        Normal --> Stunned: STUN效果
        Stunned --> Normal: 效果结束
        Slowed --> Normal: 效果结束
    }
    
    Pursuing --> Damaged: 受到伤害
    Escaping --> Damaged: 受到伤害
    Damaged --> Pursuing: HP > 0
    Damaged --> Escaping: HP > 0 (哥布林)
    Damaged --> Dying: HP <= 0
    
    state Dying {
        [*] --> PlayDeathSound
        PlayDeathSound --> SpawnParticles
        SpawnParticles --> DropLoot
        DropLoot --> MarkRemoval
    }
    
    Dying --> Released: 回收到对象池
    Released --> [*]
```

---

## 💥 状态效果状态机

```mermaid
stateDiagram-v2
    [*] --> None: 无状态效果
    
    None --> Burning: 🔥 BURN
    None --> Poisoned: ☠️ POISON
    None --> Slowed: ❄️ SLOW
    None --> Stunned: ⚡ STUN
    None --> Frozen: 🧊 FREEZE
    
    Burning --> None: 持续时间结束
    Poisoned --> None: 持续时间结束
    Slowed --> None: 持续时间结束
    Stunned --> None: 持续时间结束
    Frozen --> None: 持续时间结束
    
    Burning --> Burning: 刷新持续时间
    Poisoned --> Poisoned: 叠加伤害
    
    note right of Burning: magnitude = DPS
    note right of Poisoned: magnitude = DPS (可叠加)
    note right of Slowed: magnitude = 速度倍率
    note right of Stunned: 完全静止
```

---

## 🔫 武器冷却状态机

```mermaid
stateDiagram-v2
    [*] --> Ready: 初始化
    
    Ready --> Firing: canFire() && 有目标
    Firing --> Cooldown: 创建投射物
    Cooldown --> Ready: timer >= cooldown
    
    note right of Firing: 播放音效<br/>生成投射物
    note right of Cooldown: timer += dt * 1000
```

---

## 🎁 宝箱交互状态机

```mermaid
stateDiagram-v2
    [*] --> Closed: 生成宝箱
    
    Closed --> Opening: 玩家接触
    
    state Opening {
        [*] --> PlayAnimation
        PlayAnimation --> SpawnLoot
        SpawnLoot --> CheckEvolution
    }
    
    CheckEvolution --> Evolution: 有可进化武器
    CheckEvolution --> ShowLoot: 无可进化武器
    
    Evolution --> ShowLoot: 进化动画完成
    ShowLoot --> Collected: 显示奖励
    
    Collected --> [*]: 宝箱消失
```

---

## 🗺️ 地图事件状态机

```mermaid
stateDiagram-v2
    [*] --> Idle: 游戏开始
    
    Idle --> Cooldown: 初始60秒冷却
    Cooldown --> Rolling: 冷却结束
    
    Rolling --> Siege: 50%概率
    Rolling --> TreasureHunt: 30%概率
    Rolling --> ShrineSpawn: 20%概率
    
    state Siege {
        [*] --> SiegeActive: 15秒高频刷怪
        SiegeActive --> [*]: 时间结束
    }
    
    state TreasureHunt {
        [*] --> SpawnGoblins: 生成3-5只哥布林
        SpawnGoblins --> [*]: 5秒后结束
    }
    
    state ShrineSpawn {
        [*] --> CreateShrine: 生成探索点
        CreateShrine --> [*]: 2秒后结束
    }
    
    Siege --> Cooldown: 45-90秒随机冷却
    TreasureHunt --> Cooldown: 45-90秒随机冷却
    ShrineSpawn --> Cooldown: 45-90秒随机冷却
```

---

## 🔗 相关文档

- [13-player-system.md](../reverse-engineering/13-player-system.md) - 玩家系统详解
- [07-enemy-spawn-design.md](../reverse-engineering/07-enemy-spawn-design.md) - 敌人与事件设计
- [16-ui-project-structure.md](../reverse-engineering/16-ui-project-structure.md) - UI 组件结构
