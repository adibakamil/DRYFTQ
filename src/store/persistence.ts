import type { PlantState } from '../lib/types';
import { DEFAULT_STATE } from './defaultState';

/**
 * Persistence for the plant state.
 * The key and the merge rules are inherited from the legacy engine so any
 * state an operator already saved in `localStorage` keeps working.
 */
export const STORAGE_KEY = 'dryftq_plant_operations_v2';
export const STATE_CHANGE_EVENT = 'dryftq:state-change';

const LEGACY_USER_NAME = 'Aditya Kamil';
const LEGACY_AVATAR_PREFIX = 'https://lh3.googleusercontent.com/';

/** Merge stored data over the seed defaults, migrating legacy identity forward. */
export function hydrate(raw: string | null): PlantState {
  let parsed: Partial<PlantState> | null = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw) as Partial<PlantState>;
    } catch {
      console.warn('DRYFTQ: stored state is corrupt, falling back to defaults.');
      parsed = null;
    }
  }

  const state: PlantState = {
    ...DEFAULT_STATE,
    ...(parsed ?? {}),
    user: { ...DEFAULT_STATE.user, ...(parsed?.user ?? {}) },
  };

  // Migrate the originally seeded identity forward; deliberate edits are kept.
  if (!state.user.name || state.user.name === LEGACY_USER_NAME) {
    state.user.name = DEFAULT_STATE.user.name;
  }
  if (
    !state.user.avatar ||
    state.user.avatar === DEFAULT_STATE.user.avatar ||
    state.user.avatar.startsWith(LEGACY_AVATAR_PREFIX) ||
    state.user.avatar.startsWith('../')
  ) {
    state.user.avatar = DEFAULT_STATE.user.avatar;
  }

  // Arrays must exist even if an older payload omitted them.
  state.machines ??= [];
  state.alerts ??= [];
  state.maintenanceTasks ??= [];
  state.team ??= [];
  state.integrations ??= [];
  state.recentEvents ??= [];
  state.settings ??= { ...DEFAULT_STATE.settings };

  return state;
}

/** Read the persisted state (or the defaults on first run). */
export function loadState(): PlantState {
  if (typeof localStorage === 'undefined') return hydrate(null);
  return hydrate(localStorage.getItem(STORAGE_KEY));
}

/** Persist + announce so other tabs (and any legacy page) stay in sync. */
export function saveState(state: PlantState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const payload: PlantState = {
      ...state,
      user: {
        ...state.user,
        // Never persist relative rebasing — storage keeps the canonical path.
        avatar: state.user.avatar.startsWith('../') ? state.user.avatar.slice(2) : state.user.avatar,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(STATE_CHANGE_EVENT, { detail: payload }));
  } catch (e) {
    console.error('DRYFTQ: could not write localStorage', e);
  }
}
