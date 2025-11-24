
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

        const distSq = (playerPos.x - this.pos.x) ** 2 + (playerPos.y - this.pos.y) ** 2;
        
        // Snap to target if very close to avoid sub-pixel jitter/shimmering when STOPPED
        if (distSq < 0.5) {
            this.pos.x = playerPos.x;
            this.pos.y = playerPos.y;
        } else {
            this.pos.x += (playerPos.x - this.pos.x) * factor;
            this.pos.y += (playerPos.y - this.pos.y) * factor;
        }
    }

    applyTransform(ctx: CanvasRenderingContext2D) {
        // Removed Math.round.
        // While rounding helps align static pixel art, in a smooth-scrolling action game with 
        // physics-based interpolation, forcing integer coordinates causes "jitter" or "vibration"
        // because the camera snaps to the grid while the internal logic moves smoothly.
        // Modern browsers handle sub-pixel rendering (anti-aliasing) well enough to look smooth.
        const tx = -this.pos.x + ctx.canvas.width / 2;
        const ty = -this.pos.y + ctx.canvas.height / 2;
        ctx.translate(tx, ty);
    }
}
