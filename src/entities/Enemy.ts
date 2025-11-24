
import { Vector2D } from "../utils/Vector2D";
import { IEnemyData, IStatusEffect, IWeaponStatusEffect, StatusEffectType } from "../utils/types";
import { EnemyCache } from "../core/EnemyCache";

export class Enemy {
    static _idCounter = 0;
    id: number;
    pos: Vector2D;
    hp: number;
    speed: number;
    damage: number;
    size: number;
    xpOrbType: string;
    color: string;
    goldDrop?: [number, number];
    shouldBeRemoved = false;
    data: IEnemyData;
    public isElite: boolean;
    public chestDropChance: number;
    
    private originalSpeed: number;
    private activeStatusEffects: Map<StatusEffectType, IStatusEffect> = new Map();
    private type: string;

    // Animation properties
    private globalTime = 0;

    constructor(x: number, y: number, data: IEnemyData, type: string, isElite: boolean = false) {
        this.id = ++Enemy._idCounter;
        this.data = data;
        this.pos = new Vector2D(x, y);
        this.type = type;
        this.isElite = isElite;
        this.hp = data.hp;
        this.speed = data.speed;
        this.damage = data.damage;
        this.size = data.size;
        this.xpOrbType = data.xpOrbType;
        this.color = data.color;
        this.chestDropChance = 0;
        this.originalSpeed = data.speed;
        
        // Initialize logic
        this.reset(x, y, data, type, isElite);
    }

    reset(x: number, y: number, data: IEnemyData, type: string, isElite: boolean) {
        this.id = ++Enemy._idCounter;
        this.pos.x = x;
        this.pos.y = y;
        this.data = data;
        this.type = type;
        this.isElite = isElite;
        this.shouldBeRemoved = false;
        
        // Default stats
        this.hp = data.hp;
        this.speed = data.speed;
        this.damage = data.damage;
        this.size = data.size;
        this.color = data.color;
        this.xpOrbType = data.xpOrbType;
        this.goldDrop = data.goldDrop;
        this.chestDropChance = data.chestDropChance || 0;
        
        // Apply elite modifiers
        if (isElite && data.elite) {
            const eliteData = data.elite;
            this.hp *= eliteData.hpMultiplier;
            this.damage *= eliteData.damageMultiplier;
            if (eliteData.speedMultiplier) this.speed *= eliteData.speedMultiplier;
            if (eliteData.sizeMultiplier) this.size *= eliteData.sizeMultiplier;
            if (eliteData.color) this.color = eliteData.color;
            if (eliteData.xpOrbType) this.xpOrbType = eliteData.xpOrbType;
            if (eliteData.goldDrop) this.goldDrop = eliteData.goldDrop;
            if (eliteData.chestDropChance) this.chestDropChance = eliteData.chestDropChance;
        }

        this.originalSpeed = this.speed;
        this.activeStatusEffects.clear();
        this.globalTime = Math.random() * 10; // Random start frame
    }
    
    update(dt: number, playerPos: Vector2D) {
        this.globalTime += dt;
        this.handleStatusEffects(dt);
        const direction = new Vector2D(playerPos.x - this.pos.x, playerPos.y - this.pos.y).normalize();
        this.pos.x += direction.x * this.speed * dt;
        this.pos.y += direction.y * this.speed * dt;
    }
    
    takeDamage(amount: number) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.shouldBeRemoved = true;
        }
    }

    applyStatusEffect(effectData: IWeaponStatusEffect) {
        if (Math.random() > effectData.chance) return;

        this.activeStatusEffects.set(effectData.type, {
            ...effectData,
            timer: effectData.duration, // Start timer at full duration
        });
    }

    private handleStatusEffects(dt: number) {
        this.speed = this.originalSpeed; // Reset modifiers before applying
        if (this.activeStatusEffects.size === 0) return;

        for (const [type, effect] of this.activeStatusEffects.entries()) {
            effect.timer -= dt * 1000;
            if (effect.timer <= 0) {
                this.activeStatusEffects.delete(type);
                continue;
            }

            switch (type) {
                case 'BURN':
                    // damage per second, applied fractionally each frame
                    this.takeDamage(effect.magnitude * dt);
                    break;
                case 'SLOW':
                    this.speed *= effect.magnitude;
                    break;
            }
        }
    }
    
    public isBurning(): boolean {
        return this.activeStatusEffects.has('BURN');
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Use the Cache System for performance
        // This returns a pre-rendered canvas element
        const frame = EnemyCache.getFrame(this.type, this.isElite, this.color, this.size, this.globalTime);
        
        // The cache includes padding, so we need to center it based on its width/height
        // frame.width is likely size * 2 + padding
        const drawX = this.pos.x - frame.width / 2;
        const drawY = this.pos.y - frame.height / 2;

        ctx.drawImage(frame, drawX, drawY);

        // Draw overlays for status effects (Simple primitives are fine to keep dynamic)
        if (this.activeStatusEffects.size > 0) {
            const radius = this.size / 2;
            if (this.activeStatusEffects.has('BURN')) {
                ctx.fillStyle = '#FF7043';
                for (let i = 0; i < 3; i++) {
                    const angle = this.globalTime * 5 + i * (Math.PI * 2 / 3);
                    const fx = this.pos.x + Math.cos(angle) * radius;
                    const fy = this.pos.y + Math.sin(angle) * radius;
                    ctx.beginPath();
                    ctx.arc(fx, fy, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            if (this.activeStatusEffects.has('SLOW')) {
                ctx.fillStyle = 'rgba(129, 212, 250, 0.4)';
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y, radius, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }
}
