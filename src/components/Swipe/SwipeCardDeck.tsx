import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { 
  Heart, 
  X, 
  Star, 
  RotateCcw, 
  CheckCircle2, 
  MapPin, 
  Sparkles, 
  Info, 
  Zap, 
  SlidersHorizontal,
  RefreshCw,
  Radio
} from 'lucide-react';
import { Profile } from '../../types';

interface SwipeCardDeckProps {
  profiles: Profile[];
  onSwipe: (profile: Profile, action: 'like' | 'pass' | 'superlike') => void;
  onOpenProfileDetail: (profile: Profile) => void;
  onOpenFilters: () => void;
  onBoostProfile: () => void;
  onForceSync?: () => void;
  isSyncing?: boolean;
  credits: number;
}

export const SwipeCardDeck: React.FC<SwipeCardDeckProps> = ({
  profiles,
  onSwipe,
  onOpenProfileDetail,
  onOpenFilters,
  onBoostProfile,
  onForceSync,
  isSyncing = false,
  credits,
}) => {
  const [genderPreference, setGenderPreference] = useState<'all' | 'woman' | 'man'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<Profile[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Active deck filtered by gender preference
  const activeDeck = profiles.filter(p => {
    if (genderPreference === 'all') return true;
    return p.gender === genderPreference;
  });

  const activeProfile = activeDeck[currentIndex];

  // Reset index when active deck changes or shrinks
  React.useEffect(() => {
    if (currentIndex >= activeDeck.length && activeDeck.length > 0) {
      setCurrentIndex(0);
    }
  }, [genderPreference, activeDeck.length]);

  // Motion values for swiping gesture
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacityLike = useTransform(x, [20, 100], [0, 1]);
  const opacityPass = useTransform(x, [-20, -100], [0, 1]);
  const opacitySuperlike = useTransform(y, [-20, -100], [0, 1]);

  const handleSwipeAction = (action: 'like' | 'pass' | 'superlike') => {
    if (!activeProfile) return;
    setHistory((prev) => [...prev, activeProfile]);
    onSwipe(activeProfile, action);
    setCurrentIndex((prev) => prev + 1);
    setCurrentPhotoIndex(0);
    x.set(0);
    y.set(0);
  };

  const handleUndo = () => {
    if (history.length === 0 || currentIndex === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => prev - 1);
    setCurrentPhotoIndex(0);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeProfile) return;
    if (currentPhotoIndex < activeProfile.photos.length - 1) {
      setCurrentPhotoIndex((prev) => prev + 1);
    } else {
      setCurrentPhotoIndex(0);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeProfile) return;
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex((prev) => prev - 1);
    } else {
      setCurrentPhotoIndex(activeProfile.photos.length - 1);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 sm:p-4 select-none max-w-lg mx-auto">
      {/* Top Filter & Boost Bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            80% Gratuit • Likes illimités
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onForceSync && (
            <button
              id="swipe-sync-refresh-btn"
              onClick={onForceSync}
              className={`p-1.5 rounded-full border transition ${
                isSyncing
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
              }`}
              title="Actualiser et synchroniser les profils connectés PC/Mobile"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          )}

          <button
            id="swipe-boost-btn"
            onClick={onBoostProfile}
            className="flex items-center space-x-1 bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-purple-500/30 text-purple-300 hover:text-white px-2.5 py-1 rounded-full text-xs font-semibold transition hover:scale-105 active:scale-95"
            title="Booster votre profil pour être vu en priorité (20 crédits)"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
            <span>Boost</span>
          </button>

          <button
            id="swipe-filter-btn"
            onClick={onOpenFilters}
            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-full transition"
            title="Filtres avancés"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gender Quick Preference Switcher */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center bg-[#121622] p-0.5 rounded-xl border border-white/10 text-[11px]">
          <button
            type="button"
            onClick={() => {
              setGenderPreference('all');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              genderPreference === 'all'
                ? 'bg-rose-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ✨ Tous ({profiles.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setGenderPreference('woman');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              genderPreference === 'woman'
                ? 'bg-rose-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            👩 Femmes ({profiles.filter(p => p.gender === 'woman').length})
          </button>
          <button
            type="button"
            onClick={() => {
              setGenderPreference('man');
              setCurrentIndex(0);
            }}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              genderPreference === 'man'
                ? 'bg-rose-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            👨 Hommes ({profiles.filter(p => p.gender === 'man').length})
          </button>
        </div>

        <span className="text-[11px] text-gray-400 font-medium">
          {activeDeck.length > 0 ? `${currentIndex + 1} / ${activeDeck.length}` : '0 profil'}
        </span>
      </div>

      {/* Main Card Viewport */}
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[440px] sm:min-h-[500px]">
        {activeProfile ? (
          <motion.div
            style={{ x, y, rotate }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={(_, info) => {
              if (info.offset.x > 120) {
                handleSwipeAction('like');
              } else if (info.offset.x < -120) {
                handleSwipeAction('pass');
              } else if (info.offset.y < -120) {
                handleSwipeAction('superlike');
              }
            }}
            className="relative w-full h-full max-h-[580px] rounded-3xl overflow-hidden shadow-2xl bg-[#131622] border border-white/10 cursor-grab active:cursor-grabbing flex flex-col justify-end"
          >
            {/* Swiping feedback stamps */}
            <motion.div
              style={{ opacity: opacityLike }}
              className="absolute top-8 left-8 z-20 border-4 border-emerald-400 text-emerald-400 font-black text-2xl px-4 py-1 rounded-xl rotate-[-15deg] uppercase tracking-wider bg-black/40 backdrop-blur-sm pointer-events-none"
            >
              MARHBA ❤️
            </motion.div>

            <motion.div
              style={{ opacity: opacityPass }}
              className="absolute top-8 right-8 z-20 border-4 border-rose-500 text-rose-500 font-black text-2xl px-4 py-1 rounded-xl rotate-[15deg] uppercase tracking-wider bg-black/40 backdrop-blur-sm pointer-events-none"
            >
              PASSER ✕
            </motion.div>

            <motion.div
              style={{ opacity: opacitySuperlike }}
              className="absolute top-1/4 left-1/2 -translate-x-1/2 z-20 border-4 border-sky-400 text-sky-400 font-black text-2xl px-5 py-1.5 rounded-xl uppercase tracking-wider bg-black/50 backdrop-blur-md pointer-events-none"
            >
              SUPER LIKE ★
            </motion.div>

            {/* Photo background */}
            <img
              src={activeProfile.photos[currentPhotoIndex] || activeProfile.photos[0]}
              alt={activeProfile.name}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            />

            {/* Photo pagination bars */}
            {activeProfile.photos.length > 1 && (
              <div className="absolute top-3 inset-x-4 flex space-x-1.5 z-10">
                {activeProfile.photos.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      idx === currentPhotoIndex ? 'bg-white shadow' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Left & Right tap zones for next/prev photo */}
            <div className="absolute inset-0 flex z-10">
              <div className="w-1/2 h-2/3 cursor-pointer" onClick={prevPhoto} />
              <div className="w-1/2 h-2/3 cursor-pointer" onClick={nextPhoto} />
            </div>

            {/* Bottom Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/60 to-transparent pointer-events-none" />

            {/* Card Content & Details */}
            <div className="relative z-10 p-5 text-white">
              {/* Status Badge (Diaspora / Local / Foreigner / Synced Active) */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {activeProfile.id.startsWith('usr_') && !['usr_nour', 'usr_yassine'].includes(activeProfile.id) && (
                  <span className="text-xs font-bold bg-emerald-500 text-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-black" />
                    Connecté(e) Direct PC/Mobile
                  </span>
                )}

                {activeProfile.status === 'diaspora' && (
                  <span className="text-xs font-bold bg-rose-600/90 text-white px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    🇹🇳 Diaspora • {activeProfile.currentCity}, {activeProfile.currentCountry}
                  </span>
                )}
                {activeProfile.status === 'local' && (
                  <span className="text-xs font-bold bg-emerald-600/90 text-white px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    📍 En Tunisie • {activeProfile.currentCity}
                  </span>
                )}
                {activeProfile.status === 'foreigner' && (
                  <span className="text-xs font-bold bg-purple-600/90 text-white px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    🌍 Passionné(e) de Tunisie • {activeProfile.currentCity}
                  </span>
                )}

                {activeProfile.originCity && activeProfile.status === 'diaspora' && (
                  <span className="text-[11px] font-medium bg-white/15 backdrop-blur-md text-amber-200 px-2 py-0.5 rounded-full border border-white/10">
                    Originaire de {activeProfile.originCity}
                  </span>
                )}
              </div>

              {/* Name, Age, Verification */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {activeProfile.name}, {activeProfile.age}
                  </h2>
                  {activeProfile.isVerified && (
                    <span title="Identité vérifiée (Selfie & Pièce)">
                      <CheckCircle2 className="w-5 h-5 text-sky-400 fill-sky-400/20" />
                    </span>
                  )}
                </div>

                <button
                  id={`profile-info-btn-${activeProfile.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProfileDetail(activeProfile);
                  }}
                  className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition active:scale-95"
                  title="Voir le profil complet"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>

              {/* Job & City */}
              <div className="flex items-center space-x-2 text-xs text-gray-300 mt-1">
                <span>{activeProfile.jobTitle}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {activeProfile.currentCity} ({activeProfile.distanceKm} km)
                </span>
              </div>

              {/* Bio summary */}
              <p className="text-sm text-gray-200 mt-2.5 line-clamp-2 leading-relaxed">
                {activeProfile.bio}
              </p>

              {/* Interests chips */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {activeProfile.interests.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-white/15 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full border border-white/10 font-medium"
                  >
                    {item}
                  </span>
                ))}
                {activeProfile.interests.length > 3 && (
                  <span className="text-[11px] text-gray-400 px-1 py-0.5">
                    +{activeProfile.interests.length - 3} autres
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Empty State */
          <div className="w-full max-w-sm p-8 bg-[#141722] border border-white/10 rounded-3xl text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Tu as tout vu pour l'instant !</h3>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              De nouveaux profils de la diaspora et des locaux s'inscrivent chaque heure sur Allo-Allo.
            </p>
            <div className="flex flex-col gap-2 w-full">
              {onForceSync && (
                <button
                  id="sync-profiles-btn"
                  onClick={() => {
                    onForceSync();
                    setCurrentIndex(0);
                    setHistory([]);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition active:scale-95 shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Synchroniser PC & Mobile ({profiles.length} profils)</span>
                </button>
              )}
              <button
                id="reset-profiles-btn"
                onClick={() => {
                  setCurrentIndex(0);
                  setHistory([]);
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs transition active:scale-95 shadow-lg shadow-rose-600/20"
              >
                Revoir les profils
              </button>
              <button
                id="adjust-filters-btn"
                onClick={onOpenFilters}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl text-xs transition"
              >
                Élargir les filtres de recherche
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Controls */}
      <div className="flex items-center justify-center space-x-3 sm:space-x-4 pt-3 pb-1">
        {/* Undo button */}
        <button
          id="swipe-undo-btn"
          onClick={handleUndo}
          disabled={history.length === 0 || currentIndex === 0}
          className="w-11 h-11 rounded-full bg-[#181c28] border border-white/10 flex items-center justify-center text-amber-400 hover:bg-[#202536] transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 shadow-md"
          title="Annuler le dernier swipe"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Pass Button (X) */}
        <button
          id="swipe-pass-btn"
          onClick={() => handleSwipeAction('pass')}
          disabled={!activeProfile}
          className="w-14 h-14 rounded-full bg-[#1e2230] border border-rose-500/30 flex items-center justify-center text-rose-500 hover:bg-rose-500/15 hover:border-rose-500 transition active:scale-90 shadow-lg shadow-rose-950/40"
          title="Passer"
        >
          <X className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Super Like Button (Star) */}
        <button
          id="swipe-superlike-btn"
          onClick={() => handleSwipeAction('superlike')}
          disabled={!activeProfile}
          className="w-12 h-12 rounded-full bg-[#1e2230] border border-sky-400/30 flex items-center justify-center text-sky-400 hover:bg-sky-400/15 hover:border-sky-400 transition active:scale-90 shadow-lg shadow-sky-950/40"
          title="Super Like"
        >
          <Star className="w-6 h-6 stroke-[2.2] fill-sky-400/20" />
        </button>

        {/* Like Button (Heart) */}
        <button
          id="swipe-like-btn"
          onClick={() => handleSwipeAction('like')}
          disabled={!activeProfile}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-rose-500 border border-rose-400/40 flex items-center justify-center text-white hover:brightness-110 transition active:scale-90 shadow-xl shadow-rose-600/30"
          title="Liker"
        >
          <Heart className="w-8 h-8 fill-white stroke-white" />
        </button>
      </div>
    </div>
  );
};
