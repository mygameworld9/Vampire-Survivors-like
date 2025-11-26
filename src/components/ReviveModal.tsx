
import React from 'react';
import { i18nManager } from '../core/i18n';

/**
 * Interface for the properties of the ReviveModal component.
 * @interface ReviveModalProps
 */
interface ReviveModalProps {
    /** The number of revives the player has remaining. */
    revivesLeft: number;
    /** Callback function to execute when the player chooses to revive. */
    onRevive: () => void;
    /** Callback function to execute when the player chooses to give up. */
    onGiveUp: () => void;
}

/**
 * A React functional component that displays the Revive modal.
 * This modal appears when the player's health reaches zero, offering them the choice
 * to use a revive charge or end the game.
 *
 * @param {ReviveModalProps} props - The properties for the component.
 * @returns {React.ReactElement} The rendered ReviveModal component.
 */
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
