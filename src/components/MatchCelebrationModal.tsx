import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Heart, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Profile } from '../types';

interface MatchCelebrationModalProps {
  currentUser: Profile;
  matchedProfile: Profile;
  onSendMessage: () => void;
  onContinueSwiping: () => void;
}

export const MatchCelebrationModal: React.FC<MatchCelebrationModalProps> = ({
  currentUser,
  matchedProfile,
  onSendMessage,
  onContinueSwiping,
}) => {
  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#fbbf24', '#38bdf8', '#ffffff']
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-[#121622] border border-rose-500/40 rounded-3xl p-6 text-center shadow-2xl space-y-5 animate-in fade-in zoom-in duration-300">
        <div className="inline-flex items-center space-x-1.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 px-3 py-1 rounded-full text-xs font-bold">
          <Sparkles className="w-4 h-4" />
          <span>C'est un Match ! Mabrouk 🇹🇳❤️</span>
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">
          Vous et {matchedProfile.name} vous plaisez !
        </h2>

        {/* Dual Avatars */}
        <div className="flex items-center justify-center -space-x-4 py-3">
          <div className="relative z-10 w-24 h-24 rounded-full overflow-hidden border-4 border-rose-500 shadow-xl">
            <img
              src={currentUser.photos[0]}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-20 w-10 h-10 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-lg border-2 border-rose-500">
            <Heart className="w-5 h-5 fill-rose-600" />
          </div>

          <div className="relative z-10 w-24 h-24 rounded-full overflow-hidden border-4 border-rose-500 shadow-xl">
            <img
              src={matchedProfile.photos[0]}
              alt={matchedProfile.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          {matchedProfile.name} est à {matchedProfile.currentCity}. Brisez la glace avec un message ou un café direct virtuel !
        </p>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            id="match-send-message-btn"
            onClick={onSendMessage}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-500 hover:brightness-110 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-rose-600/30 active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Envoyer un message à {matchedProfile.name}</span>
          </button>

          <button
            id="match-continue-btn"
            onClick={onContinueSwiping}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl text-xs transition"
          >
            Continuer à swiper
          </button>
        </div>
      </div>
    </div>
  );
};
