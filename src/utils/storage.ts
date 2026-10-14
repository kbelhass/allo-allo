import { Profile } from '../types';
import { CURRENT_USER, DEFAULT_WIFE_PROFILE, INITIAL_PROFILES } from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'allo_allo_current_user',
  PROFILES: 'allo_allo_registered_profiles',
  ACCOUNTS: 'allo_allo_user_accounts',
  WIFE_PROFILE: 'allo_allo_wife_profile',
};

export function getStoredCurrentUser(): Profile {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id && parsed.name) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load current user from storage:', err);
  }
  return CURRENT_USER;
}

export function saveStoredCurrentUser(user: Profile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } catch (err) {
    console.warn('Failed to save current user to storage:', err);
    safeStorageCleanup();
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch {}
  }
}

export function getStoredProfiles(): Profile[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (saved) {
      const parsed: Profile[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const ids = new Set(parsed.map((p) => p.id));
        const missingDefaults = [DEFAULT_WIFE_PROFILE, ...INITIAL_PROFILES].filter(
          (p) => !ids.has(p.id)
        );
        return [...parsed, ...missingDefaults];
      }
    }
  } catch (err) {
    console.warn('Failed to load profiles from storage:', err);
  }
  return [DEFAULT_WIFE_PROFILE, ...INITIAL_PROFILES];
}

export function saveStoredProfiles(profiles: Profile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  } catch (err) {
    console.warn('Failed to save profiles to storage, attempting cleanup:', err);
    safeStorageCleanup();
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    } catch (finalErr) {
      console.error('Final error saving profiles:', finalErr);
    }
  }
}

export function getStoredAccounts(): Profile[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (saved) {
      const parsed: Profile[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load user accounts:', err);
  }
  return [CURRENT_USER, DEFAULT_WIFE_PROFILE];
}

export function saveStoredAccounts(accounts: Profile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    console.warn('Failed to save user accounts:', err);
    safeStorageCleanup();
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch {}
  }
}

/**
 * Cleanup function to free up space if localStorage quota is tight
 */
function safeStorageCleanup(): void {
  try {
    // Remove heavy non-critical items if needed
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !Object.values(STORAGE_KEYS).includes(key) && key.startsWith('tmp_')) {
        localStorage.removeItem(key);
      }
    }
  } catch {}
}
