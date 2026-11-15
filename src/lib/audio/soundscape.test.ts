import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { soundscape } from './soundscape';

class MockGainNode {
  gain = {
    value: 1,
    setValueAtTime: () => {},
    setTargetAtTime: () => {},
    exponentialRampToValueAtTime: () => {},
  };
  connect() {}
  disconnect() {}
}

class MockBiquadFilterNode {
  frequency = {
    value: 140,
    setValueAtTime: () => {},
  };
  connect() {}
  disconnect() {}
}

class MockOscillatorNode {
  type = 'sine';
  frequency = {
    value: 440,
    setValueAtTime: () => {},
    exponentialRampToValueAtTime: () => {},
  };
  started = false;
  stopped = false;
  connected = false;
  onended: (() => void) | null = null;

  start() {
    this.started = true;
  }
  stop() {
    this.stopped = true;
  }
  connect() {
    this.connected = true;
  }
  disconnect() {
    this.connected = false;
  }
}

let activeMockContexts: MockAudioContext[] = [];

class MockAudioContext {
  state: 'suspended' | 'running' | 'closed' = 'running';
  currentTime = 0;
  destination = {};
  createdOscillators: MockOscillatorNode[] = [];
  createdGainNodes: MockGainNode[] = [];
  createdFilters: MockBiquadFilterNode[] = [];
  closed = false;

  constructor() {
    activeMockContexts.push(this);
  }

  createGain() {
    const node = new MockGainNode();
    this.createdGainNodes.push(node);
    return node;
  }

  createOscillator() {
    const node = new MockOscillatorNode();
    this.createdOscillators.push(node);
    return node;
  }

  createBiquadFilter() {
    const node = new MockBiquadFilterNode();
    this.createdFilters.push(node);
    return node;
  }

  async resume() {
    this.state = 'running';
  }

  async close() {
    this.closed = true;
    this.state = 'closed';
  }
}

describe('Web Audio Soundscape Engine', () => {
  beforeEach(() => {
    soundscape.cleanup();
    activeMockContexts = [];
  });

  afterEach(() => {
    soundscape.cleanup();
    activeMockContexts = [];
  });

  it('initializes in muted and locked state by default without throwing', () => {
    assert.equal(soundscape.isMuted, true);
    assert.equal(soundscape.isUnlocked, false);
  });

  it('safely handles audio triggers in headless/SSR environments without throwing', () => {
    assert.doesNotThrow(() => {
      soundscape.playFacilitySelect();
      soundscape.playMaintenanceSuccess();
      soundscape.playEmergencyWarning();
      soundscape.playVictory();
      soundscape.playFailure();
    });
  });

  it('does NOT begin audio automatically on page load when preference is restored', () => {
    const storage: Record<string, string> = {
      triorbit_sound_muted: 'false', // User previously unmuted sound
    };

    (globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, val: string) => {
        storage[key] = val;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {},
      length: 1,
      key: () => null,
    };

    // Restore preference
    const restored = soundscape.restorePreference();
    assert.equal(restored, false, 'Preference should restore as unmuted (false)');
    assert.equal(soundscape.isMuted, false);

    // Audio MUST remain locked until user interaction
    assert.equal(soundscape.isUnlocked, false, 'Playback must remain locked until user gesture');

    // Triggering cues while locked must NOT throw and must NOT create AudioContext
    assert.doesNotThrow(() => {
      soundscape.playEmergencyWarning();
    });
    assert.equal(activeMockContexts.length, 0, 'No AudioContext must be created before user interaction');

    // Clean up mock localStorage
    delete (globalThis as unknown as { localStorage?: Storage }).localStorage;
  });

  it('unlocks playback upon user interaction and starts ambient drone if unmuted', () => {
    (globalThis as unknown as { window: unknown }).window = {
      AudioContext: MockAudioContext,
      addEventListener: () => {},
      removeEventListener: () => {},
    };

    soundscape.setMuted(false);
    assert.equal(soundscape.isMuted, false);
    assert.equal(soundscape.isUnlocked, false);

    // Explicitly simulate fresh user interaction
    soundscape.unlockPlayback();
    assert.equal(soundscape.isUnlocked, true);

    // AudioContext must now be initialized and ambient drone started
    assert.equal(activeMockContexts.length, 1, 'Exactly one AudioContext created');
    const ctx = activeMockContexts[0];
    assert.equal(ctx.createdOscillators.length, 2, 'Ambient drone creates dual oscillators');
    assert.equal(ctx.createdOscillators[0].started, true);
    assert.equal(ctx.createdOscillators[1].started, true);

    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it('stops ambient drone cleanly when sound is muted and avoids duplicate oscillators on repeated toggles', () => {
    (globalThis as unknown as { window: unknown }).window = {
      AudioContext: MockAudioContext,
      addEventListener: () => {},
      removeEventListener: () => {},
    };

    // 1. First toggle: unmutes and unlocks
    soundscape.toggleSound();
    assert.equal(soundscape.isMuted, false);
    assert.equal(soundscape.isUnlocked, true);
    assert.equal(activeMockContexts.length, 1);
    const ctx = activeMockContexts[0];

    const initialOsc1 = ctx.createdOscillators[0];
    const initialOsc2 = ctx.createdOscillators[1];
    assert.equal(initialOsc1.started, true);
    assert.equal(initialOsc2.started, true);

    // 2. Second toggle: mutes sound -> ambient drone must stop and disconnect
    soundscape.toggleSound();
    assert.equal(soundscape.isMuted, true);
    assert.equal(initialOsc1.stopped, true, 'Oscillator 1 must be stopped on mute');
    assert.equal(initialOsc2.stopped, true, 'Oscillator 2 must be stopped on mute');
    assert.equal(initialOsc1.connected, false, 'Oscillator 1 must be disconnected on mute');
    assert.equal(initialOsc2.connected, false, 'Oscillator 2 must be disconnected on mute');

    // 3. Repeated rapid toggling must reuse the same AudioContext and never leak extra contexts
    for (let i = 0; i < 6; i++) {
      soundscape.toggleSound();
    }
    assert.equal(activeMockContexts.length, 1, 'AudioContext instance must be reused, not leaked');

    // 4. Mute again to verify final clean state
    if (!soundscape.isMuted) {
      soundscape.toggleSound();
    }
    assert.equal(soundscape.isMuted, true);

    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it('handles cleanup safely and closes AudioContext', () => {
    (globalThis as unknown as { window: unknown }).window = {
      AudioContext: MockAudioContext,
      addEventListener: () => {},
      removeEventListener: () => {},
    };

    soundscape.toggleSound();
    assert.equal(activeMockContexts.length, 1);
    const ctx = activeMockContexts[0];

    soundscape.cleanup();
    assert.equal(ctx.closed, true, 'AudioContext must be closed on cleanup');
    assert.equal(soundscape.isUnlocked, false, 'isUnlocked must reset to false on cleanup');

    delete (globalThis as unknown as { window?: unknown }).window;
  });
});
