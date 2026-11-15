/**
 * TriOrbit Lunar Survival Simulator — Soundscape Engine
 *
 * Tasteful, lightweight synthesized Web Audio API sound system.
 * - Sound OFF by default.
 * - No autoplay; requires explicit user interaction to activate.
 * - Respects browser autoplay policies and AudioContext lifecycle.
 * - Clean cleanup of oscillators, gain nodes, and contexts.
 * - Safe SSR / node environment no-op execution.
 * - Zero external sound dependencies or copyrighted audio assets.
 */

export interface SoundEngine {
  isMuted: boolean;
  isUnlocked: boolean;
  init: () => void;
  unlockPlayback: () => boolean;
  restorePreference: () => boolean;
  setMuted: (muted: boolean) => void;
  toggleSound: () => boolean;
  playFacilitySelect: () => void;
  playMaintenanceSuccess: () => void;
  playEmergencyWarning: () => void;
  playVictory: () => void;
  playFailure: () => void;
  cleanup: () => void;
}

const STORAGE_KEY = 'triorbit_sound_muted';

class WebAudioSoundscape implements SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private _isMuted = true;
  private _isUnlocked = false;
  private isInitialized = false;

  constructor() {
    this._isMuted = true;
    this._isUnlocked = false;

    // Attach passive one-time user interaction listeners in browser
    if (typeof window !== 'undefined') {
      const handleFirstInteraction = () => {
        this.unlockPlayback();
        window.removeEventListener('pointerdown', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
        window.removeEventListener('click', handleFirstInteraction);
      };
      window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
      window.addEventListener('keydown', handleFirstInteraction, { passive: true });
      window.addEventListener('click', handleFirstInteraction, { passive: true });
    }
  }

  get isMuted(): boolean {
    return this._isMuted;
  }

  get isUnlocked(): boolean {
    return this._isUnlocked;
  }

  /**
   * Safely restore audio preference from localStorage post-hydration.
   * Guarantees SSR hydration consistency: initial state is always muted on both
   * server and client, then restored post-mount without triggering autoplay.
   */
  public restorePreference(): boolean {
    if (typeof window !== 'undefined' || typeof localStorage !== 'undefined') {
      try {
        const storage = typeof window !== 'undefined' ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
        if (storage) {
          const stored = storage.getItem(STORAGE_KEY);
          if (stored !== null) {
            this._isMuted = stored === 'true';
          }
        }
      } catch {
        this._isMuted = true;
      }
    }
    return this._isMuted;
  }

  /**
   * Explicitly unlocks audio playback following a fresh user gesture.
   * In accordance with browser autoplay policies, AudioContext is never started
   * or resumed until a user interaction has occurred on the page.
   */
  public unlockPlayback(): boolean {
    if (this._isUnlocked) return true;
    this._isUnlocked = true;

    // If user preference had sound unmuted, start ambient drone upon first interaction
    if (!this._isMuted) {
      if (this.ensureContext() && this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(0.25, this.ctx.currentTime, 0.05);
        this.startAmbient();
      }
    }
    return true;
  }

  public init(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this._isMuted ? 0 : 0.25, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch {
      // Audio initialization failure must never block gameplay
    }
  }

  private ensureContext(): boolean {
    // Block audio context creation and resumption until unlocked by user interaction
    if (!this._isUnlocked) return false;

    if (!this.isInitialized) {
      this.init();
    }
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  public setMuted(muted: boolean): void {
    this._isMuted = muted;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, String(muted));
      } catch {
        // Storage access failure non-blocking
      }
    }

    if (!muted) {
      if (this._isUnlocked && this.ensureContext() && this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(0.25, this.ctx.currentTime, 0.05);
        this.startAmbient();
        this.playConfirmationTone();
      }
    } else {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      }
      this.stopAmbient();
    }
  }

  public toggleSound(): boolean {
    this.unlockPlayback();
    const next = !this._isMuted;
    this.setMuted(next);
    return next;
  }

  /**
   * Gentle notification when sound is first unmuted.
   */
  private playConfirmationTone(): void {
    if (this._isMuted || !this.ensureContext() || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.16);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch {
      // Non-blocking
    }
  }

  /**
   * Gentle click / blip on facility selection.
   */
  public playFacilitySelect(): void {
    if (this._isMuted || !this.ensureContext() || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.06); // G5

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.09);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch {
      // Non-blocking
    }
  }

  /**
   * Soft confirmation sound for successful maintenance action execution.
   */
  public playMaintenanceSuccess(): void {
    if (this._isMuted || !this.ensureContext() || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 triad

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteStart = now + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.06, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.22);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.24);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      });
    } catch {
      // Non-blocking
    }
  }

  /**
   * Restrained warning cue for emergencies (Days 2, 3, 4 dilemmas).
   */
  public playEmergencyWarning(): void {
    if (this._isMuted || !this.ensureContext() || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const pulses = [
        { freq: 440, start: now, duration: 0.15 },
        { freq: 392, start: now + 0.18, duration: 0.2 },
      ];

      pulses.forEach(({ freq, start, duration }) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.07, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(start);
        osc.stop(start + duration + 0.02);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      });
    } catch {
      // Non-blocking
    }
  }

  /**
   * Distinct victory fanfare cue on successful 5-day expedition survival.
   */
  public playVictory(): void {
    if (this._isMuted || !this.ensureContext() || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      // Ascending celebratory major arpeggio: C4, E4, G4, C5
      const notes = [261.63, 329.63, 392.0, 523.25];

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteStart = now + idx * 0.12;
        const duration = idx === notes.length - 1 ? 0.6 : 0.28;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.08, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + duration + 0.02);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      });
    } catch {
      // Non-blocking
    }
  }

  /**
   * Distinct mission-aborted cue on life support failure.
   */
  public playFailure(): void {
    if (this._isMuted || !this.ensureContext() || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      // Descending somber intervals: 329.63 (E4), 261.63 (C4), 196.00 (G3)
      const notes = [329.63, 261.63, 196.0];

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteStart = now + idx * 0.16;
        const duration = idx === notes.length - 1 ? 0.5 : 0.24;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, noteStart);

        // Low-pass filter to dampen harsh sawtooth harmonics
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, noteStart);

        gain.gain.setValueAtTime(0.05, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + duration + 0.02);
        osc.onended = () => {
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
        };
      });
    } catch {
      // Non-blocking
    }
  }

  /**
   * Original subtle sci-fi ambient soundscape:
   * Dual ultra-low detuned sine drone through gentle low-pass filter at very low comfortable volume (0.02).
   */
  private startAmbient(): void {
    if (this._isMuted || !this._isUnlocked || !this.ctx || !this.masterGain) return;
    this.stopAmbient();

    try {
      const now = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.02, now + 1.5); // Smooth 1.5s fade-in

      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(140, now);

      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(55, now); // A1 root

      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'sine';
      this.ambientOsc2.frequency.setValueAtTime(82.4, now); // E2 fifth

      this.ambientOsc1.connect(this.ambientFilter);
      this.ambientOsc2.connect(this.ambientFilter);
      this.ambientFilter.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
    } catch {
      // Ambient failure must never block application
    }
  }

  private stopAmbient(): void {
    try {
      if (this.ambientGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.ambientGain.gain.setTargetAtTime(0, now, 0.2);
      }
    } catch {
      // Non-blocking
    }

    if (this.ambientOsc1) {
      try {
        this.ambientOsc1.stop();
        this.ambientOsc1.disconnect();
      } catch {
        // Safe disposal
      }
      this.ambientOsc1 = null;
    }

    if (this.ambientOsc2) {
      try {
        this.ambientOsc2.stop();
        this.ambientOsc2.disconnect();
      } catch {
        // Safe disposal
      }
      this.ambientOsc2 = null;
    }

    if (this.ambientFilter) {
      try {
        this.ambientFilter.disconnect();
      } catch {
        // Safe disposal
      }
      this.ambientFilter = null;
    }

    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect();
      } catch {
        // Safe disposal
      }
      this.ambientGain = null;
    }
  }

  public cleanup(): void {
    this.stopAmbient();
    if (this.ctx) {
      try {
        this.ctx.close().catch(() => {});
      } catch {
        // Ignored
      }
      this.ctx = null;
    }
    this.masterGain = null;
    this.isInitialized = false;
    this._isUnlocked = false;
    this._isMuted = true;
  }
}

// Export singleton instance for client use
export const soundscape: SoundEngine = new WebAudioSoundscape();
