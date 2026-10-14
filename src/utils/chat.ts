import { ChatMessage } from '../types';

// Identité "invité" partagée par tous les visiteurs non connectés (profil de démo).
// Elle ne doit JAMAIS servir à envoyer des messages : tous les invités auraient le même
// identifiant et leurs conversations se mélangeraient.
export const GUEST_USER_ID = 'me_current_user';

/**
 * Identifiant de conversation déterministe et identique des deux côtés :
 * la paire d'identifiants est triée, donc A↔B et B↔A donnent la même conversation,
 * et A↔C est une conversation totalement différente.
 */
export function conversationId(userA: string, userB: string): string {
  return 'conv~' + [userA, userB].sort().join('~');
}

export function conversationParticipants(convId: string): string[] {
  const parts = convId.split('~');
  return parts.length === 3 && parts[0] === 'conv' ? [parts[1], parts[2]] : [];
}

export function previewText(m: Pick<ChatMessage, 'mediaType' | 'text'>): string {
  if (m.mediaType === 'image') return '📷 Photo';
  if (m.mediaType === 'voice') return '🎤 Message vocal';
  if (m.mediaType === 'video') return '🎬 Vidéo';
  return m.text || '';
}
