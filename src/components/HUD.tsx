
import React from 'react';
import { IPlayerState } from '../utils/types';
import { Weapon } from '../entities/Weapon';
import { Skill } from '../entities/Skill';
import { i18nManager } from '../core/i18n';

interface HUDProps {
    playerState: IPlayerState;
    gameTime: number;
    weapons: Weapon[];
    skills: Skill[];
    onPause: () => void;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

// Use React.memo to prevent re-rendering if props are identical.
// This is crucial for game loop performance as the parent updates state frequently.
export const HUD: React.FC<HUDProps> = React.memo(({ playerState, gameTime, weapons, skills, onPause }) => {
    const totalSkillSlots = 6;
    const isLowHp = playerState.hp > 0 && (playerState.hp / playerState.maxHp) <= 0.25;

    return (
        <div className="hud">
            <div className="hud-top">
                <div className="hud-top-left">
                    <div className="hud-stats-line">
                        <span className="stats-text">{i18nManager.t('ui.hud.level', { level: playerState.level })}</span>
                        <span className="gold-counter">💰 {playerState.gold}</span>
                    </div>
                    <div className={`stats-bar ${isLowHp ? 'low-hp-container' : ''}`}>
                        <div className={`stats-bar-inner hp-bar ${isLowHp ? 'low-hp' : ''}`} style={{width: `${(playerState.hp / playerState.maxHp) * 100}%`}}></div>
                    </div>
                     <span className="stats-text">{playerState.hp} / {playerState.maxHp}</span>
                     <div className="stats-bar">
                        <div className="stats-bar-inner xp-bar" style={{width: `${(playerState.xp / playerState.xpToNext) * 100}%`}}></div>
                    </div>
                </div>
                <div className="hud-top-center">{formatTime(gameTime)}</div>
                <div className="hud-top-right">
                    <button className="pause-button" onClick={onPause} aria-label="Pause Game">||</button>
                </div>
            </div>
            <div className="hud-bottom">
                 <div className="hud-bottom-left">
                     {weapons.map(w => (
                         <div key={w.id} className="inventory-slot">
                             {w.icon}
                             <div style={{fontSize: '0.7rem', position: 'absolute', bottom: 2, right: 4}}>{i18nManager.t('ui.panel.level', { level: w.level })}</div>
                         </div>
                     ))}
                 </div>
                 <div className="hud-bottom-right">
                    {skills.map(s => (
                        <div key={s.id} className="inventory-slot skill-slot occupied">
                            {s.icon}
                            <div style={{fontSize: '0.7rem', position: 'absolute', bottom: 2, right: 4}}>{i18nManager.t('ui.panel.level', { level: s.level })}</div>
                        </div>
                    ))}
                    {Array.from({ length: totalSkillSlots - skills.length }).map((_, i) => (
                        <div key={i} className="inventory-slot skill-slot"></div>
                    ))}
                 </div>
            </div>
        </div>
    );
});