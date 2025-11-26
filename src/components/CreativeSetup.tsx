
import React, { useState } from 'react';
import { i18nManager } from '../core/i18n';
import { WEAPON_DATA } from '../data/weaponData';
import { SKILL_DATA } from '../data/skillData';
import { UPGRADE_DATA } from '../data/upgradeData';
import { SKILL_UPGRADE_DATA } from '../data/skillUpgradeData';
import { CreativeLoadout } from '../utils/types';
import { EVOLUTION_RECIPES } from '../data/evolutionData';

interface CreativeSetupProps {
    onStart: (loadout: CreativeLoadout) => void;
    onBack: () => void;
}

export const CreativeSetup: React.FC<CreativeSetupProps> = ({ onStart, onBack }) => {
    // Stores the selected level. If key exists, it is selected.
    const [weaponLevels, setWeaponLevels] = useState<{ [id: string]: number }>({});
    const [skillLevels, setSkillLevels] = useState<{ [id: string]: number }>({});
    const LIMIT = 6;

    const evolvedWeaponIds = new Set(EVOLUTION_RECIPES.map(r => r.evolvedWeaponId));

    const getWeaponCount = () => Object.keys(weaponLevels).length;
    const getSkillCount = () => Object.keys(skillLevels).length;

    const getMaxLevel = (id: string, type: 'weapon' | 'skill') => {
        if (type === 'weapon') {
            // Base level (1) + number of upgrades
            return 1 + (UPGRADE_DATA[id]?.length || 0);
        } else {
            return 1 + (SKILL_UPGRADE_DATA[id]?.length || 0);
        }
    };

    const updateLevel = (id: string, delta: number, type: 'weapon' | 'skill') => {
        const setMap = type === 'weapon' ? setWeaponLevels : setSkillLevels;
        const currentMap = type === 'weapon' ? weaponLevels : skillLevels;
        const currentLevel = currentMap[id] || 0;
        const count = type === 'weapon' ? getWeaponCount() : getSkillCount();
        const maxLevel = getMaxLevel(id, type);

        if (currentLevel === 0 && delta > 0) {
            // Trying to add new item
            if (count >= LIMIT) return; // Limit reached
            setMap(prev => ({ ...prev, [id]: 1 }));
        } else {
            const newLevel = currentLevel + delta;
            if (newLevel <= 0) {
                // Remove item
                const newMap = { ...currentMap };
                delete newMap[id];
                setMap(newMap);
            } else if (newLevel <= maxLevel) {
                // Update level
                setMap(prev => ({ ...prev, [id]: newLevel }));
            }
        }
    };

    const setMaxLevel = (id: string, type: 'weapon' | 'skill') => {
        const setMap = type === 'weapon' ? setWeaponLevels : setSkillLevels;
        const count = type === 'weapon' ? getWeaponCount() : getSkillCount();
        const currentMap = type === 'weapon' ? weaponLevels : skillLevels;
        const isSelected = !!currentMap[id];

        if (!isSelected && count >= LIMIT) return;

        const max = getMaxLevel(id, type);
        setMap(prev => ({ ...prev, [id]: max }));
    };

    const renderCard = (id: string, icon: string, nameKey: string, currentLevel: number, type: 'weapon' | 'skill') => {
        const isSelected = currentLevel > 0;
        const count = type === 'weapon' ? getWeaponCount() : getSkillCount();
        const disabled = !isSelected && count >= LIMIT;
        const maxLevel = getMaxLevel(id, type);

        return (
            <div 
                key={id} 
                className={`selection-card creative-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            >
                <div className="creative-icon">{icon}</div>
                <h4>{i18nManager.t(nameKey)}</h4>
                
                {isSelected ? (
                    <div className="level-controls">
                        <button onClick={(e) => { e.stopPropagation(); updateLevel(id, -1, type); }}>-</button>
                        <span>LVL {currentLevel}</span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); updateLevel(id, 1, type); }}
                            disabled={currentLevel >= maxLevel}
                        >
                            +
                        </button>
                    </div>
                ) : (
                    <div 
                        className="add-overlay"
                        onClick={() => updateLevel(id, 1, type)}
                    >
                        <span>+ ADD</span>
                    </div>
                )}
                
                {/* Max Button for Quick Testing */}
                <button 
                    className="max-btn"
                    onClick={(e) => { e.stopPropagation(); setMaxLevel(id, type); }}
                    disabled={currentLevel >= maxLevel || (disabled)}
                    title="Set to Max Level"
                >
                    MAX
                </button>
            </div>
        );
    };

    const handleStart = () => {
        const loadout: CreativeLoadout = {
            weapons: Object.entries(weaponLevels).map(([id, level]) => ({ id, level: level as number })),
            skills: Object.entries(skillLevels).map(([id, level]) => ({ id, level: level as number }))
        };
        onStart(loadout);
    };

    return (
        <div className="menu-screen creative-screen">
            <h2>{i18nManager.t('ui.creative.title')}</h2>
            <p className="subtitle">{i18nManager.t('ui.creative.subtitle')}</p>
            
            <div className="creative-sections">
                <div className="creative-section">
                    <h3>{i18nManager.t('ui.codex.weapons')} ({getWeaponCount()}/{LIMIT})</h3>
                    <div className="creative-grid">
                        {Object.values(WEAPON_DATA)
                            .filter(w => !evolvedWeaponIds.has(w.id)) // Hide evolved weapons
                            .map(w => (
                                renderCard(w.id, w.icon, w.nameKey, weaponLevels[w.id] || 0, 'weapon')
                            ))
                        }
                    </div>
                </div>
                
                <div className="creative-section">
                    <h3>{i18nManager.t('ui.codex.skills')} ({getSkillCount()}/{LIMIT})</h3>
                    <div className="creative-grid">
                        {Object.values(SKILL_DATA).map(s => (
                             renderCard(s.id, s.icon, s.nameKey, skillLevels[s.id] || 0, 'skill')
                        ))}
                    </div>
                </div>
            </div>

            <div className="action-row">
                 <button className="back-button" onClick={onBack}>{i18nManager.t('ui.select.back')}</button>
                 <button 
                    className="jelly-btn primary" 
                    onClick={handleStart}
                >
                    {i18nManager.t('ui.creative.start')}
                </button>
            </div>
            
            <style>{`
                .creative-screen {
                    overflow-y: auto;
                    justify-content: flex-start;
                    padding-top: 4rem;
                }
                .creative-sections {
                    display: flex;
                    gap: 2rem;
                    width: 100%;
                    max-width: 1200px;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .creative-section {
                    flex: 1;
                    min-width: 300px;
                    background: rgba(255, 255, 255, 0.5);
                    padding: 1rem;
                    border-radius: 20px;
                }
                .creative-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
                    gap: 12px;
                }
                .creative-card {
                    width: auto;
                    padding: 10px;
                    height: 140px;
                    border-width: 2px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between; 
                    position: relative;
                    transition: all 0.2s;
                }
                .creative-card h4 {
                    font-size: 0.8rem;
                    margin: 0;
                    text-align: center;
                }
                .creative-icon {
                    font-size: 2rem;
                }
                .creative-card.selected {
                    background-color: #e1bee7;
                    border-color: #8e24aa;
                    box-shadow: inset 0 0 10px rgba(142, 36, 170, 0.3);
                }
                .creative-card.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    filter: grayscale(1);
                }
                .add-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: rgba(0,0,0,0.05);
                    opacity: 0;
                    transition: opacity 0.2s;
                    cursor: pointer;
                    font-weight: bold;
                    color: #4a148c;
                    font-size: 1.2rem;
                    z-index: 5;
                }
                .creative-card:not(.selected):not(.disabled):hover .add-overlay {
                    opacity: 1;
                }
                .level-controls {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    background: rgba(255,255,255,0.6);
                    padding: 2px 5px;
                    border-radius: 10px;
                    width: 100%;
                    justify-content: space-between;
                    box-sizing: border-box;
                    z-index: 10;
                }
                .level-controls span {
                    font-size: 0.8rem;
                    font-weight: bold;
                }
                .level-controls button {
                    width: 20px;
                    height: 20px;
                    padding: 0;
                    border: 1px solid #8e24aa;
                    background: white;
                    color: #8e24aa;
                    border-radius: 50%;
                    cursor: pointer;
                    font-weight: bold;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .level-controls button:hover {
                    background: #f3e5f5;
                }
                .level-controls button:disabled {
                    opacity: 0.3;
                    cursor: default;
                }
                .max-btn {
                    width: 100%;
                    border: none;
                    background: #ab47bc;
                    color: white;
                    font-size: 0.7rem;
                    padding: 2px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 2px;
                    font-weight: bold;
                    z-index: 10;
                }
                .max-btn:hover:not(:disabled) {
                    background: #8e24aa;
                }
                .max-btn:disabled {
                    background: #ccc;
                    cursor: default;
                }
                .action-row {
                    display: flex;
                    width: 100%;
                    justify-content: center;
                    position: relative;
                    margin-bottom: 2rem;
                }
                .action-row .back-button {
                    position: static;
                    margin-right: 2rem;
                }
            `}</style>
        </div>
    );
};
