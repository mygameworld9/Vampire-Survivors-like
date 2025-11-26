
import { Vector2D } from "../utils/Vector2D";
import { IPropData } from "../utils/types";

export class Prop {
    pos: Vector2D;
    data: IPropData;
    hp: number;
    maxHp: number;
    size: number;
    shouldBeRemoved = false;
    hitFlashTimer = 0;

    constructor(x: number, y: number, data: IPropData) {
        this.pos = new Vector2D(x, y);
        this.data = data;
        this.size = data.size;
        this.maxHp = data.hp;
        this.hp = data.hp;
    }

    reset(x: number, y: number, data: IPropData) {
        this.pos.x = x;
        this.pos.y = y;
        this.data = data;
        this.size = data.size;
        this.maxHp = data.hp;
        this.hp = data.hp;
        this.shouldBeRemoved = false;
        this.hitFlashTimer = 0;
    }

    update(dt: number) {
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= dt;
        }
    }

    takeDamage(amount: number) {
        this.hp -= amount;
        this.hitFlashTimer = 0.1; // Flash white for 100ms
        if (this.hp <= 0) {
            this.shouldBeRemoved = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        if (this.hitFlashTimer > 0) {
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = 'white';
        } else {
            ctx.fillStyle = this.data.color;
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, this.size/2 - 2, this.size/2, this.size/4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main Body
        ctx.fillStyle = this.hitFlashTimer > 0 ? '#fff' : this.data.color;
        
        if (this.data.type === 'CRATE') {
            const s = this.size;
            ctx.fillRect(-s/2, -s/2, s, s);
            
            // Crate Detail (X or Frame)
            ctx.strokeStyle = '#3E2723';
            ctx.lineWidth = 2;
            ctx.strokeRect(-s/2, -s/2, s, s);
            ctx.beginPath();
            ctx.moveTo(-s/2, -s/2); ctx.lineTo(s/2, s/2);
            ctx.moveTo(s/2, -s/2); ctx.lineTo(-s/2, s/2);
            ctx.stroke();

        } else if (this.data.type === 'BARREL') {
            const r = this.size / 2;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            
            // Barrel Bands
            ctx.strokeStyle = '#212121'; // Black iron
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();
            
            // Wood Plank lines
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.moveTo(0, -r); ctx.lineTo(0, r);
            ctx.stroke();

        }

        ctx.restore();
    }
}
