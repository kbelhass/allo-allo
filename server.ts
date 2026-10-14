import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import cors from 'cors';
import pg from 'pg';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Derrière le reverse proxy Caddy (Oracle Cloud) : on récupère la vraie IP du client
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// En-têtes de sécurité de base
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const DB_FILE = path.join(process.cwd(), 'server_profiles_db.json');
const MESSAGES_FILE = path.join(process.cwd(), 'server_messages_db.json');

// Si DATABASE_URL est défini (PostgreSQL), les données survivent aux redémarrages et mises à jour.
// Sans DATABASE_URL : repli sur des fichiers JSON locaux (pratique pour tester sur son PC).
// DATABASE_SSL=true uniquement pour une base distante qui impose SSL (Neon, Oracle Autonomous...).
// Le PostgreSQL du docker-compose est local au serveur : pas de SSL.
const pool = process.env.DATABASE_URL
  ? new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 10,
    })
  : null;

// Default initial profiles seed
const INITIAL_DEFAULT_PROFILES = [
  {
    id: 'usr_nour',
    name: 'Nour',
    age: 25,
    gender: 'woman',
    status: 'local',
    currentCity: 'La Marsa, Tunis',
    currentCountry: 'Tunisie',
    originCity: 'Tunis',
    distanceKm: 4,
    bio: 'Architecte d’intérieur & amoureuse de Sidi Bou Saïd. J’adore cuisiner le vrai couscous au mérou et refaire le monde devant un café direct au coucher du soleil 🌅☕',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
    ],
    jobTitle: 'Architecte d’intérieur',
    education: 'ENAU Sidi Bou Said',
    interests: ['Architecture', 'Café Direct', 'Carthage', 'Plage La Marsa', 'Art contemporain'],
    languages: ['Arabe tunisien (Darija)', 'Français', 'Anglais'],
    isVerified: true,
    isPremium: true,
    isBoosted: true,
    discreetMode: false,
    hideExactLocation: true,
    onlineStatus: 'online'
  },
  {
    id: 'usr_yassine',
    name: 'Yassine',
    age: 28,
    gender: 'man',
    status: 'diaspora',
    currentCity: 'Paris',
    currentCountry: 'France',
    originCity: 'Sousse',
    distanceKm: 1480,
    bio: 'Ingénieur IA à Paris 🗼 mais mon cœur bat toujours au rythme du Sahel et de la plage de Boujaafar 🏖️. De retour au pays chaque été et pour les fêtes !',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80'
    ],
    jobTitle: 'Ingénieur IA & Tech Lead',
    education: 'INSAT Tunis & Télécom Paris',
    interests: ['Tech & Startups', 'Sousse', 'Tennis', 'Gastronomie tunisienne', 'Voyages'],
    languages: ['Arabe tunisien', 'Français', 'Anglais'],
    isVerified: true,
    isPremium: false,
    discreetMode: false,
    hideExactLocation: true,
    onlineStatus: 'online'
  },
  {
    id: 'usr_karim_wife',
    name: 'Meriem',
    age: 26,
    gender: 'woman',
    status: 'local',
    currentCity: 'Tunis',
    currentCountry: 'Tunisie',
    originCity: 'Monastir',
    distanceKm: 2,
    bio: 'Designer UX/UI & photographe passionnée 📸. J’aime les balades dans la Médina, la cuisine tunisienne moderne et les discussions profondes.',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
    ],
    jobTitle: 'Product Designer',
    education: 'ESSTED Tunis',
    interests: ['Design', 'Café Direct', 'Photographie', 'Médina de Tunis', 'Musique'],
    languages: ['Arabe tunisien', 'Français', 'Anglais'],
    isVerified: true,
    isPremium: true,
    discreetMode: false,
    hideExactLocation: true,
    onlineStatus: 'online'
  }
];

let serverProfiles: any[] = [];
let serverAccounts: any[] = [];

async function loadDb() {
  if (pool) {
    await pool.query(`CREATE TABLE IF NOT EXISTS app_state (key TEXT PRIMARY KEY, value JSONB NOT NULL)`);
    const { rows } = await pool.query(`SELECT value FROM app_state WHERE key = 'allo_allo_db'`);
    if (rows.length > 0) {
      const parsed = rows[0].value;
      serverProfiles = parsed.profiles || [];
      serverAccounts = parsed.accounts || [];
    }
  } else {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        serverProfiles = parsed.profiles || [];
        serverAccounts = parsed.accounts || [];
        }
    } catch (e) {
      console.error('Failed to read profiles DB file:', e);
    }
  }

  if (!serverProfiles || serverProfiles.length === 0) {
    serverProfiles = [...INITIAL_DEFAULT_PROFILES];
  }
}

let lastPersistedSnapshot = '';

async function persistDb() {
  const payload = {
    profiles: serverProfiles,
    accounts: serverAccounts,
  };

  // Le client synchronise très souvent : on n'écrit en base que si quelque chose a réellement changé
  const snapshot = JSON.stringify(payload);
  if (snapshot === lastPersistedSnapshot) return;

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO app_state (key, value) VALUES ('allo_allo_db', $1)
         ON CONFLICT (key) DO UPDATE SET value = $1`,
        [snapshot]
      );
      lastPersistedSnapshot = snapshot;
    } catch (e) {
      console.error('Failed to write to Postgres:', e);
    }
  } else {
    try {
      fs.writeFileSync(DB_FILE, snapshot);
      lastPersistedSnapshot = snapshot;
    } catch (e) {
      console.error('Failed to write profiles DB file:', e);
    }
  }
}

// API Routes
app.get('/api/health', async (req, res) => {
  try {
    if (pool) await pool.query('SELECT 1');
    res.json({ status: 'ok', db: pool ? 'postgres' : 'file', time: new Date().toISOString() });
  } catch (e) {
    res.status(503).json({ status: 'db_error' });
  }
});

// GET all profiles (synced across all phones & PCs)
app.get('/api/profiles', (req, res) => {
  res.json({ profiles: serverProfiles });
});

// POST new or updated profile
app.post('/api/profiles', async (req, res) => {
  const { profile } = req.body;
  if (!profile || !profile.id) {
    return res.status(400).json({ error: 'Profile data missing or invalid' });
  }

  const existingIndex = serverProfiles.findIndex(p => p.id === profile.id);
  if (existingIndex >= 0) {
    serverProfiles[existingIndex] = { ...serverProfiles[existingIndex], ...profile };
  } else {
    // Put newly registered profile right at the very top so everyone on PC and smartphone sees it immediately
    serverProfiles.unshift(profile);
  }

  // Also add to registered accounts if not exists
  const accIndex = serverAccounts.findIndex(a => a.id === profile.id);
  if (accIndex >= 0) {
    serverAccounts[accIndex] = { ...serverAccounts[accIndex], ...profile };
  } else {
    serverAccounts.unshift(profile);
  }

  await persistDb();
  console.log(`[Allo-Allo Server] Profile updated/registered: ${profile.name} (${profile.id})`);
  res.json({ success: true, profiles: serverProfiles, accounts: serverAccounts, profile });
});

// PUT update profile
app.put('/api/profiles/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const index = serverProfiles.findIndex(p => p.id === id);
  if (index >= 0) {
    serverProfiles[index] = { ...serverProfiles[index], ...updates };
    
    // Also update in accounts
    const accIndex = serverAccounts.findIndex(a => a.id === id);
    if (accIndex >= 0) {
      serverAccounts[accIndex] = { ...serverAccounts[accIndex], ...updates };
    }
    
    await persistDb();
    res.json({ success: true, profile: serverProfiles[index] });
  } else {
    res.status(404).json({ error: 'Profile not found' });
  }
});

// GET all registered accounts for 1-click login across devices
app.get('/api/accounts', (req, res) => {
  res.json({ accounts: serverAccounts });
});

// SYNC endpoint: Merges client list with server list and returns unified master list
app.post('/api/sync', async (req, res) => {
  const { localProfiles, localAccounts } = req.body;
  
  if (Array.isArray(localProfiles)) {
    for (const lp of localProfiles) {
      if (lp && lp.id) {
        const idx = serverProfiles.findIndex(sp => sp.id === lp.id);
        if (idx === -1) {
          serverProfiles.unshift(lp);
        } else {
          // Update with latest local changes
          serverProfiles[idx] = { ...serverProfiles[idx], ...lp };
        }
      }
    }
  }

  if (Array.isArray(localAccounts)) {
    for (const la of localAccounts) {
      if (la && la.id) {
        const idx = serverAccounts.findIndex(sa => sa.id === la.id);
        if (idx === -1) {
          serverAccounts.unshift(la);
        } else {
          serverAccounts[idx] = { ...serverAccounts[idx], ...la };
        }
      }
    }
  }

  await persistDb();
  res.json({
    success: true,
    profiles: serverProfiles,
    accounts: serverAccounts
  });
});

// ============================================================================
// MESSAGERIE
// Chaque message appartient à UNE conversation (matchId = "conv~<idA>~<idB>", ids triés).
// - suppression "pour moi"        -> hidden_for (l'autre personne garde le message)
// - suppression "pour tous"       -> deleted_for_all (auteur uniquement)
// - suppression de conversation   -> cache tous les messages pour moi seulement
// - messages éphémères            -> expires_at, purgés côté serveur
// ============================================================================

interface StoredMessage {
  id: string;
  matchId: string;
  senderId: string;
  createdAt: string;
  expiresAt: string | null;
  deletedForAll: boolean;
  hiddenFor: string[];
  body: Record<string, any>;
}

function participantsOf(matchId: string): string[] {
  const parts = String(matchId || '').split('~');
  return parts.length === 3 && parts[0] === 'conv' && parts[1] && parts[2] ? [parts[1], parts[2]] : [];
}

let fileMessages: StoredMessage[] = [];
let fileMessagesTimer: NodeJS.Timeout | null = null;

function scheduleFileMessagesSave() {
  if (fileMessagesTimer) return;
  fileMessagesTimer = setTimeout(() => {
    fileMessagesTimer = null;
    try {
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(fileMessages));
    } catch (e) {
      console.error('Failed to write messages file:', e);
    }
  }, 300);
}

const isVisibleTo = (m: StoredMessage, userId: string) =>
  !m.deletedForAll &&
  !m.hiddenFor.includes(userId) &&
  (!m.expiresAt || new Date(m.expiresAt).getTime() > Date.now());

const messageStore = {
  async init() {
    if (pool) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          match_id TEXT NOT NULL,
          sender_id TEXT NOT NULL,
          body JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          expires_at TIMESTAMPTZ,
          deleted_for_all BOOLEAN NOT NULL DEFAULT FALSE,
          hidden_for TEXT[] NOT NULL DEFAULT '{}'
        )`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_match ON messages (match_id, created_at)`);
    } else if (fs.existsSync(MESSAGES_FILE)) {
      try {
        fileMessages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
      } catch (e) {
        console.error('Failed to read messages file:', e);
      }
    }
  },

  async list(matchId: string, userId: string): Promise<Record<string, any>[]> {
    if (pool) {
      const { rows } = await pool.query(
        `SELECT body FROM messages
         WHERE match_id = $1 AND deleted_for_all = FALSE AND NOT ($2 = ANY(hidden_for))
           AND (expires_at IS NULL OR expires_at > NOW())
         ORDER BY created_at ASC, id ASC LIMIT 500`,
        [matchId, userId]
      );
      return rows.map(r => r.body);
    }
    return fileMessages
      .filter(m => m.matchId === matchId && isVisibleTo(m, userId))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(-500)
      .map(m => m.body);
  },

  async insert(m: StoredMessage): Promise<boolean> {
    if (pool) {
      const r = await pool.query(
        `INSERT INTO messages (id, match_id, sender_id, body, created_at, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [m.id, m.matchId, m.senderId, JSON.stringify(m.body), m.createdAt, m.expiresAt]
      );
      return (r.rowCount ?? 0) > 0;
    }
    if (fileMessages.some(x => x.id === m.id)) return false;
    fileMessages.push(m);
    scheduleFileMessagesSave();
    return true;
  },

  async remove(id: string, userId: string, scope: 'me' | 'all'): Promise<'ok' | 'notfound' | 'forbidden'> {
    let matchId: string | undefined;
    let senderId: string | undefined;
    if (pool) {
      const { rows } = await pool.query(`SELECT match_id, sender_id FROM messages WHERE id = $1`, [id]);
      if (rows.length === 0) return 'notfound';
      matchId = rows[0].match_id;
      senderId = rows[0].sender_id;
    } else {
      const m = fileMessages.find(x => x.id === id);
      if (!m) return 'notfound';
      matchId = m.matchId;
      senderId = m.senderId;
    }
    if (!participantsOf(matchId!).includes(userId)) return 'forbidden';
    if (scope === 'all' && senderId !== userId) return 'forbidden';

    if (pool) {
      if (scope === 'all') {
        // On vide aussi le contenu (photo comprise) : le message est réellement effacé
        await pool.query(`UPDATE messages SET deleted_for_all = TRUE, body = '{}'::jsonb WHERE id = $1`, [id]);
      } else {
        await pool.query(
          `UPDATE messages SET hidden_for = array_append(hidden_for, $2)
           WHERE id = $1 AND NOT ($2 = ANY(hidden_for))`,
          [id, userId]
        );
      }
    } else {
      const m = fileMessages.find(x => x.id === id)!;
      if (scope === 'all') {
        m.deletedForAll = true;
        m.body = {};
      } else if (!m.hiddenFor.includes(userId)) {
        m.hiddenFor.push(userId);
      }
      scheduleFileMessagesSave();
    }
    return 'ok';
  },

  async clearConversation(matchId: string, userId: string): Promise<void> {
    if (pool) {
      await pool.query(
        `UPDATE messages SET hidden_for = array_append(hidden_for, $2)
         WHERE match_id = $1 AND NOT ($2 = ANY(hidden_for))`,
        [matchId, userId]
      );
    } else {
      for (const m of fileMessages) {
        if (m.matchId === matchId && !m.hiddenFor.includes(userId)) m.hiddenFor.push(userId);
      }
      scheduleFileMessagesSave();
    }
  },

  async previews(userId: string): Promise<{ matchId: string; lastMessage: Record<string, any> }[]> {
    if (pool) {
      const { rows } = await pool.query(
        `SELECT DISTINCT ON (match_id) match_id, body FROM messages
         WHERE (split_part(match_id, '~', 2) = $1 OR split_part(match_id, '~', 3) = $1)
           AND deleted_for_all = FALSE AND NOT ($1 = ANY(hidden_for))
           AND (expires_at IS NULL OR expires_at > NOW())
         ORDER BY match_id, created_at DESC`,
        [userId]
      );
      return rows.map(r => ({
        matchId: r.match_id,
        // L'aperçu n'a pas besoin de transporter la photo en entier
        lastMessage: { ...r.body, mediaUrl: r.body.mediaType === 'image' ? undefined : r.body.mediaUrl },
      }));
    }
    const latest = new Map<string, StoredMessage>();
    for (const m of fileMessages) {
      if (!participantsOf(m.matchId).includes(userId) || !isVisibleTo(m, userId)) continue;
      const cur = latest.get(m.matchId);
      if (!cur || m.createdAt > cur.createdAt) latest.set(m.matchId, m);
    }
    return Array.from(latest.values()).map(m => ({
      matchId: m.matchId,
      lastMessage: { ...m.body, mediaUrl: m.body.mediaType === 'image' ? undefined : m.body.mediaUrl },
    }));
  },

  // Supprime physiquement ce que plus personne ne peut voir (libère de la place)
  async purge(): Promise<void> {
    try {
      if (pool) {
        await pool.query(
          `DELETE FROM messages
           WHERE deleted_for_all = TRUE OR cardinality(hidden_for) >= 2
              OR (expires_at IS NOT NULL AND expires_at < NOW() - INTERVAL '1 minute')`
        );
      } else {
        const before = fileMessages.length;
        fileMessages = fileMessages.filter(
          m =>
            !(m.deletedForAll || m.hiddenFor.length >= 2 || (m.expiresAt && new Date(m.expiresAt).getTime() < Date.now() - 60000))
        );
        if (fileMessages.length !== before) scheduleFileMessagesSave();
      }
    } catch (e) {
      console.error('Message purge failed:', e);
    }
  },
};

// Petit limiteur en mémoire (anti-spam / anti force brute)
function makeLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string): boolean => {
    const nowMs = Date.now();
    const recent = (hits.get(key) || []).filter(t => nowMs - t < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return false;
    }
    recent.push(nowMs);
    hits.set(key, recent);
    return true;
  };
}
const messageLimiter = makeLimiter(60, 60_000); // 60 messages / minute / expéditeur
const adminLoginLimiter = makeLimiter(5, 15 * 60_000); // 5 essais / 15 min / IP

const MEDIA_TYPES = new Set(['text', 'image', 'voice', 'video']);
const asUserId = (v: unknown): string => (typeof v === 'string' ? v.trim().slice(0, 120) : '');

// GET : messages d'UNE conversation, tels que CET utilisateur doit les voir
app.get('/api/messages/:matchId', async (req, res) => {
  const { matchId } = req.params;
  const userId = asUserId(req.query.userId);
  if (!userId || !participantsOf(matchId).includes(userId)) {
    return res.status(403).json({ error: 'Accès refusé à cette conversation.' });
  }
  try {
    res.json({ messages: await messageStore.list(matchId, userId) });
  } catch (e) {
    console.error('List messages failed:', e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST : nouveau message
app.post('/api/messages', async (req, res) => {
  const raw = req.body?.message;
  if (!raw || typeof raw !== 'object') return res.status(400).json({ error: 'Message invalide.' });

  const id = typeof raw.id === 'string' ? raw.id.slice(0, 100) : '';
  const matchId = typeof raw.matchId === 'string' ? raw.matchId : '';
  const senderId = asUserId(raw.senderId);
  const mediaType = MEDIA_TYPES.has(raw.mediaType) ? raw.mediaType : 'text';

  if (!id || !senderId || !participantsOf(matchId).includes(senderId)) {
    return res.status(400).json({ error: "Message invalide (id, conversation ou expéditeur)." });
  }
  if (!messageLimiter(senderId)) {
    return res.status(429).json({ error: 'Trop de messages, patientez un instant.' });
  }

  const text = typeof raw.text === 'string' ? raw.text.slice(0, 2000) : undefined;
  if (mediaType === 'text' && !(text && text.trim())) {
    return res.status(400).json({ error: 'Message vide.' });
  }

  let mediaUrl: string | undefined;
  if (typeof raw.mediaUrl === 'string' && raw.mediaUrl.length > 0) {
    const okPrefix = raw.mediaUrl.startsWith('data:image/') || raw.mediaUrl.startsWith('data:audio/');
    if (!okPrefix || raw.mediaUrl.length > 4_000_000) {
      return res.status(413).json({ error: 'Média refusé (format ou taille).' });
    }
    mediaUrl = raw.mediaUrl;
  }
  if (mediaType === 'image' && !mediaUrl) return res.status(400).json({ error: 'Image manquante.' });

  const nowMs = Date.now();
  let createdMs = Date.parse(raw.createdAt);
  if (!Number.isFinite(createdMs) || createdMs > nowMs + 5 * 60_000) createdMs = nowMs;
  const createdAt = new Date(createdMs).toISOString();

  const isEphemeral = raw.isEphemeral === true;
  const ephemeralSeconds = isEphemeral ? Math.min(Math.max(Number(raw.ephemeralSeconds) || 20, 5), 86_400) : undefined;
  const expiresAt = isEphemeral ? new Date(nowMs + ephemeralSeconds! * 1000).toISOString() : null;

  // On ne garde que les champs connus (rien d'autre n'est stocké)
  const body: Record<string, any> = {
    id,
    matchId,
    senderId,
    mediaType,
    createdAt,
    timestamp: typeof raw.timestamp === 'string' ? raw.timestamp.slice(0, 10) : '',
  };
  if (text !== undefined) body.text = text;
  if (mediaUrl) body.mediaUrl = mediaUrl;
  if (mediaType === 'voice') body.voiceDuration = Math.min(Math.max(Number(raw.voiceDuration) || 8, 1), 300);
  if (isEphemeral) {
    body.isEphemeral = true;
    body.ephemeralSeconds = ephemeralSeconds;
    body.expiresAt = expiresAt;
  }

  try {
    await messageStore.insert({
      id,
      matchId,
      senderId,
      createdAt,
      expiresAt,
      deletedForAll: false,
      hiddenFor: [],
      body,
    });
    res.json({ success: true });
  } catch (e) {
    console.error('Insert message failed:', e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE : un message (scope=me : pour moi / scope=all : pour tout le monde, auteur uniquement)
app.delete('/api/messages/:id', async (req, res) => {
  const userId = asUserId(req.query.userId);
  const scope = req.query.scope === 'all' ? 'all' : 'me';
  if (!userId) return res.status(400).json({ error: 'userId requis.' });
  try {
    const result = await messageStore.remove(req.params.id, userId, scope);
    if (result === 'notfound') return res.status(404).json({ error: 'Message introuvable.' });
    if (result === 'forbidden') return res.status(403).json({ error: 'Suppression non autorisée.' });
    res.json({ success: true });
  } catch (e) {
    console.error('Delete message failed:', e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE : une conversation entière (pour moi uniquement)
app.delete('/api/conversations/:matchId', async (req, res) => {
  const userId = asUserId(req.query.userId);
  if (!userId || !participantsOf(req.params.matchId).includes(userId)) {
    return res.status(403).json({ error: 'Accès refusé à cette conversation.' });
  }
  try {
    await messageStore.clearConversation(req.params.matchId, userId);
    res.json({ success: true });
  } catch (e) {
    console.error('Delete conversation failed:', e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET : dernier message de chacune de mes conversations (aperçus de la liste)
app.get('/api/conversations', async (req, res) => {
  const userId = asUserId(req.query.userId);
  if (!userId) return res.status(400).json({ error: 'userId requis.' });
  try {
    res.json({ conversations: await messageStore.previews(userId) });
  } catch (e) {
    console.error('Conversation previews failed:', e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ============================================================================
// CONNEXION ADMINISTRATEUR (vérifiée côté serveur)
// Les identifiants viennent des variables d'environnement ADMIN_EMAIL / ADMIN_PASSWORD.
// Sans elles, la connexion admin est désactivée (aucun mot de passe par défaut).
// ============================================================================
const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest();
const safeEqual = (a: string, b: string) => crypto.timingSafeEqual(sha256(a), sha256(b));

app.post('/api/admin/login', (req, res) => {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  if (!adminEmail || !adminPassword) {
    return res.status(503).json({ error: "Connexion administrateur non configurée sur le serveur." });
  }
  if (!adminLoginLimiter(req.ip || 'unknown')) {
    return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
  }
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  // Les deux comparaisons sont toujours faites (pas de fuite d'information par le temps de réponse)
  const emailOk = safeEqual(email, adminEmail);
  const passOk = safeEqual(password, adminPassword);
  if (emailOk && passOk) return res.json({ success: true });
  res.status(401).json({ error: 'Identifiants administrateur incorrects.' });
});

// Démarrage : API + (dev) Vite en middleware ou (prod) fichiers statiques du build
async function startServer() {
  await loadDb();
  await messageStore.init();
  await messageStore.purge();
  setInterval(() => messageStore.purge(), 10 * 60_000);
  console.log(`[Allo-Allo Server] Persistence: ${pool ? 'PostgreSQL (DATABASE_URL)' : 'fichiers JSON locaux'}`);
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.warn('[Allo-Allo Server] ADMIN_EMAIL / ADMIN_PASSWORD non définis : connexion admin désactivée.');
  }

  if (process.env.NODE_ENV !== 'production') {
    // Import dynamique : Vite n'est chargé qu'en développement (production plus légère et rapide)
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Allo-Allo Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });

  // Arrêt propre quand Docker redémarre le conteneur
  const shutdown = () => {
    server.close(() => {
      (pool ? pool.end() : Promise.resolve()).finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Échec du démarrage du serveur:', err);
  process.exit(1);
});
