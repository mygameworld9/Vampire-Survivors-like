
import React, { useState } from 'react';
import { i18nManager } from '../core/i18n';
import { CHARACTER_DATA } from '../data/characterData';
import { WEAPON_DATA } from '../data/weaponData';

interface CharacterSelectProps {
    onSelect: (characterId: string) => void;
    onBack: () => void;
}

// Map character IDs to theme colors for the card UI
const CHAR_THEMES: {[key: string]: { emoji: string, color: string }} = {
    KNIGHT:   { emoji: '🛡️', color: '#B0BEC5' }, // Silver/Grey
    ROGUE:    { emoji: '🥷', color: '#A5D6A7' }, // Pastel Green - Changed from 🗡️ to Ninja
    MAGE:     { emoji: '🧙', color: '#90CAF9' }, // Pastel Blue
    CLERIC:   { emoji: '🕯️', color: '#FFF59D' }, // Pastel Yellow - Changed from ✨ to Candle
    HUNTRESS: { emoji: '🏹', color: '#FFCC80' }, // Pastel Orange
    WARLOCK:  { emoji: '🧿', color: '#CE93D8' }, // Pastel Purple - Changed from 🔮 to Evil Eye
};

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect, onBack }) => {
    const [hoveredChar, setHoveredChar] = useState<string | null>(null);

    return (
        <div className="menu-screen">
            <h2>{i18nManager.t('ui.select.character.title')}</h2>
            <div className="selection-grid">
                {Object.values(CHARACTER_DATA).map(char => {
                    const theme = CHAR_THEMES[char.id] || { emoji: '👤', color: '#ECEFF1' };
                    const isHovered = hoveredChar === char.id;

                    const cardStyle: React.CSSProperties = {
                        backgroundColor: '#FFFFFF',
                        border: `5px solid ${isHovered ? '#E91E63' : theme.color}`,
                        borderRadius: '30px',
                        padding: '1.5rem',
                        width: '280px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy transition
                        transform: isHovered ? 'translateY(-15px) scale(1.05)' : 'none',
                        boxShadow: isHovered ? `0 15px 0 #E91E63` : `0 10px 0 ${theme.color}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    };

                    const avatarStyle: React.CSSProperties = {
                        width: '110px',
                        height: '110px',
                        borderRadius: '50%',
                        backgroundColor: `${theme.color}40`, // 40 hex = 25% opacity
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '5rem',
                        marginBottom: '1rem',
                        border: `4px solid ${theme.color}`,
                        transition: 'transform 0.3s ease',
                        transform: isHovered ? 'rotate(10deg) scale(1.1)' : 'none'
                    };

                    return (
                        <div 
                            key={char.id} 
                            style={cardStyle}
                            onClick={() => onSelect(char.id)}
                            onMouseEnter={() => setHoveredChar(char.id)}
                            onMouseLeave={() => setHoveredChar(null)}
                        >
                            <div style={avatarStyle}>
                                {theme.emoji}
                            </div>
                            <h3 style={{ 
                                margin: '0 0 0.5rem 0', 
                                color: '#546E7A', 
                                fontFamily: "'Comic Sans MS', sans-serif",
                                fontSize: '1.5rem'
                            }}>
                                {i18nManager.t(char.nameKey)}
                            </h3>
                            <p style={{ fontSize: '0.95rem', color: '#78909C', marginBottom: 'auto', lineHeight: '1.4' }}>
                                {i18nManager.t(char.descriptionKey)}
                            </p>
                            <div style={{ 
                                marginTop: '1rem', 
                                padding: '0.5rem 1rem', 
                                backgroundColor: '#ECEFF1', 
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                color: '#455A64',
                                fontWeight: 'bold',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}>
                               {i18nManager.t('ui.select.character.starts')} <span style={{color: '#E91E63'}}>{i18nManager.t(WEAPON_DATA[char.startingWeaponId].nameKey)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <button className="back-button" onClick={onBack}>{i18nManager.t('ui.select.back')}</button>
        </div>
    );
};
