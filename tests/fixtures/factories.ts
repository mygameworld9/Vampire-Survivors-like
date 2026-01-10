import { Player } from '../../src/entities/Player';
import { Enemy } from '../../src/entities/Enemy';
import { Weapon } from '../../src/entities/Weapon';
import { mockSoundManager } from '../__mocks__/SoundManager';
import { ENEMY_DATA } from '../../src/data/enemyData';
import { WEAPON_DATA } from '../../src/data/weaponData';

/**
 * Creates a test Player instance with optional property overrides.
 */
export function createTestPlayer(overrides: Partial<Player> = {}): Player {
    const player = new Player(
        0,
        0,
        () => { }, // onAuraDamage callback
        mockSoundManager,
        'DEFAULT_HERO',
        () => { } // onStatsChange callback
    );
    return Object.assign(player, overrides);
}

/**
 * Creates a test Enemy instance.
 */
export function createTestEnemy(
    type: string = 'SLIME',
    x = 100,
    y = 100,
    isElite = false
): Enemy {
    const data = ENEMY_DATA[type];
    if (!data) {
        throw new Error(`Unknown enemy type: ${type}. Available: ${Object.keys(ENEMY_DATA).join(', ')}`);
    }
    return new Enemy(x, y, data, type, isElite);
}

/**
 * Creates a test Weapon instance.
 */
export function createTestWeapon(weaponId: string = 'MAGIC_WAND'): Weapon {
    const data = WEAPON_DATA[weaponId];
    if (!data) {
        throw new Error(`Unknown weapon: ${weaponId}. Available: ${Object.keys(WEAPON_DATA).join(', ')}`);
    }
    return new Weapon(data, mockSoundManager);
}
