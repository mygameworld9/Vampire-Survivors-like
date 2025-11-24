
import { Vector2D } from "../utils/Vector2D";

export class Camera {
    pos: Vector2D;
    constructor(x: number, y: number) {
        this.pos = new Vector2D(x, y);
    }

    update(dt: number, playerPos: Vector2D) {
        // Time-based smoothing (Frame-rate independent)
        // Speed factor of ~10 gives similar feel to 0.15 per frame at 60fps
        const speed = 10; 
        const factor = 1 - Math.exp(-speed * dt);

        this.pos.x += (playerPos.x - this.pos.x) * factor;
        this.pos.y += (playerPos.y - this.pos.y) * factor;
    }

    applyTransform(ctx: CanvasRenderingContext2D) {
        // Ensure we do NOT use Math.floor here.
        // Using floating point coordinates allows for smooth sub-pixel rendering,
        // which eliminates the "stutter" or jitter effect seen when moving slowly.
        const tx = -this.pos.x + ctx.canvas.width / 2;
        const ty = -this.pos.y + ctx.canvas.height / 2;
        ctx.translate(tx, ty);
    }
}