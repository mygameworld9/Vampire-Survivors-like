import { vi } from 'vitest';

export const mockSoundManager = {
    init: vi.fn(),
    playSound: vi.fn(),
    startBGM: vi.fn(),
    stopBGM: vi.fn(),
    setBGMIntensity: vi.fn(),
    startAmbient: vi.fn(),
    stopAmbient: vi.fn(),
} as any;

export class MockSoundManager {
    init = vi.fn();
    playSound = vi.fn();
    startBGM = vi.fn();
    stopBGM = vi.fn();
    setBGMIntensity = vi.fn();
}
