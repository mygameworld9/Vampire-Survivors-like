
import React from 'react';
import { IPlayerState } from '../utils/types';
import { Weapon } from '../entities/Weapon';
import { Skill } from '../entities/Skill';
import { i18nManager } from '../core/i18n';

/**
 * Interface for the properties of the HUD component.
 * @interface HUDProps
 */
interface HUDProps {
    /** The current state of the player, including HP, XP, level, etc. */
    playerState: IPlayerState;
    /** The elapsed game time in seconds. */
    gameTime: number;
    /** An array of the player's current weapons. */
    weapons: Weapon[];
    /** An array of the player's current skills. */
    skills: Skill[];
    /** Callback function to execute when the pause button is clicked. */
    onPause: () => void;
}

/**
 * Formats a duration in seconds into a MM:SS string.
 * @private
 * @param {number} seconds - The total seconds.
 * @returns {string} The formatted time string.
 */
const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

/**
 * A React functional component that displays the Heads-Up Display (HUD).
 * The HUD shows critical game information like player health, experience, level, gold,
 * game time, and current weapons/skills. It is memoized to optimize performance, as its
 * props update on nearly every frame.
 *
 * @param {HUDProps} props - The properties for the component.
 * @returns {React.ReactElement} The rendered HUD component.
 */
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