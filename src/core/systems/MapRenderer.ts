
import { Camera } from "../Camera";
import { IMapData } from "../../utils/types";

export class MapRenderer {
    private tileCache: Map<string, HTMLCanvasElement> = new Map();
    private readonly CHUNK_SIZE = 1000; // Pixels (10x10 tiles)
    private readonly TILE_SIZE: number;

    constructor(private mapData: IMapData) {
        this.TILE_SIZE = mapData.tileSize;
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
            intensity = (gameTime - DUS