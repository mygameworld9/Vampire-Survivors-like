
import React, { useState, useRef, useEffect } from 'react';

interface VirtualJoystickProps {
    onMove: (x: number, y: number) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
    const [active, setActive] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const center = { x: 75, y: 75 }; // Half of width/height
    const maxRadius = 50;

    const handleStart = (clientX: number, clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left - center.x;
        const y = clientY - rect.top - center.y;
        updateJoystick(x, y);
        setActive(true);
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!active || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left - center.x;
        const y = clientY - rect.top - center.y;
        updateJoystick(x, y);
    };

    const handleEnd = () => {
        setActive(false);
        setPos({ x: 0, y: 0 });
        onMove(0, 0);
    };

    const updateJoystick = (dx: number, dy: number) => {
        const distance = Math.sqrt(dx * dx + dy * dy);
        let normX = dx;
        let normY = dy;
        
        // Cap the visual stick position
        if (distance > maxRadius) {
            const ratio = maxRadius / distance;
            normX = dx * ratio;
            normY = dy * ratio;
        }

        setPos({ x: normX, y: normY });

        // Calculate normalized vector for game input
        if (distance > 5) { // Small deadzone
             const angle = Math.atan2(dy, dx);
             onMove(Math.cos(angle), Math.sin(angle));
        } else {
             onMove(0, 0);
        }
    };

    return (
        <div 
            className="virtual-joystick-zone"
            ref={containerRef}
            onPointerDown={(e) => {
                e.stopPropagation(); // Prevent map interactions under stick
                // Capture pointer to track outside div
                (e.target as Element).setPointerCapture(e.pointerId);
                handleStart(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => handleMove(e.clientX, e.clientY)}
            onPointerUp={(e) => {
                (e.target as Element).releasePointerCapture(e.pointerId);
                handleEnd();
            }}
            onPointerCancel={() => handleEnd()}
            onPointerLeave={() => {
                if (!active) return;
                // Don't stop if we have pointer capture, but just in case
                // handleEnd(); 
            }}
        >
            <div className="joystick-base">
                <div 
                    className="joystick-knob"
                    style={{
                        transform: `translate(${pos.x}px, ${pos.y}px)`,
                        transition: active ? 'none' : 'transform 0.1s ease-out'
                    }}
                ></div>
            </div>
        </div>
    );
};
