import { vi } from 'vitest';

class MockAudioContext {
  createGain = vi.fn(() => ({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      value: 1,
    },
  }));
  createBufferSource = vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    buffer: null,
  }));
  decodeAudioData = vi.fn();
  currentTime = 0;
  destination = {};
  sampleRate = 44100;
  resume = vi.fn(() => Promise.resolve());
  createBuffer = vi.fn(() => ({
      getChannelData: vi.fn(() => new Float32Array(44100 * 2))
  }));
  createBiquadFilter = vi.fn(() => ({
    connect: vi.fn(),
    frequency: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        value: 0,
    },
    type: 'lowpass',
  }));
  createOscillator = vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
    },
    type: 'sine',
  }));
  state = 'running';
}

// Mock the Web Audio API
vi.stubGlobal('AudioContext', MockAudioContext);
vi.stubGlobal('webkitAudioContext', MockAudioContext);


// Mock the Image class
vi.stubGlobal('Image', class {
  onload: () => void = () => {};
  src: string = '';

  constructor() {
    setTimeout(() => {
      this.onload();
    }, 100);
  }
});
