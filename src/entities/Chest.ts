
import { Vector2D } from "../utils/Vector2D";
import { IChestData } from "../utils/types";

export class Chest {
    pos: Vector2D;
    size: number;
    hp: number = 1;
    shouldBeRemoved = false;
    state: 'closed' | 'opening' | 'opened' = 'closed';
    public isBeingOpened = false;

    private data: IChestData;
    private globalTime = Math.random() * 1000;

    constructor(x: number, y: number, data: IChestData) {
        this.pos = new Vector2D(x, y);
        this.data = data;
        this.size = data.size;
    }

    public startOpening() {
        if (this.state === 'closed') {
            this.state = 'opening';
        }
    }
    
    public takeDamage(amount: number) {
        if (this.state !== 'closed') return;
        this.hp -= amount;
    }

    update(dt: number) {
        this.globalTime += dt;
        // Logic for state transition handled by Game/UI mostly, 
        // but we keep the entity alive until the UI animation is done.
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Hide the world entity when the UI sequence is active to prevent duplication/clutter
        if (this.isBeingOpened) return;

        // Procedural Cute Chest
        const breathe = Math.sin(this.globalTime * 3) * 0.05; // Breathing effect
        const scaleX = 1 + breathe;
        const scaleY = 1 - breathe;
        
        const w = this.size * 1.2;
        const h = this.size;
        const x = this.pos.x;
        const y = this.pos.y + (this.size * breathe * 0.5); // Adjust y to keep bottom anchored

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scaleX, scaleY);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, h/2 - 2, w/2, h/4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chest Body (Bottom)
        ctx.fillStyle = '#8D6E63'; // Wood Brown
        ctx.beginPath();
        ctx.roundRect(-w/2, -h/4, w, h * 0.75, 8);
        ctx.fill();
        
        // Gold Bands (Vertical)
        ctx.fillStyle = '#FFCA28';
        ctx.fillRect(-w/2 + 6, -h/4, 6, h * 0.75);
        ctx.fillRect(w/2 - 12, -h/4, 6, h * 0.75);

        // Chest Lid (Top) - Slightly overlapping
        ctx.fillStyle = '#A1887F'; // Lighter Wood
        ctx.beginPath();
        ctx.roundRect(-w/2 - 2, -h/2, w + 4, h * 0.4, 10);
        ctx.fill();
        
        // Gold Bands on Lid
        ctx.fillStyle = '#FFCA28';
        ctx.fillRect(-w/2 + 6, -h/2, 6, h * 0.4);
        ctx.fillRect(w/2 - 12, -h/2, 6, h * 0.4);

        // Lock
        ctx.fillStyle = '#CFD8DC'; // Silver
        ctx.beginPath();
        ctx.arc(0, -h/10, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#37474F'; // Keyhole
        ctx.beginPath();
        ctx.arc(0, -h/10 - 1, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-1, -h/10, 2, 4);

        ctx.restore();
    }
}
