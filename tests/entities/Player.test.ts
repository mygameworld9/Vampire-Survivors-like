import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Player } from '../../src/entities/Player';
import { mockSoundManager } from '../__mocks__/SoundManager';
import { createMockInput, createRightInput, createIdleInput, createJoystickInput } from '../fixtures/mockInput';

// Mock ProgressionManager singleton
vi.mock('../../src/core/ProgressionManager', () => ({
    progressionManager: {
        getGold: vi.fn(() => 0),
        getPlayerBonuses: vi.fn(() => ({
            damageMultiplier: 0,
            maxHpAdd: 0,
            speedMultiplier: 0,
            hpRegenAdd: 0,
            goldMultiplier: 0,
            revivesAdd: 0
        }))
    }
}));

// Mock Image for character sprites
vi.stubGlobal('Image', class {
    src = '';
    onload = () => { };
});

describe('Player', () => {
    let player: Player;

    beforeEach(() => {
        player = new Player(
            0, 0,
            () => { }, // onAuraDamage
            mockSoundManager,
            'KNIGHT', // Use KNIGHT character
            () => { }  // onStatsChange
        );
    });

    describe('Initialization', () => {
        it('should initialize with correct position', () => {
            expect(player.pos.x).toBe(0);
            expect(player.pos.y).toBe(0);
        });

        it('should have starting weapon from character data', () => {
            expect(player.weapons.length).toBeGreaterThan(0);
        });

        it('should initialize with KNIGHT stats', () => {
            // KNIGHT has +10% damageMultiplier (1.1)
            expect(player.damageMultiplier).toBeGreaterThanOrEqual(1.0);
        });
    });

    describe('Movement', () => {
        it('should move right when d key is pressed', () => {
            const input = createRightInput();
            const initialX = player.pos.x;

            player.update(0.1, input, []);

            expect(player.pos.x).toBeGreaterThan(initialX);
            expect(player.state).toBe('Moving');
        });

        it('should move with joystick input', () => {
            const input = createJoystickInput(1, 0); // Right via joystick
            const initialX = player.pos.x;

            player.update(0.1, input, []);

            expect(player.pos.x).toBeGreaterThan(initialX);
        });

        it('should be idle when no input', () => {
            const input = createIdleInput();

            player.update(0.1, input, []);

            expect(player.state).toBe('Idle');
        });

        it('should update facing direction when moving', () => {
            const input = createRightInput();

            player.update(0.1, input, []);

            expect(player.facingDirection.x).toBeGreaterThan(0);
        });
    });

    describe('Damage & Health', () => {
        it('should reduce HP when taking damage', () => {
            const initialHp = player.hp;
            player.takeDamage(30);
            expect(player.hp).toBe(initialHp - 30);
        });

        it('should not reduce HP below 0', () => {
            player.takeDamage(player.hp + 100);
            expect(player.hp).toBe(0);
        });

        it('should not take damage when invincible', () => {
            player.isInvincible = true;
            const initialHp = player.hp;

            player.takeDamage(30);

            expect(player.hp).toBe(initialHp);
        });

        it('should absorb damage with shield charges', () => {
            player.shieldCharges = 1;
            const initialHp = player.hp;

            player.takeDamage(30);

            expect(player.hp).toBe(initialHp); // Shield absorbed
            expect(player.shieldCharges).toBe(0);
        });

        it('should set state to Dead when HP reaches 0 with no revives', () => {
            player.revives = 0;
            player.takeDamage(player.hp + 100);

            expect(player.state).toBe('Dead');
        });
    });

    describe('Healing', () => {
        it('should heal by percentage of maxHp', () => {
            player.hp = 50;
            player.maxHp = 100;

            player.heal(0.5); // 50%

            expect(player.hp).toBe(100);
        });

        it('should not exceed maxHp when healing', () => {
            player.hp = 90;
            player.maxHp = 100;

            player.heal(0.5);

            expect(player.hp).toBe(100);
        });
    });

    describe('XP & Leveling', () => {
        it('should accumulate XP', () => {
            player.xp = 0;
            player.gainXp(50);

            expect(player.xp).toBe(50);
        });

        it('should return true when level up threshold reached', () => {
            player.xp = 0;
            player.level = 1;

            // Give enough XP to level up (depends on XP_LEVELS config)
            const leveledUp = player.gainXp(1000);

            expect(leveledUp).toBe(true);
            expect(player.level).toBe(2);
            expect(player.xp).toBe(0); // Reset after level up
        });

        it('should heal on level up', () => {
            player.hp = 50;
            player.maxHp = 100;
            player.xp = 0;
            player.level = 1;

            player.gainXp(1000); // Force level up

            expect(player.hp).toBeGreaterThan(50);
        });
    });

    describe('Gold', () => {
        it('should gain gold with multiplier', () => {
            player.gold = 0;
            player.goldMultiplier = 2;

            player.gainGold(10);

            expect(player.gold).toBe(20);
        });
    });

    describe('Critical Hit System', () => {
        it('should not crit when critChance is 0', () => {
            player.critChance = 0;
            const result = player.calculateCritDamage(100);

            expect(result.isCrit).toBe(false);
            expect(result.damage).toBe(100);
        });

        it('should always crit when critChance is 1', () => {
            player.critChance = 1;
            player.critMultiplier = 2;
            const result = player.calculateCritDamage(100);

            expect(result.isCrit).toBe(true);
            expect(result.damage).toBe(200);
        });
    });

    describe('Momentum System', () => {
        beforeEach(() => {
            // Enable momentum system
            player.momentumStacks = 0;
            (player as any).momentumMaxStacks = 10;
            (player as any).momentumDamagePerStack = 5;
            (player as any).momentumRadius = 100;
        });

        it('should build momentum while moving', () => {
            const result = player.updateMomentum(true, 0.5);

            expect(player.momentumStacks).toBeGreaterThan(0);
            expect(result).toBeNull(); // No release yet
        });

        it('should release momentum when stopping', () => {
            // Build up momentum
            player.momentumStacks = 5;
            (player as any).wasMovingLastFrame = true;

            const result = player.updateMomentum(false, 0.1);

            expect(result).not.toBeNull();
            expect(result).toBe(25); // 5 stacks * 5 damage
            expect(player.momentumStacks).toBe(0);
        });
    });

    describe('Vampirism System', () => {
        it('should heal on enemy kill when onKillHealPercent > 0', () => {
            player.hp = 50;
            player.maxHp = 100;
            player.onKillHealPercent = 0.1; // 10%

            player.onEnemyKill();

            expect(player.hp).toBe(60);
        });

        it('should not exceed maxHp from vampirism', () => {
            player.hp = 95;
            player.maxHp = 100;
            player.onKillHealPercent = 0.1;

            player.onEnemyKill();

            expect(player.hp).toBe(100);
        });
    });

    describe('Revive', () => {
        it('should revive with half HP', () => {
            player.hp = 0;
            player.maxHp = 100;
            player.revives = 1;
            player.state = 'Dead';

            player.revive();

            expect(player.hp).toBe(50);
            expect(player.revives).toBe(0);
            expect(player.state).toBe('Idle');
        });

        it('should not revive when no revives left', () => {
            player.hp = 0;
            player.revives = 0;
            player.state = 'Dead';

            player.revive();

            expect(player.hp).toBe(0);
            expect(player.state).toBe('Dead');
        });
    });

    describe('Weapon Management', () => {
        it('should add weapons', () => {
            const initialCount = player.weapons.length;
            player.addWeapon('ICE_SHARD');

            expect(player.weapons.length).toBe(initialCount + 1);
        });

        it('should not add duplicate weapons', () => {
            player.addWeapon('ICE_SHARD');
            const countAfterFirst = player.weapons.length;

            player.addWeapon('ICE_SHARD');

            expect(player.weapons.length).toBe(countAfterFirst);
        });
    });

    describe('Skill Management', () => {
        it('should add skills', () => {
            const initialCount = player.skills.length;
            player.addSkill('REGENERATION');

            expect(player.skills.length).toBe(initialCount + 1);
        });

        it('should check hasSkill correctly', () => {
            player.addSkill('REGENERATION');

            expect(player.hasSkill('REGENERATION')).toBe(true);
            expect(player.hasSkill('NONEXISTENT')).toBe(false);
        });
    });
});
