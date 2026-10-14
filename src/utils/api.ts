import { ChatMessage, ConversationPreview, Profile } from '../types';

export async function fetchServerProfiles(): Promise<Profile[] | null> {
  try {
    const res = await fetch('/api/profiles');
    if (!res.ok) return null;
    const data = await res.json();
    if (data && Array.isArray(data.profiles)) {
      return data.profiles;
    }
  } catch (err) {
    console.warn('Could not fetch server profiles:', err);
  }
  return null;
}

export async function saveProfileToServer(profile: Profile): Promise<boolean> {
  try {
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not save profile to server:', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Messagerie : chaque appel précise l'utilisateur (userId) pour que le serveur
// ne renvoie que ce que CET utilisateur a le droit de voir (messages non supprimés pour lui).
// ---------------------------------------------------------------------------

export async function fetchMessagesFromServer(matchId: string, userId: string): Promise<ChatMessage[] | null> {
  try {
    const res = await fetch(`/api/messages/${encodeURIComponent(matchId)}?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && Array.isArray(data.messages)) {
      return data.messages;
    }
  } catch (err) {
    console.warn('Could not fetch server messages:', err);
  }
  return null;
}

export async function sendMessageToServer(message: ChatMessage): Promise<boolean> {
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not send message to server:', err);
    return false;
  }
}

// scope "me" : le message disparaît seulement pour moi. scope "all" : pour tout le monde (auteur uniquement).
export async function deleteMessageOnServer(messageId: string, userId: string, scope: 'me' | 'all'): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/messages/${encodeURIComponent(messageId)}?userId=${encodeURIComponent(userId)}&scope=${scope}`,
      { method: 'DELETE' }
    );
    return res.ok;
  } catch (err) {
    console.warn('Could not delete message:', err);
    return false;
  }
}

// Supprime la conversation pour moi uniquement (l'autre personne garde la sienne).
export async function deleteConversationOnServer(matchId: string, userId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/conversations/${encodeURIComponent(matchId)}?userId=${encodeURIComponent(userId)}`,
      { method: 'DELETE' }
    );
    return res.ok;
  } catch (err) {
    console.warn('Could not delete conversation:', err);
    return false;
  }
}

export async function fetchConversationPreviews(userId: string): Promise<ConversationPreview[] | null> {
  try {
    const res = await fetch(`/api/conversations?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.conversations) ? data.conversations : null;
  } catch (err) {
    console.warn('Could not fetch conversations:', err);
    return null;
  }
}

// Vérification des identifiants administrateur côté serveur (plus de mot de passe en dur dans l'app).
export async function adminLogin(email: string, password: string): Promise<'ok' | 'invalid' | 'unavailable'> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) return 'ok';
    if (res.status === 401 || res.status === 429) return 'invalid';
    return 'unavailable';
  } catch {
    return 'unavailable';
  }
}

export async function syncWithServer(localProfiles: Profile[], localAccounts: Profile[]): Promise<{
  profiles: Profile[];
  accounts: Profile[];
} | null> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localProfiles, localAccounts }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      profiles: data.profiles || [],
      accounts: data.accounts || [],
    };
  } catch (err) {
    console.warn('Could not sync with server:', err);
    return null;
  }
}
