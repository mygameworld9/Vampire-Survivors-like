
import React, { useState, useEffect } from 'react';
import { i18nManager } from '../core/i18n';
import { progressionManager } from '../core/ProgressionManager';
import { META_UPGRADES } from '../data/metaUpgradeData';

interface ArmoryProps {
    onBack: () => void;
}

export const Armory: React.FC<ArmoryProps> = ({ onBack }) => {
    const [gold, setGold] = useState(0);
    const [upgrades, setUpgrades] = useState<{[key: string]: number}>({});

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        setGold(progressionManager.getGold());
        const levels: {[key: string]: number} = {};
        for (const key in META_UPGRADES) {
            levels[key] = progressionManager.getUpgradeLevel(key);
        }
        setUpgrades(levels);
    };

    const handleBuy = (id: string) => {
        if (progressionManager.purchaseUpgrade(id)) {
            refreshData();
        }
    };

    return (
        <div className="menu-screen armory-screen">
            <h2>{i18nManager.t('ui.armory.title')}</h2>
            <div className="armory-header">
                <span className="gold-display">💰 {gold}</span>
            </div>
            
            <div className="selection-grid">
                {Object.values(META_UPGRADES).map(meta => {
                    const level = upgrades[meta.id] || 0;
                    const cost = progressionManager.getUpgradeCost(meta.id, level);
                    const isMax = level >= meta.maxLevel;
                    const canAfford = gold >= cost;

                    return (
                        <div key={meta.id} className="selection-card armory-card">
                            <div className="armory-icon">{meta.icon}</div>
                            <h3>{i18nManager.t(meta.nameKey)}</h3>
                            <p>{i18nManager.t(meta.descriptionKey)}</p>
                            
                            <div className="armory-progress">
                                {Array.from({ length: meta.maxLevel }).map((_, i) => (
                                    <div key={i} className={`pip ${i < level ? 'filled' : ''}`}></div>
                                ))}
                            </div>

                            <button 
                                className={`pill-button ${canAfford ? 'primary' : 'secondary'}`}
                                disabled={isMax || !canAfford}
                                onClick={() => handleBuy(meta.id)}
                                style={{ 
                                    opacity: (isMax || !canAfford) ? 0.6 : 1,
                                    cursor: (isMax || !canAfford) ? 'not-allowed' : 'pointer',
                                    marginTop: 'auto',
                                    fontSize: '1rem',
                                    padding: '0.5rem 1rem'
                                }}
                            >
                                {isMax ? i18nManager.t('ui.maxLevel') : `💰 ${cost}`}
                            </button>
                        </div>
                    );
                })}
            </div>
            <button className="back-button" onClick={onBack}>{i18nManager.t('ui.select.back')}</button>
        </div>
    );
};
