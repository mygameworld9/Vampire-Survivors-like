import React from 'react';
import { i18nManager } from '../core/i18n';
import { MAP_DATA } from '../data/mapData';

interface MapSelectProps {
    onSelect: (mapId: string) => void;
    onBack: () => void;
}

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
