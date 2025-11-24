
import React, { useState } from 'react';
import { i18nManager } from '../core/i18n';
import { CHARACTER_DATA } from '../data/characterData';
import { WEAPON_DATA } from '../data/weaponData';
import { CharacterCache } from '../core/CharacterCache';

interface CharacterSelectProps {
    onSelect: (characterId: string) => void;
    onBack: () => void;
}

// Visual themes mapping
const CHAR_THEMES: {[key: string]: { color: string, secondary: string, bg: string }} = {
    KNIGHT:   { color: '#546E7A', secondary: '#B0BEC5', bg: '#ECEFF1' }, // Steel
    ROGUE:    { color: '#43A047', secondary: '#A5D6A7', bg: '#E8F5E9' }, // Forest Green
    MAGE:     { color: '#1E88E5', secondary: '#90CAF9', bg: '#E3F2FD' }, // Arcane Blue
    CLERIC:   { color: '#FDD835', secondary: '#FFF59D', bg: '#FFFDE7' }, // Holy Gold
    HUNTRESS: { color: '#F4511E', secondary: '#FFAB91', bg: '#FBE9E7' }, // Hunter Orange
    WARLOCK:  { color: '#8E24AA', secondary: '#CE93D8', bg: '#F3E5F5' }, // Void Purple
};

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect, onBack }) => {
    const [hoveredChar, setHoveredChar] = useState<string | null>(null);

    // Helper to calculate bar percentage (Max HP ~150, Max Speed ~300 for visualization context)
    const getStatPercent = (val: number, max: number) => Math.min(100, Math.max(10, (val / max) * 100));

    return (
        <div className="menu-screen character-select-screen">
            <h2 className="screen-title">{i18nManager.t('ui.select.character.title')}</h2>
            
            <div className="hero-grid">
                {Object.values(CHARACTER_DATA).map(char => {
                    const theme = CHAR_THEMES[char.id] || CHAR_THEMES['KNIGHT'];
                    const isHovered = hoveredChar === char.id;
                    const weapon = WEAPON_DATA[char.startingWeaponId];
                    const avatarUrl = CharacterCache.getAvatarUrl(char.id);

                    // Default stats if not defined
                    const hp = char.stats?.hp || 100;
                    const speed = char.stats?.speed || 200;

                    return (
                        <div 
                            key={char.id} 
                            className={`hero-card ${isHovered ? 'hovered' : ''}`}
                            onClick={() => onSelect(char.id)}
                            onMouseEnter={() => setHoveredChar(char.id)}
                            onMouseLeave={() => setHoveredChar(null)}
                            style={{
                                '--theme-color': theme.color,
                                '--theme-bg': theme.bg,
                                '--theme-sec': theme.secondary
                            } as React.CSSProperties}
                        >
                            {/* Header: Avatar & Name */}
                            <div className="hero-header">
                                <div className="hero-avatar-container">
                                    <div className={`character-portrait ${isHovered ? 'animate' : ''}`} 
                                         style={{ backgroundImage: `url(${avatarUrl})` }}>
                                    </div>
                                </div>
                                <h3 className="hero-name">{i18nManager.t(char.nameKey)}</h3>
                            </div>

                            {/* Body: Stats */}
                            <div className="hero-stats">
                                <div className="stat-row">
                                    <span className="stat-label">HP</span>
                                    <div className="stat-track">
                                        <div className="stat-fill" style={{ width: `${getStatPercent(hp, 150)}%`, background: '#ef5350' }}></div>
                                    </div>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">SPD</span>
                                    <div className="stat-track">
                                        <div className="stat-fill" style={{ width: `${getStatPercent(speed, 300)}%`, background: '#42a5f5' }}></div>
                                    </div>
                                </div>
                                <p className="hero-desc">{i18nManager.t(char.descriptionKey)}</p>
                            </div>

                            {/* Footer: Weapon Persona */}
                            <div className="hero-weapon-badge">
                                <span className="weapon-label">{i18nManager.t('ui.select.character.starts')}</span>
                                <div className="weapon-info">
                                    <span className="weapon-icon">{weapon.icon}</span>
                                    <span className="weapon-name">{i18nManager.t(weapon.nameKey)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <button className="back-button" onClick={onBack}>{i18nManager.t('ui.select.back')}</button>
        </div>
    );
};
