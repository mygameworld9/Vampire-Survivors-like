
import { IItemData } from "../utils/types";

export const ITEM_DATA: { [key: string]: IItemData } = {
    HEALTH_POTION: {
        id: 'HEALTH_POTION',
        nameKey: 'item.healthpotion.name',
        rarity: 'Common',
        effect: {
            type: 'HEAL_PERCENT',
            value: 0.3, // 30%
        },
        color: '#e57373', // Light red for the potion itself
    },
    GOLD_COIN: {
        id: 'GOLD_COIN',
        nameKey: 'ui.levelup.gold',
        rarity: 'Common',
        effect: {
            type: 'GOLD_ADD',
            value: 10,
        },
        color: '#FFD700',
    }
};
