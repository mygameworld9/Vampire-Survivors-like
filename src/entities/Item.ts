import { Vector2D } from "../utils/Vector2D";
import { IItemData } from "../utils/types";
import { RARITY_COLORS } from "../data/rarityData";
import { i18nManager } from "../core/i18n";

export class Item {
    pos: Vector2D;
    data: IItemData;
    size = 20;
    shouldBeRemoved = false;
    
    constructor(x: number, y: number, data: IItemData) {
        this.pos = new Vector2D(x, y);
        this.data = data;
    }

    get name(): string {
        return i18nManager.t(this.data.nameKey);
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        // Draw rarity glow/border
        ctx.fillStyle = RARITY_COLORS[this.data.rarity];
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size / 2 + 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw item body
        ctx.fillStyle = this.data.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}
