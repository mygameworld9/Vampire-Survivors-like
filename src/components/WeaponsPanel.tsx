import React from 'react';
import { Weapon } from '../entities/Weapon';
import { i18nManager } from '../core/i18n';

/**
 * Interface for the properties of the WeaponsPanel component.
 * @interface WeaponsPanelProps
 */
interface WeaponsPanelProps {
    /** An array of the player's current weapon instances. */
    weapons: Weapon[];
    /** Callback function to execute when the panel is closed. */
    onClose: () => void;
}

/**
 * A React functional component that displays a panel showing the player's current weapons.
 * It lists each weapon, its level, current stats, and the description of its next upgrade.
 *
 * @param {WeaponsPanelProps} props - The properties for the component.
 * @returns {React.ReactElement} The rendered WeaponsPanel component.
 */
export const WeaponsPanel: React.FC<WeaponsPanelProps> = ({ weapons, onClose }) => {
    return (
        <div className="info-panel-backdrop">
            <div className="info-panel" role="dialog" aria-modal="true" aria-labelledby="weapons-title">
                <h2 id="weapons-title">{i18nManager.t('ui.weaponsPanel.title')}</h2>
                <div className="weapon-cards-container">
                    {weapons.map(w => (
                        <div key={w.id} className="weapon-card">
                            <div className="weapon-card-header">
                                <h3>{w.name}</h3>
                                <span>{i18nManager.t('ui.panel.level', { level: w.level })}</span>
                            </div>
                            <div className="weapon-card-stats">
                                <span>{i18nManager.t('ui.panel.damage', { value: w.damage.toFixed(1) })}</span>
                                <span>{i18nManager.t('ui.panel.cooldown', { value: (w.cooldown / 1000).toFixed(2) })}</span>
                                {w.type !== 'AURA' && <span>{i18nManager.t('ui.panel.speed', { value: w.speed })}</span>}
                                {w.type !== 'AURA' && <span>{i18nManager.t('ui.panel.penetration', { value: w.penetration })}</span>}
                                <span>{i18nManager.t('ui.panel.range', { value: w.range })}</span>
                            </div>
                            <div className="weapon-card-upgrade">
                                <strong>{i18nManager.t('ui.panel.nextUpgrade')}</strong> {w.getCurrentUpgradeDescription()}
                            </div>
                        </div>
                    ))}
                </div>
                <button className="close-button" onClick={onClose}>{i18nManager.t('ui.panel.close')}</button>
            </div>
        </div>
    );
};
