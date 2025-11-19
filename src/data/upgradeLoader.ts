import { UpgradeLevel } from "../utils/types";
import { UPGRADE_DATA } from './upgradeData';
import { SKILL_UPGRADE_DATA } from './skillUpgradeData';

/**
 * Retrieves the upgrade path for a given weapon ID from the pre-loaded data.
 * @param weaponId The ID of the weapon (e.g., 'BULLET').
 * @returns An array of upgrade levels, or undefined if not found.
 */
export const getUpgradeDataFor = (weaponId: string): UpgradeLevel[] | undefined => {
    return UPGRADE_DATA[weaponId];
};

/**
 * Retrieves the upgrade path for a given skill ID from the pre-loaded data.
 * @param skillId The ID of the skill (e.g., 'ENERGY_PULSE').
 * @returns An array of upgrade levels, or undefined if not found.
 */
export const getSkillUpgradeDataFor = (skillId: string): UpgradeLevel[] | undefined => {
    return SKILL_UPGRADE_DATA[skillId];
};