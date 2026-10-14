import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Star, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  CheckCircle2, 
  Volume2, 
  Languages, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Profile } from '../../types';

interface ProfileDetailModalProps {
  profile: Profile;
  onClose: () => void;
  onLike: (profile: Profile) => void;
  onPass: (profile: Profile) => void;
  onSuperLike: (profile: Profile) => void;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  profile,
  onClose,
  onLike,
  onPass,
  onSuperLike,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const playVoiceBio = () => {
    setIsPlayingAudio(true);
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch {
      // Audio fallback
    }
    setTimeout(() => setIsPlayingAudio(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#10141f] border border-white/15 rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Photos Carousel */}
        <div className="relative h-72 w-full shrink-0">
          <img
            src={profile.photos[selectedPhotoIndex] || profile.photos[0]}
            alt={profile.name}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#10141f] via-transparent to-black/40" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Photos indicators */}
          {profile.photos.length > 1 && (
            <div className="absolute bottom-3 inset-x-4 flex space-x-1.5 z-10">
              {profile.photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    idx === selectedPhotoIndex ? 'bg-white shadow' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Scrollable details */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 no-scrollbar">
          {/* Identity & Badges */}
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black text-white">{profile.name}, {profile.age}</h2>
              {profile.isVerified && (
                <CheckCircle2 className="w-5 h-5 text-sky-400 fill-sky-400/20" title="Profil vérifié" />
              )}
            </div>

            {/* Status pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-xs font-bold bg-rose-600/90 text-white px-2.5 py-0.5 rounded-full">
                {profile.status === 'diaspora' ? '🇹🇳 Diaspora' : '📍 En Tunisie'}
              </span>
              <span className="text-xs text-gray-300 flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {profile.currentCity}, {profile.currentCountry}
              </span>
              {profile.originCity && (
                <span className="text-xs text-amber-300 bg-amber-500/15 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
                  Originaire de {profile.originCity}
                </span>
              )}
            </div>
          </div>

          {/* Voice bio clip */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <button
                onClick={playVoiceBio}
                className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition active:scale-95 shadow-md shadow-rose-600/30"
              >
                <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
              </button>
              <div>
                <h4 className="text-xs font-bold text-white">Présentation Vocale (10s)</h4>
                <p className="text-[10px] text-gray-400">Écoutez sa voix et son accent tunisien</p>
              </div>
            </div>
            <span className="text-xs font-mono text-gray-300">0:10</span>
          </div>

          {/* Bio text */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              À propos de moi
            </h4>
            <p className="text-xs text-gray-200 leading-relaxed bg-[#141824] p-3 rounded-xl border border-white/5">
              {profile.bio}
            </p>
          </div>

          {/* Job & Education */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-2 text-gray-300">
              <Briefcase className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">{profile.jobTitle}</span>
            </div>
            {profile.education && (
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-2 text-gray-300">
                <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="truncate">{profile.education}</span>
              </div>
            )}
          </div>

          {/* Interests */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Passions & Tunisie
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((it, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-white/10 border border-white/10 text-white px-2.5 py-1 rounded-full font-medium"
                >
                  {it}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              Langues
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.languages.map((l, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 px-2.5 py-1 rounded-full font-medium"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-3 border-t border-white/10 bg-[#0d1017] flex items-center justify-around">
          <button
            onClick={() => {
              onPass(profile);
              onClose();
            }}
            className="w-12 h-12 rounded-full bg-[#1e2230] border border-rose-500/30 flex items-center justify-center text-rose-500 hover:bg-rose-500/20 transition active:scale-90"
            title="Passer"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={() => {
              onSuperLike(profile);
              onClose();
            }}
            className="w-12 h-12 rounded-full bg-[#1e2230] border border-sky-400/30 flex items-center justify-center text-sky-400 hover:bg-sky-400/20 transition active:scale-90"
            title="Super Like"
          >
            <Star className="w-6 h-6 fill-sky-400/20" />
          </button>

          <button
            onClick={() => {
              onLike(profile);
              onClose();
            }}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition active:scale-90"
            title="Liker"
          >
            <Heart className="w-7 h-7 fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
