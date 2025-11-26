
import React from 'react';
import { IPlayerState, BossData } from '../utils/types';
import { Weapon } from '../entities/Weapon';
import { Skill } from '../entities/Skill';
import { i18nManager } from '../core/i18n';
import { BossBar } from './BossBar';

interface HUDRefs {
    hpBarRef: React.RefObject<HTMLDivElement>;
    xpBarRef: React.RefObject<HTMLDivElement>;
    timerRef: React.RefObject<HTMLDivElement>;
    hpTextRef: React.RefObject<HTMLSpanElement>;
}

interface HUDProps {
    playerState: IPlayerState;
    // Removed gameTime prop to avoid re-renders
    weapons: Weapon[];
    skills: Skill[];
    onPause: () => void;
    activeBoss?: BossData;
    hudRefs: HUDRefs;
}

export const HUD: React.FC<HUDProps> = React.memo(({ playerState, weapons, skills, onPause, activeBoss, hudRefs }) => {
    const totalSkillSlots = 6;
    // Initial width set by React, updates handled by direct DOM manipulation
    const initialHpPercent = playerState.maxHp > 0 ? (playerState.hp / playerState.maxHp) * 100 : 0;
    const initialXpPercent = playerState.xpToNext > 0 ? (playerState.xp / playerState.xpToNext) * 100 : 0;

    // Note: We removed 'isLowHp' reactive class toggling for performance. 
    // Ideally, the low-hp class should also be toggled via ref in the loop if critical.

    return (
        <div className="hud">
            {activeBoss && <BossBar boss={activeBoss} />}
            
            <div className="hud-top">
                <div className="hud-top-left">
                    <div className="hud-stats-line">
                        <span className="stats-text">{i18nManager.t('ui.hud.level', { level: playerState.level })}</span>
                        <span className="gold-counter">💰 {playerState.gold}</span>
                    </div>
                    <div className="stats-bar">
                        <div 
                            ref={hudRefs.hpBarRef}
                            className="stats-bar-inner hp-bar" 
                            style={{width: `${initialHpPercent}%`}}
                        ></div>
                    </div>
                     <span className="stats-text" ref={hudRefs.hpTextRef}>
                        {Math.round(playerState.hp)} / {Math.round(playerState.maxHp)}
                     </span>
                     <div className="stats-bar">
                        <div 
                            ref={hudRefs.xpBarRef}
                            className="stats-bar-inner xp-bar" 
                            style={{width: `${initialXpPercent}%`}}
                        ></div>
                    </div>
                </div>
                <div className="hud-top-center" ref={hudRefs.timerRef}>00:00</div>
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
