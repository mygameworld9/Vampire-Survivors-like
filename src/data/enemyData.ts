
import { IEnemyData } from "../utils/types";

export const ENEMY_DATA: { [key: string]: IEnemyData } = {
    SLIME: {
        nameKey: 'enemy.slime.name',
        descriptionKey: 'enemy.slime.desc',
        icon: '🟢',
        hp: 20, // Reduced from 30 for better TTK (2-shot with new Bullet)
        speed: 100,
        damage: 10,
        size: 24,
        xpOrbType: 'SMALL',
        color: '#4caf50',
        goldDrop: [1, 3],
        spriteSheet: './enemies/slime.png',
        spriteWidth: 24,
        spriteHeight: 24,
        animation: { maxFrames: 4 },
        elite: {
            hpMultiplier: 3.0,
            damageMultiplier: 2.0,
            sizeMultiplier: 1.2,
            color: '#ef5350',
            xpOrbType: 'MEDIUM',
            goldDrop: [5, 10]
        }
    },
    SPIDER: {
        nameKey: 'enemy.spider.name',
        descriptionKey: 'enemy.spider.desc',
        icon: '🕷️',
        hp: 15,
        speed: 180,
        damage: 8,
        size: 22,
        xpOrbType: 'SMALL',
        color: '#37474F',
        goldDrop: [1, 3],
        spriteSheet: './enemies/spider.png',
        spriteWidth: 22,
        spriteHeight: 22,
        animation: { maxFrames: 4 },
        elite: {
            hpMultiplier: 2.5,
            damageMultiplier: 1.5,
            speedMultiplier: 1.2,
            sizeMultiplier: 1.2,
            color: '#263238',
            xpOrbType: 'MEDIUM',
            goldDrop: [4, 8]
        }
    },
    BAT: {
        nameKey: 'enemy.bat.name',
        descriptionKey: 'enemy.bat.desc',
        icon: '🦇',
        hp: 15, // Reduced from 20 to ensure high-mobility enemies are fragile
        speed: 150,
        damage: 5,
        size: 20,
        xpOrbType: 'SMALL',
        color: '#7e57c2',
        goldDrop: [1, 2],
        spriteSheet: './enemies/bat.png',
        spriteWidth: 20,
        spriteHeight: 20,
        animation: { maxFrames: 3 },
        elite: {
            hpMultiplier: 2.0,
            damageMultiplier: 1.5,
            speedMultiplier: 1.2,
            sizeMultiplier: 1.1,
            color: '#d500f9',
            goldDrop: [3, 6],
            xpOrbType: 'SMALL'
        }
    },
    MUSHROOM: {
        nameKey: 'enemy.mushroom.name',
        descriptionKey: 'enemy.mushroom.desc',
        icon: '🍄',
        hp: 60,
        speed: 50, // Balanced: Slower tank role, easier to kite
        damage: 12,
        size: 28,
        xpOrbType: 'MEDIUM',
        color: '#E53935',
        goldDrop: [2, 5],
        spriteSheet: './enemies/mushroom.png',
        spriteWidth: 28,
        spriteHeight: 28,
        animation: { maxFrames: 2 },
        elite: {
            hpMultiplier: 3.0,
            damageMultiplier: 2.0,
            sizeMultiplier: 1.3,
            color: '#C62828',
            xpOrbType: 'LARGE',
            goldDrop: [10, 20]
        }
    },
    GHOST: {
        nameKey: 'enemy.ghost.name',
        descriptionKey: 'enemy.ghost.desc',
        icon: '👻',
        hp: 15,
        speed: 220,
        damage: 4,
        size: 18,
        xpOrbType: 'SMALL',
        color: 'rgba(238, 238, 238, 0.8)', // semi-transparent white
        goldDrop: [1, 2],
        spriteSheet: './enemies/ghost.png',
        spriteWidth: 18,
        spriteHeight: 18,
        animation: { maxFrames: 4 },
        elite: {
            hpMultiplier: 2.5,
            damageMultiplier: 2.0,
            speedMultiplier: 1.1,
            sizeMultiplier: 1.1,
            color: 'rgba(239, 83, 80, 0.8)',
            xpOrbType: 'MEDIUM',
            goldDrop: [4, 8]
        }
    },
    GOLEM: {
        nameKey: 'enemy.golem.name',
        descriptionKey: 'enemy.golem.desc',
        icon: '🗿',
        hp: 200, // Balanced: Increased to 200 for proper boss-tier TTK
        speed: 65, // Increased from 50 to prevent easy kiting
        damage: 25,
        size: 40,
        xpOrbType: 'MEDIUM',
        color: '#424242', // dark grey
        goldDrop: [5, 10],
        spriteSheet: './enemies/golem.png',
        spriteWidth: 40,
        spriteHeight: 40,
        animation: { maxFrames: 2 },
        chestDropChance: 0.25, // 25% chance to drop a chest
        elite: {
            hpMultiplier: 2.5,
            damageMultiplier: 1.8,
            sizeMultiplier: 1.1,
            color: '#7e57c2',
            xpOrbType: 'LARGE',
            goldDrop: [20, 40],
            chestDropChance: 0.75
        }
    },
    SKELETON: {
        nameKey: 'enemy.skeleton.name',
        descriptionKey: 'enemy.skeleton.desc',
        icon: '💀',
        hp: 40,
        speed: 80,
        damage: 15,
        size: 28,
        xpOrbType: 'SMALL',
        color: '#e0e0e0',
        goldDrop: [2, 5],
        spriteSheet: './enemies/skeleton.png',
        spriteWidth: 28,
        spriteHeight: 28,
        animation: { maxFrames: 4 },
        elite: {
            hpMultiplier: 2.5,
            damageMultiplier: 1.5,
            sizeMultiplier: 1.15,
            xpOrbType: 'MEDIUM',
            goldDrop: [8, 15]
        }
    },
    TREASURE_GOBLIN: {
        nameKey: 'enemy.goblin.name',
        descriptionKey: 'enemy.goblin.desc',
        icon: '👺',
        hp: 150, // Balanced: Increased to 150 for more chase time
        speed: 130,
        damage: 0, // Doesn't attack
        size: 20,
        xpOrbType: 'LARGE',
        color: '#FFD700', // Gold
        goldDrop: [50, 100],
        aiBehavior: 'FLEE',
        chestDropChance: 0.8,
        spriteSheet: './enemies/goblin.png',
        spriteWidth: 24,
        spriteHeight: 24,
        animation: { maxFrames: 4 },
        elite: { // Mega Goblin
            hpMultiplier: 3.0,
            damageMultiplier: 1.0,
            sizeMultiplier: 1.5,
            color: '#FF6F00',
            xpOrbType: 'LARGE',
            goldDrop: [200, 500],
            chestDropChance: 1.0
        }
    }
};
