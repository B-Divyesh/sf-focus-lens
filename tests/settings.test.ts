import { describe, expect, it } from 'vitest';
import { clampZoom, mergeSettings, storageKey, validateWaypointName } from '../lib/settings';

describe('site settings', () => {
  it('keeps zoom within the supported range', () => {
    expect(clampZoom(61)).toBe(80);
    expect(clampZoom(137)).toBe(140);
    expect(clampZoom(241)).toBe(200);
  });

  it('merges old records with safe defaults', () => {
    expect(mergeSettings({ zoom: 150 }).focusVisible).toBe(true);
    expect(mergeSettings({ zoom: 150 }).waypoints).toEqual([]);
  });

  it('uses one local key for each origin', () => {
    expect(storageKey('https://work.example')).toBe('site:https://work.example');
  });

  it('requires a named waypoint with recoverable guidance', () => {
    expect(validateWaypointName('   ')).toBe('Enter a waypoint name, then save it.');
    expect(validateWaypointName('Review search')).toBeNull();
  });
});
