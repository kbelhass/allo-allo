import React, { useState } from 'react';
import { 
  Coins, 
  Smartphone, 
  Maximize2, 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  Users, 
  ChevronDown, 
  UserPlus, 
  LogIn 
} from 'lucide-react';
import { AppLogo } from '../Common/AppLogo';
import { Profile } from '../../types';

interface TopHeaderProps {
  credits: number;
  isPremium: boolean;
  logoUrl?: string | null;
  isAdmin?: boolean;
  currentUser?: Profile;
  wifeProfile?: Profile;
  registeredAccounts?: Profile[];
  isSyncing?: boolean;
  onForceSync?: () => void;
  onOpenRecharge: () => void;
  onOpenArchitecture: () => void;
  onOpenSafety: () => void;
  onOpenAdmin: () => void;
  onOpenLogoUpload: () => void;
  onOpenLogoGuide?: () => void;
  onGoToLogin?: () => void;
  onGoToRegister?: () => void;
  onSwitchUser?: (newUser: Profile) => void;
  isPhoneFrame: boolean;
  onToggleFrame: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  credits,
  isPremium,
  logoUrl,
  isAdmin,
  currentUser,
  registeredAccounts = [],
  isSyncing = false,
  onForceSync,
  onOpenRecharge,
  onOpenArchitecture,
  onOpenSafety,
  onOpenAdmin,
  onOpenLogoUpload,
  onOpenLogoGuide,
  onGoToLogin,
  onGoToRegister,
  onSwitchUser,
  isPhoneFrame,
  onToggleFrame,
}) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  return (
    <header className="w-full bg-[#0d1017]/95 backdrop-blur-md border-b border-white/10 px-3 py-2 flex items-center justify-between z-30 sticky top-0">
      {/* Brand logo */}
      <div className="flex items-center space-x-2 select-none">
        <div>
          <AppLogo logoUrl={logoUrl} size="sm" showText={true} />
        </div>
      </div>

      {/* Center / Right: Sync status + Account switcher + Credits + Admin + Frame toggle */}
      <div className="flex items-center space-x-2">
        {/* Live Multi-Device Sync Indicator */}
        {onForceSync && (
          <button
            type="button"
            onClick={onForceSync}
            disabled={isSyncing}
            className="flex items-center space-x-1 bg-white/5 hover:bg-white/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded-full text-[10px] font-semibold transition active:scale-95"
            title="Synchronisation PC & Mobile en temps réel (cliquer pour forcer l'actualisation)"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span className="hidden xs:inline">{isSyncing ? 'Sync...' : 'Direct PC/Tél'}</span>
          </button>
        )}

        {/* Current User Pill & Switcher */}
        {currentUser && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center space-x-1.5 bg-[#161a26] hover:bg-[#1f2434] border border-white/15 px-2 py-1 rounded-full text-xs font-semibold text-white transition active:scale-95 shadow-sm"
              title="Changer de compte ou voir les profils connectés"
            >
              <img
                src={currentUser.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-rose-500"
              />
              <span className="text-[11px] max-w-[65px] truncate font-bold">{currentUser.name}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Dropdown Menu for registered accounts */}
            {showAccountMenu && (
              <div 
                className="absolute right-0 top-full mt-2 w-64 bg-[#10141f] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 text-[11px] font-bold text-gray-400 border-b border-white/10 mb-1 flex items-center justify-between">
                  <span>Comptes enregistrés ({registeredAccounts.length})</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">● PC & Mobile</span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 py-1">
                  {registeredAccounts.map((acc) => {
                    const isCurrent = acc.id === currentUser.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          if (onSwitchUser) onSwitchUser(acc);
                          setShowAccountMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-1.5 rounded-xl text-left transition ${
                          isCurrent
                            ? 'bg-rose-600/20 border border-rose-500 text-white'
                            : 'hover:bg-white/5 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <img
                            src={acc.photos[0]}
                            alt={acc.name}
                            className="w-7 h-7 rounded-full object-cover border border-white/10"
                          />
                          <div className="truncate">
                            <p className="text-xs font-bold leading-tight truncate">{acc.name}, {acc.age}</p>
                            <p className="text-[10px] text-gray-400 truncate">{acc.currentCity}</p>
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md">
                            Actif
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-white/10 pt-1.5 mt-1 grid grid-cols-2 gap-1 text-[11px]">
                  {onGoToRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAccountMenu(false);
                        onGoToRegister();
                      }}
                      className="py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-semibold flex items-center justify-center gap-1"
                    >
                      <UserPlus className="w-3 h-3 text-rose-400" />
                      <span>Nouveau</span>
                    </button>
                  )}
                  {onGoToLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAccountMenu(false);
                        onGoToLogin();
                      }}
                      className="py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-semibold flex items-center justify-center gap-1"
                    >
                      <LogIn className="w-3 h-3 text-sky-400" />
                      <span>Connexion</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Credits Pill */}
        <button
          id="topbar-credits-btn"
          onClick={onOpenRecharge}
          className="flex items-center space-x-1 bg-gradient-to-r from-amber-500/15 to-rose-500/15 hover:from-amber-500/25 hover:to-rose-500/25 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-full text-xs font-semibold transition active:scale-95"
          title="Recharger des crédits"
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-bold">{credits} 🪙</span>
        </button>

        {/* Admin Dashboard button - only if admin */}
        {isAdmin && (
          <button
            id="topbar-admin-btn"
            onClick={onOpenAdmin}
            className="p-1.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 rounded-lg transition active:scale-95"
            title="Espace Administrateur"
          >
            <Shield className="w-4 h-4 text-rose-400" />
          </button>
        )}

        {/* Device frame switch */}
        <button
          id="topbar-frame-toggle-btn"
          onClick={onToggleFrame}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition"
          title={isPhoneFrame ? "Plein écran" : "Simulateur smartphone"}
        >
          {isPhoneFrame ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4 text-rose-400" />}
        </button>
      </div>
    </header>
  );
};

