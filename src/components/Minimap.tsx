

import React, { useRef, useEffect } from 'react';
import { Game } from '../core/Game';
import { MinimapRenderer } from '../core/systems/MinimapRenderer';

interface MinimapProps {
    game: Game;
    visible: boolean;
}

export const Minimap: React.FC<MinimapProps> = ({ game, visible }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<MinimapRenderer>(new MinimapRenderer());
    const animationId = useRef<number | null>(null);

    useEffect(() => {
        if (!visible || !canvasRef.current) {
            if (animationId.current) cancelAnimationFrame(animationId.current);
            return;
        }

        const renderLoop = () => {
            if (canvasRef.current && game) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    rendererRef.current.render(ctx, game);
                }
            }
            animationId.current = requestAnimationFrame(renderLoop);
        };

        renderLoop();

        return () => {
            if (animationId.current) cancelAnimationFrame(animationId.current);
        };
    }, [visible, game]);

    if (!visible) return null;

    return (
        <div className="minimap-container">
            <canvas ref={canvasRef} width={150} height={150} className="minimap-canvas" />
        </div>
    );
};