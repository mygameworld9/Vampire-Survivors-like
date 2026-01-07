
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
    },

    // ========== NEW SKILLS v2.0 ==========

    // === New Passive Skills ===
    VAMPIRISM: {
        id: 'VAMPIRISM',
        nameKey: 'skill.vampirism.name',
        type: 'PASSIVE',
        descriptionKey: 'skill.vampirism.desc',
        icon: '🧛',
        effects: {
            onKill_healPercent: { op: 'add', value: 0.005 } // 0.5% max HP on kill (adjusted from 1%)
        }
    },
    GOLDEN_TOUCH: {
        id: 'GOLDEN_TOUCH',
        nameKey: 'skill.goldentouch.name',
        type: 'PASSIVE',
        descriptionKey: 'skill.goldentouch.desc',
        icon: '💰',
        effects: {
            goldMultiplier: { op: 'multiply', value: 1.5 } // +50% gold
        }
    },
    CRITICAL_STRIKE: {
        id: 'CRITICAL_STRIKE',
        nameKey: 'skill.criticalstrike.name',
        type: 'PASSIVE',
        descriptionKey: 'skill.criticalstrike.desc',
        icon: '⚔️',
        effects: {
            critChance: { op: 'add', value: 0.08 }, // 8% crit (adjusted from 10%)
            critMultiplier: { op: 'add', value: 1.8 } // 1.8x crit damage (adjusted from 2.0x)
        }
    },
    SHIELD_MASTERY: {
        id: 'SHIELD_MASTERY',
        nameKey: 'skill.shieldmastery.name',
        type: 'PASSIVE',
        descriptionKey: 'skill.shieldmastery.desc',
        icon: '🛡️',
        effects: {
            shield_interval: { op: 'add', value: 10000 }, // 10 seconds
            shield_charges: { op: 'add', value: 1 }
        }
    },
    MOMENTUM: {
        id: 'MOMENTUM',
        nameKey: 'skill.momentum.name',
        type: 'PASSIVE',
        descriptionKey: 'skill.momentum.desc',
        icon: '🏃',
        effects: {
            momentum_maxStacks: { op: 'add', value: 100 },
            momentum_damagePerStack: { op: 'add', value: 0.5 },
            momentum_radius: { op: 'add', value: 150 }
        }
    },

    // === New Active Skills ===
    BLINK: {
        id: 'BLINK',
        nameKey: 'skill.blink.name',
        type: 'ACTIVE',
        descriptionKey: 'skill.blink.desc',
        icon: '✨',
        cooldown: 5000,
        range: 150 // Teleport distance
    },
    RAGE_BURST: {
        id: 'RAGE_BURST',
        nameKey: 'skill.rageburst.name',
        type: 'ACTIVE',
        descriptionKey: 'skill.rageburst.desc',
        icon: '😡',
        cooldown: 30000,
        damage: 0, // No direct damage
        range: 0 // Self-buff
    },
    GUARDIAN_ANGEL: {
        id: 'GUARDIAN_ANGEL',
        nameKey: 'skill.guardianangel.name',
        type: 'ACTIVE',
        descriptionKey: 'skill.guardianangel.desc',
        icon: '👼',
        cooldown: 120000, // 2 minutes
        range: 0 // Auto-trigger on death
    }
};
