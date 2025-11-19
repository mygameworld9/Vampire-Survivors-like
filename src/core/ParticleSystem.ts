import { Particle } from "../entities/Particle";

export class ParticleSystem {
    private particles: Particle[] = [];

    /**
     * Spawns a number of particles at a given location.
     * @param x The x-coordinate to spawn at.
     * @param y The y-coordinate to spawn at.
     * @param count The number of particles to create.
     * @param color The color of the particles.
     */
    emit(x: number, y: number, count: number, color: string) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    /**
     * Updates all active particles and removes expired ones.
     * @param dt Delta time since the last frame.
     */
    update(dt: number) {
        for (const p of this.particles) {
            p.update(dt);
        }
        this.particles = this.particles.filter(p => !p.shouldBeRemoved);
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
