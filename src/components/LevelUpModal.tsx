


import React from 'react';
import { UpgradeOption } from '../utils/types';
import { i18nManager } from '../core/i18n';

interface LevelUpModalProps {
    options: UpgradeOption[];
    onSelect: (option: UpgradeOption) => void;
    onReroll: () => void;
    onBanish: (option: UpgradeOption) => void;
    onSkip: () => void;
    rerollsLeft: number;
    banishesLeft: number;
    skipsLeft: number;
}

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

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ 
    options, onSelect, 
    onReroll, onBanish, onSkip,
    rerollsLeft, banishesLeft, skipsLeft 
}) => {
    return (
        <div className="level-up-modal-backdrop">
            <div className="level-up-modal">
                <h2>{i18nManager.t('ui.levelup.title')}</h2>
                <p>{i18nManager.t('ui.levelup.subtitle')}</p>
                
                <div className="level-up-options">
                    {options.map((opt, index) => (
                        <div className="level-up-option-container" key={index}>
                            <div className="level-up-option" onClick={() => onSelect(opt)}>
                                {renderOption(opt)}
                            </div>
                            {/* Banish Button below option */}
                            {banishesLeft > 0 && (
                                <button 
                                    className="banish-btn" 
                                    onClick={(e) => { e.stopPropagation(); onBanish(opt); }}
                                    title="Banish this item"
                                >
                                    🚫 Banish
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="level-up-controls">
                    <button 
                        className="control-btn reroll" 
                        onClick={onReroll} 
                        disabled={rerollsLeft <= 0}
                    >
                        🎲 Reroll ({rerollsLeft})
                    </button>
                    <button 
                        className="control-btn skip" 
                        onClick={onSkip}
                        disabled={skipsLeft <= 0}
                    >
                        ⏩ Skip ({skipsLeft})
                    </button>
                </div>
            </div>
            <style>{`
                .level-up-option-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .banish-btn {
                    background: #ef5350;
                    border: none;
                    color: white;
                    border-radius: 15px;
                    padding: 5px 10px;
                    cursor: pointer;
                    font-weight: bold;
                    align-self: center;
                    opacity: 0.8;
                }
                .banish-btn:hover {
                    opacity: 1;
                    transform: scale(1.05);
                }
                .level-up-controls {
                    margin-top: 2rem;
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                }
                .control-btn {
                    padding: 0.8rem 1.5rem;
                    border: none;
                    border-radius: 30px;
                    font-weight: bold;
                    font-size: 1.1rem;
                    cursor: pointer;
                    color: white;
                    box-shadow: 0 4px 0 rgba(0,0,0,0.2);
                    transition: transform 0.1s;
                }
                .control-btn:active {
                    transform: translateY(2px);
                    box-shadow: 0 2px 0 rgba(0,0,0,0.2);
                }
                .control-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    filter: grayscale(1);
                }
                .control-btn.reroll {
                    background-color: #42a5f5;
                }
                .control-btn.skip {
                    background-color: #ffa726;
                }
            `}</style>
        </div>
    );
};
