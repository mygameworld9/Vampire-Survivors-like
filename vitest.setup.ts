import { vi } from 'vitest';

const mockAudioNode = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  gain: {
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  frequency: {
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  start: vi.fn(),
  stop: vi.fn(),
  buffer: {},
  type: 'sine',
};

// Mock the global AudioContext
const mockAudioContext = {
  currentTime: 0,
  destination: {},
  state: 'running',
  sampleRate: 44100,
  createBufferSource: vi.fn(() => mockAudioNode),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: {
      value: 0,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  })),
  createOscillator: vi.fn(() => mockAudioNode),
  createBiquadFilter: vi.fn(() => mockAudioNode),
  createBuffer: vi.fn((_channels, length, _sampleRate) => ({
    getChannelData: vi.fn(() => new Float32Array(length)),
    length,
    duration: length / _sampleRate,
    numberOfChannels: _channels,
    sampleRate: _sampleRate,
  })),
  resume: vi.fn().mockResolvedValue(undefined),
};

class MockAudioContext {
    constructor() {
        return mockAudioContext;
    }
}

vi.stubGlobal('AudioContext', MockAudioContext);
vi.stubGlobal('webkitAudioContext', MockAudioContext);
