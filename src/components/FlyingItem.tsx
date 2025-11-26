import React from 'react';

/**
 * Interface for the properties of the FlyingItem component.
 * @interface FlyingItemProps
 */
interface FlyingItemProps {
    /**
     * The content to be rendered inside the flying item (e.g., an icon).
     */
    children: React.ReactNode;
    /**
     * Inline styles to control the position and animation of the item.
     */
    style: React.CSSProperties;
}

/**
 * A React functional component that renders an item with a "flying" or "ejecting" animation.
 * This is used for visual effects like gold coins flying from a chest to the HUD.
 * The component itself is a simple styled wrapper; the animation logic is handled by its parent
 * through the `style` prop.
 *
 * @param {FlyingItemProps} props - The properties for the component.
 * @returns {React.ReactElement} The rendered FlyingItem component.
 */
export const FlyingItem: React.FC<FlyingItemProps> = ({ children, style }) => {
    return (
        <div className="item-ejecting" style={style}>
            {children}
        </div>
    );
};
