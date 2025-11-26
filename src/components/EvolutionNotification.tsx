
import React, { useEffect } from 'react';
import { Weapon } from '../entities/Weapon';
import { i18nManager } from '../core/i18n';

/**
 * Interface for the properties of the EvolutionNotification component.
 * @interface EvolutionNotificationProps
 */
interface EvolutionNotificationProps {
    /**
     * The weapon instance that has just evolved.
     */
    weapon: Weapon;
    /**
     * Callback function executed when the notification is closed.
     */
    onClose: () => void;
}

/**
 * A React functional component that displays a notification when a weapon evolves.
 * It presents a celebratory screen showing the evolved weapon, its new stats, and an "Evolved!" tag.
 *
 * @param {EvolutionNotificationProps} props - The properties for the component.
 * @returns {React.ReactElement} The rendered EvolutionNotification component.
 */
export const EvolutionNotification: React.FC<EvolutionNotificationProps> = ({ weapon, onClose }) => {
    
    useEffect(() => {
        const playSound = async () => {
            // We can assume SoundManager is available via a global or prop if needed, 
            // but for UI components usually we rely on the parent or effects.
            // For now, purely visual.
        };
        playSound();
    }, []);

    return (
        <div className="evolution-backdrop" onClick={onClose}>
            <div className="sunburst"></div>
            <div className="evolution-container">
                <h1 className="evolution-title">{i18nManager.t('ui.evolution.title')}</h1>
                
                <div className="evolution-icon-container">
                    <div className="evolution-icon">{weapon.icon}</div>
                </div>
                
                <h2 className="evolution-weapon-name">{weapon.name}</h2>
                <div className="evolution-tag">{i18nManager.t('ui.evolution.tag')}</div>
                
                <div className="evolution-stats">
                    <div className="evo-stat">
                        <span className="label">{i18nManager.t('ui.panel.damage')}</span>
                        <span className="value">{Math.round(weapon.damage)}</span>
                    </div>
                    {weapon.type !== 'AURA' && (
                        <div className="evo-stat">
                            <span className="label">{i18nManager.t('ui.panel.cooldown')}</span>
                            <span className="value">{(weapon.cooldown / 1000).toFixed(2)}s</span>
                        </div>
                    )}
                </div>
                
                <p className="evolution-subtitle">{i18nManager.t('ui.evolution.subtitle')}</p>
                <button className="jelly-btn primary evolution-btn">{i18nManager.t('ui.evolution.continue')}</button>
            </div>
        </div>
    );
};
