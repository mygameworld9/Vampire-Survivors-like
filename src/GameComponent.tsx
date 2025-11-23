
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Game } from './core/Game';
import { XP_LEVELS } from './data/gameConfig';
import { IPlayerState, UpgradeOption, CreativeLoadout } from './utils/types';
import { Weapon } from './entities/Weapon';
import { HUD } from './components/HUD';
import { LevelUpModal } from './components/LevelUpModal';
import { WEAPON_DATA } from './data/weaponData';
import { PauseMenu } from './components/PauseMenu';
import { WeaponsPanel } from './components/WeaponsPanel';
import { SkillsPanel } from './components/SkillsPanel';
import { SoundManager } from './core/SoundManager';
import { SOUND_DATA } from './data/soundData';
import { Skill } from './entities/Skill';
import { SKILL_DATA } from './data/skillData';
import { i18nManager } from './core/i18n';
import { Codex } from './components/Codex';
import { CharacterSelect } from './components/CharacterSelect';
import { MapSelect } from './components/MapSelect';
import { Chest } from './entities/Chest';
import { TreasureSequence } from './components/TreasureSequence';
import { Armory } from './components/Armory';
import { progressionManager } from './core/ProgressionManager';
import { CreativeSetup } from './components/CreativeSetup';
import { ReviveModal } from './components/ReviveModal';

type GameState = 'start' | 'characterSelect' | 'creativeSetup' | 'mapSelect' | 'playing' | 'levelUp' | 'gameOver' | 'paused' | 'chestOpening' | 'armory' | 'revive';
type InfoPanelState = 'none' | 'weapons' | 'skills';

// Fisher-Yates shuffle
const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export const GameComponent: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const soundManagerRef = useRef<SoundManager | null>(null);
    
    const [gameState, setGameState] = useState<GameState>('start');
    const [openingChest, setOpeningChest] = useState<Chest | null>(null);
    const [infoPanel, setInfoPanel] = useState<InfoPanelState>('none');
    const [playerState, setPlayerState] = useState<IPlayerState>({ hp: 0, maxHp: 1, xp: 0, xpToNext: 1, level: 1, gold: 0 });
    const [gameTime, setGameTime] = useState(0);
    const [weapons, setWeapons] = useState<Weapon[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);
    const [langLoaded, setLangLoaded] = useState(false);
    const [language, setLanguage] = useState(i18nManager.currentLanguage);
    const [showCodex, setShowCodex] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
    const [selectedMap, setSelectedMap] = useState<string | null>(null);
    
    // Creative Mode State
    const [isCreativeMode, setIsCreativeMode] = useState(false);
    const [creativeLoadout, setCreativeLoadout] = useState<CreativeLoadout | undefined>(undefined);


    useEffect(() => {
        i18nManager.init().then(() => {
            setLanguage(i18nManager.currentLanguage);
            setLangLoaded(true);
        });
    }, []);

    const stopGameLoop = useCallback(() => {
        if (animationFrameId.current != null) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
    }, []);

    const generateUpgradeOptions = useCallback(() => {
        if (!gameRef.current) return;
        const game = gameRef.current;
        const player = game.player;

        // 1. Get available weapon upgrades
        const availableWeaponUpgrades = player.weapons
            .filter(w => !w.isMaxLevel())
            .map(w => ({ type: 'upgrade', weapon: w } as UpgradeOption));

        // 2. Get available new weapons
        const ownedWeaponIds = new Set(player.weapons.map(w => w.id));
        const availableNewWeapons = Object.values(WEAPON_DATA)
            .filter(wd => !ownedWeaponIds.has(wd.id))
            .map(wd => ({ type: 'new', weaponData: wd } as UpgradeOption));
        
        // 3. Get available skill upgrades
        const availableSkillUpgrades = player.skills
            .filter(s => !s.isMaxLevel())
            .map(s => ({ type: 'upgrade', skill: s } as UpgradeOption));

        // 4. Get available new skills
        const ownedSkillIds = new Set(player.skills.map(s => s.id));
        let availableNewSkills = Object.values(SKILL_DATA)
             .filter(sd => !ownedSkillIds.has(sd.id))
             .map(sd => ({ type: 'new', skillData: sd } as UpgradeOption));
        
        // *** RULE: No new skills on the first level up (player level will be 2) ***
        if (player.level === 2) {
            availableNewSkills = [];
        }

        const optionsPool = [
            ...availableWeaponUpgrades,
            ...availableNewWeapons,
            ...availableSkillUpgrades,
            ...availableNewSkills
        ];

        setUpgradeOptions(shuffleArray(optionsPool).slice(0, 3));
        setGameState('levelUp');
    }, []);

    const handleChestOpenStart = useCallback((chest: Chest) => {
        setOpeningChest(chest);
        setGameState('chestOpening');
    }, []);

    const handleChestOpenFinish = useCallback(() => {
        if (gameRef.current && openingChest) {
            gameRef.current.finalizeChestOpening(openingChest);
        }
        setOpeningChest(null);
        setGameState('playing');
    }, [openingChest]);
    
    const startGame = useCallback((characterId: string, mapId: string, loadout?: CreativeLoadout) => {
        stopGameLoop();
        if (!canvasRef.current) return;

        // Reset UI state to avoid stale data flash
        setWeapons([]);
        setSkills([]);
        setPlayerState({ hp: 0, maxHp: 1, xp: 0, xpToNext: 1, level: 1, gold: 0 });
        setGameTime(0);

        if (!soundManagerRef.current) {
            soundManagerRef.current = new SoundManager(SOUND_DATA);
        }
        // This is the user interaction point required by browsers to enable audio.
        soundManagerRef.current.init();

        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const game = new Game(
            canvas.width, 
            canvas.height, 
            generateUpgradeOptions, 
            handleChestOpenStart, 
            soundManagerRef.current, 
            characterId, 
            mapId, 
            loadout
        );
        gameRef.current = game;
        
        let lastTime = performance.now();

        const gameLoop = (timestamp: number) => {
            animationFrameId.current = requestAnimationFrame(gameLoop);
            const dt = (timestamp - lastTime) / 1000;
            lastTime = timestamp;
            
            // Handle Death / Revive Logic
            if (game.player.hp <= 0 && gameStateRef.current !== 'revive' && gameStateRef.current !== 'gameOver') {
                if (game.player.revives > 0) {
                    setGameState('revive');
                    // Loop continues but update is paused by check below
                } else {
                    progressionManager.addGold(game.player.gold);
                    setGameState('gameOver');
                    stopGameLoop();
                    return;
                }
            }

            if (gameStateRef.current === 'playing') {
                 game.update(dt);
            }
            game.updateAnimations(dt);
            game.draw(canvas.getContext('2d')!);
            
            setPlayerState({
                hp: Math.round(game.player.hp),
                maxHp: Math.round(game.player.maxHp),
                xp: game.player.xp,
                xpToNext: XP_LEVELS[game.player.level - 1] || Infinity,
                level: game.player.level,
                gold: game.player.gold,
            });
            setWeapons([...game.player.weapons]);
            setSkills([...game.player.skills]);
            setGameTime(game.gameTime);
        };
        
        animationFrameId.current = requestAnimationFrame(gameLoop);

    }, [generateUpgradeOptions, stopGameLoop, handleChestOpenStart]);

    // Use a ref to get the latest gameState inside the game loop
    const gameStateRef = useRef(gameState);
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    const handleSelectUpgrade = (option: UpgradeOption) => {
        if (!gameRef.current) return;
        const player = gameRef.current.player;

        if (option.type === 'upgrade') {
            if ('weapon' in option) {
                option.weapon.levelUp();
            } else { // skill
                option.skill.levelUp(player);
            }
        } else if (option.type === 'new') {
            if ('weaponData' in option) {
                player.addWeapon(option.weaponData.id);
            } else { // skillData
                player.addSkill(option.skillData.id);
            }
        }
        setGameState('playing');
    }
    
    const handleRevive = () => {
        if (gameRef.current) {
            gameRef.current.player.revive();
            setGameState('playing');
        }
    };

    const handleGiveUp = () => {
        if (gameRef.current) {
            progressionManager.addGold(gameRef.current.player.gold);
        }
        setGameState('gameOver');
        stopGameLoop();
    };

    const handleMainMenu = () => {
        if (gameRef.current && gameStateRef.current !== 'gameOver' && gameStateRef.current !== 'start') {
             // In case user quits mid-game (from pause menu), save their gold
             progressionManager.addGold(gameRef.current.player.gold);
        }
        stopGameLoop();
        gameRef.current = null;
        
        // Explicitly reset UI state
        setWeapons([]);
        setSkills([]);
        setGameTime(0);
        setPlayerState({ hp: 0, maxHp: 1, xp: 0, xpToNext: 1, level: 1, gold: 0 });
        setGameState('start');
        setIsCreativeMode(false);
        setCreativeLoadout(undefined);
    };

    const handleRestart = () => {
        if (selectedCharacter && selectedMap) {
            setGameState('playing');
            startGame(selectedCharacter, selectedMap, creativeLoadout);
        } else {
            // Fallback to main menu if selections are lost for some reason
            handleMainMenu();
        }
    };

    const handleCharacterSelect = (characterId: string) => {
        setSelectedCharacter(characterId);
        if (isCreativeMode) {
            setGameState('creativeSetup');
        } else {
            setGameState('mapSelect');
        }
    };

    const handleCreativeLoadoutConfirm = (loadout: CreativeLoadout) => {
        setCreativeLoadout(loadout);
        setGameState('mapSelect');
    };

    const handleMapSelect = (mapId: string) => {
        if (!selectedCharacter) return; // Should not happen
        setSelectedMap(mapId);
        setGameState('playing');
        startGame(selectedCharacter, mapId, creativeLoadout);
    };

    const handleLanguageChange = async (lang: string) => {
        await i18nManager.setLanguage(lang);
        setLanguage(lang);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const renderInfoPanel = () => {
        switch (infoPanel) {
            case 'weapons':
                return <WeaponsPanel weapons={weapons} onClose={() => setInfoPanel('none')} />;
            case 'skills':
                return <SkillsPanel skills={skills} onClose={() => setInfoPanel('none')} />;
            default:
                return null;
        }
    }
    
    if (!langLoaded) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <canvas ref={canvasRef} style={{ display: gameState !== 'start' && gameState !== 'characterSelect' && gameState !== 'mapSelect' && gameState !== 'gameOver' && gameState !== 'armory' && gameState !== 'creativeSetup' ? 'block' : 'none' }} />
            
            {gameState === 'start' && (
                <div className="start-screen-container pop-theme">
                    {/* Animated Background Elements */}
                    <div className="bg-stripe-overlay"></div>
                    <div className="cloud cloud-1">☁️</div>
                    <div className="cloud cloud-2">☁️</div>
                    <div className="sparkle sparkle-1">✨</div>
                    <div className="sparkle sparkle-2">✨</div>

                    {/* Minimal Language Switcher Top-Right */}
                    <div className="language-switcher-corner">
                        <span className={`lang-opt ${language === 'en' ? 'active' : ''}`} onClick={() => handleLanguageChange('en')}>EN</span>
                        <span className={`lang-opt ${language === 'zh-CN' ? 'active' : ''}`} onClick={() => handleLanguageChange('zh-CN')}>中文</span>
                    </div>

                    <div className="start-content-layout">
                        <div className="start-left-panel">
                            <div className="title-group">
                                <h1 className="pop-main-title">Sparkle</h1>
                                <h1 className="pop-sub-title">Survivors</h1>
                            </div>
                            <div className="action-group">
                                <button className="jelly-btn primary" onClick={() => { setIsCreativeMode(false); setGameState('characterSelect'); }}>
                                     <span className="btn-icon">▶</span> {i18nManager.t('ui.start.button')}
                                </button>
                                <button className="jelly-btn secondary" onClick={() => { setIsCreativeMode(true); setGameState('characterSelect'); }}>
                                     <span className="btn-icon">🧪</span> {i18nManager.t('ui.start.creative')}
                                </button>
                                <button className="jelly-btn secondary" onClick={() => setGameState('armory')}>
                                     <span className="btn-icon">🛠️</span> {i18nManager.t('ui.armory.title')}
                                </button>
                                 <button className="jelly-btn secondary" onClick={() => setShowCodex(true)}>
                                    <span className="btn-icon">📘</span> {i18nManager.t('ui.start.codex')}
                                </button>
                            </div>
                        </div>

                        <div className="start-right-panel">
                             <div className="hero-mascot">🛡️</div>
                        </div>
                    </div>
                </div>
            )}

             {gameState === 'characterSelect' && (
                <CharacterSelect onSelect={handleCharacterSelect} onBack={() => { setIsCreativeMode(false); setGameState('start'); }} />
             )}
             
             {gameState === 'creativeSetup' && (
                 <CreativeSetup onStart={handleCreativeLoadoutConfirm} onBack={() => setGameState('characterSelect')} />
             )}

              {gameState === 'mapSelect' && (
                <MapSelect onSelect={handleMapSelect} onBack={() => setGameState(isCreativeMode ? 'creativeSetup' : 'characterSelect')} />
             )}
             {gameState === 'armory' && (
                 <Armory onBack={() => setGameState('start')} />
             )}
             
             {gameState === 'gameOver' && (
                <div className="game-over-container">
                    <div className="game-over-card">
                        <div className="game-over-mascot">👻</div>
                        <h1 className="game-over-title">{i18nManager.t('ui.gameover.title')}</h1>
                        
                        <div className="game-over-stats">
                            <div className="stat-row">
                                <div className="stat-item">
                                    <span className="stat-icon">⏱️</span>
                                    <span className="stat-label">{i18nManager.t('ui.gameover.survived', { time: formatTime(gameTime) })}</span>
                                </div>
                            </div>
                            <div className="stat-row dual">
                                <div className="stat-item">
                                    <span className="stat-icon">⭐</span>
                                    <span className="stat-label">{i18nManager.t('ui.hud.level', { level: playerState.level })}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-icon">💰</span>
                                    <span className="stat-label">{playerState.gold}</span>
                                </div>
                            </div>
                        </div>

                        <div className="game-over-actions">
                            <button className="pill-button primary" onClick={handleRestart}>
                                <span className="btn-icon">↺</span> {i18nManager.t('ui.gameover.restart')}
                            </button>
                            <button className="pill-button secondary" onClick={handleMainMenu}>
                                <span className="btn-icon">🏠</span> {i18nManager.t('ui.gameover.mainMenu')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {(gameState === 'playing' || gameState === 'paused' || gameState === 'levelUp' || gameState === 'chestOpening' || gameState === 'revive') && (
              <>
                <HUD 
                  playerState={playerState}
                  gameTime={gameTime}
                  weapons={weapons}
                  skills={skills}
                  onPause={() => setGameState('paused')}
                />
                { gameState === 'playing' &&
                    <button 
                        className="debug-button" 
                        onClick={() => gameRef.current?.spawnChestNearPlayer()}>
                        Spawn Chest
                    </button>
                }
              </>
            )}

            {gameState === 'levelUp' && (
                <LevelUpModal options={upgradeOptions} onSelect={handleSelectUpgrade} />
            )}
            
            {gameState === 'revive' && gameRef.current && (
                <ReviveModal 
                    revivesLeft={gameRef.current.player.revives} 
                    onRevive={handleRevive} 
                    onGiveUp={handleGiveUp} 
                />
            )}

            {gameState === 'paused' && selectedCharacter && selectedMap && (
                <>
                    <PauseMenu
                        onResume={() => setGameState('playing')}
                        onWeapons={() => setInfoPanel('weapons')}
                        onSkills={() => setInfoPanel('skills')}
                        onCodex={() => setShowCodex(true)}
                        onRestart={() => startGame(selectedCharacter, selectedMap, creativeLoadout)}
                        onMainMenu={handleMainMenu}
                    />
                    {renderInfoPanel()}
                </>
            )}

            {showCodex && <Codex onClose={() => setShowCodex(false)} />}
            
            {gameState === 'chestOpening' && openingChest && (
                <TreasureSequence onAnimationEnd={handleChestOpenFinish} />
            )}
        </div>
    );
};
