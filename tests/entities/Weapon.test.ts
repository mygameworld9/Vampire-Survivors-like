import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Weapon } from '../../src/entities/Weapon';
import { Player } from '../../src/entities/Player';
import { Enemy } from '../../src/entities/Enemy';
import { mockSoundManager } from '../__mocks__/SoundManager';
import { WEAPON_DATA } from '../../src/data/weaponData';
import { ENEMY_DATA } from '../../src/data/enemyData';

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

// Mock Image
vi.stubGlobal('Image', class {
    src = '';
    onload = () => { };
});

describe('Weapon', () => {
    let player: Player;

    beforeEach(() => {
        player = new Player(0, 0, () => { }, mockSoundManager, 'KNIGHT', () => { });
    });

    function createEnemy(x = 100, y = 100): Enemy {
        return new Enemy(x, y, ENEMY_DATA.SLIME, 'SLIME', false);
    }

    describe('Initialization', () => {
        it('should initialize MAGIC_MISSILE with correct properties', () => {
            const weapon = new Weapon(WEAPON_DATA.MAGIC_MISSILE, mockSoundManager);

            expect(weapon.id).toBe('MAGIC_MISSILE');
            expect(weapon.level).toBe(1);
            expect(weapon.baseDamage).toBeGreaterThan(0);
            expect(weapon.cooldown).toBeGreaterThan(0);
        });

        it('should have correct type for different weapons', () => {
            const projectile = new Weapon(WEAPON_DATA.BULLET, mockSoundManager);
            const boomerang = new Weapon(WEAPON_DATA.BOOMERANG, mockSoundManager);

            expect(projectile.type).toBe('PROJECTILE');
            expect(boomerang.type).toBe('BOOMERANG');
        });
    });

    describe('Cooldown Mechanics', () => {
        it('should fire immediately on first update with low cooldown', () => {
            const weapon = new Weapon(WEAPON_DATA.BULLET, mockSoundManager);
            const enemies = [createEnemy()];

            // First update with full cooldown time should fire
            const result = weapon.update(weapon.cooldown + 0.01, player, enemies);

            expect(result).not.toBeNull();
        });

        it('should not fire before cooldown expires', () => {
            const weapon = new Weapon(WEAPON_DATA.BULLET, mockSoundManager);
            const enemies = [createEnemy()];

            // Fire once to reset cooldown
            weapon.update(weapon.cooldown + 0.1, player, enemies);

            // Now try to fire again immediately - should fail
            const result = weapon.update(0.01, player, enemies);

            expect(result).toBeNull();
        });

        it('should fire again after cooldown expires', () => {
            const weapon = new Weapon(WEAPON_DATA.BULLET, mockSoundManager);
            const enemies = [createEnemy()];

            // Fire once
            weapon.update(weapon.cooldown + 0.1, player, enemies);

            // Wait for cooldown
            const result = weapon.update(weapon.cooldown + 0.1, player, enemies);

            expect(result).not.toBeNull();
        });
    });

    describe('Damage Calculation', () => {
        it('should return damage value', () => {
            const weapon = new Weapon(WEAPON_DATA.BULLET, mockSoundManager);

            expect(weapon.damage).toBe(weapon.baseDamage);
        });

        it('should apply damage multiplier after level up', () => {
            const weapon = new Weapon(WEAPON_DATA.BULLET, mockSoundManager);
            const baseDamage = weapon.damage;

            weapon.levelUp();

            // Damage should increase or stay same depending on upgrade path
            expect(weapon.damage).toBeGreaterThanOrEqual(baseDamage);
        });
    });

    describe('Level Up', () => {
        it('should increment level on levelUp', () => {
            const weapon = new Weapon(WEAPON_DATA.BULLET, mockSoundManager);
            expect(weapon.level).toBe(1);

            weapon.levelUp();

            expect(weapon.level).toBe(2);
        });

        it('should track max level correctly', () => {
            const weapon = new Weapon(WEAPON_DATA.BULLET, mockSoundManager);

            expect(weapon.isMaxLevel()).toBe(false);

            // Level up to max
            while (!weapon.isMaxLevel()) {
                weapon.levelUp();
            }

            expect(weapon.isMaxLevel()).toBe(true);
        });

        it('should provide upgrade description', () => {
            const weapon = new Weapon(WEAPON_DATA.BULLET, mockSoundManager);

            const desc = weapon.getCurrentUpgradeDescription();

            expect(typeof desc).toBe('string');
        });
    });

    describe('Projectile Creation', () => {
        it('should create projectiles when firing PROJECTILE type', () => {
            const weapon = new Weapon(WEAPON_DATA.BULLET, mockSoundManager);
            const enemies = [createEnemy()];

            const projectiles = weapon.update(weapon.cooldown + 0.1, player, enemies);

            expect(projectiles).not.toBeNull();
            expect(projectiles!.length).toBeGreaterThan(0);
        });

        it('should play sound when firing', () => {
            const weapon = new Weapon(WEAPON_DATA.BULLET, mockSoundManager);
            const enemies = [createEnemy()];

            weapon.update(weapon.cooldown + 0.1, player, enemies);

            expect(mockSoundManager.playSound).toHaveBeenCalled();
        });
    });

    describe('Weapon Name', () => {
        it('should return name key', () => {
            const weapon = new Weapon(WEAPON_DATA.BULLET, mockSoundManager);

            expect(weapon.name).toBe(weapon.nameKey);
        });
    });

    describe('AURA Type', () => {
        it('should have AURA type for aura weapons', () => {
            const weapon = new Weapon(WEAPON_DATA.SUNFIRE, mockSoundManager);

            expect(weapon.type).toBe('AURA');
        });
    });

    describe('BOOMERANG Mechanics', () => {
        it('should create BOOMERANG projectiles', () => {
            const weapon = new Weapon(WEAPON_DATA.BOOMERANG, mockSoundManager);
            const enemies = [createEnemy()];

            const projectiles = weapon.update(weapon.cooldown + 0.1, player, enemies);

            expect(projectiles).not.toBeNull();
            expect(projectiles!.length).toBeGreaterThan(0);
        });
    });
});
