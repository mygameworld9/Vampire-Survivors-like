

import { EvolutionRecipe } from "../utils/types";

export const EVOLUTION_RECIPES: EvolutionRecipe[] = [
    // Tier 1 -> Tier 2
    { baseWeaponId: 'BULLET', requiredSkillId: 'TOUGHNESS', evolvedWeaponId: 'GATLING_GUN' },
    { baseWeaponId: 'BOOMERANG', requiredSkillId: 'SWIFTNESS', evolvedWeaponId: 'SONIC_DISC' },
    { baseWeaponId: 'SUNFIRE', requiredSkillId: 'REGENERATION', evolvedWeaponId: 'SUPERNOVA' },

    // Tier 2 -> Tier 3 (Recursive Evolution)
    { baseWeaponId: 'GATLING_GUN', requiredSkillId: 'SWIFTNESS', evolvedWeaponId: 'DOOM_CANNON' },
    { baseWeaponId: 'SONIC_DISC', requiredSkillId: 'TOUGHNESS', evolvedWeaponId: 'VOID_EATER' },
    { baseWeaponId: 'SUPERNOVA', requiredSkillId: 'REGENERATION', evolvedWeaponId: 'BLACK_HOLE' },

    // ========== NEW EVOLUTIONS v2.0 ==========

    // === Poison Line ===
    { baseWeaponId: 'POISON_DAGGER', requiredSkillId: 'TOUGHNESS', evolvedWeaponId: 'VENOM_FANG' },
    { baseWeaponId: 'VENOM_FANG', requiredSkillId: 'REGENERATION', evolvedWeaponId: 'PLAGUE_SCYTHE' },

    // === Summoning Line ===
    { baseWeaponId: 'SPIRIT_ORB', requiredSkillId: 'HOLY_NOVA', evolvedWeaponId: 'PHANTOM_GUARD' },
    { baseWeaponId: 'PHANTOM_GUARD', requiredSkillId: 'MOMENTUM', evolvedWeaponId: 'SOUL_VORTEX' },

    // === Chain Line ===
    { baseWeaponId: 'CHAIN_BOLT', requiredSkillId: 'ELEMENTAL_MASTERY', evolvedWeaponId: 'SHOCK_CHAIN' },
    { baseWeaponId: 'SHOCK_CHAIN', requiredSkillId: 'CRITICAL_STRIKE', evolvedWeaponId: 'STORM_WEAVER' },

    // === Trap Line ===
    { baseWeaponId: 'SPIKE_TRAP', requiredSkillId: 'SWIFTNESS', evolvedWeaponId: 'FROST_MINE' },
    { baseWeaponId: 'FROST_MINE', requiredSkillId: 'TOUGHNESS', evolvedWeaponId: 'VOID_RIFT' },

    // === Independent Evolutions (Existing weapons get upgrades) ===
    { baseWeaponId: 'ICE_SHARD', requiredSkillId: 'ELEMENTAL_MASTERY', evolvedWeaponId: 'FROST_STORM' },
    { baseWeaponId: 'MAGIC_MISSILE', requiredSkillId: 'BALLISTICS', evolvedWeaponId: 'ARCANE_SWARM' },
    { baseWeaponId: 'THUNDER_STAFF', requiredSkillId: 'ELEMENTAL_MASTERY', evolvedWeaponId: 'CHAIN_LIGHTNING' },
    { baseWeaponId: 'KATANA', requiredSkillId: 'SWIFTNESS', evolvedWeaponId: 'SHADOW_BLADE' }
];