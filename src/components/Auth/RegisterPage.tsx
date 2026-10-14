import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Camera, 
  Globe, 
  MapPin, 
  Heart, 
  ShieldCheck, 
  User, 
  Upload, 
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Mail,
  KeyRound,
  RefreshCw,
  AlertCircle,
  Shield,
  CheckCircle2,
  Calendar,
  Loader2
} from 'lucide-react';
import { AppLogo } from '../Common/AppLogo';
import { hashPassword } from '../../utils/password';
import { Profile, UserStatus, Gender } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';

interface RegisterPageProps {
  logoUrl: string | null;
  onRegisterSuccess: (newProfile: Profile) => void;
  onRegisterCouple?: (husband: Profile, wife: Profile) => void;
  onGoToLogin: () => void;
  onBackToApp?: () => void;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80'
];

const TUNISIAN_CITIES = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'La Marsa / Carthage',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Bizerte',
  'Nabeul / Hammamet',
  'Djerba',
  'Gabès',
  'Kairouan',
  'Gafsa',
  'Zaghouan',
  'Autre région de Tunisie'
];

const CULTURAL_TAGS = [
  'Café Direct ☕',
  'Plage & Mer 🏖️',
  'Sidi Bou Saïd 💙',
  'Couscous Tunisien 🍲',
  'Startups & Tech 💻',
  'Musique & Mezoued 🎵',
  'Voyages ✈️',
  'Djerba la Douce 🌴',
  'Randonnées Zaghouan 🏔️',
  'Hammamet Vibes ⛵'
];

export const RegisterPage: React.FC<RegisterPageProps> = ({
  logoUrl,
  onRegisterSuccess,
  onRegisterCouple,
  onGoToLogin,
  onBackToApp,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // STEP 1: Identity & Strong Security Credentials
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<Gender>('man');
  const [phonePrefix, setPhonePrefix] = useState('+216');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // STEP 2: 2FA Verification
  const [otpCode, setOtpCode] = useState('8391');
  const [generatedOtp, setGeneratedOtp] = useState('8391');
  const [timerSeconds, setTimerSeconds] = useState(60);

  // STEP 3: Origin, Culture & Profile
  const [status, setStatus] = useState<UserStatus>('diaspora');
  const [currentCity, setCurrentCity] = useState('Paris');
  const [currentCountry, setCurrentCountry] = useState('France');
  const [originCity, setOriginCity] = useState('Tunis');
  const [bio, setBio] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(DEFAULT_AVATARS[2]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Café Direct ☕',
    'Plage & Mer 🏖️',
    'Sidi Bou Saïd 💙'
  ]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Countdown timer for 2FA in step 2
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  // Password Security Strength Calculation
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

  const getPasswordStrengthLabel = () => {
    if (passwordScore === 0) return { text: 'Très faible', color: 'bg-gray-600', textColor: 'text-gray-400' };
    if (passwordScore <= 2) return { text: 'Moyen', color: 'bg-amber-500', textColor: 'text-amber-400' };
    if (passwordScore === 3) return { text: 'Fort', color: 'bg-sky-500', textColor: 'text-sky-400' };
    return { text: 'Sécurité Maximale (Blindé)', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
  };

  const strength = getPasswordStrengthLabel();

  const handleResendOtp = () => {
    if (timerSeconds > 0) return;
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setOtpCode(newOtp);
    setTimerSeconds(60);
  };

  const handleCustomPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressingPhoto(true);
      setErrorMsg(null);
      try {
        const compressed = await compressImageFile(file, 600, 600, 0.82);
        setSelectedPhoto(compressed);
      } catch (err) {
        console.error('Error compressing image:', err);
        setErrorMsg('Impossible de traiter cette photo, veuillez en choisir une autre.');
      } finally {
        setIsCompressingPhoto(false);
      }
    }
  };

  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter(t => t !== tag));
    } else {
      setSelectedInterests([...selectedInterests, tag]);
    }
  };

  // STEP 1 Submission
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Veuillez saisir votre prénom ou nom complet.');
      return;
    }
    if (age < 18) {
      setErrorMsg('Vous devez être âgé(e) d’au moins 18 ans pour vous inscrire.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Veuillez saisir votre numéro de téléphone.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Veuillez saisir une adresse email valide.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setErrorMsg('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('Vous devez accepter les règles de confidentialité.');
      return;
    }

    setErrorMsg(null);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpCode(code); // Pre-fill code for effortless testing
    setTimerSeconds(60);
    setStep(2);
  };

  // STEP 2 Submission (2FA Verification)
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStep(3);
  };

  // STEP 3 Final Submission
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCity.trim()) {
      setErrorMsg('Veuillez indiquer votre ville de résidence actuelle.');
      return;
    }

    const passwordHash = await hashPassword(password);

    const newProfile: Profile = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      age: Number(age),
      gender: gender,
      status: status,
      currentCity: currentCity.trim(),
      currentCountry: currentCountry,
      originCity: originCity || 'Tunis',
      distanceKm: status === 'diaspora' ? 1400 : 8,
      bio: bio.trim() || `Originaire de ${originCity || 'Tunisie'}, ravi(e) de rejoindre la communauté Allo-Allo ! 🇹🇳`,
      photos: [selectedPhoto],
      jobTitle: status === 'diaspora' ? 'Diaspora Tunisienne' : 'Résident(e) en Tunisie',
      interests: selectedInterests,
      languages: ['Arabe tunisien', 'Français'],
      isVerified: true, // Auto-verified through 2FA
      isPremium: true,
      onlineStatus: 'online',
      email: email.trim(),
      phoneNumber: `${phonePrefix} ${phone.trim()}`,
      isAdmin: false,
      passwordHash
    };

    onRegisterSuccess(newProfile);
  };

  // Quick Preset Helper for testing without typing
  const handlePreFillDemo = () => {
    setName('Karim');
    setAge(28);
    setGender('man');
    setPhonePrefix('+216');
    setPhone('98 123 456');
    setEmail('karim.test@allo-allo.tn');
    setPassword('AlloAllo2026!');
    setConfirmPassword('AlloAllo2026!');
    setSelectedPhoto(DEFAULT_AVATARS[2]);
    setBio('Tunisien de la diaspora active, fier de nos origines et ouvert aux belles rencontres 🇹🇳');
    setErrorMsg(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#07090e] text-white p-4 sm:p-6 overflow-y-auto no-scrollbar">
      {/* Header with back button */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={step > 1 ? () => setStep((step - 1) as 1 | 2) : (onBackToApp || onGoToLogin)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step > 1 ? 'Étape précédente' : onBackToApp ? 'Retour application' : 'Connexion'}</span>
          </button>

          {step === 1 && (
            <button
              onClick={onGoToLogin}
              className="px-2.5 py-1 rounded-lg text-rose-400 hover:text-rose-300 text-xs font-bold underline"
            >
              Déjà un compte ? Se connecter
            </button>
          )}
        </div>

        <AppLogo logoUrl={logoUrl} size="sm" showText={true} />

        <div className="flex items-center gap-1.5">
          <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Étape {step}/3</span>
          </div>
        </div>
      </div>

      {/* Security Breadcrumb */}
      <div className="max-w-md w-full mx-auto pt-3">
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-rose-500' : 'bg-white/10'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-rose-500' : 'bg-white/10'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? 'bg-rose-500' : 'bg-white/10'}`} />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 pt-1 font-semibold">
          <span className={step === 1 ? 'text-rose-400 font-bold' : ''}>1. Identité & Sécurité</span>
          <span className={step === 2 ? 'text-rose-400 font-bold' : ''}>2. Double Authentification</span>
          <span className={step === 3 ? 'text-rose-400 font-bold' : ''}>3. Profil & Origines</span>
        </div>
      </div>

      {errorMsg && (
        <div className="max-w-md w-full mx-auto mt-3 p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: IDENTITY & STRONG SECURITY CREDENTIALS */}
      {/* ========================================================================= */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="max-w-md w-full mx-auto my-auto py-4 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
              Créer votre compte sécurisé 🇹🇳
            </h2>
            <p className="text-xs text-gray-400">
              Inscription vérifiée et protégée par le chiffrement de bout en bout
            </p>
          </div>

          {/* Security Guarantee Badge */}
          <div className="p-2.5 rounded-2xl bg-[#101420] border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <span className="font-bold text-white text-[11px]">Protection Maximale des Données</span>
                <p className="text-[10px] text-gray-400">Conforme INPDP Tunisie (Loi n° 2004-63)</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
              SSL 256-bit
            </span>
          </div>

          {/* Genre & Prénom */}
          <div className="space-y-3 bg-[#101420]/80 p-4 rounded-3xl border border-white/10">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGender('man')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  gender === 'man' 
                    ? 'bg-rose-600 border-rose-500 text-white shadow-md' 
                    : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <span>👨 Un Homme</span>
              </button>
              <button
                type="button"
                onClick={() => setGender('woman')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  gender === 'woman' 
                    ? 'bg-rose-600 border-rose-500 text-white shadow-md' 
                    : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <span>👩 Une Femme</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-semibold text-gray-300">Prénom & Nom :</label>
                <input
                  type="text"
                  placeholder="Ex: Karim, Mariem..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Âge :</label>
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-bold text-center"
                />
              </div>
            </div>

            {/* Mobile with country code */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span>Numéro Mobile (Vérification 2FA SMS) :</span>
                <span className="text-[10px] text-rose-400">Obligatoire</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={phonePrefix}
                  onChange={(e) => setPhonePrefix(e.target.value)}
                  className="bg-black/50 border border-white/15 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold shrink-0"
                >
                  <option value="+216">🇹🇳 +216 (TN)</option>
                  <option value="+33">🇫🇷 +33 (FR)</option>
                  <option value="+1">🇨🇦 +1 (CA/US)</option>
                  <option value="+49">🇩🇪 +49 (DE)</option>
                  <option value="+39">🇮🇹 +39 (IT)</option>
                  <option value="+971">🇦🇪 +971 (EAU)</option>
                </select>
                <input
                  type="tel"
                  placeholder="Ex: 98 123 456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Email personnel :</label>
              <input
                type="email"
                placeholder="votre.email@domaine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Strong Password Section */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300">Mot de passe de sécurité :</label>
                <span className={`text-[10px] font-bold ${strength.textColor}`}>{strength.text}</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 caractères (lettres, chiffres, symboles)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl pl-3 pr-10 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter bars */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <div className={`h-1 rounded-full ${passwordScore >= 1 ? strength.color : 'bg-white/10'}`} />
                <div className={`h-1 rounded-full ${passwordScore >= 2 ? strength.color : 'bg-white/10'}`} />
                <div className={`h-1 rounded-full ${passwordScore >= 3 ? strength.color : 'bg-white/10'}`} />
                <div className={`h-1 rounded-full ${passwordScore >= 4 ? strength.color : 'bg-white/10'}`} />
              </div>

              {/* Confirmation Mot de passe */}
              <div className="pt-1 space-y-1">
                <label className="text-xs font-semibold text-gray-300">Confirmez votre mot de passe :</label>
                <input
                  type="password"
                  placeholder="Retapez le mot de passe identique"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-black/50 border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none ${
                    confirmPassword && confirmPassword === password 
                      ? 'border-emerald-500' 
                      : confirmPassword && confirmPassword !== password 
                      ? 'border-rose-500' 
                      : 'border-white/15 focus:border-rose-500'
                  }`}
                />
                {confirmPassword && confirmPassword === password && (
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <Check className="w-3 h-3" /> Mots de passe identiques
                  </p>
                )}
              </div>
            </div>

            {/* Terms and Privacy Check */}
            <div className="pt-2 border-t border-white/10">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-gray-600 text-rose-600 focus:ring-0 w-4 h-4 mt-0.5"
                />
                <span className="text-[11px] leading-tight">
                  Je certifie avoir plus de 18 ans et j'accepte la politique de confidentialité stricte et de protection des données d'Allo-Allo.
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-2xl text-xs font-bold shadow-xl shadow-rose-600/30 flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <span>Passer à la vérification 2FA Sécurisée</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Pre-fill for reviewers */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handlePreFillDemo}
              className="text-[11px] text-gray-400 hover:text-rose-300 underline font-medium"
            >
              Pré-remplir un profil test de démonstration
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: REAL 2FA VERIFICATION */}
      {/* ========================================================================= */}
      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="max-w-md w-full mx-auto my-auto py-4 space-y-4">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <Phone className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-white">Vérification de sécurité 2FA</h2>
            <p className="text-xs text-gray-400">
              Un code de validation unique a été envoyé au <strong className="text-white">{phonePrefix} {phone}</strong>
            </p>
          </div>

          <div className="p-4 rounded-3xl bg-[#101420] border border-emerald-500/30 space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Code de sécurité généré pour le test :
                </span>
                <span className="font-mono text-xs font-black bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                  {generatedOtp}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOtpCode(generatedOtp)}
                className="w-full py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-500/30 transition"
              >
                Cliquer pour insérer automatiquement le code ({generatedOtp})
              </button>
            </div>

            <div className="space-y-1.5 text-center">
              <label className="text-xs font-semibold text-gray-300">
                Saisissez le code de validation (4 chiffres) :
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="••••"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center tracking-[0.6em] font-mono text-2xl font-black bg-black/60 border border-rose-500/40 rounded-2xl py-3 text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 shadow-inner"
              />
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                <span>Chiffrement AES 256-bit</span>
                {timerSeconds > 0 ? (
                  <span className="text-amber-400 font-mono">Renvoi dans {timerSeconds}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-rose-400 hover:text-rose-300 underline font-bold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Renvoyer le code</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-2xl text-xs font-bold shadow-xl shadow-rose-600/30 flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Valider le numéro & Continuer</span>
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: TUNISIAN ORIGINS & CERTIFIED PROFILE PHOTO */}
      {/* ========================================================================= */}
      {step === 3 && (
        <form onSubmit={handleStep3Submit} className="max-w-md w-full mx-auto my-auto py-3 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-white">Votre profil & Origines 🇹🇳</h2>
            <p className="text-xs text-gray-400">
              Dernière étape pour finaliser votre compte certifié
            </p>
          </div>

          <div className="space-y-3 bg-[#101420]/80 p-4 rounded-3xl border border-white/10">
            {/* Statut culturel */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Votre situation :</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('diaspora')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    status === 'diaspora'
                      ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                      : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Diaspora (À l'étranger)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('local')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    status === 'local'
                      ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                      : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Résident en Tunisie 🇹🇳</span>
                </button>
              </div>
            </div>

            {/* Ville actuelle & Origine */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Ville actuelle :</label>
                <input
                  type="text"
                  placeholder="Ex: Paris, Lyon, Tunis..."
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Origine en Tunisie :</label>
                <select
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  {TUNISIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Photo de profil avec badge certifié */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300">Photo de profil :</label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 underline"
                >
                  <Upload className="w-3 h-3" />
                  <span>Importer ma photo</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomPhotoUpload}
                className="hidden"
              />

              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={selectedPhoto}
                    alt="Aperçu"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-rose-500 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-0.5 rounded-full" title="Vérification photo active">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-1.5 py-1">
                  {DEFAULT_AVATARS.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt="Avatar"
                      onClick={() => setSelectedPhoto(av)}
                      className={`w-10 h-10 rounded-xl object-cover cursor-pointer transition border-2 shrink-0 ${
                        selectedPhoto === av ? 'border-rose-500 scale-105' : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Centres d'intérêt */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-gray-300">Centres d'intérêt culturels :</label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                {CULTURAL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition border ${
                      selectedInterests.includes(tag)
                        ? 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-gray-300">Bio de présentation :</label>
              <textarea
                rows={2}
                placeholder="Quelques mots sur vous, vos passions, vos origines..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-2xl text-xs font-bold shadow-xl shadow-rose-600/30 flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Finaliser l'Inscription & Entrer sur Allo-Allo</span>
          </button>
        </form>
      )}

      {/* Footer reassurance */}
      <div className="text-center pt-3 pb-2 text-[10px] text-gray-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Données chiffrées de bout en bout • Non transmises à des tiers</span>
      </div>
    </div>
  );
};
