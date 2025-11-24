
export const SPAWN_SCHEDULE = [
    // Phase 1: Only Slimes for the first minute
    { time: 0, enemyType: 'SLIME', rate: 500 }, // significantly faster start (was 2000)
    { time: 30, enemyType: 'SLIME', rate: 400 }, // (was 1500)

    // Phase 1.5: Spiders appear (Fast swarms)
    { time: 45, enemyType: 'SPIDER', rate: 600 },

    // Phase 2: Introduce Ghosts
    { time: 60, enemyType: 'GHOST', rate: 800 }, // (was 2500)

    // Phase 3: Introduce Bats
    { time: 90, enemyType: 'BAT', rate: 600 }, // (was 2000)
    
    // Phase 3.5: Mushrooms appear (Tanky blockers)
    { time: 100, enemyType: 'MUSHROOM', rate: 1500 },

    // Phase 4: Increase pressure
    { time: 120, enemyType: 'SLIME', rate: 300 }, // Swarm mode (was 1000)
    { time: 120, enemyType: 'SKELETON', rate: 1000 }, // (was 3000)

    // Phase 5: Introduce Golems
    { time: 150, enemyType: 'GOLEM', rate: 5000 }, // (was 10000)

    // Phase 6: Faster Swarms
    { time: 180, enemyType: 'GHOST', rate: 500 }, // (was 1500)
    { time: 180, enemyType: 'BAT', rate: 400 }, // (was 1200)
    { time: 180, enemyType: 'SPIDER', rate: 300 }, // Very fast spider swarm

    // Phase 7: More Elites
    { time: 240, enemyType: 'GOLEM', rate: 3000 }, // (was 7000)
];

export const XP_LEVELS = Array.from({ length: 100 }, (_, i) => 10 * (i + 1) ** 2);
