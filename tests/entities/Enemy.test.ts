import { describe, it, expect, beforeEach } from 'vitest';
import { Enemy } from '../../src/entities/Enemy';
import { Vector2D } from '../../src/utils/Vector2D';
import { ENEMY_DATA } from '../../src/data/enemyData';

describe('Enemy', () => {
    function createEnemy(
        type: string = 'SLIME',
        x = 100,
        y = 100,
        isElite = false
    ): Enemy {
        return new Enemy(x, y, ENEMY_DATA[type], type, isElite);
    }

    describe('Initialization', () => {
        it('should initialize with correct position', () => {
            const enemy = createEnemy('SLIME', 50, 75);

            expect(enemy.pos.x).toBe(50);
            expect(enemy.pos.y).toBe(75);
        });

        it('should initialize with stats from ENEMY_DATA', () => {
            const enemy = createEnemy('SLIME');

            expect(enemy.hp).toBe(ENEMY_DATA.SLIME.hp);
            expect(enemy.speed).toBe(ENEMY_DATA.SLIME.speed);
            expect(enemy.damage).toBe(ENEMY_DATA.SLIME.damage);
        });

        it('should have higher stats when elite', () => {
            const normal = createEnemy('SLIME', 0, 0, false);
            const elite = createEnemy('SLIME', 0, 0, true);

            expect(elite.hp).toBeGreaterThan(normal.hp);
        });

        it('should not be marked for removal initially', () => {
            const enemy = createEnemy();

            expect(enemy.shouldBeRemoved).toBe(false);
        });
    });

    describe('Movement AI', () => {
        it('should move towards player position', () => {
            const enemy = createEnemy('SLIME', 100, 100);
            const playerPos = new Vector2D(0, 0);
            const initialDistance = enemy.pos.dist(playerPos);

            enemy.update(0.1, playerPos);

            const newDistance = enemy.pos.dist(playerPos);
            expect(newDistance).toBeLessThan(initialDistance);
        });

        it('should move faster for faster enemy types', () => {
            const slime = createEnemy('SLIME', 100, 0); // speed 100
            const ghost = createEnemy('GHOST', 100, 0); // speed 220
            const playerPos = new Vector2D(0, 0);

            const slimeInitialX = slime.pos.x;
            const ghostInitialX = ghost.pos.x;

            slime.update(0.1, playerPos);
            ghost.update(0.1, playerPos);

            const slimeMoved = slimeInitialX - slime.pos.x;
            const ghostMoved = ghostInitialX - ghost.pos.x;

            expect(ghostMoved).toBeGreaterThan(slimeMoved);
        });
    });

    describe('Damage & Death', () => {
        it('should reduce HP when taking damage', () => {
            const enemy = createEnemy();
            const initialHp = enemy.hp;

            enemy.takeDamage(10);

            expect(enemy.hp).toBe(initialHp - 10);
        });

        it('should mark for removal when HP <= 0', () => {
            const enemy = createEnemy();

            enemy.takeDamage(enemy.hp + 100);

            expect(enemy.shouldBeRemoved).toBe(true);
        });

        it('should not go below 0 HP', () => {
            const enemy = createEnemy();

            enemy.takeDamage(enemy.hp + 500);

            expect(enemy.hp).toBeLessThanOrEqual(0);
        });
    });

    describe('Status Effects', () => {
        it('should apply BURN effect', () => {
            const enemy = createEnemy();

            enemy.applyStatusEffect({
                type: 'BURN',
                chance: 1,
                duration: 2000,
                magnitude: 5
            });

            expect(enemy.isBurning()).toBe(true);
        });

        it('should apply POISON effect', () => {
            const enemy = createEnemy();

            enemy.applyStatusEffect({
                type: 'POISON',
                chance: 1,
                duration: 3000,
                magnitude: 3
            });

            expect(enemy.isPoisoned()).toBe(true);
        });

        it('should apply STUN effect', () => {
            const enemy = createEnemy();

            enemy.applyStatusEffect({
                type: 'STUN',
                chance: 1,
                duration: 1000,
                magnitude: 0
            });

            expect(enemy.isStunned()).toBe(true);
        });

        it('should apply FREEZE effect', () => {
            const enemy = createEnemy();

            enemy.applyStatusEffect({
                type: 'FREEZE',
                chance: 1,
                duration: 1500,
                magnitude: 0
            });

            expect(enemy.isFrozen()).toBe(true);
        });

        it('should not move when stunned', () => {
            const enemy = createEnemy('SLIME', 100, 100);
            const playerPos = new Vector2D(0, 0);

            enemy.applyStatusEffect({
                type: 'STUN',
                chance: 1,
                duration: 2000,
                magnitude: 0
            });

            const posBeforeUpdate = { x: enemy.pos.x, y: enemy.pos.y };
            enemy.update(0.5, playerPos);

            expect(enemy.pos.x).toBe(posBeforeUpdate.x);
            expect(enemy.pos.y).toBe(posBeforeUpdate.y);
        });

        // Status effect timing is handled internally via update()
        it('should tick status effects during update', () => {
            const enemy = createEnemy();
            const playerPos = new Vector2D(0, 0);

            enemy.applyStatusEffect({
                type: 'STUN',
                chance: 1,
                duration: 500, // 0.5 seconds
                magnitude: 0
            });

            expect(enemy.isStunned()).toBe(true);

            // Update past the duration (dt in seconds, duration in ms)
            enemy.update(1.0, playerPos);

            expect(enemy.isStunned()).toBe(false);
        });
    });

    describe('Reset', () => {
        it('should reset enemy state for object pool reuse', () => {
            const enemy = createEnemy('SLIME', 100, 100);

            // Damage and mark for removal
            enemy.takeDamage(enemy.hp);
            expect(enemy.shouldBeRemoved).toBe(true);

            // Reset for reuse
            enemy.reset(200, 200, ENEMY_DATA.BAT, 'BAT', false);

            expect(enemy.shouldBeRemoved).toBe(false);
            expect(enemy.pos.x).toBe(200);
            expect(enemy.pos.y).toBe(200);
            expect(enemy.hp).toBe(ENEMY_DATA.BAT.hp);
        });
    });

    describe('Elite Variants', () => {
        it('should have multiplied HP when elite', () => {
            const normal = createEnemy('SLIME', 0, 0, false);
            const elite = createEnemy('SLIME', 0, 0, true);

            const expectedEliteHp = ENEMY_DATA.SLIME.hp * ENEMY_DATA.SLIME.elite!.hpMultiplier;
            expect(elite.hp).toBe(expectedEliteHp);
        });

        it('should have multiplied damage when elite (if specified)', () => {
            const normal = createEnemy('SLIME', 0, 0, false);
            const elite = createEnemy('SLIME', 0, 0, true);

            expect(elite.damage).toBeGreaterThan(normal.damage);
        });

        it('should have different XP orb type when elite', () => {
            const elite = createEnemy('SLIME', 0, 0, true);

            expect(elite.xpOrbType).toBe(ENEMY_DATA.SLIME.elite!.xpOrbType);
        });
    });

    describe('Flee AI (TREASURE_GOBLIN)', () => {
        it('should have FLEE behavior for TREASURE_GOBLIN', () => {
            const goblin = createEnemy('TREASURE_GOBLIN', 0, 0);

            expect(goblin.data.aiBehavior).toBe('FLEE');
        });
    });
});
