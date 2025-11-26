
import React, { useState, useRef, useEffect } from 'react';

/**
 * Interface for the properties of the VirtualJoystick component.
 * @interface VirtualJoystickProps
 */
interface VirtualJoystickProps {
    /**
     * Callback function executed when the joystick is moved.
     * @param {number} x - The normalized x-component of the movement vector (-1 to 1).
     * @param {number} y - The normalized y-component of the movement vector (-1 to 1).
     */
    onMove: (x: number, y: number) => void;
}

/**
 * A React functional component that provides a virtual joystick for touch controls.
 * It renders a draggable knob within a defined area and reports a normalized
 * movement vector to its parent component via the `onMove` callback.
 *
 * @param {VirtualJoystickProps} props - The properties for the component.
 * @returns {React.ReactElement} The rendered VirtualJoystick component.
 */
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
