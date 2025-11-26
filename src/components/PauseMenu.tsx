import React from 'react';
import { i18nManager } from '../core/i18n';

/**
 * Interface for the properties of the PauseMenu component.
 * @interface PauseMenuProps
 */
interface PauseMenuProps {
    /** Callback function to resume the game. */
    onResume: () => void;
    /** Callback function to open the weapons panel. */
    onWeapons: () => void;
    /** Callback function to open the skills panel. */
    onSkills: () => void;
    /** Callback function to open the codex. */
    onCodex: () => void;
    /** Callback function to restart the current game. */
    onRestart: () => void;
    /** Callback function to return to the main menu. */
    onMainMenu: () => void;
}

/**
 * A React functional component that displays the pause menu.
 * This menu appears when the game is paused, providing options to resume, view player stats,
 * restart the game, or return to the main menu.
 *
 * @param {PauseMenuProps} props - The properties for the component.
 * @returns {React.ReactElement} The rendered PauseMenu component.
 */
export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onWeapons, onSkills, onCodex, onRestart, onMainMenu }) => {
    return (
        <div className="pause-menu-backdrop">
            <div className="pause-menu" role="dialog" aria-modal="true" aria-labelledby="pause-title">
                <h2 id="pause-title">{i18nManager.t('ui.pause.title')}</h2>
                <button onClick={onResume}>{i18nManager.t('ui.pause.resume')}</button>
                <button onClick={onWeapons}>{i18nManager.t('ui.pause.weapons')}</button>
                <button onClick={onSkills}>{i18nManager.t('ui.pause.skills')}</button>
                <button onClick={onCodex}>{i18nManager.t('ui.codex.title')}</button>
                <button onClick={onRestart}>{i18nManager.t('ui.pause.restart')}</button>
                <button onClick={onMainMenu}>{i18nManager.t('ui.pause.mainMenu')}</button>
            </div>
        </div>
    );
};