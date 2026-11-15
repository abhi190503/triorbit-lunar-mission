import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { soundscape } from './soundscape';

describe('Web Audio Soundscape Engine', () => {
  it('initializes in muted state by default without throwing', () => {
    assert.equal(soundscape.isMuted, true);
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

  it('toggles muted state safely', () => {
    const initialState = soundscape.isMuted;
    const toggled = soundscape.toggleSound();
    assert.equal(toggled, !initialState);
    assert.equal(soundscape.isMuted, !initialState);

    // Toggle back to preserve default muted state
    soundscape.toggleSound();
    assert.equal(soundscape.isMuted, initialState);
  });

  it('handles cleanup safely', () => {
    assert.doesNotThrow(() => {
      soundscape.cleanup();
    });
  });
});
