
import { Camera } from "../Camera";
import { IMapData } from "../../utils/types";

export class MapRenderer {
    private tileCache: Map<string, HTMLCanvasElement> = new Map();
    private readonly CHUNK_SIZE = 1000; // Pixels (10x10 tiles)
    private readonly TILE_SIZE: number;

    constructor(private mapData: IMapData) {
        this.TILE_SIZE = mapData.tileSize;
    }

    private updateCache(camera: Camera) {
        // Simple pruning: remove chunks very far away
        const KEEP_DISTANCE = 3000;
        for (const [key, _] of this.tileCache) {
            const [cx, cy] = key.split(',').map(Number);
            const chunkWorldX = cx * this.CHUNK_SIZE + this.CHUNK_SIZE / 2;
            const chunkWorldY = cy * this.CHUNK_SIZE + this.CHUNK_SIZE / 2;
            
            const dist = Math.hypot(camera.pos.x - chunkWorldX, camera.pos.y - chunkWorldY);
            if (dist > KEEP_DISTANCE) {
                this.tileCache.delete(key);
            }
        }
    }

    private generateChunk(cx: number, cy: number): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = this.CHUNK_SIZE;
        canvas.height = this.CHUNK_SIZE;
        const ctx = canvas.getContext('2d')!;

        const startX = cx * this.CHUNK_SIZE;
        const startY = cy * this.CHUNK_SIZE;
        const tilesPerChunk = this.CHUNK_SIZE / this.TILE_SIZE;

        for (let x = 0; x < tilesPerChunk; x++) {
            for (let y = 0; y < tilesPerChunk; y++) {
                const worldX = startX + x * this.TILE_SIZE;
                const worldY = startY + y * this.TILE_SIZE;

                // Checkerboard pattern
                const isEven = (Math.floor(worldX / this.TILE_SIZE) + Math.floor(worldY / this.TILE_SIZE)) % 2 === 0;
                ctx.fillStyle = isEven ? this.mapData.baseColors[0] : this.mapData.baseColors[1];
                ctx.fillRect(x * this.TILE_SIZE, y * this.TILE_SIZE, this.TILE_SIZE, this.TILE_SIZE);

                // Decor
                if (this.mapData.decoration !== 'none') {
                    // Simple deterministic random based on position
                    const seed = Math.sin(worldX * 12.9898 + worldY * 78.233) * 43758.5453;
                    const rand = seed - Math.floor(seed);
                    
                    if (rand > 0.8) {
                        this.drawDecoration(ctx, x * this.TILE_SIZE, y * this.TILE_SIZE, this.mapData.decoration, rand);
                    }
                }
            }
        }
        return canvas;
    }

    private drawDecoration(ctx: CanvasRenderingContext2D, x: number, y: number, type: string, rand: number) {
        const cx = x + this.TILE_SIZE / 2;
        const cy = y + this.TILE_SIZE / 2;
        
        ctx.save();
        ctx.translate(cx, cy);
        
        if (type === 'flower') {
            ctx.fillStyle = rand > 0.9 ? '#F48FB1' : '#FFF59D'; // Pink or Yellow
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI*2);
            ctx.fill();
        } else if (type === 'crack') {
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-10, -10);
            ctx.lineTo(5, 5);
            ctx.lineTo(10, -2);
            ctx.stroke();
        } else if (type === 'pebble') {
             ctx.fillStyle = 'rgba(0,0,0,0.1)';
             ctx.beginPath();
             ctx.arc(3, 3, 3, 0, Math.PI*2);
             ctx.fill();
        }
        
        ctx.restore();
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera, width: number, height: number, gameTime: number) {
        // Prune chunks that are too far away
        this.updateCache(camera);

        ctx.save();
        camera.applyTransform(ctx);
        
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
                ctx.drawImage(chunk, x * this.CHUNK_SIZE, y * this.CHUNK_SIZE);
            }
        }

        ctx.restore();

        // --- Time of Day Overlay ---
        // 0-300s: Day (Transparent)
        // 300s-600s: Sunset (Orange)
        // 600s+: Night (Blue)
        let overlayColor = 'transparent';
        let intensity = 0;
        
        const DUSK_START = 300; // 5 minutes
        const NIGHT_START = 600; // 10 minutes

        if (gameTime > DUSK_START && gameTime <= NIGHT_START) {
            // Sunset Transition
            intensity = (gameTime - DUSK_START) / (NIGHT_START - DUSK_START);
            // Orange overlay
            overlayColor = `rgba(255, 87, 34, ${intensity * 0.3})`;
        } else if (gameTime > NIGHT_START) {
            // Night
            overlayColor = `rgba(13, 71, 161, 0.4)`;
        }

        if (overlayColor !== 'transparent') {
            ctx.fillStyle = overlayColor;
            ctx.fillRect(0, 0, width, height); // UI overlay, not transformed
        }
    }
}
