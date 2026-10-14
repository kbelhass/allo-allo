import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  CreditCard, 
  Video, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Coins, 
  Crown, 
  Upload, 
  ArrowLeft, 
  TrendingUp, 
  Globe, 
  Smartphone, 
  Sparkles,
  PhoneCall,
  UserCheck,
  Ban,
  Trash2,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { Profile, PendingPaymentTransaction, UserReport, VideoPost, AppBrandingSettings } from '../../types';
import { AppLogo } from '../Common/AppLogo';

interface AdminDashboardProps {
  currentUser: Profile;
  allProfiles: Profile[];
  videos: VideoPost[];
  branding: AppBrandingSettings;
  pendingPayments: PendingPaymentTransaction[];
  reports: UserReport[];
  onUpdateBranding: (newBranding: Partial<AppBrandingSettings>) => void;
  onOpenLogoUpload: () => void;
  onApprovePayment: (transactionId: string) => void;
  onRejectPayment: (transactionId: string) => void;
  onToggleUserBan: (userId: string) => void;
  onToggleUserVerified: (userId: string) => void;
  onToggleUserPremium: (userId: string) => void;
  onAwardUserCredits: (userId: string, amount: number) => void;
  onDeleteVideo: (videoId: string) => void;
  onResolveReport: (reportId: string) => void;
  onReturnToApp: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  allProfiles,
  videos,
  branding,
  pendingPayments,
  reports,
  onUpdateBranding,
  onOpenLogoUpload,
  onApprovePayment,
  onRejectPayment,
  onToggleUserBan,
  onToggleUserVerified,
  onToggleUserPremium,
  onAwardUserCredits,
  onDeleteVideo,
  onResolveReport,
  onReturnToApp,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments' | 'moderation' | 'branding'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'diaspora' | 'local' | 'verified' | 'banned'>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Filtered Users
  const filteredUsers = allProfiles.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.currentCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.originCity && user.originCity.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (userFilter === 'diaspora') return user.status === 'diaspora';
    if (userFilter === 'local') return user.status === 'local';
    if (userFilter === 'verified') return user.isVerified;
    if (userFilter === 'banned') return user.isBanned;
    return true;
  });

  const pendingCount = pendingPayments.filter(p => p.status === 'pending').length;
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="w-full h-full flex flex-col bg-[#08090e] text-white overflow-hidden select-none">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 border border-emerald-400/40 text-white px-5 py-2 rounded-2xl shadow-2xl text-xs font-bold animate-in fade-in duration-200">
          {successToast}
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="w-full bg-[#0e121d] border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onReturnToApp}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
            title="Revenir à l'application"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quitter Admin</span>
          </button>

          <div className="flex items-center space-x-2">
            <AppLogo logoUrl={branding.logoUrl} size="sm" showText={false} />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold text-white flex items-center gap-1">
                  Allo-Allo Admin
                  <span className="text-[10px] bg-rose-600/30 text-rose-400 border border-rose-500/40 px-1.5 py-0.2 rounded font-black tracking-wider uppercase">
                    Master
                  </span>
                </h1>
              </div>
              <p className="text-[10px] text-gray-400">Centre de Contrôle & Modération 🇹🇳</p>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center space-x-2">
          {/* Logo upload button */}
          <button
            onClick={onOpenLogoUpload}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-rose-600/20 to-amber-500/20 hover:from-rose-600/30 hover:to-amber-500/30 border border-rose-500/30 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95"
            title="Téléverser votre propre photo de logo"
          >
            <Upload className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Changer Logo</span>
          </button>

          <button
            onClick={onLogout}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-gray-400 hover:text-rose-300 text-xs font-semibold transition"
            title="Déconnexion"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="bg-[#0b0e17] border-b border-white/10 px-3 py-1.5 flex items-center space-x-1 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'overview'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Tableau de bord</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'users'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Utilisateurs ({allProfiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap relative transition ${
            activeTab === 'payments'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Paiements Tunisiens</span>
          {pendingCount > 0 && (
            <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap relative transition ${
            activeTab === 'moderation'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Modération</span>
          {pendingReportsCount > 0 && (
            <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
              {pendingReportsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'branding'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Logo & Paramètres</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            {/* Quick KPI Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#121623] border border-white/10 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[11px] font-semibold">Total Inscrits</span>
                  <Users className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-xl font-extrabold text-white">1,842</div>
                <div className="text-[10px] text-emerald-400 font-semibold">+18% cette semaine</div>
              </div>

              <div className="bg-[#121623] border border-white/10 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[11px] font-semibold">Diaspora 🇹🇳</span>
                  <Globe className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-xl font-extrabold text-sky-400">64%</div>
                <div className="text-[10px] text-gray-400">Paris, Lyon, Montréal, Berlin</div>
              </div>

              <div className="bg-[#121623] border border-white/10 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[11px] font-semibold">Revenu D17 & Telco</span>
                  <Coins className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl font-extrabold text-amber-400">4,350 TND</div>
                <div className="text-[10px] text-emerald-400 font-semibold">100% monétisé en dinars</div>
              </div>

              <div className="bg-[#121623] border border-white/10 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-[11px] font-semibold">Paiements en attente</span>
                  <CreditCard className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-xl font-extrabold text-rose-400">{pendingCount}</div>
                <div className="text-[10px] text-gray-400">À valider manuellement</div>
              </div>
            </div>

            {/* Application Branding Quick Banner */}
            <div className="bg-gradient-to-r from-rose-950/40 via-[#141824] to-[#141824] border border-rose-500/20 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <AppLogo logoUrl={branding.logoUrl} size="lg" showText={false} />
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Identité Visuelle Allo-Allo
                    {branding.logoUrl ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                        Logo Personnalisé Actif
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                        Logo Standard
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-300">
                    Vous pouvez partager ou uploader le logo officiel de votre choix à tout moment.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenLogoUpload}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20 flex items-center justify-center space-x-1.5 transition shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>Uploader mon Logo</span>
              </button>
            </div>

            {/* Activity distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#121623] border border-white/10 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-rose-400" />
                  Répartition Géographique
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-gray-300 mb-1">
                      <span>France (Paris, Lyon, Marseille)</span>
                      <span className="font-bold text-white">42%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: '42%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-gray-300 mb-1">
                      <span>Tunisie (Grand Tunis, Sahel, Sfax)</span>
                      <span className="font-bold text-white">36%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '36%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-gray-300 mb-1">
                      <span>Allemagne & Italie</span>
                      <span className="font-bold text-white">14%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: '14%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-gray-300 mb-1">
                      <span>Canada & USA</span>
                      <span className="font-bold text-white">8%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '8%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#121623] border border-white/10 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  Moyens de Paiement Préférés
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <span className="font-semibold text-gray-300">📮 D17 Poste Tunisienne</span>
                    <span className="text-amber-400 font-bold">54% des transactions</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <span className="font-semibold text-gray-300">📱 Cartes Ooredoo / Orange / TT</span>
                    <span className="text-rose-400 font-bold">32% des recharges</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                    <span className="font-semibold text-gray-300">💳 Floussi & Cartes Bancaires</span>
                    <span className="text-sky-400 font-bold">14% des paiements</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-3 max-w-3xl mx-auto">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, ville (Paris, Tunis, Sousse...)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#121623] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
                {(['all', 'diaspora', 'local', 'verified', 'banned'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setUserFilter(filter)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold capitalize transition ${
                      userFilter === filter
                        ? 'bg-white text-black font-bold'
                        : 'bg-[#121623] text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {filter === 'all' ? 'Tous' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`bg-[#121623] border rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                    user.isBanned ? 'border-rose-500/50 bg-rose-950/10 opacity-75' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.photos[0]}
                      alt={user.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/15"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-sm text-white">{user.name}, {user.age}</span>
                        {user.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" title="Profil Vérifié" />
                        )}
                        {user.isPremium && (
                          <span className="text-[9px] bg-amber-500 text-black font-black px-1.5 py-0.2 rounded uppercase">
                            Gold
                          </span>
                        )}
                        {user.isBanned && (
                          <span className="text-[9px] bg-rose-600 text-white font-black px-1.5 py-0.2 rounded uppercase">
                            Banni
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        📍 {user.currentCity} {user.originCity ? `(Origine: ${user.originCity})` : ''} •{' '}
                        <span className="text-rose-400 font-semibold uppercase text-[10px]">
                          {user.status === 'diaspora' ? '🇹🇳 Diaspora' : '📍 Local'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center space-x-1.5 self-end sm:self-center">
                    {/* Toggle Verified */}
                    <button
                      onClick={() => {
                        onToggleUserVerified(user.id);
                        showToast(`Statut vérifié mis à jour pour ${user.name}`);
                      }}
                      className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
                        user.isVerified
                          ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                      }`}
                      title={user.isVerified ? "Révoquer le badge vérifié" : "Accorder le badge vérifié"}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span className="text-[10px] hidden md:inline">Vérif</span>
                    </button>

                    {/* Toggle Gold */}
                    <button
                      onClick={() => {
                        onToggleUserPremium(user.id);
                        showToast(`Statut Gold mis à jour pour ${user.name}`);
                      }}
                      className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
                        user.isPremium
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                      }`}
                      title={user.isPremium ? "Désactiver Gold" : "Activer Gold VIP"}
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span className="text-[10px] hidden md:inline">Gold</span>
                    </button>

                    {/* Award Credits */}
                    <button
                      onClick={() => {
                        onAwardUserCredits(user.id, 50);
                        showToast(`+50 crédits attribués à ${user.name}`);
                      }}
                      className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1 transition"
                      title="Offrir 50 crédits cadeaux"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span className="text-[10px]">+50</span>
                    </button>

                    {/* Ban / Unban */}
                    <button
                      onClick={() => {
                        onToggleUserBan(user.id);
                        showToast(user.isBanned ? `${user.name} a été débanni` : `${user.name} a été suspendu`);
                      }}
                      className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
                        user.isBanned
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                      }`}
                      title={user.isBanned ? "Débannir cet utilisateur" : "Bannir / Bloquer cet utilisateur"}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{user.isBanned ? 'Débannir' : 'Bannir'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TUNISIAN PAYMENTS VALIDATION */}
        {activeTab === 'payments' && (
          <div className="space-y-3 max-w-3xl mx-auto">
            <div className="bg-[#121623] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Validation des Recharges et D17 Tunisienne
                </h3>
                <p className="text-xs text-gray-400">
                  Validez les reçus D17 et les codes de cartes à gratter 14 chiffres soumis par les utilisateurs.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingCount} en attente
              </span>
            </div>

            <div className="space-y-2">
              {pendingPayments.map(tx => (
                <div
                  key={tx.id}
                  className="bg-[#121623] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">{tx.userName}</span>
                      <span className="text-xs text-gray-400">{tx.userPhone}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        tx.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : tx.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {tx.status === 'pending' ? '⏳ En attente' : tx.status === 'approved' ? '✓ Validé' : '✗ Rejeté'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-rose-400 font-bold">{tx.methodLabel}</span>
                      <span className="text-gray-400">•</span>
                      <span className="font-bold text-amber-300">{tx.amountTND} TND ({tx.creditsToAward} 🪙)</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400 font-mono bg-black/40 px-2 py-0.5 rounded border border-white/10">
                        Code: {tx.referenceCode}
                      </span>
                      <span className="text-gray-500 text-[10px]">({tx.createdAt})</span>
                    </div>
                  </div>

                  {tx.status === 'pending' ? (
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          onRejectPayment(tx.id);
                          showToast(`Transaction ${tx.id} rejetée.`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-rose-400 border border-white/10 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Rejeter</span>
                      </button>

                      <button
                        onClick={() => {
                          onApprovePayment(tx.id);
                          showToast(`Transaction ${tx.id} validée ! +${tx.creditsToAward} crédits versés.`);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Valider & Créditer</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 self-end sm:self-center">
                      Traité
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MODERATION & SAFETY */}
        {activeTab === 'moderation' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            {/* Reports list */}
            <div className="bg-[#121623] border border-white/10 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Signalements Utilisateurs ({reports.length})
              </h3>

              <div className="space-y-2">
                {reports.map(report => (
                  <div
                    key={report.id}
                    className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-rose-400">{report.reasonLabel}</span>
                        <span className="text-[11px] text-gray-400">Signalé par: {report.reporterName}</span>
                      </div>
                      <p className="text-xs text-gray-200">
                        Cible : <span className="font-bold text-white">{report.targetUserName}</span> — "{report.details}"
                      </p>
                      <span className="text-[10px] text-gray-500">{report.timestamp}</span>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          onResolveReport(report.id);
                          showToast('Signalement classé sans suite.');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                      >
                        Classer
                      </button>
                      <button
                        onClick={() => {
                          onToggleUserBan(report.targetUserId);
                          onResolveReport(report.id);
                          showToast(`Utilisateur ${report.targetUserName} banni suite au signalement.`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                      >
                        Bannir l'utilisateur
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Feed Moderation */}
            <div className="bg-[#121623] border border-white/10 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Video className="w-4 h-4 text-sky-400" />
                Modération des Vidéos du Feed ({videos.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {videos.map(video => (
                  <div
                    key={video.id}
                    className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={video.posterUrl}
                        alt="Poster"
                        className="w-12 h-16 rounded-lg object-cover"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white line-clamp-1">{video.author.name}</span>
                        <p className="text-[11px] text-gray-400 line-clamp-2">{video.caption}</p>
                        <span className="text-[10px] text-rose-400">{video.likesCount} likes</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onDeleteVideo(video.id);
                        showToast('Vidéo supprimée du feed.');
                      }}
                      className="p-2 text-gray-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                      title="Supprimer la vidéo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LOGO & BRANDING SETTINGS */}
        {activeTab === 'branding' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            {/* Logo Customizer Card */}
            <div className="bg-[#121623] border border-white/10 rounded-3xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Logo Officiel Allo-Allo
                  </h3>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Déposez ou modifiez la photo du logo. Il sera instantanément appliqué sur la barre supérieure, les écrans de connexion/inscription et dans toute l'interface.
                  </p>
                </div>

                <button
                  onClick={onOpenLogoUpload}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>Uploader une photo</span>
                </button>
              </div>

              {/* Preview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Affichage dans le Header</span>
                    <p className="text-xs text-gray-300">Format compact en haut de page</p>
                  </div>
                  <div className="p-2 bg-[#0e121d] rounded-xl border border-white/10">
                    <AppLogo logoUrl={branding.logoUrl} size="sm" showText={true} />
                  </div>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Affichage Écran de Connexion</span>
                    <p className="text-xs text-gray-300">Format d'accueil grand format</p>
                  </div>
                  <div className="p-2 bg-[#0e121d] rounded-xl border border-white/10">
                    <AppLogo logoUrl={branding.logoUrl} size="lg" showText={false} />
                  </div>
                </div>
              </div>

              {branding.logoUrl && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-xs text-gray-300">Photo de logo personnalisée enregistrée</span>
                  <button
                    onClick={() => {
                      onUpdateBranding({ logoUrl: null });
                      showToast('Logo rétabli au style d’origine.');
                    }}
                    className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Rétablir le logo standard
                  </button>
                </div>
              )}
            </div>

            {/* App Tuning & 80% Gratuité Settings */}
            <div className="bg-[#121623] border border-white/10 rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-rose-400" />
                Philosophie & Règles de la Plateforme (80% Gratuit)
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/10">
                  <div>
                    <span className="font-bold text-white">Likes & Swipes Gratuits par Jour</span>
                    <p className="text-gray-400 text-[11px]">Pas de blocage frustrant, généreux pour les utilisateurs</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[30, 50, 100].map(count => (
                      <button
                        key={count}
                        onClick={() => {
                          onUpdateBranding({ freeLikesPerDay: count });
                          showToast(`Quota quotidien ajusté à ${count} likes.`);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold ${
                          branding.freeLikesPerDay === count
                            ? 'bg-rose-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/10">
                  <div>
                    <span className="font-bold text-white">Filtre Spécial Diaspora Activé</span>
                    <p className="text-gray-400 text-[11px]">Permet de filtrer par ville d'origine en Tunisie (Djerba, Sousse, etc.)</p>
                  </div>
                  <button
                    onClick={() => {
                      onUpdateBranding({ diasporaModeEnabled: !branding.diasporaModeEnabled });
                      showToast(`Mode Diaspora ${!branding.diasporaModeEnabled ? 'activé' : 'désactivé'}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold ${
                      branding.diasporaModeEnabled ? 'bg-emerald-600 text-white' : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {branding.diasporaModeEnabled ? 'Activé' : 'Désactivé'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
