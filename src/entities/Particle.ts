
import { Vector2D } from "../utils/Vector2D";

export class Particle {
    pos: Vector2D;
    velocity: Vector2D;
    size: number;
    color: string;
    lifeTimer: number;
    initialLife: number;
    shouldBeRemoved = false;

    constructor(x: number, y: number, color: string) {
        this.pos = new Vector2D(0, 0);
        this.velocity = new Vector2D(0, 0);
        this.size = 0;
        this.color = '';
        this.lifeTimer = 0;
        this.initialLife = 0;
        this.reset(x, y, color);
    }

    reset(x: number, y: number, color: string) {
        this.pos.x = x;
        this.pos.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 80 + 20; // Random speed between 20 and 100
        this.velocity.x = Math.cos(angle) * speed;
        this.velocity.y = Math.sin(angle) * speed;
        this.size = Math.random() * 3 + 1; // Random size between 1 and 4
        this.color = color;
        this.initialLife = Math.random() * 0.4 + 0.2; // Lifetime between 0.2 and 0.6 seconds
        this.lifeTimer = this.initialLife;
        this.shouldBeRemoved = false;
    }

    update(dt: number) {
        this.pos.x += this.velocity.x * dt;
        this.pos.y += this.velocity.y * dt;

        // Apply friction
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;

        this.lifeTimer -= dt;
        if (this.lifeTimer <= 0) {
            this.shouldBeRemoved = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        const opacity = Math.max(0, this.lifeTimer / this.initialLife);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}
