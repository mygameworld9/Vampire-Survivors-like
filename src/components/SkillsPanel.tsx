import React from 'react';
import { Skill } from '../entities/Skill';
import { i18nManager } from '../core/i18n';

/**
 * Interface for the properties of the SkillsPanel component.
 * @interface SkillsPanelProps
 */
interface SkillsPanelProps {
    /** An array of the player's current skill instances. */
    skills: Skill[];
    /** Callback function to execute when the panel is closed. */
    onClose: () => void;
}

/**
 * A React functional component that displays a panel showing the player's current skills.
 * It lists each skill, its level, current stats, and the description of its next upgrade.
 *
 * @param {SkillsPanelProps} props - The properties for the component.
 * @returns {React.ReactElement} The rendered SkillsPanel component.
 */
export const SkillsPanel: React.FC<SkillsPanelProps> = ({ skills, onClose }) => {
    return (
        <div className="info-panel-backdrop">
            <div className="info-panel" role="dialog" aria-modal="true" aria-labelledby="skills-title">
                <h2 id="skills-title">{i18nManager.t('ui.skillsPanel.title')}</h2>
                <div className="weapon-cards-container">
                    {skills.length === 0 && <p>{i18nManager.t('ui.skillsPanel.noSkills')}</p>}
                    {skills.map(s => (
                        <div key={s.id} className="weapon-card">
                            <div className="weapon-card-header">
                                <h3>{s.name}</h3>
                                <span>{i18nManager.t('ui.panel.level', { level: s.level })}</span>
                            </div>
                            <div className="weapon-card-stats">
                               <span>{i18nManager.t('ui.panel.type', { type: i18nManager.t(`skill.type.${s.type.toLowerCase()}`) })}</span>
                               {s.type === 'ACTIVE' && s.damage && <span>{i18nManager.t('ui.panel.damage', { value: s.damage.toFixed(1) })}</span>}
                               {s.type === 'ACTIVE' && s.cooldown && <span>{i18nManager.t('ui.panel.cooldown', { value: (s.cooldown / 1000).toFixed(2) })}</span>}
                               {s.type === 'ACTIVE' && s.range && <span>{i18nManager.t('ui.panel.range', { value: s.range })}</span>}
                            </div>
                             <div className="weapon-card-upgrade">
                                <strong>{i18nManager.t('ui.panel.nextUpgrade')}</strong> {s.getCurrentUpgradeDescription()}
                            </div>
                        </div>
                    ))}
                </div>
                <button className="close-button" onClick={onClose}>{i18nManager.t('ui.panel.close')}</button>
            </div>
        </div>
    );
};