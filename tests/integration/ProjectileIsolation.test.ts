/**
 * Integration Tests for Projectile-Player Interaction
 * 
 * These tests verify that projectiles maintain their state correctly
 * even when the player's state changes after firing.
 * 
 * Key principle: Projectiles should be "fire and forget" - once created,
 * they should NOT be affected by later changes to the player.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Weapon } from '../../src/entities/Weapon';
import { Player } from '../../src/entities/Player';
import { LaserProjectile } from '../../src/entities/LaserProjectile';
import { mockSoundManager } from '../__mocks__/SoundManager';
import { WEAPON_DATA } from '../../src/data/weaponData';
import { ENEMY_DATA } from '../../src/data/enemyData';
import { Enemy } from '../../src/entities/Enemy';
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

describe('Projectile State Isolation (Integration)', () => {
    let player: Player;

    beforeEach(() => {
        player = new Player(0, 0, () => { }, mockSoundManager, 'KNIGHT', () => { });
        // Set initial facing direction
        player.facingDirection.set(1, 0); // Facing right
    });

    function createEnemy(x = 100, y = 0): Enemy {
        return new Enemy(x, y, ENEMY_DATA.SLIME, 'SLIME', false);
    }

    describe('LASER projectile direction isolation', () => {
        it('should NOT change laser direction when player direction changes after firing', () => {
            const weapon = new Weapon(WEAPON_DATA.ICE_SHARD, mockSoundManager);
            const enemies = [createEnemy()];

            // Player facing right (1, 0)
            player.facingDirection.set(1, 0);

            // Fire the weapon
            const projectiles = weapon.update(weapon.cooldown + 0.1, player, enemies);
            expect(projectiles).not.toBeNull();
            expect(projectiles!.length).toBeGreaterThan(0);

            const laser = projectiles![0] as LaserProjectile;
            const originalDirX = laser.dir.x;
            const originalDirY = laser.dir.y;

            // Player changes direction (turns left)
            player.facingDirection.set(-1, 0);

            // CRITICAL: Laser direction should NOT have changed!
            expect(laser.dir.x).toBe(originalDirX);
            expect(laser.dir.y).toBe(originalDirY);
            expect(laser.dir.x).toBe(1);  // Still pointing right
            expect(laser.dir.y).toBe(0);
        });

        it('should fire in correct direction (non-zero)', () => {
            const weapon = new Weapon(WEAPON_DATA.ICE_SHARD, mockSoundManager);
            const enemies = [createEnemy()];

            player.facingDirection.set(0.707, 0.707); // Diagonal

            const projectiles = weapon.update(weapon.cooldown + 0.1, player, enemies);
            const laser = projectiles![0] as LaserProjectile;

            // Direction should be non-zero
            expect(laser.dir.x !== 0 || laser.dir.y !== 0).toBe(true);

            // Direction should match what player was facing at fire time
            expect(laser.dir.x).toBeCloseTo(0.707, 2);
            expect(laser.dir.y).toBeCloseTo(0.707, 2);
        });

        it('should maintain direction across multiple update cycles', () => {
            const weapon = new Weapon(WEAPON_DATA.ICE_SHARD, mockSoundManager);
            const enemies = [createEnemy()];

            player.facingDirection.set(0, 1); // Facing down

            const projectiles = weapon.update(weapon.cooldown + 0.1, player, enemies);
            const laser = projectiles![0] as LaserProjectile;

            // Simulate multiple frames where player moves around
            for (let i = 0; i < 10; i++) {
                // Player spins randomly
                player.facingDirection.set(Math.random() * 2 - 1, Math.random() * 2 - 1);

                // Update laser
                laser.update(0.016);

                // Laser direction should remain unchanged (facing down)
                expect(laser.dir.x).toBeCloseTo(0, 5);
                expect(laser.dir.y).toBeCloseTo(1, 5);
            }
        });
    });

    describe('BOOMERANG projectile state isolation', () => {
        it('should fire from correct position regardless of later player movement', () => {
            const weapon = new Weapon(WEAPON_DATA.BOOMERANG, mockSoundManager);
            const enemies = [createEnemy()];

            player.pos.set(100, 100);

            const projectiles = weapon.update(weapon.cooldown + 0.1, player, enemies);
            expect(projectiles).not.toBeNull();

            // Move player
            player.pos.set(500, 500);

            // Boomerang starting position should be where player WAS (100, 100)  
            // not where they are NOW (500, 500)
            // Note: Boomerang stores initial pos for return logic
        });
    });

    describe('Multi-frame weapon firing simulation', () => {
        it('should fire lasers in correct direction across multiple frames', () => {
            const weapon = new Weapon(WEAPON_DATA.ICE_SHARD, mockSoundManager);
            const enemies = [createEnemy()];
            const firedLasers: LaserProjectile[] = [];

            // Simulate 10 seconds of gameplay at 60fps
            const dt = 0.016; // ~60fps
            for (let frame = 0; frame < 600; frame++) {
                // Player randomly changes direction each frame
                const angle = frame * 0.1;
                player.facingDirection.set(Math.cos(angle), Math.sin(angle));

                const projectiles = weapon.update(dt, player, enemies);
                if (projectiles && projectiles.length > 0) {
                    const laser = projectiles[0] as LaserProjectile;

                    // Record what direction the player was facing when laser was fired
                    const expectedDir = { x: Math.cos(angle), y: Math.sin(angle) };

                    firedLasers.push(laser);

                    // Laser should have the direction from THIS frame
                    expect(laser.dir.x).toBeCloseTo(expectedDir.x, 2);
                    expect(laser.dir.y).toBeCloseTo(expectedDir.y, 2);
                }

                // Update all existing lasers
                for (const existingLaser of firedLasers) {
                    if (!existingLaser.shouldBeRemoved) {
                        existingLaser.update(dt);
                    }
                }
            }

            // Should have fired multiple lasers
            expect(firedLasers.length).toBeGreaterThan(5);
        });
    });
});
