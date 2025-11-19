import { ItemRarity } from '../utils/types';

export const RARITY_COLORS: { [key in ItemRarity]: string } = {
    Common: '#bdbdbd',    // Grey
    Rare: '#42a5f5',     // Blue
    Epic: '#ab47bc',     // Purple
    Legendary: '#ffa726', // Orange
};
