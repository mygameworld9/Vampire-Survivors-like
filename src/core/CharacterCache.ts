
/**
 * A static utility class for generating and caching character avatar images.
 * This cache prevents the expensive operation of re-generating an avatar every time it's needed.
 * Avatars are generated on-the-fly as data URLs using the Canvas API.
 */
export class CharacterCache {
    /** @private A cache to store generated avatar data URLs, mapping character IDs to URLs. */
    private static cache: Map<string, string> = new Map();

    /**
     * Retrieves the data URL for a character's avatar.
     * If the avatar is already in the cache, it's returned directly.
     * Otherwise, it's generated, cached, and then returned.
     * @param {string} characterId - The unique identifier for the character (e.g., 'KNIGHT', 'MAGE').
     * @returns {string} The data URL of the generated avatar image.
     */
    public static getAvatarUrl(characterId: string): string {
        if (!this.cache.has(characterId)) {
            this.cache.set(characterId, this.generateAvatar(characterId));
        }
        return this.cache.get(characterId)!;
    }

    /**
     * Generates a unique avatar for a given character ID using the Canvas API.
     * This method contains the specific drawing logic for each character.
     * @private
     * @param {string} id - The character ID to generate an avatar for.
     * @returns {string} A data URL representing the generated PNG image.
     */
    private static generateAvatar(id: string): string {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        // Center coordinates
        const cx = size / 2;
        const cy = size / 2 + 5; // Move down slightly to center vertically
        const radius = 16; // Base radius matching Player size/2 roughly scaled

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1.5, 1.5); // Scale up for avatar visibility

        // Helper for eyes
        const drawEyes = (xOffset: number, yOffset: number, color: string = '#333') => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(xOffset + 3, yOffset, 2.5, 3.5, 0, 0, Math.PI * 2); // Left
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(xOffset + 13, yOffset, 2.5, 3.5, 0, 0, Math.PI * 2); // Right
            ctx.fill();
            
            // Shine
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(xOffset + 4, yOffset - 1, 1, 0, Math.PI*2);
            ctx.arc(xOffset + 14, yOffset - 1, 1, 0, Math.PI*2);
            ctx.fill();
        };

        // --- DRAWING LOGIC COPIED & ADAPTED FROM Player.ts ---
        switch (id) {
            case 'KNIGHT':
                // Body (Silver Armor - Pastel)
                ctx.fillStyle = '#CFD8DC'; 
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();
                // Visor area
                ctx.fillStyle = '#546E7A';
                ctx.beginPath();
                ctx.roundRect(-radius + 4, -6, radius * 2 - 8, 10, 5);
                ctx.fill();
                // Plume (Pastel Red)
                ctx.fillStyle = '#EF9A9A';
                ctx.beginPath();
                ctx.moveTo(0, -radius + 2);
                ctx.quadraticCurveTo(10, -radius - 10, 0, -radius - 12);
                ctx.quadraticCurveTo(-10, -radius - 10, 0, -radius + 2);
                ctx.fill();
                // Detail
                ctx.fillStyle = '#B0BEC5';
                ctx.fillRect(-2, -6, 4, 10);
                break;

            case 'ROGUE':
                // Hood (Pastel Green)
                ctx.fillStyle = '#A5D6A7';
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();
                // Face shadow inside hood
                ctx.fillStyle = '#2E7D32'; 
                ctx.beginPath();
                ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
                ctx.fill();
                // Bandana Mask
                ctx.fillStyle = '#4CAF50';
                ctx.beginPath();
                ctx.moveTo(-radius*0.7, 2);
                ctx.quadraticCurveTo(0, 8, radius*0.7, 2);
                ctx.lineTo(radius*0.7, radius*0.6);
                ctx.quadraticCurveTo(0, radius, -radius*0.7, radius*0.6);
                ctx.fill();
                // Fierce Eyes
                drawEyes(-3, -2, '#FFF');
                break;

            case 'MAGE':
                // Robe (Pastel Blue)
                ctx.fillStyle = '#90CAF9';
                ctx.beginPath();
                ctx.arc(0, 4, radius - 2, 0, Math.PI * 2);
                ctx.fill();
                // Face (Pale)
                ctx.fillStyle = '#FFE0B2';
                ctx.beginPath();
                ctx.arc(0, -2, 10, 0, Math.PI * 2);
                ctx.fill();
                drawEyes(-8, -2);
                // Hat (Pointy Dark Blue)
                ctx.fillStyle = '#1976D2';
                ctx.beginPath();
                ctx.moveTo(-16, -8);
                ctx.lineTo(16, -8);
                ctx.quadraticCurveTo(0, -35, 0, -35); // Pointy tip
                ctx.lineTo(-16, -8);
                ctx.fill();
                // Star on Hat
                ctx.fillStyle = '#FFEB3B';
                ctx.beginPath();
                ctx.arc(0, -20, 3, 0, Math.PI*2);
                ctx.fill();
                // Hat Rim
                ctx.fillStyle = '#1565C0';
                ctx.beginPath();
                ctx.ellipse(0, -8, 18, 5, 0, 0, Math.PI*2);
                ctx.fill();
                break;

            case 'CLERIC':
                // Hood/Robe (Pastel Yellow)
                ctx.fillStyle = '#FFF59D';
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();
                // White trim
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
                ctx.stroke();
                // Gold Symbol (Ankh-like)
                ctx.fillStyle = '#FFB74D';
                ctx.beginPath();
                ctx.arc(0, -6, 4, 0, Math.PI*2); // Top loop
                ctx.fill();
                ctx.fillRect(-2, -4, 4, 10); // Vertical
                ctx.fillRect(-6, 0, 12, 4); // Horizontal
                drawEyes(-2, -4, '#5D4037');
                break;

            case 'HUNTRESS':
                // Hood (Pastel Brown)
                ctx.fillStyle = '#BCAAA4';
                ctx.beginPath();
                ctx.arc(0, -5, 11, 0, Math.PI * 2);
                ctx.fill();
                // Body (Pastel Green)
                ctx.fillStyle = '#C5E1A5';
                ctx.beginPath();
                ctx.arc(0, 7, 11, 0, Math.PI * 2);
                ctx.fill();
                drawEyes(-8, -4);
                // Feather
                ctx.fillStyle = '#FFAB91';
                ctx.beginPath();
                ctx.ellipse(-8, -15, 4, 10, -Math.PI/5, 0, Math.PI*2);
                ctx.fill();
                // Quiver strap
                ctx.strokeStyle = '#8D6E63';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-8, 0);
                ctx.lineTo(8, 14);
                ctx.stroke();
                break;

            case 'WARLOCK':
                // Robe (Pastel Purple)
                ctx.fillStyle = '#CE93D8';
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();
                // Dark aura face
                ctx.fillStyle = '#4A148C';
                ctx.beginPath();
                ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
                ctx.fill();
                // Glowing Eyes
                drawEyes(-4, 0, '#69F0AE');
                // Third Eye Rune
                ctx.fillStyle = '#E040FB';
                ctx.beginPath();
                ctx.moveTo(0, -8);
                ctx.lineTo(-2, -10);
                ctx.lineTo(2, -10);
                ctx.fill();
                // Horns
                ctx.fillStyle = '#EEEEEE';
                ctx.beginPath();
                ctx.moveTo(-8, -8);
                ctx.quadraticCurveTo(-12, -16, -6, -14);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(8, -8);
                ctx.quadraticCurveTo(12, -16, 6, -14);
                ctx.fill();
                break;
        }

        ctx.restore();
        return canvas.toDataURL();
    }
}
