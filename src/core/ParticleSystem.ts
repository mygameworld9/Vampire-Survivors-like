
import { Particle } from "../entities/Particle";
import { ObjectPool } from "../utils/ObjectPool";

/**
 * Manages the creation, updating, and rendering of all particle effects in the game.
 * It uses an object pool to efficiently reuse particle instances, minimizing garbage collection.
 */
export class ParticleSystem {
    /** @private An array of all active particles currently in the system. */
    private particles: Particle[] = [];
    /** @private The object pool used to get and release particle instances. */
    private pool: ObjectPool<Particle>;

    /**
     * Creates a new ParticleSystem.
     * @param {ObjectPool<Particle>} pool - The object pool to use for managing particle instances.
     */
    constructor(pool: ObjectPool<Particle>) {
        this.pool = pool;
    }

    /**
     * Spawns a specified number of particles at a given location with a specific color.
     * Particles are retrieved from the object pool.
     * @param {number} x - The x-coordinate where particles will be spawned.
     * @param {number} y - The y-coordinate where particles will be spawned.
     * @param {number} count - The number of particles to create.
     * @param {string} color - The color of the particles.
     */
    emit(x: number, y: number, count: number, color: string) {
        for (let i = 0; i < count; i++) {
            const p = this.pool.get();
            p.reset(x, y, color);
            this.particles.push(p);
        }
    }

    /**
     * Updates the state of all active particles.
     * This moves particles, decreases their lifespan, and removes them from the system
     * once they expire by returning them to the object pool.
     * @param {number} dt - The time elapsed since the last frame, in seconds.
     */
    update(dt: number) {
        let i = 0;
        while (i < this.particles.length) {
            const p = this.particles[i];
            p.update(dt);
            if (p.shouldBeRemoved) {
                this.pool.release(p);
                // Swap remove for performance
                this.particles[i] = this.particles[this.particles.length - 1];
                this.particles.pop();
            } else {
                i++;
            }
        }
    }

    /**
     * Renders all active particles to the screen.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
     */
    draw(ctx: CanvasRenderingContext2D) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }
}
