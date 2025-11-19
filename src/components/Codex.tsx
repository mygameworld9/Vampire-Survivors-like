import React, { useState } from 'react';
import { i18nManager } from '../core/i18n';
import { WEAPON_DATA } from '../data/weaponData';
import { SKILL_DATA } from '../data/skillData';

interface CodexProps {
    onClose: () => void;
}

type CodexTab = 'weapons' | 'skills';

export const Codex: React.FC<CodexProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<CodexTab>('weapons');

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
                </div>

                <div className="weapon-cards-container codex-content">
                   {activeTab === 'weapons' ? renderWeaponStats() : renderSkillStats()}
                </div>

                <button className="close-button" onClick={onClose} aria-label="Close Codex">{i18nManager.t('ui.panel.close')}</button>
            </div>
        </div>
    );
};