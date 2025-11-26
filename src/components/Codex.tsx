
import React, { useState } from 'react';
import { i18nManager } from '../core/i18n';
import { WEAPON_DATA } from '../data/weaponData';
import { SKILL_DATA } from '../data/skillData';
import { ENEMY_DATA } from '../data/enemyData';

/**
 * Interface for the properties of the Codex component.
 * @interface CodexProps
 */
interface CodexProps {
    /**
     * Callback function to be executed when the codex is closed.
     */
    onClose: () => void;
}

/** @private Represents the possible tabs in the Codex. */
type CodexTab = 'weapons' | 'skills' | 'enemies';

/**
 * A React functional component that displays the in-game Codex.
 * The Codex is an encyclopedia of all weapons, skills, and enemies in the game,
 * showing their stats and descriptions.
 *
 * @param {CodexProps} props - The properties for the component.
 * @returns {React.ReactElement} The rendered Codex component.
 */
export const Codex: React.FC<CodexProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<CodexTab>('weapons');

    /**
     * Renders the list of weapon statistics.
     * @private
     * @returns {React.ReactElement[]} An array of JSX elements, one for each weapon.
     */
    const renderWeaponStats = () => {
        return Object.values(WEAPON_DATA).map(w => (
            <div key={w.id} className="weapon-card">
                <div className="weapon-card-header">
                    <div className="codex-title-group">
                        <span className="codex-icon">{w.icon}</span>
                        <h3>{i18nManager.t(w.nameKey)}</h3>
                    </div>
                    <span>{i18nManager.t('ui.panel.level', { level: 1 })}</span>
                </div>
                <div className="weapon-card-stats">
                    <span>{i18nManager.t('ui.panel.damage', { value: w.damage.toFixed(1) })}</span>
                    <span>{i18nManager.t('ui.panel.cooldown', { value: (w.cooldown / 1000).toFixed(2) })}</span>
                    {w.type !== 'AURA' && <span>{i18nManager.t('ui.panel.speed', { value: w.speed })}</span>}
                    {w.type !== 'AURA' && <span>{i18nManager.t('ui.panel.penetration', { value: w.penetration })}</span>}
                    <span>{i18nManager.t('ui.panel.range', { value: w.range })}</span>
                </div>
            </div>
        ));
    };

    /**
     * Renders the list of skill statistics.
     * @private
     * @returns {React.ReactElement[]} An array of JSX elements, one for each skill.
     */
    const renderSkillStats = () => {
        return Object.values(SKILL_DATA).map(s => (
            <div key={s.id} className="weapon-card">
                <div className="weapon-card-header">
                     <div className="codex-title-group">
                        <span className="codex-icon">{s.icon}</span>
                        <h3>{i18nManager.t(s.nameKey)}</h3>
                    </div>
                    <span>{i18nManager.t('ui.panel.level', { level: 1 })}</span>
                </div>
                 <div className="weapon-card-stats">
                    <span>{i18nManager.t('ui.panel.type', { type: i18nManager.t(`skill.type.${s.type.toLowerCase()}`) })}</span>
                    {s.type === 'ACTIVE' && s.damage && <span>{i18nManager.t('ui.panel.damage', { value: s.damage.toFixed(1) })}</span>}
                    {s.type === 'ACTIVE' && s.cooldown && <span>{i18nManager.t('ui.panel.cooldown', { value: (s.cooldown / 1000).toFixed(2) })}</span>}
                    {s.type === 'ACTIVE' && s.range && <span>{i18nManager.t('ui.panel.range', { value: s.range })}</span>}
                </div>
                <div className="weapon-card-upgrade">
                    {i18nManager.t(s.descriptionKey)}
                </div>
            </div>
        ));
    };

    /**
     * Renders the list of enemy statistics.
     * @private
     * @returns {React.ReactElement[]} An array of JSX elements, one for each enemy.
     */
    const renderEnemyStats = () => {
        return Object.values(ENEMY_DATA).map(e => (
            <div key={e.nameKey} className="weapon-card">
                <div className="weapon-card-header">
                    <div className="codex-title-group">
                        <span className="codex-icon">{e.icon}</span>
                        <h3>{i18nManager.t(e.nameKey)}</h3>
                    </div>
                </div>
                <div className="weapon-card-stats">
                     <span>{i18nManager.t('ui.panel.hp', { value: e.hp })}</span>
                     <span>{i18nManager.t('ui.panel.damage', { value: e.damage })}</span>
                     <span>{i18nManager.t('ui.panel.speed', { value: e.speed })}</span>
                </div>
                <div className="weapon-card-upgrade">
                    {i18nManager.t(e.descriptionKey)}
                </div>
            </div>
        ));
    };


    return (
        <div className="info-panel-backdrop codex-backdrop">
            <div className="info-panel codex-panel" role="dialog" aria-modal="true" aria-labelledby="codex-title">
                <h2 id="codex-title">{i18nManager.t('ui.codex.title')}</h2>
                
                <div className="codex-tabs">
                    <button 
                        className={`codex-tab ${activeTab === 'weapons' ? 'active' : ''}`}
                        onClick={() => setActiveTab('weapons')}
                        aria-pressed={activeTab === 'weapons'}
                    >
                        {i18nManager.t('ui.codex.weapons')}
                    </button>
                    <button 
                        className={`codex-tab ${activeTab === 'skills' ? 'active' : ''}`}
                        onClick={() => setActiveTab('skills')}
                        aria-pressed={activeTab === 'skills'}
                    >
                        {i18nManager.t('ui.codex.skills')}
                    </button>
                     <button 
                        className={`codex-tab ${activeTab === 'enemies' ? 'active' : ''}`}
                        onClick={() => setActiveTab('enemies')}
                        aria-pressed={activeTab === 'enemies'}
                    >
                        {i18nManager.t('ui.codex.enemies')}
                    </button>
                </div>

                <div className="weapon-cards-container codex-content">
                   {activeTab === 'weapons' && renderWeaponStats()}
                   {activeTab === 'skills' && renderSkillStats()}
                   {activeTab === 'enemies' && renderEnemyStats()}
                </div>

                <button className="close-button" onClick={onClose} aria-label="Close Codex">{i18nManager.t('ui.panel.close')}</button>
            </div>
        </div>
    );
};