
import React from 'react';
import { UpgradeOption } from '../utils/types';
import { i18nManager } from '../core/i18n';

/**
 * Interface for the properties of the LevelUpModal component.
 * @interface LevelUpModalProps
 */
interface LevelUpModalProps {
    /** An array of upgrade choices to present to the player. */
    options: UpgradeOption[];
    /** Callback function executed when the player selects an upgrade. */
    onSelect: (option: UpgradeOption) => void;
}

/**
 * Renders the content for a single upgrade option card.
 * @private
 * @param {UpgradeOption} option - The upgrade option data to render.
 * @returns {React.ReactElement} The rendered content for the option card.
 */
const renderOption = (option: UpgradeOption) => {
    let icon: string;
    let title: React.ReactNode;
    let description: string;

    if (option.type === 'upgrade') {
        if ('weapon' in option) {
            icon = option.weapon.icon;
            title = <h3>{i18nManager.t('ui.levelup.upgradeWeapon', { name: option.weapon.name, level: option.weapon.level })}</h3>;
            description = option.weapon.getCurrentUpgradeDescription();
        } else { // Skill
            icon = option.skill.icon;
            title = <h3>{i18nManager.t('ui.levelup.upgradeSkill', { name: option.skill.name, level: option.skill.level })}</h3>;
            description = option.skill.getCurrentUpgradeDescription();
        }
    } else if (option.type === 'new') {
        if ('weaponData' in option) {
            icon = option.weaponData.icon;
            title = <h3>{i18nManager.t('ui.levelup.newWeapon', { name: i18nManager.t(option.weaponData.nameKey) })}</h3>;
            description = i18nManager.t('ui.levelup.newWeaponDesc');
        } else { // Skill
            icon = option.skillData.icon;
            title = <h3>{i18nManager.t('ui.levelup.newSkill', { name: i18nManager.t(option.skillData.nameKey) })}</h3>;
            description = i18nManager.t(option.skillData.descriptionKey);
        }
    } else if (option.type === 'heal') {
        icon = '🍗';
        title = <h3>{i18nManager.t('ui.levelup.heal')}</h3>;
        description = i18nManager.t('ui.levelup.healDesc', { value: option.amount * 100 });
    } else { // gold
        icon = '💰';
        title = <h3>{i18nManager.t('ui.levelup.gold')}</h3>;
        description = i18nManager.t('ui.levelup.goldDesc', { value: option.amount });
    }

    return (
        <>
            <div className="level-up-option-icon">{icon}</div>
            {title}
            <p>{description}</p>
        </>
    );
};

/**
 * A React functional component that displays the Level Up modal.
 * When the player levels up, this modal appears, pausing the game and presenting
 * a set of choices for new weapons, skills, or upgrades.
 *
 * @param {LevelUpModalProps} props - The properties for the component.
 * @returns {React.ReactElement} The rendered LevelUpModal component.
 */
export const LevelUpModal: React.FC<LevelUpModalProps> = ({ options, onSelect }) => {
    return (
        <div className="level-up-modal-backdrop">
            <div className="level-up-modal">
                <h2>{i18nManager.t('ui.levelup.title')}</h2>
                <p>{i18nManager.t('ui.levelup.subtitle')}</p>
                <div className="level-up-options">
                    {options.map((opt, index) => (
                        <div className="level-up-option" key={index} onClick={() => onSelect(opt)}>
                            {renderOption(opt)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
