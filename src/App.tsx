import React, { useState, useEffect, useRef } from 'react';
import { TopHeader } from './components/Navigation/TopHeader';
import { BottomBar, TabType } from './components/Navigation/BottomBar';
import { SwipeCardDeck } from './components/Swipe/SwipeCardDeck';
import { VerticalVideoFeed } from './components/VideoFeed/VerticalVideoFeed';
import { LiveStreamViewer } from './components/LiveStream/LiveStreamViewer';
import { ChatListAndConversation } from './components/Chat/ChatListAndConversation';
import { FilterDrawer } from './components/Discovery/FilterDrawer';
import { ProfileAndPrivacy } from './components/Profile/ProfileAndPrivacy';
import { TunisianPaymentModal } from './components/Payment/TunisianPaymentModal';
import { MatchCelebrationModal } from './components/MatchCelebrationModal';
import { ProfileDetailModal } from './components/Profile/ProfileDetailModal';
import { WebRTCCallModal } from './components/Calls/WebRTCCallModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { LogoUploadModal } from './components/Admin/LogoUploadModal';
import { LogoGuideModal } from './components/Admin/LogoGuideModal';
import { LoginPage } from './components/Auth/LoginPage';
import { RegisterPage } from './components/Auth/RegisterPage';
import { 
  getStoredCurrentUser, 
  saveStoredCurrentUser, 
  getStoredProfiles, 
  saveStoredProfiles, 
  getStoredAccounts, 
  saveStoredAccounts 
} from './utils/storage';
import { 
  syncWithServer, 
  saveProfileToServer 
} from './utils/api';

import { 
  INITIAL_PROFILES, 
  CURRENT_USER, 
  DEFAULT_WIFE_PROFILE,
  ADMIN_USER,
  INITIAL_VIDEOS, 
  INITIAL_LIVES,
  INITIAL_PENDING_PAYMENTS,
  INITIAL_REPORTS,
  DEFAULT_BRANDING
} from './data/mockData';
import { 
  Profile, 
  Match, 
  VideoPost, 
  LiveStream, 
  VirtualGift, 
  PrivacySettings, 
  UserStatus,
  PendingPaymentTransaction,
  UserReport,
  AppBrandingSettings 
} from './types';

export default function App() {
  // Screen & Auth Mode: 'app' | 'login' | 'register' | 'admin'
  const [currentScreen, setCurrentScreen] = useState<'app' | 'login' | 'register' | 'admin'>('app');

  // Navigation within 'app' screen
  const [activeTab, setActiveTab] = useState<TabType>('swipe');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // App Branding & Custom Logo State
  const [branding, setBranding] = useState<AppBrandingSettings>(() => {
    try {
      const saved = localStorage.getItem('allo_allo_branding');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_BRANDING,
          ...parsed,
          logoUrl: parsed.logoUrl || DEFAULT_BRANDING.logoUrl
        };
      }
      return DEFAULT_BRANDING;
    } catch {
      return DEFAULT_BRANDING;
    }
  });

  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showLogoGuideModal, setShowLogoGuideModal] = useState(false);

  // App Data State with safe LocalStorage persistence & quota protection
  const [currentUser, setCurrentUser] = useState<Profile>(() => getStoredCurrentUser());

  const [wifeProfile, setWifeProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem('allo_allo_wife_profile');
      return saved ? JSON.parse(saved) : DEFAULT_WIFE_PROFILE;
    } catch {
      return DEFAULT_WIFE_PROFILE;
    }
  });

  const [registeredAccounts, setRegisteredAccounts] = useState<Profile[]>(() => getStoredAccounts());
  const [profiles, setProfiles] = useState<Profile[]>(() => getStoredProfiles());

  // Sync state safely to Storage
  useEffect(() => {
    saveStoredCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveStoredProfiles(profiles);
  }, [profiles]);

  useEffect(() => {
    saveStoredAccounts(registeredAccounts);
  }, [registeredAccounts]);

  // Keep live refs to avoid stale closures in background sync
  const profilesRef = useRef(profiles);
  profilesRef.current = profiles;
  const registeredAccountsRef = useRef(registeredAccounts);
  registeredAccountsRef.current = registeredAccounts;
  const [isSyncing, setIsSyncing] = useState(false);

  // Initial and Periodic Server Synchronization (Multi-Device & Cross-Browser Live Sync)
  const doLiveSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncWithServer(profilesRef.current, registeredAccountsRef.current);
      if (result && Array.isArray(result.profiles) && result.profiles.length > 0) {
        setProfiles(result.profiles);
        if (Array.isArray(result.accounts) && result.accounts.length > 0) {
          setRegisteredAccounts(result.accounts);
        }
      }
    } catch (err) {
      console.warn('Background sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    doLiveSync();
    const interval = setInterval(doLiveSync, 10000);
    return () => clearInterval(interval);
  }, []);

  const [credits, setCredits] = useState<number>(150);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [videos, setVideos] = useState<VideoPost[]>(INITIAL_VIDEOS);
  const [lives, setLives] = useState<LiveStream[]>(INITIAL_LIVES);

  // Switch between Karim and Wife or any registered account
  const handleSwitchUser = (targetUser?: Profile) => {
    if (targetUser && targetUser.id) {
      setCurrentUser(targetUser);
      showToast(`Connecté en tant que ${targetUser.name} 🇹🇳`);
      return;
    }
    if (currentUser.id === wifeProfile.id) {
      setCurrentUser(CURRENT_USER);
      showToast('Connecté en tant que Karim 👨 (Mon Compte)');
    } else {
      setCurrentUser(wifeProfile);
      showToast(`Connecté en tant que ${wifeProfile.name.split(' ')[0]} 👩 (Compte Ma Femme)`);
    }
  };

  // Register both husband and wife
  const handleRegisterCouple = (husband: Profile, wife: Profile) => {
    setCurrentUser(husband);
    setWifeProfile(wife);
    try {
      localStorage.setItem('allo_allo_wife_profile', JSON.stringify(wife));
    } catch {}
    setRegisteredAccounts(prev => [husband, wife, ...prev.filter(p => p.id !== husband.id && p.id !== wife.id)]);
    setProfiles(prev => [husband, wife, ...prev.filter(p => p.id !== husband.id && p.id !== wife.id)]);
    setCurrentScreen('app');
    setActiveTab('messages');
    showToast('Couple Karim & son Épouse configuré avec succès ! Chat réel prêt à tester 💑');
  };

  // Admin Data State
  const [pendingPayments, setPendingPayments] = useState<PendingPaymentTransaction[]>(INITIAL_PENDING_PAYMENTS);
  const [reports, setReports] = useState<UserReport[]>(INITIAL_REPORTS);

  // Save branding changes to localStorage
  const handleUpdateBranding = (newBranding: Partial<AppBrandingSettings>) => {
    setBranding(prev => {
      const updated = { ...prev, ...newBranding };
      try {
        localStorage.setItem('allo_allo_branding', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save branding', err);
      }
      return updated;
    });
  };

  const handleSaveLogo = (logoUrl: string | null) => {
    handleUpdateBranding({ logoUrl });
    showToast(logoUrl ? 'Nouveau logo Allo-Allo appliqué avec succès !' : 'Logo réinitialisé.');
  };

  // Filter State
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | UserStatus>('all');

  // Matches State (dynamic: if logged in as Karim, spouse is Mariem; if logged in as Mariem, spouse is Karim)
  const activePartnerProfile = currentUser.id === wifeProfile.id ? CURRENT_USER : wifeProfile;

  const [matches, setMatches] = useState<Match[]>([
    {
      id: 'match_spouse',
      partnerProfile: DEFAULT_WIFE_PROFILE,
      matchedAt: 'À l’instant',
      unreadCount: 1,
      lastMessage: '3asslema 3zizi ❤️ Tu as vu la nouvelle version d’Allo-Allo ?',
      lastMessageTimestamp: '14:20'
    },
    {
      id: 'match_nour',
      partnerProfile: INITIAL_PROFILES[0], // Nour
      matchedAt: 'Aujourd’hui à 14h',
      unreadCount: 0,
      lastMessage: 'Écoute cette recommandation !',
      lastMessageTimestamp: '14:32'
    },
    {
      id: 'match_kenza',
      partnerProfile: INITIAL_PROFILES[4], // Kenza Lyon
      matchedAt: 'Hier',
      unreadCount: 0,
      lastMessage: 'Super, on s’appelle ce soir !',
      lastMessageTimestamp: 'Hier'
    }
  ]);

  // Keep spouse match updated when switching active identity
  useEffect(() => {
    setMatches(prev => {
      const filtered = prev.filter(m => m.id !== 'match_spouse');
      return [
        {
          id: 'match_spouse',
          partnerProfile: activePartnerProfile,
          matchedAt: 'En direct',
          unreadCount: 1,
          lastMessage: currentUser.id === wifeProfile.id 
            ? 'Oui chérie ! L’application est fluide 🇹🇳' 
            : '3asslema 3zizi ❤️ Tu as vu la nouvelle version d’Allo-Allo ?',
          lastMessageTimestamp: '14:25'
        },
        ...filtered
      ];
    });
  }, [currentUser.id, wifeProfile]);

  // Privacy Settings State
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    discreetMode: false,
    hideExactLocation: true,
    visibilityScope: 'everyone',
    whoCanMessageMe: 'matches_only',
    showOnlineStatus: true,
  });

  // Active Modals & Overlays
  const [activeLiveStream, setActiveLiveStream] = useState<LiveStream | null>(null);
  const [activeCall, setActiveCall] = useState<{ partner: Profile; isVideo: boolean } | null>(null);
  const [matchedProfileForCelebration, setMatchedProfileForCelebration] = useState<Profile | null>(null);
  const [inspectedProfile, setInspectedProfile] = useState<Profile | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Swiping handler
  const handleSwipe = (profile: Profile, action: 'like' | 'pass' | 'superlike') => {
    if (action === 'like' || action === 'superlike') {
      const isMatch = true;
      if (isMatch) {
        setMatchedProfileForCelebration(profile);
        const newMatch: Match = {
          id: 'match_' + profile.id,
          partnerProfile: profile,
          matchedAt: 'À l’instant',
          unreadCount: 0,
          lastMessage: action === 'superlike' ? 'Vous avez envoyé un Super Like ! ★' : 'Nouveau match !'
        };
        setMatches(prev => [newMatch, ...prev]);
      }
    }
  };

  // Boost Profile handler
  const handleBoostProfile = () => {
    if (credits < 20) {
      showToast('Crédits insuffisants (20 🪙 requis). Veuillez recharger via D17.');
      setShowPaymentModal(true);
      return;
    }
    setCredits(prev => prev - 20);
    showToast('Profil boosté pour 1 heure ! Visibilité x10 en Tunisie & Diaspora.');
  };

  // Virtual Gifts handler
  const handleSendGift = (gift: VirtualGift) => {
    setCredits(prev => Math.max(0, prev - gift.priceCredits));
    showToast(`Cadeau ${gift.name} ${gift.icon} envoyé avec succès !`);
  };

  // Tunisian Payment handler
  const handleAddCredits = (amount: number) => {
    setCredits(prev => prev + amount);
    showToast(`+${amount} crédits ajoutés à votre compte Allo-Allo !`);
  };

  // Identity Verification handler
  const handleVerifyBadge = () => {
    setCurrentUser(prev => ({ ...prev, isVerified: true }));
    showToast('Badge Vérifié activé sur votre profil avec succès !');
  };

  // Admin Actions Handlers
  const handleApprovePayment = (transactionId: string) => {
    const tx = pendingPayments.find(p => p.id === transactionId);
    if (!tx) return;

    setPendingPayments(prev => 
      prev.map(p => p.id === transactionId ? { ...p, status: 'approved' } : p)
    );

    if (tx.userId === currentUser.id) {
      setCredits(prev => prev + tx.creditsToAward);
    }
  };

  const handleRejectPayment = (transactionId: string) => {
    setPendingPayments(prev => 
      prev.map(p => p.id === transactionId ? { ...p, status: 'rejected' } : p)
    );
  };

  const handleToggleUserBan = (userId: string) => {
    setProfiles(prev => 
      prev.map(p => p.id === userId ? { ...p, isBanned: !p.isBanned } : p)
    );
  };

  const handleToggleUserVerified = (userId: string) => {
    setProfiles(prev => 
      prev.map(p => p.id === userId ? { ...p, isVerified: !p.isVerified } : p)
    );
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, isVerified: !prev.isVerified }));
    }
  };

  const handleToggleUserPremium = (userId: string) => {
    setProfiles(prev => 
      prev.map(p => p.id === userId ? { ...p, isPremium: !p.isPremium } : p)
    );
    if (currentUser.id === userId) {
      setIsPremium(prev => !prev);
      setCurrentUser(prev => ({ ...prev, isPremium: !prev.isPremium }));
    }
  };

  const handleAwardUserCredits = (userId: string, amount: number) => {
    if (currentUser.id === userId) {
      setCredits(prev => prev + amount);
    }
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
  };

  const handleResolveReport = (reportId: string) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
  };

  // Auth Handlers
  const handleLoginSuccess = (user: Profile) => {
    setCurrentUser(user);
    setIsPremium(user.isPremium);
    setCurrentScreen('app');
    showToast(`Bienvenue sur Allo-Allo, ${user.name} 🇹🇳 !`);
  };

  const handleRegisterSuccess = (newProfile: Profile) => {
    setProfiles(prev => [newProfile, ...prev.filter(p => p.id !== newProfile.id)]);
    setRegisteredAccounts(prev => [newProfile, ...prev.filter(p => p.id !== newProfile.id)]);
    setCurrentUser(newProfile);
    setIsPremium(newProfile.isPremium || false);
    setCredits(100); // 100 free welcome credits
    setCurrentScreen('app');
    setActiveTab('swipe');
    // Save to multi-device backend server
    saveProfileToServer(newProfile);
    showToast(`Compte créé avec succès ! Bienvenue ${newProfile.name} 🇹🇳`);
  };

  const handleUpdateProfilePhoto = (newPhotoUrl: string) => {
    const updated = {
      ...currentUser,
      photos: [newPhotoUrl, ...currentUser.photos.slice(1)]
    };
    setCurrentUser(updated);

    setProfiles(prev =>
      prev.map(p => p.id === currentUser.id ? updated : p)
    );

    setRegisteredAccounts(prev =>
      prev.map(p => p.id === currentUser.id ? updated : p)
    );

    saveProfileToServer(updated);
    showToast('Photo de profil mise à jour et enregistrée !');
  };

  const handleUpdateProfileDetails = (updatedData: Partial<Profile>) => {
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    setProfiles(prev => prev.map(p => p.id === currentUser.id ? updatedUser : p));
    setRegisteredAccounts(prev => prev.map(p => p.id === currentUser.id ? updatedUser : p));
    saveProfileToServer(updatedUser);
    showToast('Profil mis à jour et enregistré !');
  };

  // L'espace admin n'est accessible qu'à un compte administrateur vérifié par le serveur
  const openAdmin = () => {
    if (!currentUser.isAdmin) {
      showToast('Accès réservé à l’administrateur. Connectez-vous avec le compte admin.');
      setCurrentScreen('login');
      return;
    }
    setCurrentScreen('admin');
  };

  const handleLogout = () => {
    setCurrentScreen('login');
    showToast('Vous êtes désormais déconnecté(e).');
  };

  return (
    <div className="min-h-screen w-full bg-[#05060a] text-white flex flex-col items-center justify-center font-sans antialiased overflow-x-hidden">
      {/* Toast alert banner */}
      {notificationToast && (
        <div className="fixed top-4 z-50 bg-rose-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl font-semibold text-xs animate-in slide-in-from-top duration-300 flex items-center space-x-2 border border-rose-400/40">
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Main Container: Switchable between Device Simulator Frame and Fullscreen */}
      <main
        className={`w-full transition-all duration-300 flex flex-col overflow-hidden bg-[#090b10] ${
          isPhoneFrame
            ? 'max-w-[430px] h-[92vh] max-h-[890px] rounded-[42px] border-[8px] border-[#1e2330] shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative my-auto'
            : 'max-w-4xl min-h-screen'
        }`}
      >
        {/* Smartphone top speaker notch if in phone frame */}
        {isPhoneFrame && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#1e2330] rounded-full z-40 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-1 bg-black/60 rounded-full" />
            <div className="w-2.5 h-2.5 rounded-full bg-black/80 ml-2.5" />
          </div>
        )}

        {/* VIEW 1: AUTH - LOGIN PAGE */}
        {currentScreen === 'login' && (
          <LoginPage
            logoUrl={branding.logoUrl}
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={() => setCurrentScreen('register')}
            onGoToAdmin={openAdmin}
            onOpenLogoGuide={() => setShowLogoGuideModal(true)}
            onBackToApp={() => setCurrentScreen('app')}
            registeredAccounts={registeredAccounts}
            demoProfiles={{
              karim: CURRENT_USER,
              wife: wifeProfile,
              nour: INITIAL_PROFILES[0],
              admin: ADMIN_USER
            }}
          />
        )}

        {/* VIEW 2: AUTH - REGISTER PAGE */}
        {currentScreen === 'register' && (
          <RegisterPage
            logoUrl={branding.logoUrl}
            onRegisterSuccess={handleRegisterSuccess}
            onRegisterCouple={handleRegisterCouple}
            onGoToLogin={() => setCurrentScreen('login')}
            onBackToApp={() => setCurrentScreen('app')}
          />
        )}

        {/* VIEW 3: ADMIN DASHBOARD */}
        {currentScreen === 'admin' && currentUser.isAdmin && (
          <AdminDashboard
            currentUser={currentUser}
            allProfiles={profiles}
            videos={videos}
            branding={branding}
            pendingPayments={pendingPayments}
            reports={reports}
            onUpdateBranding={handleUpdateBranding}
            onOpenLogoUpload={() => setShowLogoModal(true)}
            onApprovePayment={handleApprovePayment}
            onRejectPayment={handleRejectPayment}
            onToggleUserBan={handleToggleUserBan}
            onToggleUserVerified={handleToggleUserVerified}
            onToggleUserPremium={handleToggleUserPremium}
            onAwardUserCredits={handleAwardUserCredits}
            onDeleteVideo={handleDeleteVideo}
            onResolveReport={handleResolveReport}
            onReturnToApp={() => setCurrentScreen('app')}
            onLogout={handleLogout}
          />
        )}

        {/* VIEW 4: CORE APPLICATION (SWIPE, VIDEO, MESSAGES, DISCOVERY, PROFILE) */}
        {currentScreen === 'app' && (
          <>
            {/* Persistent Top Header */}
            <TopHeader
              credits={credits}
              isPremium={isPremium}
              logoUrl={branding.logoUrl}
              isAdmin={currentUser.isAdmin}
              currentUser={currentUser}
              registeredAccounts={registeredAccounts}
              isSyncing={isSyncing}
              onForceSync={doLiveSync}
              onSwitchUser={handleSwitchUser}
              onOpenRecharge={() => setShowPaymentModal(true)}
              onOpenArchitecture={() => setShowArchitectureModal(true)}
              onOpenSafety={() => setActiveTab('profile')}
              onOpenAdmin={openAdmin}
              onOpenLogoUpload={() => setShowLogoModal(true)}
              onOpenLogoGuide={() => setShowLogoGuideModal(true)}
              onGoToLogin={() => setCurrentScreen('login')}
              onGoToRegister={() => setCurrentScreen('register')}
              isPhoneFrame={isPhoneFrame}
              onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}
            />

            {/* Center Viewport according to active tab */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
              {activeTab === 'swipe' && (
                <SwipeCardDeck
                  profiles={profiles.filter(p => !p.isBanned && p.id !== currentUser.id)}
                  onSwipe={handleSwipe}
                  onOpenProfileDetail={(p) => setInspectedProfile(p)}
                  onOpenFilters={() => setActiveTab('discovery')}
                  onBoostProfile={handleBoostProfile}
                  onForceSync={doLiveSync}
                  isSyncing={isSyncing}
                  credits={credits}
                />
              )}

              {activeTab === 'video' && (
                <VerticalVideoFeed
                  videos={videos}
                  lives={lives}
                  onOpenLive={(live) => setActiveLiveStream(live)}
                  onStartLive={() => {
                    if (!isPremium && credits < 10) {
                      showToast('Lancement de Live réservé aux membres Gold ou avec 10 crédits.');
                      setShowPaymentModal(true);
                      return;
                    }
                    const newLive: LiveStream = {
                      id: 'live_my_' + Date.now(),
                      host: currentUser,
                      title: `Direct de ${currentUser.name} : Rencontres & Discussion Diaspora 🇹🇳`,
                      category: currentUser.status,
                      viewerCount: 1,
                      streamPoster: currentUser.photos[0],
                      isActive: true,
                      messages: []
                    };
                    setActiveLiveStream(newLive);
                  }}
                  onPostVideo={() => {
                    showToast('Votre vidéo a été soumise à la modération IA avant publication.');
                  }}
                  onViewAuthorProfile={(authorId) => {
                    const author = profiles.find(p => p.id === authorId);
                    if (author) setInspectedProfile(author);
                  }}
                />
              )}

              {activeTab === 'messages' && (
                <ChatListAndConversation
                  matches={matches}
                  allProfiles={profiles}
                  currentUser={currentUser}
                  wifeProfile={wifeProfile}
                  onStartCall={(partner, isVideo) => {
                    setActiveCall({ partner, isVideo });
                  }}
                  onOpenProfile={(p) => setInspectedProfile(p)}
                  onSwitchUser={handleSwitchUser}
                  onGoToLogin={() => setCurrentScreen('login')}
                  onGoToRegister={() => setCurrentScreen('register')}
                />
              )}

              {activeTab === 'discovery' && (
                <FilterDrawer
                  allProfiles={profiles.filter(p => !p.isBanned && p.id !== currentUser.id)}
                  isPremium={isPremium}
                  selectedStatus={selectedStatusFilter}
                  onChangeStatus={(status) => setSelectedStatusFilter(status)}
                  onSelectProfile={(p) => setInspectedProfile(p)}
                  onOpenRecharge={() => setShowPaymentModal(true)}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileAndPrivacy
                  user={currentUser}
                  credits={credits}
                  isPremium={isPremium}
                  privacy={privacy}
                  onUpdatePrivacy={(newP) => setPrivacy(prev => ({ ...prev, ...newP }))}
                  onUpdatePhoto={handleUpdateProfilePhoto}
                  onUpdateProfile={handleUpdateProfileDetails}
                  onOpenRecharge={() => setShowPaymentModal(true)}
                  onVerifyBadge={handleVerifyBadge}
                  onOpenAdmin={openAdmin}
                  onGoToLogin={() => setCurrentScreen('login')}
                  onGoToRegister={() => setCurrentScreen('register')}
                  onLogout={handleLogout}
                />
              )}
            </div>

            {/* Persistent Bottom Navigation */}
            <BottomBar
              activeTab={activeTab}
              onSelectTab={(tab) => setActiveTab(tab)}
              unreadMessagesCount={1}
            />
          </>
        )}
      </main>

      {/* MODAL: Logo Upload & Photo Sharing */}
      {showLogoModal && (
        <LogoUploadModal
          currentLogoUrl={branding.logoUrl}
          onSaveLogo={handleSaveLogo}
          onClose={() => setShowLogoModal(false)}
        />
      )}

      {/* MODAL: Logo Guide */}
      {showLogoGuideModal && (
        <LogoGuideModal
          currentLogoUrl={branding.logoUrl}
          onOpenUpload={() => {
            setShowLogoGuideModal(false);
            setShowLogoModal(true);
          }}
          onClose={() => setShowLogoGuideModal(false)}
        />
      )}

      {/* OVERLAY: Live Stream Fullscreen Viewer */}
      {activeLiveStream && (
        <LiveStreamViewer
          live={activeLiveStream}
          userCredits={credits}
          onSendGift={handleSendGift}
          onClose={() => setActiveLiveStream(null)}
          onOpenRecharge={() => {
            setActiveLiveStream(null);
            setShowPaymentModal(true);
          }}
        />
      )}

      {/* OVERLAY: WebRTC Audio/Video Call */}
      {activeCall && (
        <WebRTCCallModal
          partner={activeCall.partner}
          isVideo={activeCall.isVideo}
          onEndCall={() => setActiveCall(null)}
        />
      )}

      {/* OVERLAY: Match Celebration with Confetti */}
      {matchedProfileForCelebration && (
        <MatchCelebrationModal
          currentUser={currentUser}
          matchedProfile={matchedProfileForCelebration}
          onSendMessage={() => {
            setMatchedProfileForCelebration(null);
            setActiveTab('messages');
          }}
          onContinueSwiping={() => setMatchedProfileForCelebration(null)}
        />
      )}

      {/* OVERLAY: Profile Detail Modal */}
      {inspectedProfile && (
        <ProfileDetailModal
          profile={inspectedProfile}
          onClose={() => setInspectedProfile(null)}
          onLike={(p) => {
            handleSwipe(p, 'like');
            setInspectedProfile(null);
          }}
          onPass={(p) => {
            handleSwipe(p, 'pass');
            setInspectedProfile(null);
          }}
          onSuperLike={(p) => {
            handleSwipe(p, 'superlike');
            setInspectedProfile(null);
          }}
        />
      )}

      {/* OVERLAY: Tunisian Payments (D17, Floussi, Recharge USSD) */}
      {showPaymentModal && (
        <TunisianPaymentModal
          currentCredits={credits}
          isPremium={isPremium}
          onClose={() => setShowPaymentModal(false)}
          onAddCredits={handleAddCredits}
          onUpgradePremium={() => {
            setIsPremium(true);
            showToast('Abonnement Allo-Allo Gold activé avec succès !');
          }}
        />
      )}

      {/* OVERLAY: Technical Architecture & Documentation */}
      {showArchitectureModal && (
        <ArchitectureModal onClose={() => setShowArchitectureModal(false)} />
      )}
    </div>
  );
}

