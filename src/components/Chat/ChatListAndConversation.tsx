import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Phone,
  Video,
  Send,
  Mic,
  Image as ImageIcon,
  Clock,
  CheckCheck,
  Play,
  Pause,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Lock,
  LogIn,
  UserPlus,
  X
} from 'lucide-react';
import { Match, ChatMessage, ConversationPreview, Profile } from '../../types';
import {
  fetchMessagesFromServer,
  sendMessageToServer,
  deleteMessageOnServer,
  deleteConversationOnServer,
  fetchConversationPreviews
} from '../../utils/api';
import { conversationId, GUEST_USER_ID, previewText } from '../../utils/chat';
import { compressImageFile } from '../../utils/imageCompressor';

interface ChatListAndConversationProps {
  matches: Match[];
  allProfiles: Profile[];
  currentUser: Profile;
  wifeProfile?: Profile;
  onStartCall: (partner: Profile, isVideo: boolean) => void;
  onOpenProfile: (profile: Profile) => void;
  onSwitchUser?: (newUser: Profile) => void;
  onGoToLogin?: () => void;
  onGoToRegister?: () => void;
}

type Threads = Record<string, ChatMessage[]>;
type HiddenMap = Record<string, string>;

const CACHE_PREFIX = 'allo_allo_chat_v3_';
const HIDDEN_PREFIX = 'allo_allo_chat_hidden_v3_';
const MAX_CACHED_PER_THREAD = 60;

// Ancien stockage (v2) : une seule liste globale, partagée entre tous les comptes et toutes les
// conversations. C'est la source du mélange des messages — on le supprime.
const LEGACY_KEY = 'allo_allo_chat_messages_v2';

function loadThreads(userId: string): Threads {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + userId);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function saveThreads(userId: string, threads: Threads) {
  try {
    const slim: Threads = {};
    for (const [convId, list] of Object.entries(threads)) {
      slim[convId] = list
        .filter(m => m.status !== 'sending' && m.status !== 'failed')
        .slice(-MAX_CACHED_PER_THREAD)
        .map(m => (m.mediaType === 'image' ? { ...m, mediaUrl: undefined } : m)); // les photos se rechargent depuis le serveur
    }
    localStorage.setItem(CACHE_PREFIX + userId, JSON.stringify(slim));
  } catch {
    // quota dépassé : le cache est facultatif
  }
}

function loadHidden(userId: string): HiddenMap {
  try {
    const raw = localStorage.getItem(HIDDEN_PREFIX + userId);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function saveHidden(userId: string, hidden: HiddenMap) {
  try {
    localStorage.setItem(HIDDEN_PREFIX + userId, JSON.stringify(hidden));
  } catch {
    // ignore
  }
}

function sortByDate(list: ChatMessage[]): ChatMessage[] {
  return [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function newMessageId(): string {
  return 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
}

type ConfirmState =
  | { kind: 'conversation'; match: Match }
  | { kind: 'message'; message: ChatMessage; scope: 'me' | 'all' }
  | null;

export const ChatListAndConversation: React.FC<ChatListAndConversationProps> = ({
  matches,
  currentUser,
  onStartCall,
  onOpenProfile,
  onGoToLogin,
  onGoToRegister,
}) => {
  const uid = currentUser.id;
  const isGuest = uid === GUEST_USER_ID;

  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Threads>(() => loadThreads(uid));
  const [hidden, setHidden] = useState<HiddenMap>(() => loadHidden(uid));
  const [previews, setPreviews] = useState<Record<string, ChatMessage>>({});

  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isEphemeralMode, setIsEphemeralMode] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [safetyAlert, setSafetyAlert] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [now, setNow] = useState(() => Date.now());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deletingConvs = useRef<Set<string>>(new Set());
  const lastRenderedCount = useRef<number>(-1);

  const activeMatch = useMemo(
    () => matches.find(m => m.id === activeMatchId) || null,
    [matches, activeMatchId]
  );
  const activeConvId = activeMatch ? conversationId(uid, activeMatch.partnerProfile.id) : null;

  const showNotice = (text: string) => {
    setNotice(text);
    setTimeout(() => setNotice(null), 4000);
  };

  // --- Changement de compte : on repart d'un état propre, rien ne fuit d'un compte à l'autre ---
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      // ignore
    }
    setThreads(loadThreads(uid));
    setHidden(loadHidden(uid));
    setPreviews({});
    setActiveMatchId(null);
    setSelectedMsgId(null);
    setConfirm(null);
  }, [uid]);

  useEffect(() => {
    if (!isGuest) saveThreads(uid, threads);
  }, [threads, uid, isGuest]);

  useEffect(() => {
    if (!isGuest) saveHidden(uid, hidden);
  }, [hidden, uid, isGuest]);

  // --- Sons ---
  const playChime = (isIncoming: boolean) => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new Ctx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      if (isIncoming) {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.12);
      }
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.22);
      osc.onended = () => audioCtx.close().catch(() => {});
    } catch {
      // pas d'audio disponible
    }
  };

  // --- Synchronisation de la conversation ouverte (toutes les 3 s) ---
  useEffect(() => {
    if (isGuest || !activeConvId) return;
    const convId = activeConvId;
    let cancelled = false;

    const pull = async () => {
      if (deletingConvs.current.has(convId)) return;
      const serverMsgs = await fetchMessagesFromServer(convId, uid);
      if (cancelled || !serverMsgs || deletingConvs.current.has(convId)) return;

      setThreads(prev => {
        const local = prev[convId] || [];
        const serverIds = new Set(serverMsgs.map(m => m.id));
        // On garde les messages encore en cours d'envoi / en échec (pas encore connus du serveur)
        const pending = local.filter(m => (m.status === 'sending' || m.status === 'failed') && !serverIds.has(m.id));
        const merged = sortByDate([...serverMsgs, ...pending]);

        const sameAsLocal =
          merged.length === local.length &&
          merged.every((m, i) => m.id === local[i].id && m.status === local[i].status);
        if (sameAsLocal) return prev;

        const incomingBefore = local.filter(m => m.senderId !== uid).length;
        const incomingAfter = merged.filter(m => m.senderId !== uid).length;
        if (incomingAfter > incomingBefore && local.length > 0) playChime(true);

        return { ...prev, [convId]: merged };
      });
    };

    pull();
    const intervalId = setInterval(pull, 3000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [activeConvId, uid, isGuest]);

  // --- Aperçus de la liste (dernier message réel de chaque conversation) ---
  useEffect(() => {
    if (isGuest) return;
    let cancelled = false;

    const pull = async () => {
      const list: ConversationPreview[] | null = await fetchConversationPreviews(uid);
      if (cancelled || !list) return;
      const map: Record<string, ChatMessage> = {};
      for (const p of list) {
        if (!deletingConvs.current.has(p.matchId)) map[p.matchId] = p.lastMessage;
      }
      setPreviews(map);
    };

    pull();
    const intervalId = setInterval(pull, 5000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [uid, isGuest, activeConvId]);

  // --- Messages visibles de la conversation ouverte (uniquement SES messages) ---
  const rawThread = activeConvId ? threads[activeConvId] || [] : [];
  const hasEphemeral = rawThread.some(m => m.expiresAt);
  useEffect(() => {
    if (!hasEphemeral) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [hasEphemeral]);

  const visibleMessages = useMemo(
    () => rawThread.filter(m => !m.expiresAt || new Date(m.expiresAt).getTime() > now),
    [rawThread, now]
  );

  useEffect(() => {
    lastRenderedCount.current = -1;
  }, [activeConvId]);

  useEffect(() => {
    if (visibleMessages.length !== lastRenderedCount.current) {
      lastRenderedCount.current = visibleMessages.length;
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [visibleMessages.length, activeConvId]);

  // --- Notes vocales (simulation sonore) ---
  const handlePlayVoice = (msgId: string) => {
    if (playingVoiceId === msgId) {
      setPlayingVoiceId(null);
      return;
    }
    setPlayingVoiceId(msgId);
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new Ctx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(560, audioCtx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);
      osc.onended = () => audioCtx.close().catch(() => {});
    } catch {
      // pas d'audio disponible
    }
    setTimeout(() => setPlayingVoiceId(null), 3500);
  };

  // --- Envoi ---
  const pushOutgoing = async (msg: ChatMessage) => {
    const convId = msg.matchId;
    // Si la conversation avait été supprimée, elle réapparaît dès qu'on écrit à nouveau
    setHidden(prev => {
      if (!(convId in prev)) return prev;
      const next = { ...prev };
      delete next[convId];
      return next;
    });
    setThreads(prev => ({ ...prev, [convId]: sortByDate([...(prev[convId] || []), msg]) }));
    playChime(false);

    const ok = await sendMessageToServer({ ...msg, status: undefined });
    setThreads(prev => ({
      ...prev,
      [convId]: (prev[convId] || []).map(m => (m.id === msg.id ? { ...m, status: ok ? 'sent' : 'failed' } : m)),
    }));
  };

  const buildMessage = (partial: Partial<ChatMessage>): ChatMessage | null => {
    if (!activeMatch || !activeConvId) return null;
    const created = new Date();
    return {
      id: newMessageId(),
      matchId: activeConvId,
      senderId: uid, // toujours l'utilisateur connecté : on ne peut plus écrire "à la place" de quelqu'un
      mediaType: 'text',
      createdAt: created.toISOString(),
      timestamp: created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
      ...partial,
    };
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const lower = text.toLowerCase();
    if (lower.includes('rib') || lower.includes('carte bancaire') || lower.includes('mot de passe')) {
      setSafetyAlert('Alerte sécurité Allo-Allo : Ne partagez jamais vos données bancaires dans le chat.');
      setTimeout(() => setSafetyAlert(null), 5000);
    }

    const msg = buildMessage({
      text: text.slice(0, 2000),
      isEphemeral: isEphemeralMode || undefined,
      ephemeralSeconds: isEphemeralMode ? 20 : undefined,
      expiresAt: isEphemeralMode ? new Date(Date.now() + 20000).toISOString() : undefined,
    });
    if (!msg) return;
    setInputText('');
    pushOutgoing(msg);
  };

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 900, 900, 0.75);
      const msg = buildMessage({ mediaType: 'image', mediaUrl: dataUrl });
      if (msg) pushOutgoing(msg);
    } catch {
      showNotice("Impossible de charger cette image.");
    }
  };

  const handleSendVoiceNote = () => {
    if (!activeMatch || isRecordingVoice) return;
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      const msg = buildMessage({ mediaType: 'voice', mediaUrl: '', voiceDuration: 8 });
      if (msg) pushOutgoing(msg);
    }, 1400);
  };

  const handleRetry = async (msg: ChatMessage) => {
    const convId = msg.matchId;
    setThreads(prev => ({
      ...prev,
      [convId]: (prev[convId] || []).map(m => (m.id === msg.id ? { ...m, status: 'sending' } : m)),
    }));
    const ok = await sendMessageToServer({ ...msg, status: undefined });
    setThreads(prev => ({
      ...prev,
      [convId]: (prev[convId] || []).map(m => (m.id === msg.id ? { ...m, status: ok ? 'sent' : 'failed' } : m)),
    }));
  };

  // --- Suppression d'un message ---
  const performDeleteMessage = async (msg: ChatMessage, scope: 'me' | 'all') => {
    setConfirm(null);
    setSelectedMsgId(null);
    setThreads(prev => ({
      ...prev,
      [msg.matchId]: (prev[msg.matchId] || []).filter(m => m.id !== msg.id),
    }));
    // Un message jamais arrivé sur le serveur n'a rien à y supprimer
    if (msg.status === 'sending' || msg.status === 'failed') return;
    const ok = await deleteMessageOnServer(msg.id, uid, scope);
    if (!ok) showNotice('Suppression impossible pour le moment. Vérifiez votre connexion.');
  };

  // --- Suppression d'une conversation (pour moi uniquement) ---
  const performDeleteConversation = async (match: Match) => {
    const convId = conversationId(uid, match.partnerProfile.id);
    setConfirm(null);
    deletingConvs.current.add(convId);
    setThreads(prev => {
      const next = { ...prev };
      delete next[convId];
      return next;
    });
    setPreviews(prev => {
      const next = { ...prev };
      delete next[convId];
      return next;
    });
    setHidden(prev => ({ ...prev, [convId]: new Date().toISOString() }));
    if (activeMatchId === match.id) setActiveMatchId(null);

    const ok = await deleteConversationOnServer(convId, uid);
    deletingConvs.current.delete(convId);
    if (!ok) {
      showNotice('Conversation retirée de cet écran, mais la suppression serveur a échoué. Réessayez plus tard.');
    }
  };

  const previewFor = (m: Match): ChatMessage | undefined => previews[conversationId(uid, m.partnerProfile.id)];

  // Une conversation supprimée reste cachée tant qu'aucun nouveau message n'est arrivé
  const visibleConversations = matches.filter(m => {
    const convId = conversationId(uid, m.partnerProfile.id);
    return !(convId in hidden) || !!previews[convId];
  });

  // ============================ RENDU ============================

  if (isGuest) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#090b10] max-w-lg mx-auto p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7 text-rose-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Connectez-vous pour discuter</h2>
        <p className="text-xs text-gray-400 mb-5 max-w-xs leading-relaxed">
          La messagerie est personnelle et privée : il faut un compte Allo-Allo pour que vos conversations restent bien les vôtres.
        </p>
        <div className="flex items-center gap-2">
          {onGoToLogin && (
            <button
              onClick={onGoToLogin}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
            >
              <LogIn className="w-4 h-4" /> Se connecter
            </button>
          )}
          {onGoToRegister && (
            <button
              onClick={onGoToRegister}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
            >
              <UserPlus className="w-4 h-4" /> Créer un compte
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#090b10] max-w-lg mx-auto overflow-hidden relative">
      {notice && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-[#1a1f2e] border border-white/15 text-white text-[11px] px-3 py-2 rounded-xl shadow-xl max-w-[90%] text-center">
          {notice}
        </div>
      )}

      {/* Fenêtre de confirmation */}
      {confirm && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
          <div className="bg-[#121623] border border-white/15 rounded-2xl p-5 w-full max-w-xs shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1.5">
              {confirm.kind === 'conversation'
                ? `Supprimer la conversation avec ${confirm.match.partnerProfile.name} ?`
                : confirm.scope === 'all'
                  ? 'Supprimer ce message pour tout le monde ?'
                  : 'Supprimer ce message pour vous ?'}
            </h3>
            <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
              {confirm.kind === 'conversation'
                ? "Tous les messages disparaîtront de votre côté. L'autre personne garde sa propre copie."
                : confirm.scope === 'all'
                  ? "Le message sera retiré de la conversation pour vous et pour votre correspondant."
                  : "Le message restera visible pour votre correspondant."}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={() =>
                  confirm.kind === 'conversation'
                    ? performDeleteConversation(confirm.match)
                    : performDeleteMessage(confirm.message, confirm.scope)
                }
                className="px-3.5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {!activeMatch ? (
        /* Liste des conversations */
        <div className="flex-1 flex flex-col p-4 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-white">Messages & Matchs</h2>
          </div>

          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 mb-2">Matchs & Contacts</p>
            <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
              {matches.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setActiveMatchId(m.id)}
                  className="flex flex-col items-center space-y-1.5 cursor-pointer shrink-0 group"
                >
                  <div className="relative">
                    <img
                      src={m.partnerProfile.photos[0]}
                      alt={m.partnerProfile.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-rose-500 p-0.5 group-hover:scale-105 transition shadow-lg"
                    />
                  </div>
                  <span className="text-xs font-semibold text-white truncate max-w-[65px]">
                    {m.partnerProfile.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 mb-1">Discussions actives</p>
            {visibleConversations.length === 0 && (
              <p className="text-xs text-gray-500 py-6 text-center">
                Aucune discussion. Touchez un contact ci-dessus pour écrire le premier message.
              </p>
            )}
            {visibleConversations.map((m) => {
              const last = previewFor(m);
              return (
                <div
                  key={m.id}
                  onClick={() => setActiveMatchId(m.id)}
                  className="p-3 rounded-2xl border transition flex items-center space-x-3 cursor-pointer bg-[#101420] border-white/10 hover:border-white/20"
                >
                  <div className="relative shrink-0">
                    <img
                      src={m.partnerProfile.photos[0]}
                      alt={m.partnerProfile.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    {m.partnerProfile.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20 absolute -top-1 -right-1 bg-[#101420] rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white truncate">{m.partnerProfile.name}</h4>
                      <span className="text-[10px] text-gray-400">{last ? last.timestamp : ''}</span>
                    </div>
                    <p className="text-xs text-gray-300 truncate mt-0.5">
                      {last
                        ? (last.senderId === uid ? 'Vous : ' : '') + previewText(last)
                        : 'Envoyer un premier message...'}
                    </p>
                    <span className="text-[10px] text-rose-400 font-medium">{m.partnerProfile.currentCity}</span>
                  </div>

                  <button
                    type="button"
                    aria-label={`Supprimer la conversation avec ${m.partnerProfile.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirm({ kind: 'conversation', match: m });
                    }}
                    className="p-2 text-gray-500 hover:text-rose-400 hover:bg-white/5 rounded-full transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Conversation ouverte */
        <div className="flex-1 flex flex-col h-full min-h-0">
          <div className="px-3 py-2 bg-[#0d1017] border-b border-white/10 flex items-center justify-between z-20">
            <div className="flex items-center space-x-2 min-w-0">
              <button
                onClick={() => setActiveMatchId(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div
                className="flex items-center space-x-2 cursor-pointer min-w-0"
                onClick={() => onOpenProfile(activeMatch.partnerProfile)}
              >
                <img
                  src={activeMatch.partnerProfile.photos[0]}
                  alt={activeMatch.partnerProfile.name}
                  className="w-10 h-10 rounded-full object-cover border border-rose-500 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center space-x-1">
                    <h4 className="text-sm font-bold text-white leading-none truncate">
                      {activeMatch.partnerProfile.name}
                    </h4>
                    {activeMatch.partnerProfile.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5 block truncate">
                    {activeMatch.partnerProfile.currentCity}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsEphemeralMode(!isEphemeralMode)}
                className={`p-2 rounded-full transition ${
                  isEphemeralMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-gray-400 hover:text-white'
                }`}
                title={isEphemeralMode ? 'Mode Éphémère activé (20s)' : 'Activer les messages éphémères'}
              >
                <Clock className="w-4 h-4" />
              </button>

              <button
                id="voice-call-btn"
                onClick={() => onStartCall(activeMatch.partnerProfile, false)}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition"
                title="Lancer un appel audio"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                id="video-call-btn"
                onClick={() => onStartCall(activeMatch.partnerProfile, true)}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition"
                title="Lancer un appel vidéo"
              >
                <Video className="w-4 h-4 text-rose-400" />
              </button>

              <button
                onClick={() => setConfirm({ kind: 'conversation', match: activeMatch })}
                className="p-2 text-gray-400 hover:text-rose-400 hover:bg-white/10 rounded-full transition"
                title="Supprimer la conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {safetyAlert && (
            <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-[11px] px-3 py-2">
              {safetyAlert}
            </div>
          )}

          {/* Fil de messages : uniquement ceux de CETTE conversation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar" onClick={() => setSelectedMsgId(null)}>
            {visibleMessages.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-10">
                Aucun message. Dites bonjour à {activeMatch.partnerProfile.name.split(' ')[0]} 👋
              </p>
            )}
            {visibleMessages.map((msg) => {
              const isSentByMe = msg.senderId === uid;
              const isSelected = selectedMsgId === msg.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'}`}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMsgId(isSelected ? null : msg.id);
                    }}
                    className={`relative max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-md cursor-pointer ${
                      isSentByMe
                        ? 'bg-rose-600 text-white rounded-br-xs'
                        : 'bg-[#151926] text-gray-200 border border-white/10 rounded-bl-xs'
                    } ${msg.status === 'failed' ? 'opacity-70 ring-1 ring-red-400' : ''}`}
                  >
                    {msg.isEphemeral && (
                      <div className="flex items-center space-x-1 text-[10px] text-amber-200 mb-1 font-semibold">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>Message éphémère</span>
                      </div>
                    )}

                    {msg.mediaType === 'text' && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}

                    {msg.mediaType === 'image' && (
                      <div className="space-y-1">
                        {msg.mediaUrl ? (
                          <img
                            src={msg.mediaUrl}
                            alt="Photo partagée"
                            className="rounded-xl max-h-52 w-full object-cover border border-white/15"
                          />
                        ) : (
                          <div className="rounded-xl h-24 w-40 bg-black/30 flex items-center justify-center text-[10px] text-gray-400">
                            Chargement de la photo…
                          </div>
                        )}
                        {msg.text && <p className="pt-1">{msg.text}</p>}
                      </div>
                    )}

                    {msg.mediaType === 'voice' && (
                      <div className="flex items-center space-x-2 py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayVoice(msg.id);
                          }}
                          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition active:scale-95"
                        >
                          {playingVoiceId === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <div className="flex items-center space-x-1">
                          {[3, 7, 12, 8, 4, 11, 14, 9, 6, 12, 5, 8].map((h, i) => (
                            <span
                              key={i}
                              style={{ height: `${h}px` }}
                              className={`w-0.5 rounded-full ${
                                playingVoiceId === msg.id ? 'bg-white animate-pulse' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-white/80">{msg.voiceDuration || 8}s</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-1 mt-1 text-[9px] opacity-70">
                      <span>{msg.timestamp}</span>
                      {isSentByMe && msg.status === 'sending' && <Clock className="w-3 h-3" />}
                      {isSentByMe && msg.status !== 'sending' && msg.status !== 'failed' && (
                        <CheckCheck className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>

                  {msg.status === 'failed' && (
                    <button
                      onClick={() => handleRetry(msg)}
                      className="mt-1 flex items-center gap-1 text-[10px] text-red-300 hover:text-red-200 font-semibold"
                    >
                      <AlertCircle className="w-3 h-3" /> Échec de l'envoi — Réessayer
                    </button>
                  )}

                  {isSelected && (
                    <div className={`mt-1 flex items-center gap-1.5 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirm({ kind: 'message', message: msg, scope: 'me' });
                        }}
                        className="flex items-center gap-1 text-[10px] font-semibold bg-white/10 hover:bg-white/15 text-gray-200 px-2.5 py-1 rounded-full"
                      >
                        <Trash2 className="w-3 h-3" /> Supprimer pour moi
                      </button>
                      {isSentByMe && msg.status !== 'failed' && msg.status !== 'sending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirm({ kind: 'message', message: msg, scope: 'all' });
                          }}
                          className="flex items-center gap-1 text-[10px] font-semibold bg-rose-600/80 hover:bg-rose-600 text-white px-2.5 py-1 rounded-full"
                        >
                          <Trash2 className="w-3 h-3" /> Pour tout le monde
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMsgId(null);
                        }}
                        className="p-1 text-gray-500 hover:text-white"
                        aria-label="Fermer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {isRecordingVoice && (
            <div className="bg-rose-500/20 border-t border-rose-500/30 px-4 py-2 flex items-center justify-between text-xs text-rose-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Enregistrement vocal en cours...
              </span>
              <span className="text-[10px] text-gray-400">Envoi automatique</span>
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-[#0d1017] border-t border-white/10 flex items-center space-x-2"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition"
              title="Partager une photo"
            >
              <ImageIcon className="w-5 h-5 text-rose-400" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelected} />

            <button
              type="button"
              onClick={handleSendVoiceNote}
              className={`p-2 rounded-full transition ${
                isRecordingVoice ? 'bg-rose-600 text-white animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Envoyer une note vocale"
            >
              <Mic className="w-5 h-5 text-amber-400" />
            </button>

            <input
              type="text"
              value={inputText}
              maxLength={2000}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message à ${activeMatch.partnerProfile.name.split(' ')[0]}...`}
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white rounded-full transition active:scale-95 shadow-md shadow-rose-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
