export type UserStatus = 'diaspora' | 'local' | 'foreigner';
export type Gender = 'man' | 'woman' | 'non_binary';
export type VisibilityScope = 'everyone' | 'diaspora_only' | 'locals_only' | 'matches_only';

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  status: UserStatus;
  currentCity: string;
  currentCountry: string;
  originCity?: string; // Ex: Originaire de Djerba, vivant à Paris
  distanceKm: number;
  bio: string;
  photos: string[];
  videoIntroUrl?: string;
  voiceIntroUrl?: string; // Audio intro 10s
  voiceIntroDuration?: number;
  jobTitle: string;
  education?: string;
  interests: string[];
  languages: string[];
  isVerified: boolean;
  isPremium: boolean;
  isBoosted?: boolean;
  discreetMode?: boolean;
  hideExactLocation?: boolean;
  onlineStatus: 'online' | 'recent' | 'offline';
  email?: string;
  phoneNumber?: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  createdAt?: string;
  passwordHash?: string; // SHA-256 hex digest, never the plaintext password
}

export interface Match {
  id: string;
  partnerProfile: Profile;
  matchedAt: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTimestamp?: string;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  text?: string;
  mediaType: 'text' | 'image' | 'voice' | 'video';
  mediaUrl?: string;
  voiceDuration?: number;
  isEphemeral?: boolean;
  ephemeralSeconds?: number;
  isViewed?: boolean;
  expiresAt?: string; // messages éphémères : date d'expiration (ISO)
  status?: 'sending' | 'sent' | 'failed'; // état d'envoi côté client uniquement
  createdAt: string;
  timestamp: string;
}

export interface ConversationPreview {
  matchId: string;
  lastMessage: ChatMessage;
}

export interface VideoPost {
  id: string;
  author: Profile;
  videoUrl: string;
  posterUrl: string;
  caption: string;
  tags: string[];
  category: UserStatus;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLikedByMe: boolean;
  musicTitle: string;
  comments: {
    id: string;
    userName: string;
    userAvatar: string;
    text: string;
    timeAgo: string;
  }[];
}

export interface LiveStream {
  id: string;
  host: Profile;
  title: string;
  category: UserStatus;
  viewerCount: number;
  streamPoster: string;
  isActive: boolean;
  messages: {
    id: string;
    userName: string;
    userAvatar?: string;
    text: string;
    isGift?: boolean;
    giftIcon?: string;
  }[];
}

export interface VirtualGift {
  id: string;
  name: string;
  icon: string;
  priceCredits: number;
  description: string;
}

export interface TunisianPaymentOption {
  id: 'd17' | 'floussi' | 'recharge_telco' | 'sobflous';
  name: string;
  operator?: 'ooredoo' | 'orange' | 'telecom';
  label: string;
  description: string;
  iconType: string;
}

export interface PrivacySettings {
  discreetMode: boolean; // Profil visible uniquement si on a liké
  hideExactLocation: boolean; // Affiche la ville uniquement
  visibilityScope: VisibilityScope;
  whoCanMessageMe: 'matches_only' | 'verified_only' | 'everyone';
  showOnlineStatus: boolean;
}

export interface PendingPaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  method: 'd17' | 'ooredoo' | 'orange' | 'telecom' | 'floussi' | 'carte_bancaire';
  methodLabel: string;
  amountTND: number;
  creditsToAward: number;
  referenceCode: string; // Numéro e-Dinar ou code PIN recharge 14 chiffres
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface UserReport {
  id: string;
  reporterName: string;
  targetUserId: string;
  targetUserName: string;
  reason: 'photo_inappropriate' | 'fake_profile' | 'harassment' | 'scam' | 'other';
  reasonLabel: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  timestamp: string;
}

export interface AppBrandingSettings {
  appName: string;
  tagline: string;
  logoUrl: string | null;
  primaryColor: string;
  allowFreeMatches: boolean;
  freeLikesPerDay: number;
  diasporaModeEnabled: boolean;
}

