
import { IMetaUpgradeData } from "../utils/types";

export const META_UPGRADES: { [key: string]: IMetaUpgradeData } = {
    MIGHT: {
        id: 'MIGHT',
        nameKey: 'meta.might.name',
        descriptionKey: 'meta.might.desc',
        icon: '⚔️',
        maxLevel: 5,
        baseCost: 200,
        costMultiplier: 1.5,
        stat: 'damage',
        valuePerLevel: 0.08 // Balanced: +8% damage per level (was 5%)
    },
    ARMOR: {
        id: 'ARMOR',
        nameKey: 'meta.armor.name',
        descriptionKey: 'meta.armor.desc',
        icon: '🛡️',
        maxLevel: 5,
        baseCost: 150,
        costMultiplier: 1.4,
        stat: 'maxHp',
        valuePerLevel: 10 // +10 HP per level
    },
    RECOVERY: {
        id: 'RECOVERY',
        nameKey: 'meta.recovery.name',
        descriptionKey: 'meta.recovery.desc',
        icon: '❤️',
        maxLevel: 5,
        baseCost: 200,
        costMultiplier: 1.5,
        stat: 'hpRegen',
        valuePerLevel: 0.1 // +0.1 HP/sec per level
    },
    SWIFTNESS: {
        id: 'SWIFTNESS',
        nameKey: 'meta.swiftness.name',
        descriptionKey: 'meta.swiftness.desc',
        icon: '👞',
        maxLevel: 3,
        baseCost: 300,
        costMultiplier: 1.6,
        stat: 'speed',
        valuePerLevel: 0.05 // +5% speed per level
    },
    GREED: {
        id: 'GREED',
        nameKey: 'meta.greed.name',
        descriptionKey: 'meta.greed.desc',
        icon: '💰',
        maxLevel: 5,
        baseCost: 250,
        costMultiplier: 1.5,
        stat: 'goldGain',
        valuePerLevel: 0.1 // +10% gold gain per level
    },
    REVIVAL: {
        id: 'REVIVAL',
        nameKey: 'meta.revival.name',
        descriptionKey: 'meta.revival.desc',
        icon: '⚰️',
        maxLevel: 1,
        baseCost: 1500, // Balanced: Reduced from 2000 for accessibility
        costMultiplier: 2,
        stat: 'revives',
        valuePerLevel: 1 // +1 revive
    }
};
