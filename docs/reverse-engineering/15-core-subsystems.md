# 🔧 核心子系统技术文档

> 本文档详细记录游戏引擎的核心子系统：相机、粒子、音效、实体管理和对象池化。

---

## 📌 子系统概览

| 子系统 | 文件 | 行数 | 职责 |
|:---|:---|:---:|:---|
| 相机系统 | Camera.ts | 39 | 平滑跟随玩家 |
| 粒子系统 | ParticleSystem.ts | 58 | 视觉特效 |
| 音效系统 | SoundManager.ts | 464 | 程序化音效合成 |
| 实体管理 | EntityManager.ts | 191 | 实体生命周期管理 |
| 对象池 | ObjectPool.ts | 21 | 内存复用优化 |

---

## 📷 相机系统 (Camera)

### 平滑跟随算法

```typescript
update(dt: number, playerPos: Vector2D) {
    // 帧率无关的指数衰减插值
    const speed = 10;
    const factor = 1 - Math.exp(-speed * dt);

    const distSq = (playerPos.x - this.pos.x) ** 2 + 
                   (playerPos.y - this.pos.y) ** 2;
    
    // 接近时直接对齐，防止亚像素抖动
    if (distSq < 0.5) {
        this.pos = playerPos;
    } else {
        this.pos.x += (playerPos.x - this.pos.x) * factor;
        this.pos.y += (playerPos.y - this.pos.y) * factor;
    }
}
```

### 视图变换

```typescript
applyTransform(ctx: CanvasRenderingContext2D) {
    // 不使用 Math.round - 保持平滑滚动
    const tx = -this.pos.x + ctx.canvas.width / 2;
    const ty = -this.pos.y + ctx.canvas.height / 2;
    ctx.translate(tx, ty);
}
```

| 参数 | 值 | 说明 |
|:---|:---:|:---|
| speed | 10 | 跟随速度因子 |
| 对齐阈值 | 0.5 px² | 防抖动阈值 |

---

## ✨ 粒子系统 (ParticleSystem)

### 接口

```typescript
class ParticleSystem {
    emit(x: number, y: number, count: number, color: string);
    update(dt: number);
    draw(ctx: CanvasRenderingContext2D);
}
```

### 特性

- **对象池化**: 粒子从 `ObjectPool<Particle>` 获取和回收
- **交换删除**: O(1) 移除过期粒子

```typescript
// 高效移除（交换到末尾后pop）
if (p.shouldBeRemoved) {
    this.pool.release(p);
    this.particles[i] = this.particles[this.particles.length - 1];
    this.particles.pop();
}
```

---

## 🔊 音效系统 (SoundManager)

### 架构特点

- **无外部资源**: 使用 Web Audio API 程序化合成所有音效
- **动态 BGM**: 根据游戏强度动态调整音乐

### 音效类型

| 音效键 | 类型 | 触发场景 |
|:---|:---|:---|
| WEAPON_BULLET | 射击 | 投射物发射 |
| WEAPON_BOOMERANG | 射击 | 回旋镖发射 |
| WEAPON_LASER | 射击 | 激光发射 |
| WEAPON_LIGHTNING | 射击 | 闪电打击 |
| WEAPON_AURA | 射击 | 光环伤害 |
| WEAPON_SLASH | 射击 | 近战挥砍 |
| ENEMY_HIT | 命中 | 敌人受伤 |
| PLAYER_HURT | 受伤 | 玩家受伤 |
| LEVEL_UP | 升级 | 玩家升级 |
| CHEST_OPEN | 拾取 | 开启宝箱 |
| GAME_OVER | 结束 | 游戏失败/Boss警告 |

### BGM 强度系统

```typescript
setBGMIntensity(intensity: number) {
    // intensity: 0.0 ~ 1.0
    // 随游戏时间增加调整音乐层次
}

// 在 Game.update() 中调用
const intensity = Math.min(1.0, this.gameTime / 300);
this.soundManager.setBGMIntensity(intensity);
```

---

## 📦 实体管理器 (EntityManager)

### 管理的实体列表

| 列表 | 类型 | 说明 |
|:---|:---|:---|
| enemies | Enemy[] | 敌人实体 |
| props | Prop[] | 可破坏道具 |
| projectiles | AnyProjectile[] | 所有弹道类型 |
| xpOrbs | XpOrb[] | 经验球 |
| effects | AnyEffect[] | 视觉效果 |
| items | Item[] | 掉落物品 |
| chests | Chest[] | 宝箱 |
| explorationPoints | ExplorationPoint[] | 探索点 |
| floatingTexts | FloatingText[] | 浮动文字 |

### 对象池

| 池 | 类型 | 用途 |
|:---|:---|:---|
| enemyPool | ObjectPool\<Enemy\> | 敌人复用 |
| propPool | ObjectPool\<Prop\> | 道具复用 |
| particlePool | ObjectPool\<Particle\> | 粒子复用 |
| projectilePool | ObjectPool\<Projectile\> | 基础弹道 |
| boomerangPool | ObjectPool\<BoomerangProjectile\> | 回旋镖 |
| laserPool | ObjectPool\<LaserProjectile\> | 激光 |
| homingPool | ObjectPool\<HomingProjectile\> | 追踪弹 |
| lightningPool | ObjectPool\<LightningProjectile\> | 闪电 |
| slashPool | ObjectPool\<SlashProjectile\> | 近战斩击 |

### 优化技术

#### 1. 分步群集更新

```typescript
// 每 10 帧只更新 1/10 的敌人群集逻辑
const updateStride = 10;
const frameMod = this.frameCount % updateStride;
const shouldUpdateFlocking = (e.id % updateStride) === frameMod;

if (shouldUpdateFlocking) {
    neighbors = collisionSystem.getNeighbors(e.pos, flockingRadius);
}
```

#### 2. 交换删除

```typescript
// O(1) 删除 - 与最后一个元素交换后 pop
if (e.shouldBeRemoved) {
    this.enemyPool.release(e);
    this.enemies[i] = this.enemies[this.enemies.length - 1];
    this.enemies.pop();
}
```

#### 3. 类型安全弹道回收

```typescript
// 根据类型归还到正确的池
if (p instanceof BoomerangProjectile) this.boomerangPool.release(p);
else if (p instanceof LaserProjectile) this.laserPool.release(p);
else if (p instanceof HomingProjectile) this.homingPool.release(p);
// ...
```

---

## 🔄 对象池 (ObjectPool)

### 泛型实现

```typescript
export class ObjectPool<T> {
    private inactive: T[] = [];
    private factory: () => T;

    constructor(factory: () => T) {
        this.factory = factory;
    }

    get(): T {
        if (this.inactive.length > 0) {
            return this.inactive.pop()!;
        }
        return this.factory();
    }

    release(obj: T) {
        this.inactive.push(obj);
    }
}
```

### 使用模式

```typescript
// 1. 创建池
const pool = new ObjectPool(() => new Particle(0, 0, '#fff'));

// 2. 获取对象
const p = pool.get();
p.reset(x, y, color);  // 重置状态

// 3. 归还对象
pool.release(p);
```

### 对象契约

池化对象需实现：

```typescript
interface Poolable {
    shouldBeRemoved: boolean;  // 标记待移除
    reset(...args): void;      // 重置状态
}
```

---

## 🎨 渲染顺序

```typescript
// EntityManager.draw()
props           →  背景层道具
explorationPoints → 探索点
xpOrbs          →  经验球
items           →  物品
chests          →  宝箱
effects         →  视觉效果
// Player (由 Game 绘制)
enemies         →  敌人
projectiles     →  弹道
// Particles (由 ParticleSystem 绘制)
floatingTexts   →  浮动文字 (最上层)
```

---

## 📝 源代码位置

```
src/core/Camera.ts          # 相机系统
src/core/ParticleSystem.ts  # 粒子系统
src/core/SoundManager.ts    # 音效管理 (464行)
src/core/EntityManager.ts   # 实体管理 (191行)
src/utils/ObjectPool.ts     # 通用对象池
```
