import { vi } from 'vitest';

export const createMockProgressionManager = (overrides = {}) => ({
    getGold: vi.fn(() => 1000),
    addGold: vi.fn(),
    subtractGold: vi.fn(),
    getUpgradeLevel: vi.fn(() => 0),
    purchaseUpgrade: vi.fn(() => true),
    getUpgradeCost: vi.fn(() => 100),
    save: vi.fn(),
    getPlayerBonuses: vi.fn(() => ({
        damageMultiplier: 0,
        maxHpAdd: 0,
        speedMultiplier: 0,
        hpRegenAdd: 0,
        goldMultiplier: 0,
        revivesAdd: 0
    })),
    ...overrides
});

export const mockProgressionManager = createMockProgressionManager();
