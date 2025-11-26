import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SoundManager } from './SoundManager';

describe('SoundManager', () => {
  let soundManager: SoundManager;
  let mockCtx: any;

  beforeEach(() => {
    soundManager = new SoundManager({});
    soundManager.init();
    mockCtx = soundManager['audioContext'];

    if (mockCtx) {
        // Reset mocks that are configured with vi.fn() in the setup file
        (mockCtx.createBufferSource as any).mockClear();
        (mockCtx.createBiquadFilter as any).mockClear();
        (mockCtx.createGain as any).mockClear();
        (mockCtx.createOscillator as any).mockClear();
    }
  });

  it('should only connect the AURA noise source to the filter, not directly to the gain', () => {
    const mockNoiseSrc = {
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        buffer: {}
    };
    const mockFilter = { connect: vi.fn(), type: 'lowpass', frequency: { value: 0 } };
    const mockNoiseGain = {
        connect: vi.fn(),
        gain: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn()
        }
    };

    if (mockCtx) {
        (mockCtx.createBufferSource as any).mockReturnValue(mockNoiseSrc);
        (mockCtx.createBiquadFilter as any).mockReturnValue(mockFilter);

        const genericGainNode = {
            connect: vi.fn(),
            gain: {
                value: 0,
                setValueAtTime: vi.fn(),
                exponentialRampToValueAtTime: vi.fn(),
            },
        };

        // There are 3 calls to createGain for AURA sound:
        // 1. masterGain in playSound
        // 2. oscillator gain in playShootSound
        // 3. noiseGain for the fire crackle effect in playShootSound
        (mockCtx.createGain as any)
            .mockReturnValueOnce(genericGainNode) // masterGain
            .mockReturnValueOnce(genericGainNode) // oscillator gain
            .mockReturnValueOnce(mockNoiseGain);    // noiseGain
    }

    soundManager.playSound('WEAPON_AURA');

    // The bug is that noiseSrc is connected twice.
    // The test asserts the correct behavior: connected only once, to the filter.
    expect(mockNoiseSrc.connect).toHaveBeenCalledTimes(1);
    expect(mockNoiseSrc.connect).toHaveBeenCalledWith(mockFilter);
  });
});
