
import { Particle } from "../entities/Particle";
import { ObjectPool } from "../utils/ObjectPool";

export class ParticleSystem {
    private particles: Particle[] = [];
    private pool: ObjectPool<Particle>;

    constructor(pool: ObjectPool<Particle>) {
        this.pool = pool;
    }

    /**
     * Spawns a number of particles at a given location.
     * @param x The x-coordinate to spawn at.
     * @param y The y-coordinate to spawn at.
     * @param count The number of particles to create.
     * @param color The color of the particles.
     */
    emit(x: number, y: number, count: number, color: string) {
        for (let i = 0; i < count; i++) {
            const p = this.pool.get();
            p.reset(x, y, color);
            this.particles.push(p);
        }
    }

    /**
     * Updates all active particles and removes expired ones.
     * @param dt Delta time since the last frame.
     */
    update(dt: number) {
        let i = 0;
        while (i < this.particles.length) {
            const p = this.particles[i];
            p.update(dt);
            if (p.shouldBeRemoved) {
                this.pool.release(p);
                // Swap remove
                this.particles[i] = this.particles[this.particles.length - 1];
                this.particles.pop();
            } else {
                i++;
            }
        }
    }

    /**
     * Draws all active particles to the canvas.
     * @param ctx The canvas rendering context.
     */
    draw(ctx: CanvasRenderingContext2D) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }
}
