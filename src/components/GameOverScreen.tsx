import React from 'react';
import { i18nManager } from '../core/i18n';

/**
 * Interface for the properties of the GameOverScreen component.
 * @interface GameOverScreenProps
 */
interface GameOverScreenProps {
    /** The total time the player survived, in seconds. */
    gameTime: number;
    /** The player's final level. */
    playerLevel: number;
    /** The amount of gold collected during the run. */
    gold: number;
    /** Callback function to execute when the 'Restart' button is clicked. */
    onRestart: () => void;
    /** Callback function to execute when the 'Main Menu' button is clicked. */
    onMainMenu: () => void;
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
 * A React functional component that displays the Game Over screen.
 * It shows the player's final stats for the run (time survived, level, gold)
 * and provides options to restart the game or return to the main menu.
 *
 * @param {GameOverScreenProps} props - The properties for the component.
 * @returns {React.ReactElement} The rendered GameOverScreen component.
 */
export const GameOverScreen: React.FC<GameOverScreenProps> = ({ 
    gameTime, 
    playerLevel, 
    gold, 
    onRestart, 
    onMainMenu 
}) => {
    return (
        <div className="game-over-container">
            <div className="game-over-card">
                <div className="game-over-mascot">👻</div>
                <h1 className="game-over-title">{i18nManager.t('ui.gameover.title')}</h1>
                
                <div className="game-over-stats">
                    <div className="stat-row">
                        <div className="stat-item">
                            <span className="stat-icon">⏱️</span>
                            <span className="stat-label">{i18nManager.t('ui.gameover.survived', { time: formatTime(gameTime) })}</span>
                        </div>
                    </div>
                    <div className="stat-row dual">
                        <div className="stat-item">
                            <span className="stat-icon">⭐</span>
                            <span className="stat-label">{i18nManager.t('ui.hud.level', { level: playerLevel })}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon">💰</span>
                            <span className="stat-label">{gold}</span>
                        </div>
                    </div>
                </div>

                <div className="game-over-actions">
                    <button className="pill-button primary" onClick={onRestart}>
                        <span className="btn-icon">↺</span> {i18nManager.t('ui.gameover.restart')}
                    </button>
                    <button className="pill-button secondary" onClick={onMainMenu}>
                        <span className="btn-icon">🏠</span> {i18nManager.t('ui.gameover.mainMenu')}
                    </button>
                </div>
            </div>
        </div>
    );
};