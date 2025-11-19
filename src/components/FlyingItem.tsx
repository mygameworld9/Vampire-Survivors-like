import React from 'react';

interface FlyingItemProps {
    children: React.ReactNode;
    style: React.CSSProperties;
}

export const FlyingItem: React.FC<FlyingItemProps> = ({ children, style }) => {
    return (
        <div className="item-ejecting" style={style}>
            {children}
        </div>
    );
};
