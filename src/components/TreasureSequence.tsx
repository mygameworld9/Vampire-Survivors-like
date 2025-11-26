
import React, { useEffect, useState } from 'react';
import { ChestComponent } from './Chest';
import { CHEST_LOOT_TABLE } from '../data/lootData';

/**
 * Interface for the properties of the TreasureSequence component.
 * @interface TreasureSequenceProps
 */
interface TreasureSequenceProps {
    /** Callback function executed when the entire treasure opening animation sequence is complete. */
    onAnimationEnd: () => void;
}

/** @private Represents the different stages of the treasure opening animation. */
type Phase = 'squeeze' | 'explode' | 'hover' | 'collect' | 'finished';

/** @private Represents the different types of loot particles that can be generated. */
type ParticleType = 'coin' | 'xp_small' | 'xp_medium' | 'xp_large' | 'potion' | 'main';

interface VisualParticle {
    id: number;
    type: ParticleType;
    angle: number;    // Radians
    distance: number; // Distance from center
    delay: number;
    icon: string;
}

/**
 * Generates a randomized set of visual loot particles based on predefined loot tables.
 * This function determines what icons to show (coins, XP orbs, upgrades) and their initial positions.
 * @private
 * @returns {VisualParticle[]} An array of generated particle data.
 */
const generateLootParticles = () => {
    const particles: VisualParticle[] = [];
    let idCounter = 0;

    // 1. Main Reward (Center)
    const hasUpgrade = Math.random() < CHEST_LOOT_TABLE.upgrades.chance;
    particles.push({
        id: idCounter++,
        type: 'main',
        angle: 0,
        distance: 0,
        delay: 0,
        icon: hasUpgrade ? '📜' : '💰', // Scroll or Big Money Sack
    });

    // 2. XP Orbs (Ring 1)
    const orbCount = 8; 
    for (let i = 0; i < orbCount; i++) {
        const angle = (i / orbCount) * Math.PI * 2;
        const types: ParticleType[] = ['xp_small', 'xp_medium', 'xp_large'];
        const type = types[Math.floor(Math.random() * types.length)];
        let icon = '🔹'; // Small
        if (type === 'xp_medium') icon = '💚';
        if (type === 'xp_large') icon = '🌟';

        particles.push({
            id: idCounter++,
            type: type,
            angle: angle,
            distance: 120, // Closer ring
            delay: Math.random() * 0.1,
            icon: icon
        });
    }

    // 3. Coins (Ring 2)
    const coinCount = 12;
    for (let i = 0; i < coinCount; i++) {
        const angle = (i / coinCount) * Math.PI * 2 + (Math.PI / coinCount); // Offset slightly
        particles.push({
            id: idCounter++,
            type: 'coin',
            angle: angle,
            distance: 200, // Outer ring
            delay: Math.random() * 0.15,
            icon: '🟡'
        });
    }

    // 4. Potions (Random scatter)
    if (Math.random() > 0.5) {
        const angle = Math.random() * Math.PI * 2;
        particles.push({
            id: idCounter++,
            type: 'potion',
            angle: angle,
            distance: 160,
            delay: 0.2,
            icon: '🧪'
        });
    }

    return particles;
};

/**
 * A React functional component that orchestrates the entire treasure chest opening animation.
 * It manages a multi-phase sequence: the chest squeezing, exploding, loot scattering, hovering,
 * and finally collecting. It's a purely visual component that calls back when the sequence is over.
 *
 * @param {TreasureSequenceProps} props - The properties for the component.
 * @returns {React.ReactElement} The rendered TreasureSequence component.
 */
export const TreasureSequence: React.FC<TreasureSequenceProps> = ({ onAnimationEnd }) => {
    const [phase, setPhase] = useState<Phase>('squeeze');
    const [particles] = useState(generateLootParticles());

    useEffect(() => {
        // 0s: Squeeze Start
        
        // 0.15s: Explode -> Scatter particles
        const explodeTimer = setTimeout(() => {
            setPhase('explode');
        }, 150);

        // 0.5s: Hover phase (particles float in place)
        const hoverTimer = setTimeout(() => {
            setPhase('hover');
        }, 600); // 150ms + 450ms scatter time

        // 2.0s: Collect phase (particles fly to HUD)
        const collectTimer = setTimeout(() => {
            setPhase('collect');
        }, 2000);

        // 2.8s: Finish
        const endTimer = setTimeout(() => {
            setPhase('finished');
            onAnimationEnd();
        }, 2800);

        return () => {
            clearTimeout(explodeTimer);
            clearTimeout(hoverTimer);
            clearTimeout(collectTimer);
            clearTimeout(endTimer);
        };
    }, [onAnimationEnd]);

    let chestVisualState: 'idle' | 'squeeze' | 'exploded' = 'idle';
    if (phase === 'squeeze') chestVisualState = 'squeeze';
    if (phase === 'explode' || phase === 'hover' || phase === 'collect') chestVisualState = 'exploded';

    return (
        <div className="chest-opening-backdrop">
            <div className={`treasure-sequence-container ${phase !== 'squeeze' ? 'dim-bg' : ''}`}>
                
                {/* The Chest (Fades out after explode) */}
                <div className="chest-anchor">
                    <ChestComponent visualState={chestVisualState} />
                </div>

                {/* Shockwave (Only on explode frame) */}
                {phase === 'explode' && <div className="sonic-shockwave"></div>}

                {/* Loot Particles */}
                {(phase === 'explode' || phase === 'hover' || phase === 'collect') && (
                    <div className="loot-scatter-container">
                        {particles.map((p) => {
                            const isMain = p.type === 'main';
                            // Calculate destination coordinates for scatter
                            const tx = Math.cos(p.angle) * p.distance;
                            const ty = Math.sin(p.angle) * p.distance;

                            return (
                                <div 
                                    key={p.id} 
                                    className={`loot-particle ${phase} ${isMain ? 'main-loot' : ''} type-${p.type}`}
                                    style={{
                                        '--tx': `${tx}px`,
                                        '--ty': `${ty}px`,
                                        '--delay': `${p.delay}s`,
                                    } as React.CSSProperties}
                                >
                                    <span className="loot-content">{p.icon}</span>
                                    {isMain && phase === 'hover' && <div className="loot-label">Big Prize!</div>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
