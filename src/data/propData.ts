
import { IPropData } from "../utils/types";

export const PROP_DATA: { [key: string]: IPropData } = {
    CRATE: {
        type: 'CRATE',
        hp: 20,
        size: 28,
        color: '#795548', // Brown
        dropTable: [
            { itemId: 'GOLD_COIN', chance: 0.6 },
            { itemId: 'HEALTH_POTION', chance: 0.1 }
        ]
    },
    BARREL: {
        type: 'BARREL',
        hp: 30,
        size: 30,
        color: '#5D4037', // Dark Brown
        dropTable: [
            { itemId: 'GOLD_COIN', chance: 0.8 },
            { itemId: 'HEALTH_POTION', chance: 0.2 }
        ]
    }
};
