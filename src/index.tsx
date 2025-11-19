import React from 'react';
import { createRoot } from 'react-dom/client';
import { GameComponent } from './GameComponent';
import './styles/base.css';
import './styles/hud.css';
import './styles/menus.css';
import './styles/animations.css';
import './styles/components.css';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<GameComponent />);