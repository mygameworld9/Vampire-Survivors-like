import React from 'react';
import { i18nManager } from '../core/i18n';

/**
 * Interface for the properties of the StartScreen component.
 * @interface StartScreenProps
 */
interface StartScreenProps {
    /** Callback function to start a standard game. */
    onStart: () => void;
    /** Callback function to enter Creative Mode setup. */
    onCreative: () => void;
    /** Callback function to open the Armory. */
    onArmory: () => void;
    /** Callback function to open the Codex. */
    onCodex: () => void;
    /** The currently selected language code. */
    currentLanguage: string;
    /** Callback function to change the language. */
    onLanguageChange: (lang: string) => void;
}

/**
 * A React functional component that displays the main start screen of the game.
 * It serves as the main menu, providing options to start a new game, enter creative mode,
 * visit the armory, or view the codex. It also includes a language switcher.
 *
 * @param {StartScreenProps} props - The properties for the component.
 * @returns {React.ReactElement} The rendered StartScreen component.
 */
export const StartScreen: React.FC<StartScreenProps> = ({ 
    onStart, 
    onCreative, 
    onArmory, 
    onCodex, 
    currentLanguage, 
    onLanguageChange 
}) => {
    return (
        <div className="start-screen-container pop-theme">
            {/* Animated Background Elements */}
            <div className="bg-stripe-overlay"></div>
            <div className="cloud cloud-1">☁️</div>
            <div className="cloud cloud-2">☁️</div>
            <div className="sparkle sparkle-1">✨</div>
            <div className="sparkle sparkle-2">✨</div>

            {/* Minimal Language Switcher Top-Right */}
            <div className="language-switcher-corner">
                <span 
                    className={`lang-opt ${currentLanguage === 'en' ? 'active' : ''}`} 
                    onClick={() => onLanguageChange('en')}
                >
                    EN
                </span>
                <span 
                    className={`lang-opt ${currentLanguage === 'zh-CN' ? 'active' : ''}`} 
                    onClick={() => onLanguageChange('zh-CN')}
                >
                    中文
                </span>
            </div>

            <div className="start-content-layout">
                <div className="start-left-panel">
                    <div className="title-group">
                        <h1 className="pop-main-title">Sparkle</h1>
                        <h1 className="pop-sub-title">Survivors</h1>
                    </div>
                    <div className="action-group">
                        <button className="jelly-btn primary" onClick={onStart}>
                                <span className="btn-icon">▶</span> {i18nManager.t('ui.start.button')}
                        </button>
                        <button className="jelly-btn secondary" onClick={onCreative}>
                                <span className="btn-icon">🧪</span> {i18nManager.t('ui.start.creative')}
                        </button>
                        <button className="jelly-btn secondary" onClick={onArmory}>
                                <span className="btn-icon">🛠️</span> {i18nManager.t('ui.armory.title')}
                        </button>
                            <button className="jelly-btn secondary" onClick={onCodex}>
                            <span className="btn-icon">📘</span> {i18nManager.t('ui.start.codex')}
                        </button>
                    </div>
                </div>

                <div className="start-right-panel">
                        <div className="hero-mascot">🛡️</div>
                </div>
            </div>
        </div>
    );
};