import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Camera, 
  EyeOff, 
  MapPin, 
  Lock, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  UserCheck, 
  Sliders, 
  Globe, 
  Coins, 
  Crown,
  LogOut,
  AlertTriangle,
  Shield,
  Upload,
  LogIn,
  UserPlus,
  Edit3,
  Save,
  Check,
  Loader2
} from 'lucide-react';
import { Profile, PrivacySettings } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';

interface ProfileAndPrivacyProps {
  user: Profile;
  credits: number;
  isPremium: boolean;
  privacy: PrivacySettings;
  onUpdatePrivacy: (newSettings: Partial<PrivacySettings>) => void;
  onOpenRecharge: () => void;
  onVerifyBadge: () => void;
  onUpdatePhoto?: (newPhotoUrl: string) => void;
  onUpdateProfile?: (updatedData: Partial<Profile>) => void;
  onOpenAdmin?: () => void;
  onGoToLogin?: () => void;
  onGoToRegister?: () => void;
  onLogout?: () => void;
}

const AVAILABLE_TAGS = [
  'Café Direct ☕',
  'Plage & Mer 🏖️',
  'Sidi Bou Saïd 💙',
  'Couscous Tunisien 🍲',
  'Startups & Tech 💻',
  'Musique & Mezoued 🎵',
  'Voyages ✈️',
  'Djerba la Douce 🌴',
  'Randonnées Zaghouan 🏔️',
  'Hammamet Vibes ⛵',
  'Cinéma & Théâtre 🎭',
  'Cuisine & Gastronomie 🥘'
];

export const ProfileAndPrivacy: React.FC<ProfileAndPrivacyProps> = ({
  user,
  credits,
  isPremium,
  privacy,
  onUpdatePrivacy,
  onOpenRecharge,
  onVerifyBadge,
  onUpdatePhoto,
  onUpdateProfile,
  onOpenAdmin,
  onGoToLogin,
  onGoToRegister,
  onLogout,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'privacy' | 'security'>('profile');
  const [showSelfieModal, setShowSelfieModal] = useState(false);
  const [selfieTaken, setSelfieTaken] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [photoUpdatedToast, setPhotoUpdatedToast] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  // Edit Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editAge, setEditAge] = useState(user.age);
  const [editBio, setEditBio] = useState(user.bio);
  const [editCity, setEditCity] = useState(user.currentCity);
  const [editOriginCity, setEditOriginCity] = useState(user.originCity || 'Tunis');
  const [editJob, setEditJob] = useState(user.jobTitle || '');
  const [editInterests, setEditInterests] = useState<string[]>(user.interests || []);
  const [saveToast, setSaveToast] = useState(false);

  // Keep edit state in sync if user changes
  React.useEffect(() => {
    setEditName(user.name);
    setEditAge(user.age);
    setEditBio(user.bio);
    setEditCity(user.currentCity);
    setEditOriginCity(user.originCity || 'Tunis');
    setEditJob(user.jobTitle || '');
    setEditInterests(user.interests || []);
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdatePhoto) {
      setIsCompressing(true);
      try {
        const compressed = await compressImageFile(file, 600, 600, 0.82);
        onUpdatePhoto(compressed);
        setPhotoUpdatedToast(true);
        setTimeout(() => setPhotoUpdatedToast(false), 3000);
      } catch (err) {
        console.error('Failed to compress profile photo:', err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSaveProfileDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        name: editName.trim() || user.name,
        age: Number(editAge) || user.age,
        bio: editBio.trim() || user.bio,
        currentCity: editCity.trim() || user.currentCity,
        originCity: editOriginCity.trim() || user.originCity,
        jobTitle: editJob.trim() || user.jobTitle,
        interests: editInterests,
      });
      setIsEditingProfile(false);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    }
  };

  const toggleInterest = (tag: string) => {
    if (editInterests.includes(tag)) {
      setEditInterests(editInterests.filter(t => t !== tag));
    } else {
      setEditInterests([...editInterests, tag]);
    }
  };

  const handleExportData = () => {
    const data = {
      app: 'Allo-Allo Tunisie & Diaspora',
      exportDate: new Date().toISOString(),
      compliance: 'RGPD (UE) & Loi organique n° 2004-63 (INPDP Tunisie)',
      userProfile: user,
      privacySettings: privacy,
      creditsBalance: credits,
      isPremium
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `allo-allo-donnees-${user.id}.json`;
    a.click();
    setExportMessage('Archive complète de vos données exportée en JSON (Conformité INPDP/RGPD)');
    setTimeout(() => setExportMessage(null), 5000);
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm(
      'Êtes-vous sûr(e) de vouloir supprimer définitivement votre compte Allo-Allo et toutes vos conversations ? Cette action est irréversible (Droit à l’oubli).'
    );
    if (confirm) {
      alert('Demande de purge des données enregistrée selon les normes INPDP. Vos données seront supprimées sous 24h.');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#090b10] max-w-lg mx-auto overflow-y-auto no-scrollbar p-4 space-y-4">
      {/* Auth & Accounts Prominent Card - Clear & never hidden */}
      <div className="rounded-3xl bg-gradient-to-r from-[#141926] via-[#1a2033] to-[#141926] border border-rose-500/40 p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Connexion & Inscription</h3>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                  SSL 256-bit
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Session actuelle : <strong className="text-rose-300">{user.name}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {onGoToLogin && (
            <button
              id="profile-login-btn"
              onClick={onGoToLogin}
              className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
              title="Se connecter avec un compte existant"
            >
              <LogIn className="w-4 h-4 text-rose-400" />
              <span>Se Connecter</span>
            </button>
          )}

          {onGoToRegister && (
            <button
              id="profile-register-btn"
              onClick={onGoToRegister}
              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-rose-950/50 border border-rose-400/40"
              title="Créer un nouveau compte certifié"
            >
              <UserPlus className="w-4 h-4" />
              <span>S'inscrire</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#161a26] to-[#0f121b] border border-white/10 p-5 shadow-xl">
        {photoUpdatedToast && (
          <div className="mb-3 py-1.5 px-3 bg-emerald-600/90 text-white rounded-xl text-xs font-semibold text-center animate-in fade-in flex items-center justify-center gap-1.5 border border-emerald-400/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Photo de profil mise à jour avec succès !</span>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="relative group">
            {/* Hidden native file input */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Clickable Avatar with hover indicator */}
            <div 
              onClick={() => photoInputRef.current?.click()}
              className="relative cursor-pointer"
              title="Cliquer pour changer ou téléverser votre photo de profil"
            >
              <img
                src={user.photos[0]}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-rose-500 shadow-md group-hover:brightness-90 transition"
              />
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Petite icône discrète pour le téléchargement / téléversement de la photo de profil */}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-500 text-white p-1.5 rounded-full border-2 border-[#161a26] shadow-lg transition active:scale-90 z-10"
              title="Télécharger / Modifier ma photo de profil"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            {user.isVerified ? (
              <span className="absolute -bottom-1.5 -right-1.5 bg-sky-500 text-white p-1 rounded-full border-2 border-black" title="Badge Vérifié">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            ) : (
              <button
                onClick={() => setShowSelfieModal(true)}
                className="absolute -bottom-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-black"
                title="Vérifier mon identité"
              >
                Vérifier
              </button>
            )}
          </div>

          {/* Credits & Subscription Badges */}
          <div className="flex flex-col items-end space-y-1.5">
            <button
              onClick={onOpenRecharge}
              className="flex items-center space-x-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold transition hover:bg-amber-500/25"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{credits} 🪙 crédits</span>
            </button>
            {isPremium ? (
              <span className="text-[11px] font-bold bg-amber-500 text-black px-2 py-0.5 rounded-md uppercase flex items-center gap-1">
                <Crown className="w-3 h-3" /> Gold
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-md">
                Plan Gratuit (80%)
              </span>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white">{user.name}, {user.age}</h2>
            {user.isVerified && <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />}
          </div>

          <div className="flex items-center space-x-2 text-xs text-rose-400 font-semibold mt-0.5">
            <span>🇹🇳 Diaspora • {user.currentCity}, {user.currentCountry}</span>
            {user.originCity && <span>• Originaire de {user.originCity}</span>}
          </div>

          <p className="text-xs text-gray-300 mt-2 leading-relaxed">{user.bio}</p>
        </div>
      </div>

      {/* Verification Promo if not verified */}
      {!user.isVerified && (
        <div
          onClick={() => setShowSelfieModal(true)}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-950/40 to-indigo-950/40 border border-sky-500/30 flex items-center justify-between cursor-pointer hover:border-sky-500 transition"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Obtenez le badge "Vérifié"</h4>
              <p className="text-[10px] text-gray-300">Selfie rapide + pièce d'identité pour certifier votre profil.</p>
            </div>
          </div>
          <span className="text-xs font-bold text-sky-400 bg-sky-400/10 px-2.5 py-1 rounded-full">
            Certifier
          </span>
        </div>
      )}

      {/* Sub tabs navigation */}
      <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition ${
            activeSubTab === 'profile' ? 'bg-rose-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Mon Profil
        </button>
        <button
          onClick={() => setActiveSubTab('privacy')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition ${
            activeSubTab === 'privacy' ? 'bg-rose-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Confidentialité
        </button>
        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition ${
            activeSubTab === 'security' ? 'bg-rose-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Sécurité & INPDP
        </button>
      </div>

      {/* Sub Tab: Profile Settings */}
      {activeSubTab === 'profile' && (
        <div className="space-y-3">
          {saveToast && (
            <div className="p-3 bg-emerald-600/90 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Profil et modifications enregistrés avec succès !</span>
            </div>
          )}

          <div className="p-4 rounded-3xl bg-[#121622] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-rose-400" />
                Informations du profil
              </h4>
              <button
                type="button"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  isEditingProfile
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingProfile ? 'Annuler' : 'Modifier mes infos'}</span>
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfileDetails} className="space-y-3 pt-1">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-gray-400">Prénom & Nom :</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-400">Âge :</label>
                    <input
                      type="number"
                      min={18}
                      max={99}
                      value={editAge}
                      onChange={(e) => setEditAge(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white text-center font-bold focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-400">Ville actuelle :</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-400">Origine en Tunisie :</label>
                    <input
                      type="text"
                      value={editOriginCity}
                      onChange={(e) => setEditOriginCity(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-400">Profession / Statut :</label>
                  <input
                    type="text"
                    value={editJob}
                    onChange={(e) => setEditJob(e.target.value)}
                    placeholder="Ex: Ingénieur, Entrepreneur, Étudiant..."
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-400">Bio de présentation :</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-semibold text-gray-400">Centres d'intérêt culturels :</label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterest(tag)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition border ${
                          editInterests.includes(tag)
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer toutes les modifications</span>
                </button>
              </form>
            ) : (
              <>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Nom complet :</span>
                    <span className="font-semibold text-white">{user.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Âge :</span>
                    <span className="font-semibold text-white">{user.age} ans</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Ville actuelle :</span>
                    <span className="font-semibold text-white">{user.currentCity} ({user.currentCountry})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Origine :</span>
                    <span className="font-semibold text-white">{user.originCity || 'Tunis'}</span>
                  </div>
                  {user.jobTitle && (
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Profession :</span>
                      <span className="font-semibold text-white">{user.jobTitle}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Centres d'intérêt
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {user.interests.map((it, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-rose-500/15 border border-rose-500/30 text-rose-300 px-3 py-1 rounded-full font-medium"
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-1">
                  <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Langues parlées
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {user.languages.map((l, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white/10 text-gray-200 px-3 py-1 rounded-full font-medium"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sub Tab: Privacy Settings */}
      {activeSubTab === 'privacy' && (
        <div className="space-y-3">
          {/* Mode Discret */}
          <div className="p-4 rounded-2xl bg-[#121622] border border-white/10 flex items-center justify-between">
            <div className="space-y-0.5 max-w-[80%]">
              <div className="flex items-center space-x-1.5">
                <EyeOff className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-white">Mode Discret</h4>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Votre profil n'apparaîtra que pour les personnes que vous avez likées en premier.
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacy.discreetMode}
              onChange={(e) => onUpdatePrivacy({ discreetMode: e.target.checked })}
              className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
            />
          </div>

          {/* Masquer position exacte */}
          <div className="p-4 rounded-2xl bg-[#121622] border border-white/10 flex items-center justify-between">
            <div className="space-y-0.5 max-w-[80%]">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white">Masquer position exacte</h4>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Affiche uniquement votre ville (ex: Paris ou Tunis) sans géolocalisation précise.
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacy.hideExactLocation}
              onChange={(e) => onUpdatePrivacy({ hideExactLocation: e.target.checked })}
              className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
            />
          </div>

          {/* Qui peut me voir ? */}
          <div className="p-4 rounded-2xl bg-[#121622] border border-white/10 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-sky-400" />
              Qui peut voir mon profil ?
            </h4>
            <div className="space-y-1.5 text-xs text-gray-300">
              {[
                { id: 'everyone', label: 'Tout le monde (Diaspora + Locaux + Étrangers)' },
                { id: 'diaspora_only', label: 'Diaspora tunisienne uniquement 🇹🇳' },
                { id: 'locals_only', label: 'Locaux en Tunisie uniquement 📍' },
                { id: 'matches_only', label: 'Mes matchs uniquement' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-white/5 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={privacy.visibilityScope === opt.id}
                    onChange={() => onUpdatePrivacy({ visibilityScope: opt.id as any })}
                    className="accent-rose-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab: Security & Legal GDPR/INPDP */}
      {activeSubTab === 'security' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="text-xs font-bold text-white">Conformité RGPD & INPDP Tunisie</h4>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Vos données sont hébergées selon les normes de la loi tunisienne n° 2004-63 et du RGPD européen. Vos communications privées et coordonnées téléphoniques ne sont jamais partagées à des tiers.
            </p>

            {exportMessage && (
              <div className="p-2.5 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 font-medium">
                {exportMessage}
              </div>
            )}

            <button
              onClick={handleExportData}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white font-semibold flex items-center justify-center space-x-2 transition"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Télécharger l'intégralité de mes données (Export JSON)</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-3">
            <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Suppression et Droit à l'oubli
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Vous pouvez demander l'effacement immédiat et irréversible de votre compte, messages, photos et logs.
            </p>

            <button
              onClick={handleDeleteAccount}
              className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-semibold flex items-center justify-center space-x-2 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer définitivement mon compte et mes données</span>
            </button>
          </div>
        </div>
      )}

      {/* Administration & Session Controls */}
      <div className="p-4 rounded-3xl bg-[#121622] border border-white/10 space-y-2.5">
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
          Gestion du Compte & Administration
        </h4>

        {onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="w-full py-2.5 px-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-bold flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400" />
              Rubrique Administrateur (Contrôle de l'app)
            </span>
            <span className="text-[10px] bg-rose-500 text-white font-black px-1.5 py-0.2 rounded uppercase">
              Master
            </span>
          </button>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-3 bg-white/5 hover:bg-rose-950/30 hover:border-rose-500/30 border border-white/10 rounded-xl text-xs text-gray-300 hover:text-rose-300 font-semibold flex items-center justify-between transition"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-gray-400" />
              Se déconnecter (Changer de compte)
            </span>
            <span className="text-[10px] text-gray-500">Session</span>
          </button>
        )}
      </div>

      {/* Selfie ID Verification Modal */}
      {showSelfieModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-white/15 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
              <Camera className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-white">Vérification de Profil Allo-Allo</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Pour protéger la communauté des faux profils et des arnaques, prenez un selfie en direct avec le signe "V" de la main ✌️.
            </p>

            <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden border-2 border-dashed border-sky-400 bg-black/40 flex items-center justify-center">
              {selfieTaken ? (
                <div className="relative w-full h-full">
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80"
                    alt="Selfie"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 inset-x-2 text-[10px] bg-emerald-600 text-white font-bold py-0.5 rounded">
                    Photo validée ✓
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelfieTaken(true)}
                  className="flex flex-col items-center text-sky-400 hover:text-sky-300"
                >
                  <Camera className="w-8 h-8 mb-1 animate-pulse" />
                  <span className="text-xs font-semibold">Prendre le selfie</span>
                </button>
              )}
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSelfieModal(false);
                  setSelfieTaken(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-gray-300 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!selfieTaken}
                onClick={() => {
                  onVerifyBadge();
                  setShowSelfieModal(false);
                  alert('Félicitations ! Votre profil est désormais certifié avec le badge Vérifié Allo-Allo 🇹🇳.');
                }}
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold disabled:opacity-40 transition"
              >
                Valider le badge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
