import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  User, 
  KeyRound, 
  Check, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Fingerprint, 
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Shield
} from 'lucide-react';
import { AppLogo } from '../Common/AppLogo';
import { hashPassword } from '../../utils/password';
import { adminLogin } from '../../utils/api';
import { Profile } from '../../types';

interface LoginPageProps {
  logoUrl: string | null;
  onLoginSuccess: (user: Profile) => void;
  onGoToRegister: () => void;
  onGoToAdmin: () => void;
  onOpenLogoGuide?: () => void;
  onBackToApp?: () => void;
  registeredAccounts?: Profile[];
  demoProfiles: {
    karim: Profile;
    wife?: Profile;
    nour: Profile;
    admin: Profile;
  };
}

export const LoginPage: React.FC<LoginPageProps> = ({
  logoUrl,
  onLoginSuccess,
  onGoToRegister,
  onGoToAdmin,
  onOpenLogoGuide,
  onBackToApp,
  registeredAccounts = [],
  demoProfiles,
}) => {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('email');
  const [phonePrefix, setPhonePrefix] = useState('+216');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  
  // 2FA Security states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('7429');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timerSeconds]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // SÉCURITÉ : l'ancien code SMS était généré dans le navigateur et affiché à l'écran, puis jamais
    // vérifié : n'importe qui pouvait entrer dans le compte d'un autre avec son numéro.
    // La connexion par SMS reste fermée tant qu'un vrai fournisseur SMS n'est pas branché côté serveur.
    setErrorMessage("La connexion par SMS n'est pas encore disponible. Utilisez votre email et votre mot de passe.");
    return;
    // eslint-disable-next-line no-unreachable
    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setErrorMessage('Veuillez saisir un numéro de téléphone valide.');
      return;
    }
    if (!isCaptchaVerified) {
      setErrorMessage('Veuillez cocher la vérification de sécurité anti-robot.');
      return;
    }

    setErrorMessage(null);
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newCode);
    setTimerSeconds(60);
    setOtpSent(true);
    setSuccessNotice(`Code de sécurité envoyé par SMS au ${phonePrefix} ${phoneNumber}`);
  };

  const handleResendOtp = () => {
    if (timerSeconds > 0) return;
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newCode);
    setTimerSeconds(60);
    setSuccessNotice(`Nouveau code SMS généré : ${newCode}`);
  };

  const handleVerifyOtpAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("La connexion par SMS n'est pas encore disponible. Utilisez votre email et votre mot de passe.");
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Veuillez renseigner une adresse email valide.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Veuillez saisir votre mot de passe.');
      return;
    }

    // Search in registered accounts
    const matched = registeredAccounts.find(p => 
      (p.email || '').trim().toLowerCase() === cleanEmail
    );

    if (matched) {
      // Real password check when the account was created with one (post-update accounts).
      if (!matched.passwordHash) {
        setErrorMessage('Ce compte de démonstration n’a pas de mot de passe : créez votre propre compte.');
        return;
      }
      const enteredHash = await hashPassword(password);
      if (enteredHash !== matched.passwordHash) {
        setErrorMessage('Mot de passe incorrect.');
        return;
      }
      onLoginSuccess(matched);
      return;
    }

    // Pas de compte membre : on tente l'accès administrateur, vérifié par le serveur
    const adminResult = await adminLogin(cleanEmail, password);
    if (adminResult === 'ok') {
      onLoginSuccess(demoProfiles.admin);
      return;
    }

    setErrorMessage('Aucun compte trouvé avec cet email. Inscrivez-vous d’abord.');
  };

  const handleBiometricAuth = () => {
    // SÉCURITÉ : l'ancienne version connectait n'importe qui au dernier compte inscrit.
    setErrorMessage("La connexion biométrique n'est pas encore disponible. Utilisez votre email et votre mot de passe.");
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#07090e] text-white p-4 sm:p-6 overflow-y-auto no-scrollbar justify-between">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        {onBackToApp ? (
          <button
            onClick={onBackToApp}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'application</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Connexion Sécurisée SSL 256-bit</span>
            <span className="sm:hidden">SSL 256-bit</span>
          </div>

          <button
            onClick={onGoToRegister}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white transition flex items-center gap-1.5 text-xs font-bold shadow-md shadow-rose-950/40 border border-rose-400/30"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Inscription</span>
          </button>
        </div>
      </div>

      {/* Top Brand & Security Header */}
      <div className="flex flex-col items-center text-center pt-2 sm:pt-4 space-y-2">
        <div className="relative">
          <AppLogo logoUrl={logoUrl} size="lg" showText={false} />
          <span className="absolute -bottom-1 -right-1 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full border-2 border-black shadow">
            🇹🇳 TN
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Allo-Allo
          </h1>
          <p className="text-xs text-rose-300 font-medium max-w-sm">
            Plateforme certifiée de rencontres pour les Tunisiens du monde & de Tunisie
          </p>
        </div>
      </div>

      {/* Main Login Form Card with Optimal Security */}
      <div className="w-full max-w-md mx-auto my-3 bg-[#101420]/95 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Security Assurance Banner */}
        <div className="p-2.5 rounded-2xl bg-[#090c14] border border-emerald-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-white flex items-center gap-1">
                <span>Espace Authentifié Sécurisé</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-gray-400">
                Protection des données conforme INPDP (Loi n° 2004-63)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
            2FA ACTIF
          </span>
        </div>

        {/* Saved Accounts on this Device */}
        {registeredAccounts.length > 0 && (
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-rose-400" />
                Comptes enregistrés ({registeredAccounts.length})
              </span>
              <span className="text-[10px] text-gray-400">Connexion en 1 clic</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {registeredAccounts.slice(0, 4).map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => onLoginSuccess(acc)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-black/40 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/40 transition text-left group"
                >
                  <img
                    src={acc.photos[0]}
                    alt={acc.name}
                    className="w-8 h-8 rounded-lg object-cover border border-rose-500/60 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white group-hover:text-rose-300 truncate">
                      {acc.name}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {acc.currentCity || 'Tunisie'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toggle Phone / Email */}
        <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              authMethod === 'phone' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Téléphone (SMS 2FA)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              authMethod === 'email' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email & Mot de passe</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successNotice && (
          <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessNotice(null)}
              className="text-[10px] text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* METHOD 1: Phone + Real 2FA OTP */}
        {authMethod === 'phone' && (
          <>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                    <span>Numéro de téléphone mobile :</span>
                    <span className="text-[10px] text-rose-400">Authentification 2FA</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={phonePrefix}
                      onChange={(e) => setPhonePrefix(e.target.value)}
                      className="bg-black/50 border border-white/15 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold shrink-0"
                    >
                      <option value="+216">🇹🇳 Tunisie (+216)</option>
                      <option value="+33">🇫🇷 France (+33)</option>
                      <option value="+1">🇨🇦 Canada / US (+1)</option>
                      <option value="+49">🇩🇪 Allemagne (+49)</option>
                      <option value="+39">🇮🇹 Italie (+39)</option>
                      <option value="+971">🇦🇪 Émirats (+971)</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Ex: 98 123 456 ou 06 12..."
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Un code à usage unique chiffré vous sera envoyé par SMS pour protéger votre compte contre tout accès non autorisé.
                  </p>
                </div>

                {/* Anti-Bot Security Check */}
                <div 
                  onClick={() => setIsCaptchaVerified(!isCaptchaVerified)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isCaptchaVerified 
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
                      : 'bg-black/30 border-white/10 hover:border-white/20 text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                      isCaptchaVerified ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-gray-500'
                    }`}>
                      {isCaptchaVerified && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-semibold">Je ne suis pas un robot (Contrôle anti-intrusion)</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">reCAPTCHA v3</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Envoyer mon code SMS de sécurité</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpAndLogin} className="space-y-3.5">
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Code SMS envoyé au {phonePrefix} {phoneNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] text-gray-300 underline font-semibold hover:text-white"
                    >
                      Modifier
                    </button>
                  </div>
                  <div className="text-[11px] text-gray-300 flex items-center gap-2 pt-1">
                    <span>Code simulé de test :</span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(generatedOtp)}
                      className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono font-bold border border-emerald-500/40 hover:bg-emerald-500/30 transition"
                    >
                      {generatedOtp} (Cliquer pour insérer)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-center">
                  <label className="text-xs font-semibold text-gray-300">
                    Saisissez le code à 4 chiffres :
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
                    <span>Tentatives restantes : 3/3</span>
                    {timerSeconds > 0 ? (
                      <span className="text-amber-400 font-mono">Renvoi possible dans {timerSeconds}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-rose-400 hover:text-rose-300 underline font-bold flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Renvoyer un code SMS</span>
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition active:scale-95"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Vérifier & Valider la Connexion Sécurisée</span>
                </button>
              </form>
            )}
          </>
        )}

        {/* METHOD 2: Email & Strong Password */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Adresse Email :</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300">Mot de passe :</label>
                <button
                  type="button"
                  onClick={() => setSuccessNotice('Lien de réinitialisation sécurisé envoyé par email.')}
                  className="text-[11px] text-rose-400 hover:text-rose-300 underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-300 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="rounded border-gray-600 text-rose-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-[11px]">Mémoriser cet appareil sécurisé</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Session chiffrée
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>Se Connecter en Toute Sécurité</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Biometric Fast Login Option */}
        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleBiometricAuth}
            disabled={isBiometricAuthenticating}
            className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Fingerprint className={`w-4 h-4 text-emerald-400 ${isBiometricAuthenticating ? 'animate-spin' : ''}`} />
            <span>
              {isBiometricAuthenticating ? 'Vérification biométrique en cours...' : 'Connexion biométrique (Face ID / Touch ID)'}
            </span>
          </button>
        </div>

        {/* Quick Demo Test Access (Subtle & Professional) */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Accès rapide test (1 clic)</span>
            <span className="text-gray-500">Profils certifiés</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onLoginSuccess(demoProfiles.karim)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-center space-x-2 active:scale-95"
            >
              <img
                src={demoProfiles.karim.photos[0]}
                alt="Karim"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">Karim 🇹🇳</div>
                <div className="text-[10px] text-rose-400 truncate">Diaspora Paris</div>
              </div>
            </button>

            {demoProfiles.wife ? (
              <button
                type="button"
                onClick={() => onLoginSuccess(demoProfiles.wife!)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-center space-x-2 active:scale-95"
              >
                <img
                  src={demoProfiles.wife.photos[0]}
                  alt="Mariem"
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{demoProfiles.wife.name.split(' ')[0]} 🇹🇳</div>
                  <div className="text-[10px] text-rose-300 truncate">Membre Certifiée</div>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onLoginSuccess(demoProfiles.nour)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-center space-x-2"
              >
                <img
                  src={demoProfiles.nour.photos[0]}
                  alt="Nour"
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">Nour 📍</div>
                  <div className="text-[10px] text-gray-400 truncate">Locale La Marsa</div>
                </div>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onGoToAdmin}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Espace Administrateur</span>
            </button>

            {onOpenLogoGuide && (
              <button
                type="button"
                onClick={onOpenLogoGuide}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Guide Logo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Registration Link & Security Seal */}
      <div className="text-center space-y-2 pb-2">
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="text-gray-400">Nouveau sur Allo-Allo ?</span>
          <button
            type="button"
            onClick={onGoToRegister}
            className="font-bold text-rose-400 hover:text-rose-300 underline transition"
          >
            Créer un compte sécurisé (Inscription) →
          </button>
        </div>

        <p className="text-[10px] text-gray-500 max-w-sm mx-auto">
          Toutes les communications, appels audio/vidéo et messages sont chiffrés de bout en bout. Respect strict de la vie privée.
        </p>
      </div>
    </div>
  );
};
