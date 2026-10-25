import { describe, expect, it } from 'vitest';
import { hydrate } from './persistence';
import { DEFAULT_STATE } from './defaultState';

describe('hydrate', () => {
  it('returns the seed state when nothing is stored', () => {
    const state = hydrate(null);
    expect(state.machines).toHaveLength(DEFAULT_STATE.machines.length);
    expect(state.user.name).toBe(DEFAULT_STATE.user.name);
  });

  it('survives corrupt JSON', () => {
    const state = hydrate('{not json');
    expect(state.user.email).toBe(DEFAULT_STATE.user.email);
    expect(state.alerts).toHaveLength(DEFAULT_STATE.alerts.length);
  });

  it('merges stored data over the defaults and keeps user defaults for missing fields', () => {
    const raw = JSON.stringify({ user: { phone: '+44 111 2222' }, machines: [] });
    const state = hydrate(raw);
    expect(state.user.phone).toBe('+44 111 2222');
    expect(state.user.name).toBe(DEFAULT_STATE.user.name); // missing → default
    expect(state.machines).toEqual([]); // explicit empty is respected
    expect(state.settings.refreshInterval).toBe(DEFAULT_STATE.settings.refreshInterval);
  });

  it('migrates the legacy identity forward', () => {
    const raw = JSON.stringify({ user: { name: 'Aditya Kamil', avatar: 'https://lh3.googleusercontent.com/abc' } });
    const state = hydrate(raw);
    expect(state.user.name).toBe('Adiba Kamil');
    expect(state.user.avatar).toBe('/mine.jpg');
  });

  it('keeps a deliberately edited profile', () => {
    const raw = JSON.stringify({ user: { name: 'Ops Lead', avatar: 'https://cdn.example.com/me.png' } });
    const state = hydrate(raw);
    expect(state.user.name).toBe('Ops Lead');
    expect(state.user.avatar).toBe('https://cdn.example.com/me.png');
  });

  it('fills in arrays omitted by an older payload', () => {
    const state = hydrate(JSON.stringify({ team: null, integrations: undefined }));
    expect(Array.isArray(state.team)).toBe(true);
    expect(Array.isArray(state.integrations)).toBe(true);
    expect(Array.isArray(state.recentEvents)).toBe(true);
  });
});
