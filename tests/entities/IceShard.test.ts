import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Weapon } from '../../src/entities/Weapon';
import { Player } from '../../src/entities/Player';
import { Enemy } from '../../src/entities/Enemy';
import { mockSoundManager } from '../__mocks__/SoundManager';
import { WEAPON_DATA } from '../../src/data/weaponData';
import { ENEMY_DATA } from '../../src/data/enemyData';
import { Vector2D } from '../../src/utils/Vector2D';

// Mock ProgressionManager singleton
vi.mock('../../src/core/ProgressionManager', () => ({
    progressionManager: {
        getGold: vi.fn(() => 0),
        getPlayerBonuses: vi.fn(() => ({
            damageMultiplier: 0, maxHpAdd: 0, speedMultiplier: 0,
            hpRegenAdd: 0, goldMultiplier: 0, revivesAdd: 0
        }))
    }
}));

vi.stubGlobal('Image', class {
    src = '';
    onload = () => { };
});

describe('ICE_SHARD Weapon - SLOW Effect', () => {
    let player: Player;

    beforeEach(() => {
        player = new Player(0, 0, () => { }, mockSoundManager, 'KNIGHT', () => { });
    });

    function createEnemy(x = 100, y = 0): Enemy {
        return new Enemy(x, y, ENEMY_DATA.SLIME, 'SLIME', false);
    }

    describe('ICE_SHARD weapon data', () => {
        it('should have SLOW statusEffect defined', () => {
            const data = WEAPON_DATA.ICE_SHARD;

            expect(data).toBeDefined();
            expect(data.statusEffect).toBeDefined();
            expect(data.statusEffect!.type).toBe('SLOW');
            expect(data.statusEffect!.chance).toBe(1.0);
            expect(data.statusEffect!.duration).toBe(2000);
            expect(data.statusEffect!.magnitude).toBe(0.5);
        });

        it('should have LASER type', () => {
            const data = WEAPON_DATA.ICE_SHARD;
            expect(data.type).toBe('LASER');
        });

        it('should have ICE tag', () => {
            const data = WEAPON_DATA.ICE_SHARD;
            expect(data.tags).toContain('ICE');
        });
    });

    describe('Enemy SLOW effect application', () => {
        it('should reduce enemy speed when SLOW is applied', () => {
            const enemy = createEnemy();
            const originalSpeed = enemy.speed;

            // Apply SLOW effect (ICE_SHARD's effect)
            enemy.applyStatusEffect({
                type: 'SLOW',
                chance: 1.0,
                duration: 2000,
                magnitude: 0.5
            });

            // Process status effects  
            const playerPos = new Vector2D(0, 0);
            enemy.update(0.016, playerPos); // ~60fps frame

            expect(enemy.speed).toBe(originalSpeed * 0.5);
        });

        it('should restore speed after SLOW expires', () => {
            const enemy = createEnemy();
            const originalSpeed = enemy.speed;

            enemy.applyStatusEffect({
                type: 'SLOW',
                chance: 1.0,
                duration: 100, // Very short duration (100ms)
                magnitude: 0.5
            });

            const playerPos = new Vector2D(0, 0);

            // First update - SLOW should be active
            enemy.update(0.05, playerPos); // 50ms elapsed
            expect(enemy.speed).toBe(originalSpeed * 0.5);

            // Second update - SLOW should expire (total 150ms > 100ms duration)
            enemy.update(0.1, playerPos); // 100ms more elapsed
            expect(enemy.speed).toBe(originalSpeed);
        });

        it('should slow enemy movement distance', () => {
            const normalEnemy = createEnemy(100, 0);
            const slowedEnemy = createEnemy(100, 0);
            const playerPos = new Vector2D(0, 0);

            // Apply SLOW to one enemy
            slowedEnemy.applyStatusEffect({
                type: 'SLOW',
                chance: 1.0,
                duration: 5000,
                magnitude: 0.5
            });

            const normalStartX = normalEnemy.pos.x;
            const slowedStartX = slowedEnemy.pos.x;

            // Update both
            normalEnemy.update(1.0, playerPos);
            slowedEnemy.update(1.0, playerPos);

            const normalMoved = normalStartX - normalEnemy.pos.x;
            const slowedMoved = slowedStartX - slowedEnemy.pos.x;

            // Slowed enemy should move ~half the distance
            expect(slowedMoved).toBeCloseTo(normalMoved * 0.5, 1);
        });
    });

    describe('Weapon creation and firing', () => {
        it('should create ICE_SHARD weapon with statusEffect', () => {
            const weapon = new Weapon(WEAPON_DATA.ICE_SHARD, mockSoundManager);

            expect(weapon.statusEffect).toBeDefined();
            expect(weapon.statusEffect!.type).toBe('SLOW');
        });

        it('should fire laser projectiles', () => {
            const weapon = new Weapon(WEAPON_DATA.ICE_SHARD, mockSoundManager);
            const enemies = [createEnemy()];

            const projectiles = weapon.update(weapon.cooldown + 0.1, player, enemies);

            expect(projectiles).not.toBeNull();
            expect(projectiles!.length).toBeGreaterThan(0);
        });
    });
});
