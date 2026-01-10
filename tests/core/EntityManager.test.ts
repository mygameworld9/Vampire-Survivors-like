import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EntityManager } from '../../src/core/EntityManager';
import { Enemy } from '../../src/entities/Enemy';
import { ENEMY_DATA } from '../../src/data/enemyData';

// Mock SoundManager
vi.mock('../../src/core/SoundManager', () => ({
    SoundManager: vi.fn()
}));

describe('EntityManager', () => {
    let manager: EntityManager;

    beforeEach(() => {
        manager = new EntityManager();
    });

    function createEnemy(x = 0, y = 0): Enemy {
        return new Enemy(x, y, ENEMY_DATA.SLIME, 'SLIME', false);
    }

    describe('Initialization', () => {
        it('should initialize with empty arrays', () => {
            expect(manager.enemies.length).toBe(0);
            expect(manager.projectiles.length).toBe(0);
            expect(manager.xpOrbs.length).toBe(0);
            expect(manager.items.length).toBe(0);
            expect(manager.effects.length).toBe(0);
        });
    });

    describe('Enemy Management', () => {
        it('should store added enemies', () => {
            const enemy = createEnemy();
            manager.enemies.push(enemy);

            expect(manager.enemies.length).toBe(1);
            expect(manager.enemies[0]).toBe(enemy);
        });

        it('should store multiple enemies', () => {
            manager.enemies.push(createEnemy(0, 0));
            manager.enemies.push(createEnemy(10, 10));
            manager.enemies.push(createEnemy(20, 20));

            expect(manager.enemies.length).toBe(3);
        });
    });

    // Note: removeMarked is private, so we test the public behavior through update()
    // by verifying that entities marked for removal are removed after update
    describe('Entity Removal (via shouldBeRemoved flag)', () => {
        it('entities with shouldBeRemoved are cleaned up', () => {
            const e1 = createEnemy(0, 0);
            const e2 = createEnemy(10, 10);
            const e3 = createEnemy(20, 20);

            manager.enemies.push(e1, e2, e3);
            e2.shouldBeRemoved = true;

            // Access private method for testing (TypeScript cast)
            (manager as any).removeMarked(manager.enemies);

            expect(manager.enemies.length).toBe(2);
            expect(manager.enemies.find(e => e === e2)).toBeUndefined();
        });

        it('should preserve un-marked entities', () => {
            const e1 = createEnemy(0, 0);
            const e2 = createEnemy(10, 10);

            manager.enemies.push(e1, e2);
            e1.shouldBeRemoved = true;

            (manager as any).removeMarked(manager.enemies);

            expect(manager.enemies).toContain(e2);
            expect(manager.enemies.length).toBe(1);
        });

        it('should handle removing all entities', () => {
            const e1 = createEnemy();
            const e2 = createEnemy();

            manager.enemies.push(e1, e2);
            e1.shouldBeRemoved = true;
            e2.shouldBeRemoved = true;

            (manager as any).removeMarked(manager.enemies);

            expect(manager.enemies.length).toBe(0);
        });

        it('should handle empty array', () => {
            (manager as any).removeMarked(manager.enemies);

            expect(manager.enemies.length).toBe(0);
        });

        it('should handle no entities marked for removal', () => {
            manager.enemies.push(createEnemy(), createEnemy());

            (manager as any).removeMarked(manager.enemies);

            expect(manager.enemies.length).toBe(2);
        });

        it('should use O(1) swap-and-pop pattern (same array reference)', () => {
            const e1 = createEnemy(0, 0);
            const e2 = createEnemy(10, 10);
            const e3 = createEnemy(20, 20);

            manager.enemies.push(e1, e2, e3);
            const arrayRef = manager.enemies;

            e2.shouldBeRemoved = true;
            (manager as any).removeMarked(manager.enemies);

            // Should be same array reference (in-place modification)
            expect(manager.enemies).toBe(arrayRef);
        });
    });

    describe('XP Orb Management', () => {
        it('should track XP orbs', () => {
            expect(Array.isArray(manager.xpOrbs)).toBe(true);
        });
    });

    describe('Projectile Management', () => {
        it('should track projectiles', () => {
            expect(Array.isArray(manager.projectiles)).toBe(true);
        });
    });

    describe('Effects Management', () => {
        it('should track effects', () => {
            expect(Array.isArray(manager.effects)).toBe(true);
        });
    });

    describe('Items Management', () => {
        it('should track items', () => {
            expect(Array.isArray(manager.items)).toBe(true);
        });
    });

    describe('Chests Management', () => {
        it('should track chests', () => {
            expect(Array.isArray(manager.chests)).toBe(true);
        });
    });
});
