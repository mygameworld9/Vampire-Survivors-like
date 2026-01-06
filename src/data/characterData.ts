
import { ICharacterData } from "../utils/types";

export const CHARACTER_DATA: { [key: string]: ICharacterData } = {
    KNIGHT: {
        id: 'KNIGHT',
        nameKey: 'character.knight.name',
        descriptionKey: 'character.knight.desc',
        startingWeaponId: 'BULLET',
        startingSkillId: 'TOUGHNESS',
        stats: {
            damageMultiplier: 1.1 // +10% damage bonus
        },
        // --- Animation System Data (Kept for frame timing in Player.ts, but spritesheet ignored for avatars) ---
        spriteSheet: '',
        spriteWidth: 32,
        spriteHeight: 32,
        animations: {
            walkDown: { frameY: 0, maxFrames: 4 },
            walkUp: { frameY: 1, maxFrames: 4 },
            walkLeft: { frameY: 2, maxFrames: 4 },
            walkRight: { frameY: 3, maxFrames: 4 },
            walkDownRight: { frameY: 4, maxFrames: 4 },
            walkDownLeft: { frameY: 5, maxFrames: 4 },
            walkUpRight: { frameY: 6, maxFrames: 4 },
            walkUpLeft: { frameY: 7, maxFrames: 4 },
        }
    },
    ROGUE: {
        id: 'ROGUE',
        nameKey: 'character.rogue.name',
        descriptionKey: 'character.rogue.desc',
        startingWeaponId: 'BOOMERANG',
        startingSkillId: 'SWIFTNESS',
        stats: {
            hp: 80,
            speed: 240 // 20% faster
        },
        spriteSheet: '',
        spriteWidth: 32,
        spriteHeight: 32,
        animations: {
            walkDown: { frameY: 0, maxFrames: 4 },
            walkUp: { frameY: 1, maxFrames: 4 },
            walkLeft: { frameY: 2, maxFrames: 4 },
            walkRight: { frameY: 3, maxFrames: 4 },
            walkDownRight: { frameY: 4, maxFrames: 4 },
            walkDownLeft: { frameY: 5, maxFrames: 4 },
            walkUpRight: { frameY: 6, maxFrames: 4 },
            walkUpLeft: { frameY: 7, maxFrames: 4 },
        }
    },
    MAGE: {
        id: 'MAGE',
        nameKey: 'character.mage.name',
        descriptionKey: 'character.mage.desc',
        startingWeaponId: 'SUNFIRE',
        startingSkillId: 'REGENERATION',
        stats: {
            hp: 90,
            speed: 180, // 10% slower
            hpRegen: 1.5 // Balanced: Increased to emphasize sustain playstyle
        },
        spriteSheet: '',
        spriteWidth: 32,
        spriteHeight: 32,
        animations: {
            walkDown: { frameY: 0, maxFrames: 4 },
            walkUp: { frameY: 1, maxFrames: 4 },
            walkLeft: { frameY: 2, maxFrames: 4 },
            walkRight: { frameY: 3, maxFrames: 4 },
            walkDownRight: { frameY: 4, maxFrames: 4 },
            walkDownLeft: { frameY: 5, maxFrames: 4 },
            walkUpRight: { frameY: 6, maxFrames: 4 },
            walkUpLeft: { frameY: 7, maxFrames: 4 },
        }
    },
    CLERIC: {
        id: 'CLERIC',
        nameKey: 'character.cleric.name',
        descriptionKey: 'character.cleric.desc',
        startingWeaponId: 'MAGIC_MISSILE',
        startingSkillId: 'REGENERATION',
        stats: {
            hp: 110,
            hpRegen: 1.0
        },
        spriteSheet: '',
        spriteWidth: 32,
        spriteHeight: 32,
        animations: {
            walkDown: { frameY: 0, maxFrames: 4 },
            walkUp: { frameY: 1, maxFrames: 4 },
            walkLeft: { frameY: 2, maxFrames: 4 },
            walkRight: { frameY: 3, maxFrames: 4 },
            walkDownRight: { frameY: 4, maxFrames: 4 },
            walkDownLeft: { frameY: 5, maxFrames: 4 },
            walkUpRight: { frameY: 6, maxFrames: 4 },
            walkUpLeft: { frameY: 7, maxFrames: 4 },
        }
    },
    HUNTRESS: {
        id: 'HUNTRESS',
        nameKey: 'character.huntress.name',
        descriptionKey: 'character.huntress.desc',
        startingWeaponId: 'BOOMERANG',
        startingSkillId: 'SWIFTNESS',
        stats: {
            hp: 90,
            speed: 230
        },
        spriteSheet: '',
        spriteWidth: 32,
        spriteHeight: 32,
        animations: {
            walkDown: { frameY: 0, maxFrames: 4 },
            walkUp: { frameY: 1, maxFrames: 4 },
            walkLeft: { frameY: 2, maxFrames: 4 },
            walkRight: { frameY: 3, maxFrames: 4 },
            walkDownRight: { frameY: 4, maxFrames: 4 },
            walkDownLeft: { frameY: 5, maxFrames: 4 },
            walkUpRight: { frameY: 6, maxFrames: 4 },
            walkUpLeft: { frameY: 7, maxFrames: 4 },
        }
    },
    WARLOCK: {
        id: 'WARLOCK',
        nameKey: 'character.warlock.name',
        descriptionKey: 'character.warlock.desc',
        startingWeaponId: 'ICE_SHARD',
        startingSkillId: 'TOUGHNESS',
        stats: {
            hp: 75,
            statusEffectDuration: 1.5 // +50% status duration as compensation for low HP
        },
        spriteSheet: '',
        spriteWidth: 32,
        spriteHeight: 32,
        animations: {
            walkDown: { frameY: 0, maxFrames: 4 },
            walkUp: { frameY: 1, maxFrames: 4 },
            walkLeft: { frameY: 2, maxFrames: 4 },
            walkRight: { frameY: 3, maxFrames: 4 },
            walkDownRight: { frameY: 4, maxFrames: 4 },
            walkDownLeft: { frameY: 5, maxFrames: 4 },
            walkUpRight: { frameY: 6, maxFrames: 4 },
            walkUpLeft: { frameY: 7, maxFrames: 4 },
        }
    }
};
