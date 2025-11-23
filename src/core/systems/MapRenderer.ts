import { Camera } from "../Camera";
import { IMapData } from "../../utils/types";

export class MapRenderer {
    constructor(private mapData: IMapData) {}

    draw(ctx: CanvasRenderingContext2D, camera: Camera, width: number, height: number) {
        // Calculate visible tile range
        const camX = camera.pos.x;
        const camY = camera.pos.y;
        const tileSize = this.mapData.tileSize;

        // Top-left visible world coordinate
        const startX = camX - width / 2;
        const startY = camY - height / 2;
        
        // Bottom-right visible world coordinate
        const endX = startX + width;
        const endY = startY + height;

        // Convert to tile indices (add buffer to prevent flickering at edges)
        const startCol = Math.floor(startX / tileSize) - 1;
        const endCol = Math.ceil(endX / tileSize) + 1;
        const startRow = Math.floor(startY / tileSize) - 1;
        const endRow = Math.ceil(endY / tileSize) + 1;

        ctx.save();
        camera.applyTransform(ctx);

        for (let col = startCol; col < endCol; col++) {
            for (let row = startRow; row < endRow; row++) {
                const x = col * tileSize;
                const y = row * tileSize;

                // Checkerboard pattern
                const colorIndex = Math.abs(col + row) % 2;
                ctx.fillStyle = this.mapData.baseColors[colorIndex];
                ctx.fillRect(x, y, tileSize, tileSize);

                // Procedural Decoration
                // Use a pseudo-random seed based on tile position so it stays consistent
                const seed = Math.sin(col * 1234 + row * 5678);
                
                if (seed > 0.7) { // 15% chance for decoration
                    if (this.mapData.decoration === 'flower') {
                        this.drawFlower(ctx, x + tileSize/2, y + tileSize/2, seed);
                    } else if (this.mapData.decoration === 'crack') {
                        this.drawCrack(ctx, x + tileSize/2, y + tileSize/2, seed);
                    }
                }
            }
        }

        ctx.restore();
    }

    private drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number) {
        const flowerColor = seed > 0.85 ? '#F48FB1' : '#FFF59D'; // Pink or Yellow
        const size = 4 + (seed * 2); // Vary size slightly
        
        ctx.fillStyle = '#81C784'; // Stem/Leaves
        ctx.beginPath();
        ctx.arc(x, y + 2, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = flowerColor;
        ctx.beginPath();
        // Simple 5-petal flower
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            ctx.arc(x + Math.cos(angle) * size, y + Math.sin(angle) * size, size/1.5, 0, Math.PI * 2);
        }
        ctx.fill();
        
        // Center
        ctx.fillStyle = '#FFF'; 
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawCrack(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number) {
        ctx.strokeStyle = '#78909C'; // Darker grey
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Simple random lines
        ctx.moveTo(x - 10, y - 5);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 8, y - 8);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 2, y + 10);
        ctx.stroke();
    }
}