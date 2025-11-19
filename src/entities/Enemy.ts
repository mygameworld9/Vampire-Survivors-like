import { Vector2D } from "../utils/Vector2D";
import { IEnemyData, IStatusEffect, IWeaponStatusEffect, StatusEffectType } from "../utils/types";

export class Enemy {
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
    private image: HTMLImageElement | null = null;
    private spriteWidth: number;
    private spriteHeight: number;
    private frameX = 0;
    private maxFrames = 1;
    private frameTimer = 0;
    private frameInterval = 150; // ms per frame
    private elitePulseTimer = Math.random() * Math.PI * 2; // Random start for pulse
    private globalTime = Math.random() * 1000; // Random start for animations

    constructor(x: number, y: number, data: IEnemyData, type: string, isElite: boolean = false) {
        this.data = data;
        this.pos = new Vector2D(x, y);
        this.isElite = isElite;

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
        this.type = type;

        this.spriteWidth = data.spriteWidth || this.size;
        this.spriteHeight = data.spriteHeight || this.size;

        if (data.spriteSheet) {
            this.image = new Image();
            this.image.src = data.spriteSheet;
        }

        if (data.animation) {
            this.maxFrames = data.animation.maxFrames;
        }
    }
    
    update(dt: number, playerPos: Vector2D) {
        this.globalTime += dt;
        if (this.isElite) {
            this.elitePulseTimer += dt * 4; // Controls pulse speed
        }
        this.handleStatusEffects(dt);
        this.updateAnimation(dt);
        const direction = new Vector2D(playerPos.x - this.pos.x, playerPos.y - this.pos.y).normalize();
        this.pos.x += direction.x * this.speed * dt;
        this.pos.y += direction.y * this.speed * dt;
    }

    private updateAnimation(dt: number) {
        if (!this.image) return;

        this.frameTimer += dt * 1000;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = (this.frameX + 1) % this.maxFrames;
        }
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
        const drawX = this.pos.x;
        const drawY = this.pos.y;
        const radius = this.size / 2;

        // Draw Elite Aura
        if (this.isElite) {
            const pulseRadius = this.size * 0.6 + Math.sin(this.elitePulseTimer) * 3 + 3;
            ctx.fillStyle = 'rgba(255, 238, 88, 0.25)'; // Pastel Gold glow
            ctx.beginPath();
            ctx.arc(drawX, drawY, pulseRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Cute Mini Crown
            ctx.fillStyle = '#FDD835';
            ctx.beginPath();
            const crownY = drawY - radius - 12;
            // Center point
            ctx.moveTo(drawX - 8, crownY);
            ctx.lineTo(drawX - 4, crownY + 6);
            ctx.lineTo(drawX, crownY - 2);
            ctx.lineTo(drawX + 4, crownY + 6);
            ctx.lineTo(drawX + 8, crownY);
            ctx.lineTo(drawX + 6, crownY + 10);
            ctx.lineTo(drawX - 6, crownY + 10);
            ctx.fill();
        }

        // Draw Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(drawX, drawY + radius - 2, radius, radius / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Force Cute Procedural Rendering exclusively
        this.drawCuteEnemy(ctx, drawX, drawY, radius);
    
        // Draw overlays for status effects (Cutified)
        if (this.activeStatusEffects.size > 0) {
            if (this.activeStatusEffects.has('BURN')) {
                // Draw little flame particles instead of full overlay
                ctx.fillStyle = '#FF7043';
                for (let i = 0; i < 3; i++) {
                    const angle = this.globalTime * 5 + i * (Math.PI * 2 / 3);
                    const fx = drawX + Math.cos(angle) * radius;
                    const fy = drawY + Math.sin(angle) * radius;
                    ctx.beginPath();
                    ctx.arc(fx, fy, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            if (this.activeStatusEffects.has('SLOW')) {
                // Draw snowflake or ice color tint
                ctx.fillStyle = 'rgba(129, 212, 250, 0.4)';
                ctx.beginPath();
                ctx.arc(drawX, drawY, radius, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }

    private drawCuteEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
        const drawEyes = (offsetX: number, offsetY: number, color: string = '#212121', size: number = 2.5) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x + offsetX - 5, y + offsetY, size, 0, Math.PI * 2); // Left
            ctx.arc(x + offsetX + 5, y + offsetY, size, 0, Math.PI * 2); // Right
            ctx.fill();
            
            // Shine
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x + offsetX - 4, y + offsetY - 1, 1, 0, Math.PI*2);
            ctx.arc(x + offsetX + 6, y + offsetY - 1, 1, 0, Math.PI*2);
            ctx.fill();
        };

        switch(this.type) {
            case 'SLIME':
                // Squash and stretch animation
                const squash = Math.sin(this.globalTime * 8) * 0.15;
                ctx.fillStyle = '#A5D6A7'; // Pastel Green
                ctx.beginPath();
                // Draw a blob shape
                ctx.ellipse(x, y + squash * 5, radius * (1 + squash), radius * (1 - squash), 0, 0, Math.PI * 2);
                ctx.fill();
                drawEyes(0, -2);
                // Cute blush
                ctx.fillStyle = '#EF9A9A';
                ctx.beginPath();
                ctx.arc(x - 8, y + 2, 2.5, 0, Math.PI * 2);
                ctx.arc(x + 8, y + 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'BAT':
                const flap = Math.sin(this.globalTime * 15) * 8;
                ctx.fillStyle = '#B39DDB'; // Pastel Purple
                // Wings
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.bezierCurveTo(x - 15, y - 15 + flap, x - 25, y + 10 + flap, x - 5, y + 5);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.bezierCurveTo(x + 15, y - 15 + flap, x + 25, y + 10 + flap, x + 5, y + 5);
                ctx.fill();
                // Body
                ctx.beginPath();
                ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
                ctx.fill();
                // Ears
                ctx.beginPath();
                ctx.moveTo(x - 4, y - 8);
                ctx.lineTo(x - 8, y - 14);
                ctx.lineTo(x, y - 10);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(x + 4, y - 8);
                ctx.lineTo(x + 8, y - 14);
                ctx.lineTo(x, y - 10);
                ctx.fill();
                drawEyes(0, -2, 'white', 2);
                // Fangs
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.moveTo(x - 3, y + 2);
                ctx.lineTo(x - 2, y + 5);
                ctx.lineTo(x - 1, y + 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(x + 1, y + 2);
                ctx.lineTo(x + 2, y + 5);
                ctx.lineTo(x + 3, y + 2);
                ctx.fill();
                break;

            case 'GHOST':
                const float = Math.sin(this.globalTime * 3) * 4;
                ctx.fillStyle = 'rgba(224, 247, 250, 0.9)'; // Pastel Cyan-ish White
                ctx.beginPath();
                ctx.arc(x, y + float - 5, radius, Math.PI, 0);
                ctx.lineTo(x + radius, y + float + 5);
                // Wavy bottom
                for(let i = 1; i <= 3; i++) {
                    ctx.quadraticCurveTo(
                        x + radius - (2 * radius / 3) * i + (radius/3), 
                        y + float + 10, 
                        x + radius - (2 * radius / 3) * i, 
                        y + float + 5
                    );
                }
                ctx.lineTo(x - radius, y + float - 5);
                ctx.fill();
                // :O face
                drawEyes(0, float - 5);
                ctx.fillStyle = '#212121';
                ctx.beginPath();
                ctx.arc(x, y + float + 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'GOLEM':
                const waddle = Math.sin(this.globalTime * 4) * 2;
                ctx.fillStyle = '#B0BEC5'; // Pastel Grey
                // Body
                ctx.beginPath();
                ctx.roundRect(x - radius, y - radius + 2, this.size, this.size - 4, 8);
                ctx.fill();
                // Arms
                ctx.fillStyle = '#90A4AE';
                ctx.beginPath();
                ctx.roundRect(x - radius - 6, y - 5 + waddle, 8, 15, 4);
                ctx.fill();
                ctx.beginPath();
                ctx.roundRect(x + radius - 2, y - 5 - waddle, 8, 15, 4);
                ctx.fill();
                // Cyclops Eye
                ctx.fillStyle = '#FFD54F';
                ctx.beginPath();
                ctx.arc(x, y - 4, 6, 0, Math.PI * 2);
                ctx.fill();
                // Pupil
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(x, y - 4, 2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'SKELETON':
                const jitter = Math.sin(this.globalTime * 20) * 1;
                ctx.fillStyle = '#F5F5F5';
                // Head
                ctx.beginPath();
                ctx.arc(x + jitter, y - 6, radius * 0.8, 0, Math.PI * 2);
                ctx.fill();
                // Jaw
                ctx.fillRect(x - 5 + jitter, y - 1, 10, 6);
                // Teeth lines
                ctx.strokeStyle = '#E0E0E0';
                ctx.beginPath();
                ctx.moveTo(x + jitter, y - 1); ctx.lineTo(x + jitter, y + 5);
                ctx.moveTo(x - 3 + jitter, y - 1); ctx.lineTo(x - 3 + jitter, y + 5);
                ctx.moveTo(x + 3 + jitter, y - 1); ctx.lineTo(x + 3 + jitter, y + 5);
                ctx.stroke();
                // Ribs (Body)
                ctx.strokeStyle = '#FAFAFA';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x, y + 5);
                ctx.lineTo(x, y + 14);
                ctx.stroke();
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - 5, y + 8); ctx.lineTo(x + 5, y + 8);
                ctx.moveTo(x - 4, y + 12); ctx.lineTo(x + 4, y + 12);
                ctx.stroke();
                
                drawEyes(jitter, -6, '#616161', 2);
                break;

            default:
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                drawEyes(0, 0);
                break;
        }
    }
}