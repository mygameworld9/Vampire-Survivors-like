import React from 'react';
import { i18nManager } from '../core/i18n';
import { MAP_DATA } from '../data/mapData';

/**
 * Interface for the properties of the MapSelect component.
 * @interface MapSelectProps
 */
interface MapSelectProps {
    /**
     * Callback function executed when a map is selected.
     * @param {string} mapId - The ID of the selected map.
     */
    onSelect: (mapId: string) => void;
    /**
     * Callback function executed when the 'Back' button is clicked.
     */
    onBack: () => void;
}

/**
 * A React functional component that displays the map selection screen.
 * It shows a grid of available maps for the player to choose from before starting a game.
 *
 * @param {MapSelectProps} props - The properties for the component.
 * @returns {React.ReactElement} The rendered MapSelect component.
 */
export const MapSelect: React.FC<MapSelectProps> = ({ onSelect, onBack }) => {
    return (
        <div className="menu-screen">
            <h2>{i18nManager.t('ui.select.map.title')}</h2>
            <div className="selection-grid">
                {Object.values(MAP_DATA).map(map => (
                    <div key={map.id} className="selection-card" onClick={() => onSelect(map.id)}>
                        <div className="map-preview" style={{ backgroundColor: map.backgroundColor }}></div>
                        <h3>{i18nManager.t(map.nameKey)}</h3>
                        <p>{i18nManager.t(map.descriptionKey)}</p>
                    </div>
                ))}
            </div>
             <button className="back-button" onClick={onBack}>{i18nManager.t('ui.select.back')}</button>
        </div>
    );
};
