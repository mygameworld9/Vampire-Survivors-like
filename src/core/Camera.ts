import { Vector2D } from "../utils/Vector2D";

export class Camera {
    pos: Vector2D;
    constructor(x: number, y: number) {
        this.pos = new Vector2D(x, y);
    }

    update(playerPos: Vector2D) {
        // Smooth follow - increased factor from 0.1 to 0.15 for a tighter follow
        this.pos.x += (playerPos.x - this.pos.x) * 0.15;
        this.pos.y += (playerPos.y - this.pos.y) * 0.15;
    }

    applyTransform(ctx: CanvasRenderingContext2D) {
        ctx.translate(-this.pos.x + ctx.canvas.width / 2, -this.pos.y + ctx.canvas.height / 2);
    }
}