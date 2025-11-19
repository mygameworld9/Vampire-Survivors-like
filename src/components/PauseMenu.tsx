import React from 'react';
import { i18nManager } from '../core/i18n';

interface PauseMenuProps {
    onResume: () => void;
    onWeapons: () => void;
    onSkills: () => void;
    onCodex: () => void;
    onRestart: () => void;
    onMainMenu: () => void;
}

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