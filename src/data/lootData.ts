import { ILootTable } from "../utils/types";

export const CHEST_LOOT_TABLE: ILootTable = {
    gold: { min: 50, max: 150 },
    xpOrbs: [
        { type: 'SMALL', count: [3, 5] },
        { type: 'MEDIUM', count: [1, 3] },
    ],
    upgrades: {
        chance: 0.15, // 15% chance for a free upgrade
        count: 1
    }
};
