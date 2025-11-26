
import { Vector2D } from "../utils/Vector2D";

/**
 * Manages the in-game camera, controlling the viewport's position and movement.
 * It smoothly follows a target (typically the player) and applies transformations
 * to the rendering context to simulate camera movement.
 */
export class Camera {
    /** The current position of the camera in world coordinates. */
    pos: Vector2D;

    /**
     * Creates a new Camera instance.
     * @param {number} x - The initial x-coordinate of the camera.
     * @param {number} y - The initial y-coordinate of the camera.
     */
    constructor(x: number, y: number) {
        this.pos = new Vector2D(x, y);
    }

    /**
     * Updates the camera's position to smoothly follow the player.
     * This uses a frame-rate independent exponential smoothing algorithm to provide
     * a fluid camera motion. The camera snaps to the target when very close to
     * prevent sub-pixel jittering when the target is stationary.
     *
     * @param {number} dt - The time elapsed since the last frame, in seconds.
     * @param {Vector2D} playerPos - The target position for the camera to follow (usually the player's position).
     */
    update(dt: number, playerPos: Vector2D) {
        // Time-based smoothing (Frame-rate independent)
        // A speed factor of ~10 provides a similar feel to a lerp factor of 0.15 at 60fps.
        const speed = 10; 
        const factor = 1 - Math.exp(-speed * dt);

        const distSq = (playerPos.x - this.pos.x) ** 2 + (playerPos.y - this.pos.y) ** 2;
        
        // Snap to target if very close to avoid sub-pixel jitter/shimmering when the target is stationary.
        if (distSq < 0.5) {
            this.pos.x = playerPos.x;
            this.pos.y = playerPos.y;
        } else {
            // Smoothly interpolate the camera's position towards the player's position.
            this.pos.x += (playerPos.x - this.pos.x) * factor;
            this.pos.y += (playerPos.y - this.pos.y) * factor;
        }
    }

    /**
     * Applies the camera's transformation to the canvas rendering context.
     * This translates the canvas so that the camera's position becomes the center of the viewport.
     * Sub-pixel coordinates are used to prevent visual jitter that occurs when rounding to integers
     * in a smooth-scrolling game.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to apply the transformation to.
     */
    applyTransform(ctx: CanvasRenderingContext2D) {
        // Calculate the translation required to center the view on the camera's position.
        const tx = -this.pos.x + ctx.canvas.width / 2;
        const ty = -this.pos.y + ctx.canvas.height / 2;
        ctx.translate(tx, ty);
    }
}
