


import { Game } from "../Game";

export class MinimapRenderer {
    private readonly SCALE = 0.15; // Scale factor
    private readonly MAP_SIZE = 150; // Canvas pixel size (assuming square)
    private readonly RANGE = 1500; // World units range radius

    render(ctx: CanvasRenderingContext2D, game: Game) {
        const player = game.player;
        const size = ctx.canvas.width;
        const center = size / 2;

        ctx.clearRect(0, 0, size, size);

        // Background Radar
        ctx.fillStyle = 'rgba(0, 20, 40, 0.6)';
        ctx.beginPath();
        ctx.arc(center, center, center - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(66, 165, 245, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Helper for coordinate transform
        // Transforms world coordinate to minimap coordinate relative to player center
        const toMap = (wx: number, wy: number) => {
            const dx = wx - player.pos.x;
            const dy = wy - player.pos.y;
            // Scale down distance
            const scaledX = dx * (center / this.RANGE);
            const scaledY = dy * (center / this.RANGE);
            
            return {
                x: center + scaledX,
                y: center + scaledY,
                distSq: dx*dx + dy*dy
            };
        };

        const maxDistSq = this.RANGE * this.RANGE;

        // 1. Draw Exploration Points (Cyan Diamonds - High Priority)
        ctx.fillStyle = '#00BCD4';
        for (const p of game.explorationPoints) {
            const m = toMap(p.pos.x, p.pos.y);
            // Always draw indicators for exploration points on the edge if out of range
            let drawX = m.x;
            let drawY = m.y;
            
            if (m.distSq > maxDistSq) {
                const angle = Math.atan2(p.pos.y - player.pos.y, p.pos.x - player.pos.x);
                drawX = center + Math.cos(angle) * (center - 8);
                drawY = center + Math.sin(angle) * (center - 8);
            } else {
                // Clip inside
                if (Math.hypot(drawX - center, drawY - center) > center - 2) continue;
            }

            ctx.beginPath();
            ctx.moveTo(drawX, drawY - 4);
            ctx.lineTo(drawX + 4, drawY);
            ctx.lineTo(drawX, drawY + 4);
            ctx.lineTo(drawX - 4, drawY);
            ctx.fill();
        }

        // 2. Draw Chests (Gold Squares)
        ctx.fillStyle = '#FFD700';
        for (const c of game.chests) {
            if (c.isBeingOpened) continue;
            const m = toMap(c.pos.x, c.pos.y);
            if (m.distSq < maxDistSq) {
                ctx.fillRect(m.x - 2, m.y - 2, 4, 4);
            }
        }

        // 3. Draw Enemies (Red Dots)
        // Optimization: only draw every Nth enemy if count is high, or limit by strict range
        for (const e of game.enemies) {
            const m = toMap(e.pos.x, e.pos.y);
            if (m.distSq < maxDistSq) {
                if (e.isElite) {
                    ctx.fillStyle = '#FF5252';
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, 3, 0, Math.PI*2);
                    ctx.fill();
                } else {
                    ctx.fillStyle = '#ef9a9a'; // Lighter red for normal
                    ctx.fillRect(m.x - 1, m.y - 1, 2, 2);
                }
            }
        }

        // 4. Draw Player (Arrow in Center)
        ctx.save();
        ctx.translate(center, center);
        const angle = Math.atan2(player.facingDirection.y, player.facingDirection.x);
        ctx.rotate(angle);
        ctx.fillStyle = '#69F0AE'; // Green
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(-4, 3);
        ctx.lineTo(-4, -3);
        ctx.fill();
        ctx.restore();
    }
}