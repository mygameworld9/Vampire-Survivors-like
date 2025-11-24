
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
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';

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
    const lastUIUpdateRef = useRef<number>(0);
    
    // Refs for tracking state changes to avoid unnecessary re-renders
    const lastWeaponsHash = useRef<string>("");
    const lastSkillsHash = useRef<string>("");

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

        const MAX_SLOTS = 6;

        // 1. Get available weapon upgrades
        const availableWeaponUpgrades = player.weapons
            .filter(w => !w.isMaxLevel())
            .map(w => ({ type: 'upgrade', weapon: w } as UpgradeOption));

        // 2. Get available new weapons (Only if slots available)
        let availableNewWeapons: UpgradeOption[] = [];
        if (player.weapons.length < MAX_SLOTS) {
            const ownedWeaponIds = new Set(player.weapons.map(w => w.id));
            availableNewWeapons = Object.values(WEAPON_DATA)
                .filter(wd => !ownedWeaponIds.has(wd.id))
                .map(wd => ({ type: 'new', weaponData: wd } as UpgradeOption));
        }
        
        // 3. Get available skill upgrades
        const availableSkillUpgrades = player.skills
            .filter(s => !s.isMaxLevel())
            .map(s => ({ type: 'upgrade', skill: s } as UpgradeOption));

        // 4. Get available new skills (Only if slots available)
        let availableNewSkills: UpgradeOption[] = [];
        if (player.skills.length < MAX_SLOTS) {
            const ownedSkillIds = new Set(player.skills.map(s => s.id));
            availableNewSkills = Object.values(SKILL_DATA)
                .filter(sd => !ownedSkillIds.has(sd.id))
                .map(sd => ({ type: 'new', skillData: sd } as UpgradeOption));
            
             // *** RULE: No new skills on the first level up (player level will be 2) ***
            if (player.level === 2) {
                availableNewSkills = [];
            }
        }

        const optionsPool = [
            ...availableWeaponUpgrades,
            ...availableNewWeapons,
            ...availableSkillUpgrades,
            ...availableNewSkills
        ];

        if (optionsPool.length === 0) {
            // All maxed out! Offer Health or Gold
            setUpgradeOptions([
                { type: 'heal', amount: 0.5 }, // 50% Heal
                { type: 'gold', amount: 50 }   // 50 Gold
            ]);
        } else {
            setUpgradeOptions(shuffleArray(optionsPool).slice(0, 3));
        }
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
        lastWeaponsHash.current = "";
        lastSkillsHash.current = "";

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
            
            // Calculate delta time in seconds
            let dt = (timestamp - lastTime) / 1000;
            
            // Cap dt at 0.1s (100ms) to prevent massive jumps due to lag spikes/tab switching
            if (dt > 0.1) dt = 0.1;
            // Prevent negative dt which can happen in rare cases with precision timers
            if (dt < 0) dt = 0;
            
            lastTime = timestamp;
            
            // Handle Death / Revive Logic
            if (game.player.hp <= 0 && gameStateRef.current !== 'revive' && gameStateRef.current !== 'gameOver') {
                if (game.player.revives > 0) {
                    setGameState('revive');
                    // Loop continues but update is paused by check below
                } else {
                    progressionManager.addGold(game.player.gold);
                    soundManagerRef.current?.stopBGM();
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
            
            // Optimization: Throttle UI updates to ~10 FPS (every 100ms)
            // This prevents React from re-rendering 60 times a second which causes stutter
            if (timestamp - lastUIUpdateRef.current > 100) {
                lastUIUpdateRef.current = timestamp;
                setPlayerState({
                    hp: Math.round(game.player.hp),
                    maxHp: Math.round(game.player.maxHp),
                    xp: game.player.xp,
                    xpToNext: XP_LEVELS[game.player.level - 1] || Infinity,
                    level: game.player.level,
                    gold: game.player.gold,
                });

                // Dirty Check for Weapons to avoid expensive array cloning and re-renders
                const currentWeaponsHash = game.player.weapons.map(w => w.id + w.level).join(',');
                if (currentWeaponsHash !== lastWeaponsHash.current) {
                    setWeapons([...game.player.weapons]);
                    lastWeaponsHash.current = currentWeaponsHash;
                }

                // Dirty Check for Skills
                const currentSkillsHash = game.player.skills.map(s => s.id + s.level).join(',');
                if (currentSkillsHash !== lastSkillsHash.current) {
                    setSkills([...game.player.skills]);
                    lastSkillsHash.current = currentSkillsHash;
                }

                setGameTime(game.gameTime);
            }
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
        } else if (option.type === 'heal') {
            player.heal(option.amount); // amount is percent here (0.5)
        } else if (option.type === 'gold') {
            player.gainGold(option.amount);
        }
        // Reset hashes to force UI update after upgrade
        lastWeaponsHash.current = "";
        lastSkillsHash.current = "";
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
        soundManagerRef.current?.stopBGM();
        setGameState('gameOver');
        stopGameLoop();
    };

    const handleMainMenu = () => {
        if (gameRef.current && gameStateRef.current !== 'gameOver' && gameStateRef.current !== 'start') {
             // In case user quits mid-game (from pause menu), save their gold
             progressionManager.addGold(gameRef.current.player.gold);
        }
        soundManagerRef.current?.stopBGM();
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
                    gameTime={gameTime}
                    playerLevel={playerState.level}
                    gold={playerState.gold}
                    onRestart={handleRestart}
                    onMainMenu={handleMainMenu}
                />
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