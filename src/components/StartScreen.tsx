
import React from 'react';
import { i18nManager } from '../core/i18n';

interface StartScreenProps {
    onStart: () => void;
    onCreative: () => void;
    onArmory: () => void;
    onCodex: () => void;
    currentLanguage: string;
    onLanguageChange: (lang: string) => void;
}

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
                        {/* Custom Kawaii Star Mascot SVG */}
                        <div className="hero-mascot">
                            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="mascot-svg">
                                <defs>
                                    <linearGradient id="starGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#FFF176" />
                                        <stop offset="100%" stopColor="#FFD54F" />
                                    </linearGradient>
                                    <filter id="stickerShadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="0" dy="8" stdDeviation="2" floodColor="rgba(0,0,0,0.15)"/>
                                    </filter>
                                </defs>
                                
                                {/* Sticker Outline */}
                                <g transform="translate(100, 100)" filter="url(#stickerShadow)">
                                    {/* White Stroke Background */}
                                    <path d="M0 -85 L23 -35 L78 -35 L40 5 L55 60 L0 30 L-55 60 L-40 5 L-78 -35 L-23 -35 Z" 
                                          fill="white" stroke="white" strokeWidth="18" strokeLinejoin="round"/>
                                    
                                    {/* Main Star Body */}
                                    <path d="M0 -85 L23 -35 L78 -35 L40 5 L55 60 L0 30 L-55 60 L-40 5 L-78 -35 L-23 -35 Z" 
                                          fill="url(#starGradient)" stroke="#F57F17" strokeWidth="3" strokeLinejoin="round"/>
                                    
                                    {/* Face */}
                                    <g transform="translate(0, 5)">
                                        {/* Left Eye */}
                                        <ellipse cx="-20" cy="-5" rx="6" ry="10" fill="#3E2723" />
                                        <circle cx="-18" cy="-10" r="3" fill="white" />
                                        
                                        {/* Right Eye */}
                                        <ellipse cx="20" cy="-5" rx="6" ry="10" fill="#3E2723" />
                                        <circle cx="22" cy="-10" r="3" fill="white" />
                                        
                                        {/* Cheeks */}
                                        <ellipse cx="-32" cy="5" rx="5" ry="3" fill="#FF8A80" opacity="0.6" />
                                        <ellipse cx="32" cy="5" rx="5" ry="3" fill="#FF8A80" opacity="0.6" />
                                        
                                        {/* Mouth */}
                                        <path d="M-5 5 Q0 10 5 5" stroke="#3E2723" strokeWidth="2" fill="none" strokeLinecap="round" />
                                    </g>
                                </g>
                            </svg>
                        </div>
                </div>
            </div>
        </div>
    );
};
