import { describe, it, expect, vi } from 'vitest';
import { Weapon } from './Weapon';
import { SoundManager } from '../core/SoundManager';
import { getUpgradeDataFor } from '../data/upgradeLoader';

// Mock the dependencies
vi.mock('../core/SoundManager');
vi.mock('../data/upgradeLoader');

describe('Weapon', () => {
  it('should not update baseDamage to NaN when levelling up with invalid data', () => {
    const soundManager = new SoundManager({} as any);
    const weaponData = {
      id: 'test_weapon',
      nameKey: 'Test Weapon',
      icon: '',
      damage: 10,
      cooldown: 1000,
      speed: 100,
      penetration: 1,
      range: 100,
    };

    const weapon = new Weapon(weaponData, soundManager);
    const initialDamage = weapon.damage;

    // Mock the upgrade data to return a non-numeric value
    (getUpgradeDataFor as any).mockReturnValue([
      {
        descriptionKey: 'test description',
        effects: {
          damage: { op: 'set', value: 'invalid-number' },
        },
      },
    ]);

    weapon.levelUp();

    expect(weapon.damage).toBe(initialDamage);
  });
});
