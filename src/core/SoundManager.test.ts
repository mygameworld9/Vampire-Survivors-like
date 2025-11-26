import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SoundManager } from './SoundManager';

describe('SoundManager', () => {
  let soundManager: SoundManager;

  beforeEach(() => {
    soundManager = new SoundManager({});
  });

  it('should not be initialized by default', () => {
    expect((soundManager as any).isInitialized).toBe(false);
  });

  it('should initialize the AudioContext on init', () => {
    soundManager.init();
    expect((soundManager as any).isInitialized).toBe(true);
    expect((soundManager as any).audioContext).not.toBeNull();
  });

  it('should not re-initialize if already initialized', () => {
    soundManager.init();
    const audioContext = (soundManager as any).audioContext;
    soundManager.init();
    expect((soundManager as any).audioContext).toBe(audioContext);
  });

  it('should call the correct sound synthesis method based on the key', () => {
    soundManager.init();
    const playShootSoundSpy = vi.spyOn(soundManager as any, 'playShootSound');
    const playHitSoundSpy = vi.spyOn(soundManager as any, 'playHitSound');
    const playExplosionSoundSpy = vi.spyOn(soundManager as any, 'playExplosionSound');
    const playPowerUpSoundSpy = vi.spyOn(soundManager as any, 'playPowerUpSound');
    const playPickupSoundSpy = vi.spyOn(soundManager as any, 'playPickupSound');
    const playHurtSoundSpy = vi.spyOn(soundManager as any, 'playHurtSound');
    const playGameOverSoundSpy = vi.spyOn(soundManager as any, 'playGameOverSound');

    soundManager.playSound('WEAPON_LASER');
    expect(playShootSoundSpy).toHaveBeenCalled();

    soundManager.playSound('ENEMY_HIT');
    expect(playHitSoundSpy).toHaveBeenCalled();

    soundManager.playSound('ENEMY_DIE');
    expect(playExplosionSoundSpy).toHaveBeenCalled();

    soundManager.playSound('LEVEL_UP');
    expect(playPowerUpSoundSpy).toHaveBeenCalled();

    soundManager.playSound('ITEM_PICKUP');
    expect(playPickupSoundSpy).toHaveBeenCalled();

    soundManager.playSound('PLAYER_HURT');
    expect(playHurtSoundSpy).toHaveBeenCalled();

    soundManager.playSound('GAME_OVER');
    expect(playGameOverSoundSpy).toHaveBeenCalled();
  });

  it('should start and stop the BGM', () => {
    soundManager.init();
    soundManager.startBGM();
    expect((soundManager as any).bgmEnabled).toBe(true);
    soundManager.stopBGM();
    expect((soundManager as any).bgmEnabled).toBe(false);
  });

  it('should set the BGM intensity', () => {
    soundManager.setBGMIntensity(0.5);
    expect((soundManager as any).bgmIntensity).toBe(0.5);
  });
});
