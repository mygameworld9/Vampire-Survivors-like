
import { Vector2D } from "../utils/Vector2D";
import { Weapon } from "./Weapon";
import { Player } from "./Player";
import { IWeaponStatusEffect, WeaponTag, ProjectileKind } from "../utils/types";

export class SlashProjectile {
    readonly KIND = ProjectileKind.SLASH;
    pos: Vector2D;

    owner: Player;
    damage: number;
    range: number; // Radius of slash
    isFullCircle: boolean;
    shouldBeRemoved = false;
    hitEnemies: Set<number> = new Set();
    statusEffect?: IWeaponStatusEffect;
    tags: WeaponTag[] = [];

    private lifeTimer = 0;
    private duration = 0.2;
    private angle: number;

    constructor(owner: Player, weapon: Weapon, isFullCircle: boolean) {
        this.owner = owner;
        this.pos = new Vector2D(0, 0);
        this.damage = 0;
        this.range = 0;
        this.isFullCircle = false;
        this.angle = 0;
        // Only call reset if owner is valid (not during pool initialization with empty object)
        if (owner && owner.facingDirection) {
            this.reset(owner, weapon, isFullCircle);
        }
    }

    reset(owner: Player, weapon: Weapon, isFullCircle: boolean) {
        this.owner = owner;
        this.damage = weapon.damage;
        this.range = weapon.range;
        this.statusEffect = weapon.statusEffect;
        this.isFullCircle = isFullCircle;
        this.tags = weapon.tags;

        this.angle = Math.atan2(owner.facingDirection.y, owner.facingDirection.x);
        this.pos.x = owner.pos.x;
        this.pos.y = owner.pos.y;

        this.lifeTimer = 0;
        this.duration = isFullCircle ? 0.4 : 0.2;
        this.shouldBeRemoved = false;
        this.hitEnemies.clear();
    }

    update(dt: number) {
        this.lifeTimer += dt;
        // Follow player tightly
        this.pos.x = this.owner.pos.x;
        this.pos.y = this.owner.pos.y;

        if (this.lifeTimer >= this.duration) {
            this.shouldBeRemoved = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        const progress = this.lifeTimer / this.duration;
        // Fade out quickly at the end
        const opacity = 1.0 - Math.pow(progress, 4);

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        if (this.isFullCircle) {
            this.drawSpin(ctx, progress, opacity);
        } else {
            this.drawSlash(ctx, progress, opacity);
        }

        ctx.restore();
    }

    private drawSlash(ctx: CanvasRenderingContext2D, progress: number, opacity: number) {
        ctx.rotate(this.angle);

        // Visual shift forward
        const offset = 20 + (progress * 30);
        ctx.translate(offset, 0);

        // Scale up
        const scale = 0.8 + (progress * 0.5);
        ctx.scale(scale, scale);

        ctx.globalAlpha = opacity;

        const radius = this.range;

        // Determine Color based on Tags
        let outerColor = '#4FC3F7'; // Default Cyan
        let innerColor = '#B2EBF2'; // Default Light Cyan
        let coreColor = '#FFFFFF';
        let isPoison = false;

        if (this.tags.includes('POISON')) {
            isPoison = true;
            outerColor = '#76FF03'; // Neon Green
            innerColor = '#B2FF59'; // Light Lime
            coreColor = '#F4FF81';  // Yellowish Core
        } else if (this.tags.includes('DARK')) {
            outerColor = '#9C27B0';
            innerColor = '#E1BEE7';
        } else if (this.tags.includes('FIRE')) {
            outerColor = '#FF5722';
            innerColor = '#FFCCBC';
        }

        // 1. Main Fade Gradient
        const gradient = ctx.createRadialGradient(0, 0, radius * 0.3, 0, 0, radius * 1.2);
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(0.4, outerColor);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;

        // Draw Tapered "Swoosh" shape
        ctx.beginPath();
        // Start from inner edge
        ctx.arc(0, 0, radius * 0.8, -Math.PI / 3, Math.PI / 3, false);
        // Outer edge (sharper curve)
        ctx.arc(0, 0, radius * 1.1, Math.PI / 3, -Math.PI / 3, true);
        ctx.closePath();
        ctx.fill();

        // 2. Sharp Edge Core Line
        ctx.strokeStyle = coreColor;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowBlur = isPoison ? 15 : 10;
        ctx.shadowColor = outerColor;

        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.95, -Math.PI / 3.5, Math.PI / 3.5, false);
        ctx.stroke();

        ctx.shadowBlur = 0; // Reset

        // 3. Particles / Sparkles
        // Poison gets "Bubbles"
        if (progress < 0.6) {
            if (isPoison) {
                // Toxic Bubbles
                ctx.fillStyle = '#CCFF90';
                for (let i = 0; i < 5; i++) {
                    const pAngle = (Math.random() - 0.5) * Math.PI / 1.5;
                    const pDist = radius * (0.5 + Math.random() * 0.6);
                    const bubbleSize = 2 + Math.random() * 3;

                    ctx.beginPath();
                    ctx.arc(Math.cos(pAngle) * pDist, Math.sin(pAngle) * pDist, bubbleSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // Standard Sparkles
                ctx.fillStyle = '#FFFFFF';
                for (let i = 0; i < 3; i++) {
                    const pAngle = (Math.random() - 0.5) * Math.PI / 2;
                    const pDist = radius * (0.8 + Math.random() * 0.3);
                    ctx.beginPath();
                    ctx.arc(Math.cos(pAngle) * pDist, Math.sin(pAngle) * pDist, 2 + Math.random() * 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    private drawSpin(ctx: CanvasRenderingContext2D, progress: number, opacity: number) {
        // Rotate continuously
        const rotation = progress * Math.PI * 4; // Faster spin
        ctx.rotate(rotation);

        ctx.globalAlpha = opacity;
        const radius = this.range;

        // Determine Color
        let colorMain = 'rgba(128, 222, 234, 0.6)'; // Cyan
        let colorStrike = '#E0F7FA';

        if (this.tags.includes('DARK')) {
            colorMain = 'rgba(156, 39, 176, 0.6)'; // Purple
            colorStrike = '#E1BEE7';
        } else if (this.tags.includes('FIRE')) {
            colorMain = 'rgba(255, 87, 34, 0.6)'; // Orange
            colorStrike = '#FFCCBC';
        } else if (this.tags.includes('POISON')) {
            colorMain = 'rgba(76, 175, 80, 0.6)'; // Green
            colorStrike = '#C8E6C9';
        }

        // Draw a whirlwind (3 arms)
        for (let i = 0; i < 3; i++) {
            ctx.rotate((Math.PI * 2) / 3);

            // Wind swoosh
            ctx.fillStyle = colorMain;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 0.6);
            ctx.quadraticCurveTo(radius * 0.5, radius * 0.5, radius, 0); // Sharp tail
            ctx.fill();

            // Speed line (Core)
            ctx.strokeStyle = colorStrike;
            ctx.lineWidth = 3;
            ctx.shadowColor = colorStrike;
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.9, 0.1, Math.PI * 0.5);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Center glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
}
