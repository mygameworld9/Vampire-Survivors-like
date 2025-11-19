export const SPAWN_SCHEDULE = [
    // Phase 1: Only Slimes for the first minute
    { time: 0, enemyType: 'SLIME', rate: 2000 }, // every 2s
    { time: 30, enemyType: 'SLIME', rate: 1500 }, // Slimes spawn faster

    // Phase 2: Introduce Ghosts
    { time: 60, enemyType: 'GHOST', rate: 2500 }, 

    // Phase 3: Introduce Bats
    { time: 90, enemyType: 'BAT', rate: 2000 },
    
    // Phase 4: Increase pressure
    { time: 120, enemyType: 'SLIME', rate: 1000 }, // Slimes are now a constant threat
    { time: 120, enemyType: 'SKELETON', rate: 3000 },

    // Phase 5: Introduce Golems
    { time: 150, enemyType: 'GOLEM', rate: 10000 }, // First Golem, then every 10s

    // Phase 6: Faster Swarms
    { time: 180, enemyType: 'GHOST', rate: 1500 }, // Ghosts spawn faster
    { time: 180, enemyType: 'BAT', rate: 1200 }, // Bats spawn faster

    // Phase 7: More Elites
    { time: 240, enemyType: 'GOLEM', rate: 7000 }, // Golems spawn faster
];

export const XP_LEVELS = Array.from({ length: 100 }, (_, i) => 10 * (i + 1) ** 2);