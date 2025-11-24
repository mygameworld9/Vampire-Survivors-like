import { Camera } from "../Camera";
import { IMapData } from "../../utils/types";

export class MapRenderer {
    private tileCache: Map<string, HTMLCanvasElement> = new Map();
    private readonly CHUNK_SIZE = 1000; // Pixels (10x10 tiles)
    private readonly TILE_SIZE: number;

    constructor(private mapData: IMapData) {
        this.TILE_SIZE = mapData.tileSize;
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera, width: number, height: number) {
        // Prune chunks that are too far away to free memory
        this.updateCache(camera);

        ctx.save();
        camera.applyTransform(ctx);
        
        // Calculate visible chunks
        const startChunkX = Math.floor((camera.pos.x - width/2) / this.CHUNK_SIZE) - 1;
        const endChunkX = Math.floor((camera.pos.x + width/2) / this.CHUNK_SIZE) + 1;
        const startChunkY = Math.floor((camera.pos.y - height/2) / this.CHUNK_SIZE) - 1;
        const endChunkY = Math.floor((camera.pos.y + height/2) / this.CHUNK_SIZE) + 1;

        for (let x = startChunkX; x <= endChunkX; x++) {
            for (let y = startChunkY; y <= endChunkY; y++) {
                const key = `${x},${y}`;
                let chunk = this.tileCache.get(key);
                if (!chunk) {
                    chunk = this.generateChunk(x, y);
                    this.tileCache.set(key, chunk);
                }
                // Draw the cached chunk image onto the main canvas
                ctx.drawImage(chunk, x * this.CHUNK_SIZE, y * this.CHUNK_SIZE);
            }
        }

        ctx.restore();
    }

    private generateChunk(cx: number, cy: number): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = this.CHUNK_SIZE;
        canvas.height = this.CHUNK_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) return canvas;

        const tilesPerChunk = this.CHUNK_SIZE / this.TILE_SIZE; // 10
        const startCol = cx * tilesPerChunk;
        const startRow = cy * tilesPerChunk;

        for (let c = 0; c < tilesPerChunk; c++) {
            for (let r = 0; r < tilesPerChunk; r++) {
                const col = startCol + c;
                const row = startRow + r;
                const x = c * this.TILE_SIZE;
                const y = r * this.TILE_SIZE;

                // Logic from original draw loop
                const colorIndex = Math.abs(col + row) % 2;
                ctx.fillStyle = this.mapData.baseColors[colorIndex];
                ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);

                // Procedural Decoration
                // Use pseudo-random seed based on tile position
                const seed = Math.sin(col * 1234 + row * 5678);
                
                if (seed > 0.7) { // 15% chance
                    if (this.mapData.decoration === 'flower') {
                        this.drawFlower(ctx, x + this.TILE_SIZE/2, y + this.TILE_SIZE/2, seed);
                    } else if (this.mapData.decoration === 'crack') {
                        this.drawCrack(ctx, x + this.TILE_SIZE/2, y + this.TILE_SIZE/2, seed);
                    }
                }
            }
        }
        return canvas;
    }

    private updateCache(camera: Camera) {
        // Keep chunks within N units of the center visible chunk
        const centerCx = Math.floor(camera.pos.x / this.CHUNK_SIZE);
        const centerCy = Math.floor(camera.pos.y / this.CHUNK_SIZE);
        const keepDist = 2; // Keep 5x5 chunks around player

        for (const key of this.tileCache.keys()) {
            const [cx, cy] = key.split(',').map(Number);
            if (Math.abs(cx - centerCx) > keepDist || Math.abs(cy - centerCy) > keepDist) {
                this.tileCache.delete(key);
            }
        }
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