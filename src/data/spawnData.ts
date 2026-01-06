
import { ISpawnSchedule } from "../utils/types";

export const SPAWN_SCHEDULES: { [key: string]: ISpawnSchedule } = {
    FOREST_NORMAL: {
        id: 'FOREST_NORMAL',
        events: [
            // Phase 1: Only Slimes for the first minute
            { time: 0, enemyType: 'SLIME', rate: 800 }, // Balanced: Slower start for new players
            { time: 30, enemyType: 'SLIME', rate: 600 },

            // Phase 1.5: Spiders appear (Fast swarms)
            { time: 45, enemyType: 'SPIDER', rate: 600 },

            // Phase 2: Introduce Ghosts
            { time: 60, enemyType: 'GHOST', rate: 800 },

            // Phase 3: Introduce Bats
            { time: 90, enemyType: 'BAT', rate: 600 },

            // Phase 3.5: Mushrooms appear (Tanky blockers)
            { time: 100, enemyType: 'MUSHROOM', rate: 1500 },

            // Phase 4: Increase pressure
            { time: 120, enemyType: 'SLIME', rate: 300 },
            { time: 120, enemyType: 'SKELETON', rate: 1000 },

            // Phase 5: Introduce Golems
            { time: 180, enemyType: 'GOLEM', rate: 5000 }, // Balanced: Delayed to 3min for more upgrade time

            // Phase 6: Faster Swarms
            { time: 210, enemyType: 'GHOST', rate: 600 }, // Balanced: Moved to 3.5min, slower rates
            { time: 210, enemyType: 'BAT', rate: 500 },
            { time: 210, enemyType: 'SPIDER', rate: 500 },

            // Phase 7: More Elites
            { time: 240, enemyType: 'GOLEM', rate: 3000 },
        ]
    },
    CRYPT_HARD: {
        id: 'CRYPT_HARD',
        events: [
            // Harder start
            { time: 0, enemyType: 'SKELETON', rate: 2000 },
            { time: 0, enemyType: 'BAT', rate: 1000 },

            // Phase 1: Spiders + Ghosts
            { time: 30, enemyType: 'SPIDER', rate: 500 },
            { time: 45, enemyType: 'GHOST', rate: 800 },

            // Phase 2: Heavy hitters early
            { time: 60, enemyType: 'GOLEM', rate: 8000 },
            { time: 60, enemyType: 'SKELETON', rate: 500 },

            // Phase 3: Swarm
            { time: 120, enemyType: 'BAT', rate: 200 },
            { time: 120, enemyType: 'GHOST', rate: 400 },

            // Phase 4: Boss rush mode
            { time: 180, enemyType: 'GOLEM', rate: 4000 },
            { time: 180, enemyType: 'MUSHROOM', rate: 1000 },
        ]
    }
};
