
import React from 'react';
import { BossData } from '../utils/types';

interface BossBarProps {
    boss: BossData;
}

export const BossBar: React.FC<BossBarProps> = ({ boss }) => {
    const percent = (boss.hp / boss.maxHp) * 100;

    return (
        <div className="boss-bar-container">
            <div className="boss-name">{boss.name}</div>
            <div className="boss-hp-track">
                <div className="boss-hp-fill" style={{ width: `${percent}%` }}></div>
            </div>
            <style>{`
                .boss-bar-container {
                    position: absolute;
                    top: 80px; /* Below top HUD */
                    left: 50%;
                    transform: translateX(-50%);
                    width: 50%;
                    min-width: 300px;
                    z-index: 45;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    pointer-events: none;
                }
                .boss-name {
                    color: #ff5252;
                    font-weight: bold;
                    font-size: 1.2rem;
                    text-shadow: 2px 2px 0 black;
                    margin-bottom: 5px;
                    text-transform: uppercase;
                }
                .boss-hp-track {
                    width: 100%;
                    height: 20px;
                    background: #37474F;
                    border: 2px solid #263238;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                }
                .boss-hp-fill {
                    height: 100%;
                    background: #ef5350;
                    transition: width 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};
