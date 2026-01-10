import { vi, beforeEach, afterEach } from 'vitest';
import { mockLocalStorage } from './__mocks__/localStorage';

// Mock localStorage globally
vi.stubGlobal('localStorage', mockLocalStorage);

// Mock AudioContext for SoundManager
vi.stubGlobal('AudioContext', vi.fn(() => ({
    createOscillator: vi.fn(() => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        type: 'sine'
    })),
    createGain: vi.fn(() => ({
        connect: vi.fn(),
        gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
    })),
    createBiquadFilter: vi.fn(() => ({
        connect: vi.fn(),
        frequency: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        type: 'lowpass'
    })),
    createBuffer: vi.fn(() => ({ getChannelData: vi.fn(() => new Float32Array(1000)) })),
    createBufferSource: vi.fn(() => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        buffer: null
    })),
    destination: {},
    currentTime: 0,
    state: 'running',
    resume: vi.fn().mockResolvedValue(undefined),
    sampleRate: 44100
})));

// Reset before each test
beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
});

afterEach(() => {
    vi.restoreAllMocks();
});
