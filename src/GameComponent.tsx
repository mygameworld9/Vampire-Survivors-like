
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Game } from './core/Game';
import { XP_LEVELS } from './data/gameConfig';
import { IPlayerState, UpgradeOption, CreativeLoadout, BossData } from './utils/types';
import { Weapon } from './entities/Weapon';
import { HUD } from './components/HUD';
import { LevelUpModal } from './components/LevelUpModal';
import { PauseMenu } from './components/PauseMenu';
import { WeaponsPanel } from './components/WeaponsPanel';
import { SkillsPanel } from './components/SkillsPanel';
import { SoundManager } from './core/SoundManager';
import { SOUND_DATA } from './data/soundData';
import { Skill } from './entities/Skill';
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
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { EvolutionNotification } from './components/EvolutionNotification';
import { VirtualJoystick } from './components/VirtualJoystick';
import { Minimap } from './components/Minimap';

type GameState = 'start' | 'characterSelect' | 'creativeSetup' | 'mapSelect' | 'playing' | 'levelUp' | 'gameOver' | 'paused' | 'chestOpening' | 'armory' | 'revive' | 'evolution';
type InfoPanelState = 'none' | 'weapons' | 'skills';

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

export const GameComponent: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const soundManagerRef = useRef<SoundManager | null>(null);
    
    // HUD Refs for Direct Manipulation (Performance Optimization)
    const hpBarRef = useRef<HTMLDivElement>(null);
    const xpBarRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<HTMLDivElement>(null);
    const hpTextRef = useRef<HTMLSpanElement>(null);

    const hudRefs = { hpBarRef, xpBarRef, timerRef, hpTextRef };

    // Refs for tracking state changes
    const lastWeaponsHash = useRef<string>("");
    const lastSkillsHash = useRef<string>("");

    const [gameState, setGameState] = useState<GameState>('start');
    const [openingChest, setOpeningChest] = useState<Chest | null>(null);
    const [evolvedWeapon, setEvolvedWeapon] = useState<Weapon | null>(null);
    const [infoPanel, setInfoPanel] = useState<InfoPanelState>('none');
    
    // React state for low-frequency updates
    const [playerState, setPlayerState] = useState<IPlayerState>({ 
        hp: 0, maxHp: 1, xp: 0, xpToNext: 1, level: 1, gold: 0,
        rerolls: 0, banishes: 0, skips: 0
    });
    const [activeBoss, setActiveBoss] = useState<BossData | undefined>(undefined);
    const [finalGameTime, setFinalGameTime] = useState(0); // Only for Game Over screen
    
    const [weapons, setWeapons] = useState<Weapon[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);
    const [langLoaded, setLangLoaded] = useState(false);
    const [language, setLanguage] = useState(i18nManager.currentLanguage);
    const [showCodex, setShowCodex] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
    const [selectedMap, setSelectedMap] = useState<string | null>(null);
    const [showMinimap, setShowMinimap] = useState(true);
    
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
        const options = gameRef.current.generateUpgradeOptions();
        setUpgradeOptions(options);
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
        setGameState(prev => prev === 'evolution' ? 'evolution' : 'playing');
    }, [openingChest]);
    
    const handleEvolutionTrigger = useCallback((weapon: Weapon) => {
        setEvolvedWeapon(weapon);
        setGameState('evolution');
        lastWeaponsHash.current = ""; 
    }, []);

    const handleReroll = () => {
        if (!gameRef.current) return;
        const newOptions = gameRef.current.performReroll();
        if (newOptions) {
            setUpgradeOptions(newOptions);
        }
    };

    const handleBanish = (option: UpgradeOption) => {
        if (!gameRef.current) return;
        const newOptions = gameRef.current.performBanish(option);
        if (newOptions) {
            setUpgradeOptions(newOptions);
        }
    };

    const handleSkip = () => {
        if (!gameRef.current) return;
        gameRef.current.performSkip();
        setGameState('playing');
    };

    const startGame = useCallback((characterId: string, mapId: string, loadout?: CreativeLoadout) => {
        stopGameLoop();
        if (!canvasRef.current) return;

        // Reset UI state
        setWeapons([]);
        setSkills([]);
        setPlayerState({ 
            hp: 0, maxHp: 1, xp: 0, xpToNext: 1, level: 1, gold: 0,
            rerolls: 0, banishes: 0, skips: 0 
        });
        setActiveBoss(undefined);
        lastWeaponsHash.current = "";
        lastSkillsHash.current = "";

        if (!soundManagerRef.current) {
            soundManagerRef.current = new SoundManager(SOUND_DATA);
        }
        soundManagerRef.current.init();

        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const game = new Game(
            canvas.width, 
            canvas.height, 
            generateUpgradeOptions, 
            handleChestOpenStart,
            handleEvolutionTrigger,
            soundManagerRef.current, 
            characterId, 
            mapId, 
            loadout
        );
        gameRef.current = game;
        
        // --- EVENT SUBSCRIPTIONS ---
        game.events.on('player-update', (stats: Partial<IPlayerState>) => {
            // 1. Update Low-Frequency State (Level, Gold, Inventory changes)
            if (stats.level !== undefined || stats.gold !== undefined || stats.rerolls !== undefined || stats.banishes !== undefined || stats.skips !== undefined) {
                setPlayerState(prev => ({ ...prev, ...stats }));
            }

            // 2. Direct DOM Manipulation for High-Frequency (HP, XP)
            if (stats.hp !== undefined && stats.maxHp !== undefined) {
                if (hpBarRef.current) {
                    const pct = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
                    hpBarRef.current.style.width = `${pct}%`;
                }
                if (hpTextRef.current) {
                    hpTextRef.current.innerText = `${Math.round(stats.hp)} / ${Math.round(stats.maxHp)}`;
                }
            }
            if (stats.xp !== undefined && stats.xpToNext !== undefined) {
                if (xpBarRef.current) {
                    const pct = Math.max(0, Math.min(100, (stats.xp / stats.xpToNext) * 100));
                    xpBarRef.current.style.width = `${pct}%`;
                }
            }
        });

        game.events.on('boss-update', (bossData: BossData | null) => {
            setActiveBoss(bossData || undefined);
        });
        
        // Force initial state set
        const p = game.player;
        setPlayerState({
            hp: p.hp, maxHp: p.maxHp, xp: p.xp, xpToNext: XP_LEVELS[p.level-1], level: p.level, gold: p.gold,
            rerolls: p.rerolls, banishes: p.banishes, skips: p.skips
        });

        let lastTime = performance.now();

        const gameLoop = (timestamp: number) => {
            animationFrameId.current = requestAnimationFrame(gameLoop);
            let dt = (timestamp - lastTime) / 1000;
            if (dt > 0.1) dt = 0.1;
            if (dt < 0) dt = 0;
            lastTime = timestamp;
            
            if (game.player.hp <= 0 && gameStateRef.current !== 'revive' && gameStateRef.current !== 'gameOver') {
                if (game.player.revives > 0) {
                    setGameState('revive');
                } else {
                    progressionManager.addGold(game.player.gold);
                    soundManagerRef.current?.stopBGM();
                    setFinalGameTime(game.gameTime);
                    setGameState('gameOver');
                    stopGameLoop();
                    return;
                }
            }

            if (gameStateRef.current === 'playing') {
                 game.update(dt);
                 // Update Timer DOM directly
                 if (timerRef.current) {
                     timerRef.current.innerText = formatTime(game.gameTime);
                 }
            }
            game.updateAnimations(dt);
            game.draw(canvas.getContext('2d')!);
            
            // Inventory check
            const currentWeaponsHash = game.player.weapons.map(w => w.id + w.level).join(',');
            if (currentWeaponsHash !== lastWeaponsHash.current) {
                setWeapons([...game.player.weapons]);
                lastWeaponsHash.current = currentWeaponsHash;
            }
            const currentSkillsHash = game.player.skills.map(s => s.id + s.level).join(',');
            if (currentSkillsHash !== lastSkillsHash.current) {
                setSkills([...game.player.skills]);
                lastSkillsHash.current = currentSkillsHash;
            }
        };
        
        animationFrameId.current = requestAnimationFrame(gameLoop);

    }, [generateUpgradeOptions, stopGameLoop, handleChestOpenStart, handleEvolutionTrigger]);

    const gameStateRef = useRef(gameState);
    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    const handleSelectUpgrade = (option: UpgradeOption) => {
        if (!gameRef.current) return;
        const player = gameRef.current.player;

        if (option.type === 'upgrade') {
            if ('weapon' in option) option.weapon.levelUp();
            else option.skill.levelUp(player);
        } else if (option.type === 'new') {
            if ('weaponData' in option) player.addWeapon(option.weaponData.id);
            else player.addSkill(option.skillData.id);
        } else if (option.type === 'heal') {
            player.heal(option.amount);
        } else if (option.type === 'gold') {
            player.gainGold(option.amount);
        }
        
        lastWeaponsHash.current = "";
        lastSkillsHash.current = "";
        setGameState('playing');
    }
    
    const handleEvolutionClose = () => {
        setEvolvedWeapon(null);
        setGameState('playing');
    };
    
    const handleRevive = () => {
        if (gameRef.current) {
            gameRef.current.player.revive();
            setGameState('playing');
        }
    };

    const handleGiveUp = () => {
        if (gameRef.current) {
            progressionManager.addGold(gameRef.current.player.gold);
            setFinalGameTime(gameRef.current.gameTime);
        }
        soundManagerRef.current?.stopBGM();
        setGameState('gameOver');
        stopGameLoop();
    };

    const handleMainMenu = () => {
        if (gameRef.current && gameStateRef.current !== 'gameOver' && gameStateRef.current !== 'start') {
             progressionManager.addGold(gameRef.current.player.gold);
        }
        soundManagerRef.current?.stopBGM();
        stopGameLoop();
        gameRef.current = null;
        
        setWeapons([]);
        setSkills([]);
        setPlayerState({ hp: 0, maxHp: 1, xp: 0, xpToNext: 1, level: 1, gold: 0, rerolls: 0, banishes: 0, skips: 0 });
        setGameState('start');
        setIsCreativeMode(false);
        setCreativeLoadout(undefined);
    };

    const handleRestart = () => {
        if (selectedCharacter && selectedMap) {
            setGameState('playing');
            startGame(selectedCharacter, selectedMap, creativeLoadout);
        } else {
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
        if (!selectedCharacter) return;
        setSelectedMap(mapId);
        setGameState('playing');
        startGame(selectedCharacter, mapId, creativeLoadout);
    };

    const handleLanguageChange = async (lang: string) => {
        await i18nManager.setLanguage(lang);
        setLanguage(lang);
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
                <StartScreen 
                    onStart={() => { setIsCreativeMode(false); setGameState('characterSelect'); }}
                    onCreative={() => { setIsCreativeMode(true); setGameState('characterSelect'); }}
                    onArmory={() => setGameState('armory')}
                    onCodex={() => setShowCodex(true)}
                    currentLanguage={language}
                    onLanguageChange={handleLanguageChange}
                />
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
                <GameOverScreen 
                    gameTime={finalGameTime}
                    playerLevel={playerState.level}
                    gold={playerState.gold}
                    onRestart={handleRestart}
                    onMainMenu={handleMainMenu}
                />
            )}

            {(gameState === 'playing' || gameState === 'paused' || gameState === 'levelUp' || gameState === 'chestOpening' || gameState === 'revive' || gameState === 'evolution') && (
              <>
                <HUD 
                  playerState={playerState}
                  weapons={weapons}
                  skills={skills}
                  onPause={() => setGameState('paused')}
                  activeBoss={activeBoss}
                  hudRefs={hudRefs}
                />
                <div className="hud-minimap-toggle" onClick={() => setShowMinimap(!showMinimap)}>
                    {showMinimap ? '👁️' : '🙈'}
                </div>
                
                {gameRef.current && (
                    <Minimap game={gameRef.current} visible={showMinimap} />
                )}

                <VirtualJoystick onMove={(x, y) => gameRef.current?.input.setJoystick(x, y)} />
              </>
            )}

            {gameState === 'levelUp' && (
                <LevelUpModal 
                    options={upgradeOptions} 
                    onSelect={handleSelectUpgrade}
                    onReroll={handleReroll}
                    onBanish={handleBanish}
                    onSkip={handleSkip}
                    rerollsLeft={playerState.rerolls}
                    banishesLeft={playerState.banishes}
                    skipsLeft={playerState.skips}
                />
            )}
            
            {gameState === 'evolution' && evolvedWeapon && (
                <EvolutionNotification weapon={evolvedWeapon} onClose={handleEvolutionClose} />
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
