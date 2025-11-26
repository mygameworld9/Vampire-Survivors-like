
import { IEnemyData } from "../utils/types";

/**
 * A static utility class for pre-rendering and caching enemy animations.
 * This class generates a series of canvas frames for each unique enemy variant (type, elite status, color, size)
 * to optimize rendering performance. Instead of redrawing enemies on every frame, the game can simply
 * grab a pre-drawn canvas from this cache, significantly reducing draw calls.
 */
export class EnemyCache {
    /** @private A cache storing pre-rendered animation frames. The key is a unique identifier for an enemy variant, and the value is an array of canvas elements, each representing a frame. */
    private static cache: Map<string, HTMLCanvasElement[]> = new Map();
    /** @private The number of frames to generate for each animation loop. */
    private static readonly FRAME_COUNT = 30; // 30 frames per animation loop
    /** @private Extra padding on the canvas to accommodate visual effects like shadows or glows that might exceed the enemy's base size. */
    private static readonly CANVAS_PADDING = 20; // Extra space for effects/shadows

    /**
     * Retrieves a specific animation frame for an enemy based on the global game time.
     * If the animation frames for this enemy variant are not already cached, this method
     * triggers their generation first.
     *
     * @param {string} type - The type of the enemy (e.g., 'SLIME', 'BAT').
     * @param {boolean} isElite - Whether the enemy is an elite variant.
     * @param {string} color - The base color of the enemy (used as a fallback).
     * @param {number} size - The base size (diameter) of the enemy.
     * @param {number} globalTime - The total elapsed game time in seconds, used to determine the current animation frame.
     * @returns {HTMLCanvasElement} The canvas element containing the pre-rendered frame for the current moment.
     */
    public static getFrame(type: string, isElite: boolean, color: string, size: number, globalTime: number): HTMLCanvasElement {
        const key = `${type}_${isElite}_${color}_${size}`;
        
        if (!this.cache.has(key)) {
            this.generateCache(key, type, isElite, color, size);
        }

        const frames = this.cache.get(key)!;
        // Calculate which frame index to show based on global time.
        // The animation is designed to loop approximately every second at 30fps.
        const frameIndex = Math.floor((globalTime * 30) % this.FRAME_COUNT);
        return frames[frameIndex % frames.length];
    }

    /**
     * Generates and caches all animation frames for a specific enemy variant.
     * It creates a canvas for each frame, draws the enemy's state at that point in the animation,
     * and stores the canvases in the cache.
     * @private
     * @param {string} key - The unique cache key for this enemy variant.
     * @param {string} type - The enemy's type.
     * @param {boolean} isElite - The enemy's elite status.
     * @param {string} color - The enemy's fallback color.
     * @param {number} size - The enemy's base size.
     */
    private static generateCache(key: string, type: string, isElite: boolean, color: string, size: number) {
        const frames: HTMLCanvasElement[] = [];
        const canvasSize = size * 2 + this.CANVAS_PADDING * 2; // Ensure enough room for squashing/stretching/glows

        for (let i = 0; i < this.FRAME_COUNT; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = canvasSize;
            canvas.height = canvasSize;
            const ctx = canvas.getContext('2d')!;
            
            // Normalized progress from 0 to 1 for the loop
            const progress = i / this.FRAME_COUNT; 
            // Simulate "time" for the math functions (0 to 2PI roughly)
            const simulatedTime = progress * Math.PI * 2; 

            // Center drawing context
            const centerX = canvasSize / 2;
            const centerY = canvasSize / 2;

            this.drawEnemyFrame(ctx, type, isElite, color, size, centerX, centerY, simulatedTime);
            
            frames.push(canvas);
        }

        this.cache.set(key, frames);
    }

    // Copied and adapted from the original Enemy.ts drawCuteEnemy logic
    private static drawEnemyFrame(ctx: CanvasRenderingContext2D, type: string, isElite: boolean, color: string, size: number, x: number, y: number, time: number) {
        const radius = size / 2;

        // Draw Elite Aura (Background Glow)
        if (isElite) {
            const pulseRadius = size * 0.6 + Math.sin(time * 2) * 3 + 3; // Adjusted speed for loop
            ctx.fillStyle = 'rgba(255, 238, 88, 0.25)'; // Pastel Gold glow
            ctx.beginPath();
            ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(x, y + radius - 2, radius, radius / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        const drawEyes = (offsetX: number, offsetY: number, eyeColor: string = '#212121', eyeSize: number = 2.5) => {
            ctx.fillStyle = eyeColor;
            ctx.beginPath();
            ctx.arc(x + offsetX - 5, y + offsetY, eyeSize, 0, Math.PI * 2); // Left
            ctx.arc(x + offsetX + 5, y + offsetY, eyeSize, 0, Math.PI * 2); // Right
            ctx.fill();
            
            // Shine
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x + offsetX - 4, y + offsetY - 1, 1, 0, Math.PI*2);
            ctx.arc(x + offsetX + 6, y + offsetY - 1, 1, 0, Math.PI*2);
            ctx.fill();
        };

        // Draw Body
        switch(type) {
            case 'SLIME':
                // Squash and stretch animation
                const squash = Math.sin(time * 2) * 0.15; // Adjusted frequency
                ctx.fillStyle = '#A5D6A7'; // Pastel Green
                ctx.beginPath();
                ctx.ellipse(x, y + squash * 5, radius * (1 + squash), radius * (1 - squash), 0, 0, Math.PI * 2);
                ctx.fill();
                drawEyes(0, -2);
                // Blush
                ctx.fillStyle = '#EF9A9A';
                ctx.beginPath();
                ctx.arc(x - 8, y + 2, 2.5, 0, Math.PI * 2);
                ctx.arc(x + 8, y + 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'SPIDER':
                // Legs
                ctx.strokeStyle = '#37474F';
                ctx.lineWidth = 2;
                const legWiggle = Math.sin(time * 4) * 3; // Adjusted frequency
                for(let i=0; i<4; i++) {
                    ctx.beginPath();
                    ctx.moveTo(x - 5, y);
                    ctx.quadraticCurveTo(x - 15, y - 10 + (i*5) + legWiggle, x - 20, y - 5 + (i*6));
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x + 5, y);
                    ctx.quadraticCurveTo(x + 15, y - 10 + (i*5) - legWiggle, x + 20, y - 5 + (i*6));
                    ctx.stroke();
                }
                // Body
                ctx.fillStyle = '#37474F';
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                drawEyes(0, -2, 'white', 2);
                drawEyes(0, -6, 'white', 1.5);
                break;

            case 'BAT':
                const flap = Math.sin(time * 4) * 8; // Adjusted frequency
                ctx.fillStyle = '#B39DDB';
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
            
            case 'MUSHROOM':
                const mushroomBounce = Math.abs(Math.sin(time * 2)) * 2;
                // Stalk
                ctx.fillStyle = '#FFE0B2';
                ctx.beginPath();
                ctx.roundRect(x - 6, y, 12, 14, 4);
                ctx.fill();
                // Cap
                ctx.fillStyle = '#E53935';
                ctx.beginPath();
                ctx.arc(x, y - 2 - mushroomBounce, radius, Math.PI, 0); 
                ctx.fill();
                // Dots
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(x - 6, y - 8 - mushroomBounce, 3, 0, Math.PI*2);
                ctx.arc(x + 6, y - 6 - mushroomBounce, 2.5, 0, Math.PI*2);
                ctx.arc(x, y - 12 - mushroomBounce, 2, 0, Math.PI*2);
                ctx.fill();
                drawEyes(0, 4, '#3E2723', 1.5);
                break;

            case 'GHOST':
                const float = Math.sin(time * 1.5) * 4;
                ctx.fillStyle = 'rgba(224, 247, 250, 0.9)'; 
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
                drawEyes(0, float - 5);
                ctx.fillStyle = '#212121';
                ctx.beginPath();
                ctx.arc(x, y + float + 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'GOLEM':
                const waddle = Math.sin(time * 2) * 2;
                ctx.fillStyle = '#B0BEC5';
                ctx.beginPath();
                ctx.roundRect(x - radius, y - radius + 2, size, size - 4, 8);
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
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(x, y - 4, 2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'SKELETON':
                const jitter = Math.sin(time * 6) * 1;
                ctx.fillStyle = '#F5F5F5';
                // Head
                ctx.beginPath();
                ctx.arc(x + jitter, y - 6, radius * 0.8, 0, Math.PI * 2);
                ctx.fill();
                // Jaw
                ctx.fillRect(x - 5 + jitter, y - 1, 10, 6);
                // Teeth
                ctx.strokeStyle = '#E0E0E0';
                ctx.beginPath();
                ctx.moveTo(x + jitter, y - 1); ctx.lineTo(x + jitter, y + 5);
                ctx.moveTo(x - 3 + jitter, y - 1); ctx.lineTo(x - 3 + jitter, y + 5);
                ctx.moveTo(x + 3 + jitter, y - 1); ctx.lineTo(x + 3 + jitter, y + 5);
                ctx.stroke();
                // Ribs
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
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                drawEyes(0, 0);
                break;
        }

        // Draw Elite Crown (Foreground - Drawn AFTER body to stay on top)
        if (isElite) {
            const crownY = y - radius - 15;
            
            // Crown Shape
            ctx.fillStyle = '#FFD700'; // Gold
            ctx.strokeStyle = '#F57F17'; // Darker Gold Outline
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            
            // Crown Points
            ctx.moveTo(x - 9, crownY);          // Top Left
            ctx.lineTo(x - 5, crownY + 7);      // Dip 1
            ctx.lineTo(x, crownY - 3);          // Top Middle
            ctx.lineTo(x + 5, crownY + 7);      // Dip 2
            ctx.lineTo(x + 9, crownY);          // Top Right
            
            // Crown Base
            ctx.lineTo(x + 7, crownY + 11);     // Bottom Right
            ctx.quadraticCurveTo(x, crownY + 13, x - 7, crownY + 11); // Curved Bottom
            ctx.closePath();
            
            ctx.fill();
            ctx.stroke();
            
            // Red Gem Center
            ctx.fillStyle = '#D50000'; 
            ctx.beginPath();
            ctx.arc(x, crownY + 8, 2, 0, Math.PI*2);
            ctx.fill();

            // Shine on gem
            ctx.fillStyle = '#FF8A80';
            ctx.beginPath();
            ctx.arc(x - 0.5, crownY + 7.5, 0.8, 0, Math.PI*2);
            ctx.fill();
        }
    }
}
