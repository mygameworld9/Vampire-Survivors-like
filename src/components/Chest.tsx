
import React from 'react';

/**
 * Interface for the properties of the ChestComponent.
 * @interface ChestProps
 */
interface ChestProps {
    /**
     * The current visual state of the chest, which determines its appearance and animations.
     * - 'idle': The chest is closed and stationary.
     * - 'squeeze': The chest is shaking and preparing to open.
     * - 'exploded': The chest has opened, revealing its contents.
     * @type {'idle' | 'squeeze' | 'exploded'}
     */
    visualState: 'idle' | 'squeeze' | 'exploded';
}

/**
 * A React functional component that renders the visual representation of a treasure chest.
 * It uses SVG to draw the chest and applies CSS classes and transformations based on its `visualState`
 * to create animations for shaking and opening.
 *
 * @param {ChestProps} props - The properties for the component.
 * @returns {React.ReactElement} The rendered Chest component.
 */
export const ChestComponent: React.FC<ChestProps> = ({ visualState }) => {
    
    // Determine classes based on state
    let containerClass = 'chest-visual-container';
    if (visualState === 'squeeze') containerClass += ' chest-squeeze';
    
    // In exploded state, we might fade out the body slightly to focus on loot
    if (visualState === 'exploded') containerClass += ' chest-exploded';

    const showLid = visualState !== 'exploded';

    return (
        <div className={containerClass}>
            <svg width="200" height="200" viewBox="0 0 100 100" overflow="visible">
                {/* Shadow */}
                <ellipse cx="50" cy="90" rx="40" ry="10" fill="rgba(0,0,0,0.3)" />

                {/* Speed Lines (Only visible during squeeze) */}
                {visualState === 'squeeze' && (
                    <g className="speed-lines" stroke="white" strokeWidth="2" opacity="0.8">
                        <line x1="10" y1="50" x2="-10" y2="50" />
                        <line x1="90" y1="50" x2="110" y2="50" />
                        <line x1="50" y1="10" x2="50" y2="-10" />
                    </g>
                )}

                {/* Body Group */}
                <g transform="translate(0, 10)">
                    {/* Main Box */}
                    <rect x="20" y="40" width="60" height="45" rx="8" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
                    {/* Vertical Bands */}
                    <rect x="28" y="40" width="8" height="45" fill="#FFCA28" stroke="#F57F17" strokeWidth="1" />
                    <rect x="64" y="40" width="8" height="45" fill="#FFCA28" stroke="#F57F17" strokeWidth="1" />
                </g>

                {/* Lid Group - Hidden instantly on explode */}
                {showLid && (
                    <g className="chest-lid">
                        {/* Lid Shape */}
                        <path d="M18,40 L82,40 L82,25 C82,15 70,15 50,15 C30,15 18,15 18,25 Z" fill="#A1887F" stroke="#5D4037" strokeWidth="2" />
                        <rect x="18" y="40" width="64" height="10" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
                        
                        {/* Lid Bands */}
                        <path d="M28,40 L36,40 L36,20 C36,20 32,18 28,20 Z" fill="#FFCA28" stroke="#F57F17" strokeWidth="1" />
                        <path d="M64,40 L72,40 L72,20 C72,20 68,18 64,20 Z" fill="#FFCA28" stroke="#F57F17" strokeWidth="1" />

                        {/* Lock */}
                        <circle cx="50" cy="45" r="6" fill="#CFD8DC" stroke="#455A64" strokeWidth="1" />
                        <circle cx="50" cy="44" r="2" fill="#37474F" />
                        <rect x="49" y="44" width="2" height="4" fill="#37474F" />
                    </g>
                )}
            </svg>
        </div>
    );
};
