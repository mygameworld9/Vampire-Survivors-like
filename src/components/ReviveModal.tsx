
import React from 'react';
import { i18nManager } from '../core/i18n';

interface ReviveModalProps {
    revivesLeft: number;
    onRevive: () => void;
    onGiveUp: () => void;
}

export const ReviveModal: React.FC<ReviveModalProps> = ({ revivesLeft, onRevive, onGiveUp }) => {
    return (
        <div className="pause-menu-backdrop">
            <div className="pause-menu" role="dialog" aria-modal="true" aria-labelledby="revive-title">
                <h2 id="revive-title" style={{color: '#E91E63'}}>{i18nManager.t('ui.revive.title')}</h2>
                <p style={{fontSize: '1.2rem', color: '#880e4f'}}>{i18nManager.t('ui.revive.subtitle')}</p>
                
                <div style={{display: 'flex', gap: '1rem', marginTop: '1rem', width: '100%', justifyContent: 'center'}}>
                    <button 
                        onClick={onRevive}
                        style={{
                            background: '#4CAF50', 
                            borderColor: '#388E3C', 
                            color: 'white',
                            padding: '1rem 2rem'
                        }}
                    >
                        {i18nManager.t('ui.revive.confirm', { count: revivesLeft })}
                    </button>
                    
                    <button 
                        onClick={onGiveUp}
                        style={{
                            background: '#ef5350', 
                            borderColor: '#c62828', 
                            color: 'white',
                             padding: '1rem 2rem'
                        }}
                    >
                        {i18nManager.t('ui.revive.giveup')}
                    </button>
                </div>
            </div>
        </div>
    );
};
