
/**
 * Manages loading and playing audio effects.
 * Uses Web Audio API to synthesize retro game sounds procedurally, ensuring audio works
 * even without external asset files.
 */
export class SoundManager {
    private audioContext: AudioContext | null = null;
    private isInitialized = false;
    private noiseBuffer: AudioBuffer | null = null;

    constructor(private soundData: { [key: string]: string }) {}

    /**
     * Enables the SoundManager. This must be called after a user gesture (e.g., a click).
     */
    public init() {
        if (this.isInitialized) return;

        try {
            // Support for standard and WebKit browsers
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.audioContext = new AudioContextClass();
            this.isInitialized = true;
            
            // Create white noise buffer for explosions/impacts
            if (this.audioContext) {
                const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds buffer
                this.noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
                const data = this.noiseBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
            }

        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }
    }

    /**
     * Plays a sound effect identified by a key.
     */
    public playSound(key: string, volume = 1.0) {
        if (!this.isInitialized || !this.audioContext) return;
        
        // Ensure context is running (browsers sometimes suspend it)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(console.error);
        }

        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        // Global volume scaler to prevent clipping when multiple sounds play
        masterGain.gain.value = volume * 0.25; 

        // Route to specific synthesizer based on key
        if (key.startsWith('WEAPON')) {
            this.playShootSound(ctx, masterGain, now, key);
        } else if (key === 'ENEMY_HIT') {
            this.playHitSound(ctx, masterGain, now);
        } else if (key === 'ENEMY_DIE') {
            this.playExplosionSound(ctx, masterGain, now);
        } else if (key === 'LEVEL_UP' || key === 'CHEST_OPEN') {
            this.playPowerUpSound(ctx, masterGain, now);
        } else if (key === 'ITEM_PICKUP' || key.includes('XP')) {
            this.playPickupSound(ctx, masterGain, now);
        } else if (key === 'PLAYER_HURT') {
            this.playHurtSound(ctx, masterGain, now);
        } else if (key === 'GAME_OVER') {
            this.playGameOverSound(ctx, masterGain, now);
        }
    }

    private playShootSound(ctx: AudioContext, output: AudioNode, now: number, key: string) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(output);

        if (key.includes('LASER')) {
            // High pitched sci-fi zap
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (key.includes('BOOMERANG')) {
            // Whirring sound
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(400, now + 0.1);
            osc.frequency.linearRampToValueAtTime(300, now + 0.2);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else {
            // Default Bullet (Pew)
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
    }

    private playHitSound(ctx: AudioContext, output: AudioNode, now: number) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(output);

        // Short low-fi crunch
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.start(now);
        osc.stop(now + 0.05);
    }

    private playExplosionSound(ctx: AudioContext, output: AudioNode, now: number) {
        if (!this.noiseBuffer) return;
        
        const source = ctx.createBufferSource();
        source.buffer = this.noiseBuffer;
        const gain = ctx.createGain();
        
        // Lowpass filter to make it sound like an explosion/pop rather than hiss
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(100, now + 0.2);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(output);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        source.start(now);
        source.stop(now + 0.2);
    }

    private playPowerUpSound(ctx: AudioContext, output: AudioNode, now: number) {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(output);

        osc1.type = 'sine';
        osc2.type = 'triangle';

        // Arpeggio effect (Major chord)
        osc1.frequency.setValueAtTime(440, now);       // A4
        osc1.frequency.setValueAtTime(554, now + 0.1); // C#5
        osc1.frequency.setValueAtTime(659, now + 0.2); // E5
        osc1.frequency.setValueAtTime(880, now + 0.3); // A5

        // Harmony layer
        osc2.frequency.setValueAtTime(442, now); 
        osc2.frequency.linearRampToValueAtTime(884, now + 0.4);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.6);
        osc2.stop(now + 0.6);
    }

    private playPickupSound(ctx: AudioContext, output: AudioNode, now: number) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(output);

        // High ping/ding
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    private playHurtSound(ctx: AudioContext, output: AudioNode, now: number) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(output);

        // Dissonant low buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.15);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    private playGameOverSound(ctx: AudioContext, output: AudioNode, now: number) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(output);

        // Sad descending slide
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(50, now + 1.5);
        
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0, now + 1.5);

        osc.start(now);
        osc.stop(now + 1.5);
    }
}
