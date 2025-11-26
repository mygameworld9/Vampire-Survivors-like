

import { EvolutionRecipe } from "../utils/types";

export const EVOLUTION_RECIPES: EvolutionRecipe[] = [
    // Tier 1 -> Tier 2
    { baseWeaponId: 'BULLET', requiredSkillId: 'TOUGHNESS', evolvedWeaponId: 'GATLING_GUN' },
    { baseWeaponId: 'BOOMERANG', requiredSkillId: 'SWIFTNESS', evolvedWeaponId: 'SONIC_DISC' },
    { baseWeaponId: 'SUNFIRE', requiredSkillId: 'REGENERATION', evolvedWeaponId: 'SUPERNOVA' },
    
    // Tier 2 -> Tier 3 (Recursive Evolution)
    { baseWeaponId: 'GATLING_GUN', requiredSkillId: 'SWIFTNESS', evolvedWeaponId: 'DOOM_CANNON' },
    { baseWeaponId: 'SONIC_DISC', requiredSkillId: 'TOUGHNESS', evolvedWeaponId: 'VOID_EATER' },
    { baseWeaponId: 'SUPERNOVA', requiredSkillId: 'REGENERATION', evolvedWeaponId: 'BLACK_HOLE' }
];