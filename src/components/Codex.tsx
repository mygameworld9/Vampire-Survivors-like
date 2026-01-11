
import React, { useState } from 'react';
import { i18nManager } from '../core/i18n';
import { WEAPON_DATA } from '../data/weaponData';
import { SKILL_DATA } from '../data/skillData';
import { ENEMY_DATA } from '../data/enemyData';
import { EVOLUTION_RECIPES } from '../data/evolutionData';

interface CodexProps {
    onClose: () => void;
}

type CodexTab = 'weapons' | 'skills' | 'enemies';

export const Codex: React.FC<CodexProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<CodexTab>('weapons');

    // Build set of evolved weapon IDs for categorization
    const evolvedWeaponIds = new Set(EVOLUTION_RECIPES.map(r => r.evolvedWeaponId));

    const renderWeaponCard = (w: typeof WEAPON_DATA[keyof typeof WEAPON_DATA]) => (
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
    );

    const renderWeaponStats = () => {
        const allWeapons = Object.values(WEAPON_DATA);
        const baseWeapons = allWeapons.filter(w => !evolvedWeaponIds.has(w.id));
        const evolvedWeapons = allWeapons.filter(w => evolvedWeaponIds.has(w.id));

        return (
            <>
                <div className="codex-weapon-group">
                    <h4 className="codex-group-title">⚔️ {i18nManager.t('ui.codex.baseWeapons') || 'Base Weapons'}</h4>
                    <div className="codex-group-grid">
                        {baseWeapons.map(renderWeaponCard)}
                    </div>
                </div>
                <div className="codex-weapon-group evolved">
                    <h4 className="codex-group-title">✨ {i18nManager.t('ui.codex.evolvedWeapons') || 'Evolved Weapons'}</h4>
                    <div className="codex-group-grid">
                        {evolvedWeapons.map(renderWeaponCard)}
                    </div>
                </div>
            </>
        );
    };

    const renderSkillCard = (s: typeof SKILL_DATA[keyof typeof SKILL_DATA]) => (
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
    );

    const renderSkillStats = () => {
        const allSkills = Object.values(SKILL_DATA);
        const passiveSkills = allSkills.filter(s => s.type === 'PASSIVE');
        const activeSkills = allSkills.filter(s => s.type === 'ACTIVE');

        return (
            <>
                <div className="codex-weapon-group">
                    <h4 className="codex-group-title">❤️ {i18nManager.t('ui.codex.passiveSkills') || 'Passive Skills'}</h4>
                    <div className="codex-group-grid">
                        {passiveSkills.map(renderSkillCard)}
                    </div>
                </div>
                <div className="codex-weapon-group evolved">
                    <h4 className="codex-group-title">⚡ {i18nManager.t('ui.codex.activeSkills') || 'Active Skills'}</h4>
                    <div className="codex-group-grid">
                        {activeSkills.map(renderSkillCard)}
                    </div>
                </div>
            </>
        );
    };

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