/**
 * EnemyRegistry: O(1) ID → Enemy lookup using bitmasked indexing.
 * 
 * PERFORMANCE OPTIMIZATION:
 * - Uses bitmasking (ID & 0xFFFF) instead of modulo for faster index calculation
 * - Fixed-size array acts as ring buffer, safely handles ID wraparound
 * - Eliminates need to pass Enemy object references through spatial hash queries
 */

import { Enemy } from "../entities/Enemy";

// 65536 slots - uses 16-bit bitmask for O(1) index calculation
const REGISTRY_SIZE = 0x10000; // 65536
const BITMASK = 0xFFFF;        // 16-bit mask

export class EnemyRegistry {
    private static slots: (Enemy | null)[] = new Array(REGISTRY_SIZE).fill(null);

    /**
     * Register an enemy in the global lookup table.
     * Call this when spawning an enemy from the pool.
     */
    static register(e: Enemy): void {
        EnemyRegistry.slots[e.id & BITMASK] = e;
    }

    /**
     * Unregister an enemy from the lookup table.
     * Call this BEFORE releasing an enemy back to the pool.
     */
    static unregister(e: Enemy): void {
        const idx = e.id & BITMASK;
        // Only clear if it's still this enemy (handles ID wraparound edge case)
        if (EnemyRegistry.slots[idx] === e) {
            EnemyRegistry.slots[idx] = null;
        }
    }

    /**
     * O(1) lookup of enemy by ID.
     * Returns null if not found or slot was recycled.
     */
    static get(id: number): Enemy | null {
        const e = EnemyRegistry.slots[id & BITMASK];
        // Verify the ID matches to handle wraparound collisions
        return (e && e.id === id) ? e : null;
    }

    /**
     * Clear all slots. Call on game reset/restart.
     */
    static clear(): void {
        EnemyRegistry.slots.fill(null);
    }
}
