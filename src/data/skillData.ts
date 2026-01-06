
import { ISkillData } from "../utils/types";

export const SKILL_DATA: { [key: string]: ISkillData } = {
    ENERGY_PULSE: {
        id: 'ENERGY_PULSE',
        nameKey: 'skill.energypulse.name',
        type: 'ACTIVE',
        descriptionKey: 'skill.energypulse.desc',
        icon: '💥',
        damage: 15,
        cooldown: 5000, // 5 seconds
        range: 150,
    },
    TOUGHNESS: {
        id: 'TOUGHNESS',
        nameKey: 'skill.toughness.name',
        type: 'PASSIVE',
        descriptionKey: 'skill.toughness.desc',
        icon: '❤️',
        effects: {
            maxHp: { op: 'multiply', value: 1.2 } // +20% max HP
        }
    },
    REGENERATION: {
        id: 'REGENERATION',
        nameKey: 'skill.regeneration.name',
        type: 'PASSIVE',
        descriptionKey: 'skill.regeneration.desc',
        icon: '➕',
        effects: {
            hpRegen: { op: 'add', value: 0.5 } // Adds 0.5 HP/sec
        }
    },
    SWIFTNESS: {
        id: 'SWIFTNESS',
        nameKey: 'skill.swiftness.name',
        type: 'PASSIVE',
        descriptionKey: 'skill.swiftness.desc',
        icon: '💨',
        effects: {
            speed: { op: 'multiply', value: 1.10 } // +10% move speed
        }
    },
    HOLY_NOVA: {
        id: 'HOLY_NOVA',
        nameKey: 'skill.holynova.name',
        type: 'ACTIVE',
        descriptionKey: 'skill.holynova.desc',
        icon: '🌟',
        damage: 10,
        cooldown: 8000, // 8 seconds
        range: 250,
    },
    ELEMENTAL_MASTERY: {
        id: 'ELEMENTAL_MASTERY',
        nameKey: 'skill.elemental.name',
        type: 'PASSIVE',
        descriptionKey: 'skill.elemental.desc',
        icon: '🔥',
        effects: {
            damage_FIRE: { op: 'multiply', value: 1.5 },
            damage_ICE: { op: 'multiply', value: 1.5 },
            damage_LIGHTNING: { op: 'multiply', value: 1.5 }
        }
    },
    BALLISTICS: {
        id: 'BALLISTICS',
        nameKey: 'skill.ballistics.name',
        type: 'PASSIVE',
        descriptionKey: 'skill.ballistics.desc',
        icon: '🎯',
        effects: {
            penetration_PROJECTILE: { op: 'add', value: 1 }
        }
    }
};
