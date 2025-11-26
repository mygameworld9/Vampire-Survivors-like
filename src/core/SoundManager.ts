
/**
 * Manages loading and playing audio effects.
 * Uses Web Audio API to synthesize retro game sounds procedurally, ensuring audio works
 * even without external asset files.
 */
export class SoundManager {
    private audioContext: AudioContext | null = null;
    private isInitialized = false;
    private noiseBuffer: AudioBuffer | null = null;
    
    // Music System Properties
    private bgmEnabled = false;
    private nextNoteTime = 0;
    private bgmIntensity = 0; // 0 to 1
    private scheduleAheadTime = 0.1; // seconds
    private lookahead = 25; // milliseconds
    private timerID: number | null = null;
    private noteIndex = 0;

    // Pentatonic Scale (C Minor: C, Eb, F, G, Bb)
    // Frequencies for C4, Eb4, F4, G4, Bb4, C5, Eb5...
    private scale = [
        261.63, 311.13, 349.23, 392.00, 466.16, // Octave 4
        523.25, 622.25, 698.46, 783.99, 932.33, // Octave 5
        1046.50 // C6
    ];

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
    
    // --- Background Music System ---

    public startBGM() {
        if (!this.isInitialized || !this.audioContext) return;
        if (this.bgmEnabled) return;
        
        this.bgmEnabled = true;
        this.noteIndex = 0;
        this.nextNoteTime = this.audioContext.currentTime + 0.1;
        this.scheduler();
    }

    public stopBGM() {
        this.bgmEnabled = false;
        if (this.timerID !== null) {
            window.clearTimeout(this.timerID);
            this.timerID = null;
        }
    }

    public setBGMIntensity(intensity: number) {
        // intensity is between 0 and 1
        this.bgmIntensity = Math.max(0, Math.min(1, intensity));
    }

    private scheduler() {
        if (!this.bgmEnabled || !this.audioContext) return;

        // While there are notes that will need to play before the next interval, 
        // schedule them and advance the pointer.
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.nextNoteTime);
            this.advanceNote();
        }
        
        this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
    }

    private scheduleNote(time: number) {
        if (!this.audioContext) return;
        
        // Base Rhythm: 16th notes
        // Arpeggiator (Sparkles) - Always plays
        // At low intensity: Slow, sparse
        // At high intensity: Fast, complex
        
        // Determine probability of playing a note based on intensity and beat position
        const beat = this.noteIndex % 16;
        const isStrongBeat = beat % 4 === 0;
        
        // High pitched "sparkle" melody
        if (isStrongBeat || Math.random() < (0.3 + this.bgmIntensity * 0.5)) {
            this.playSynthNote(time, 0.1, 'sine', 0.05);
        }

        // Bassline (Driving force) - Only kicks in at medium intensity (> 0.3)
        if (this.bgmIntensity > 0.3) {
            if (beat === 0 || beat === 8) { // Kick drum equivalent position
                this.playBassNote(time, 0.2, 'sawtooth', 0.1 + (this.bgmIntensity * 0.1));
            }
            if (this.bgmIntensity > 0.7 && (beat === 4 || beat === 12)) {
                 // Extra bass drive
                 this.playBassNote(time, 0.1, 'square', 0.1);
            }
        }
    }

    private advanceNote() {
        // Tempo increases slightly with intensity
        const baseTempo = 0.15; // seconds per 16th note (approx 100 BPM)
        const speedUp = this.bgmIntensity * 0.05; 
        const secondsPerNote = baseTempo - speedUp;
        
        this.nextNoteTime += secondsPerNote;
        this.noteIndex++;
        if (this.noteIndex >= 16) {
            this.noteIndex = 0;
        }
    }

    private playSynthNote(time: number, duration: number, type: OscillatorType, volume: number) {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = type;
        
        // Pick random note from pentatonic scale, bias towards higher notes for sparkles
        const noteIdx = Math.floor(Math.random() * this.scale.length);
        const freq = this.scale[noteIdx];
        
        osc.frequency.setValueAtTime(freq, time);
        
        // Envelope
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(volume, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        osc.start(time);
        osc.stop(time + duration);
    }

    private playBassNote(time: number, duration: number, type: OscillatorType, volume: number) {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = type;
        // Root note C2 or F2
        const freq = Math.random() > 0.5 ? 65.41 : 87.31; 
        osc.frequency.setValueAtTime(freq, time);

        // Filter envelope (Wah effect)
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, time);
        filter.frequency.exponentialRampToValueAtTime(800, time + 0.05);
        filter.frequency.exponentialRampToValueAtTime(200, time + duration);

        gain.gain.setValueAtTime(volume, time);
        gain.gain.linearRampToValueAtTime(0, time + duration);

        osc.start(time);
        osc.stop(time + duration);
    }

    // --- End Music System ---

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
        } else if (key.includes('LIGHTNING')) {
            // Crackle
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(10, now + 0.3);
            
            // Add noise layer for thunder
            if (this.noiseBuffer) {
                const noiseSrc = ctx.createBufferSource();
                noiseSrc.buffer = this.noiseBuffer;
                const noiseGain = ctx.createGain();
                noiseSrc.connect(noiseGain);
                noiseGain.connect(output);
                noiseGain.gain.setValueAtTime(0.5, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                noiseSrc.start(now);
                noiseSrc.stop(now + 0.4);
            }

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (key.includes('SLASH')) {
             if (this.noiseBuffer) {
                const noiseSrc = ctx.createBufferSource();
                noiseSrc.buffer = this.noiseBuffer;
                
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800, now);
                filter.frequency.linearRampToValueAtTime(200, now + 0.2);

                noiseSrc.connect(filter);
                filter.connect(gain);
                
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                noiseSrc.start(now);
                noiseSrc.stop(now + 0.2);
            }
        } else if (key.includes('AURA')) {
            // Low fire/magic hum
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.5);
            
            // Add slight noise for fire crackle
            if (this.noiseBuffer) {
                const noiseSrc = ctx.createBufferSource();
                noiseSrc.buffer = this.noiseBuffer;
                const noiseGain = ctx.createGain();
                noiseGain.connect(output);
                
                // Lowpass filter for deep fire sound
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 500;
                noiseSrc.connect(filter);
                filter.connect(noiseGain);

                noiseGain.gain.setValueAtTime(0.1, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                noiseSrc.start(now);
                noiseSrc.stop(now + 0.5);
            }

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
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
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.15);
        
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
