import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Gift, 
  Heart, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { LiveStream, VirtualGift } from '../../types';
import { VIRTUAL_GIFTS } from '../../data/mockData';

interface LiveStreamViewerProps {
  live: LiveStream;
  userCredits: number;
  onSendGift: (gift: VirtualGift) => void;
  onClose: () => void;
  onOpenRecharge: () => void;
}

export const LiveStreamViewer: React.FC<LiveStreamViewerProps> = ({
  live,
  userCredits,
  onSendGift,
  onClose,
  onOpenRecharge,
}) => {
  const [messages, setMessages] = useState(live.messages);
  const [newMsg, setNewMsg] = useState('');
  const [showGiftDrawer, setShowGiftDrawer] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);
  const [recentGiftAnimation, setRecentGiftAnimation] = useState<VirtualGift | null>(null);

  // Periodic simulated live comments & reactions
  useEffect(() => {
    const timer = setInterval(() => {
      const simulatedSenders = [
        { name: 'Sami_Djerba', text: 'Marhba bik ! 🇹🇳' },
        { name: 'Leila_Montreal', text: 'Coucou du Canada !' },
        { name: 'Nader_Paris', text: 'Vive la Tunisie ! ❤️' },
        { name: 'Fatma_Sousse', text: 'Superbe live !' }
      ];
      const randomMsg = simulatedSenders[Math.floor(Math.random() * simulatedSenders.length)];
      setMessages(prev => [
        ...prev.slice(-15),
        { id: 'm_' + Date.now(), userName: randomMsg.name, text: randomMsg.text }
      ]);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: 'm_' + Date.now(), userName: 'Moi (Karim)', text: newMsg.trim() }
    ]);
    setNewMsg('');
  };

  const handleSendHeart = () => {
    const id = Date.now();
    const left = Math.floor(Math.random() * 60) + 20; // 20% to 80%
    setFloatingHearts(prev => [...prev, { id, left }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== id));
    }, 2000);
  };

  const handleSelectGift = (gift: VirtualGift) => {
    if (userCredits < gift.priceCredits) {
      alert(`Solde insuffisant (${userCredits} crédits). Veuillez recharger via D17 ou carte téléphonique.`);
      onOpenRecharge();
      return;
    }

    onSendGift(gift);
    setRecentGiftAnimation(gift);
    setShowGiftDrawer(false);

    // Add gift alert in live chat
    setMessages(prev => [
      ...prev,
      {
        id: 'gift_' + Date.now(),
        userName: 'Moi (Karim)',
        text: `a offert ${gift.name} ${gift.icon} !`,
        isGift: true,
        giftIcon: gift.icon
      }
    ]);

    setTimeout(() => {
      setRecentGiftAnimation(null);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between max-w-lg mx-auto overflow-hidden">
      {/* Background Live Stream Feed Image */}
      <img
        src={live.streamPoster}
        alt={live.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay for chat readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />

      {/* Floating hearts animation */}
      {floatingHearts.map(h => (
        <div
          key={h.id}
          style={{ left: `${h.left}%` }}
          className="absolute bottom-20 z-30 pointer-events-none text-2xl animate-bounce text-rose-500"
        >
          ❤️
        </div>
      ))}

      {/* Giant Gift Celebration Animation */}
      {recentGiftAnimation && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-black/80 backdrop-blur-xl border border-amber-500/40 px-6 py-4 rounded-3xl text-center shadow-2xl animate-pulse">
          <div className="text-6xl mb-2">{recentGiftAnimation.icon}</div>
          <p className="text-sm font-bold text-amber-300">Cadeau Envoyé !</p>
          <p className="text-xs text-white font-medium">{recentGiftAnimation.name} ({recentGiftAnimation.priceCredits} 🪙)</p>
        </div>
      )}

      {/* Top Header of Live */}
      <div className="relative z-20 p-3 flex items-center justify-between">
        {/* Host details badge */}
        <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-md rounded-full pl-1 pr-3 py-1 border border-white/10">
          <img
            src={live.host.photos[0]}
            alt={live.host.name}
            className="w-8 h-8 rounded-full object-cover border border-rose-500"
          />
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold text-white leading-tight">@{live.host.name}</span>
              {live.host.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />}
            </div>
            <span className="text-[10px] text-gray-300">
              {live.host.status === 'diaspora' ? '🇹🇳 Diaspora' : '📍 En Tunisie'}
            </span>
          </div>
        </div>

        {/* Viewers count & Close button */}
        <div className="flex items-center space-x-2">
          <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            LIVE
          </span>

          <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium text-white border border-white/10">
            <Users className="w-3.5 h-3.5 text-gray-300" />
            <span>{live.viewerCount}</span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center live title banner */}
      <div className="relative z-10 px-4">
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 p-2 rounded-xl text-xs text-white max-w-xs">
          <p className="font-semibold">{live.title}</p>
        </div>
      </div>

      {/* Bottom Area: Live Chat + Gifts + Heart reaction */}
      <div className="relative z-20 p-3 space-y-2">
        {/* Messages rolling feed */}
        <div className="h-44 overflow-y-auto space-y-1.5 no-scrollbar flex flex-col justify-end">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] text-xs px-2.5 py-1 rounded-xl backdrop-blur-md ${
                m.isGift 
                  ? 'bg-amber-500/20 border border-amber-500/30 text-amber-200' 
                  : 'bg-black/40 text-white border border-white/5'
              }`}
            >
              <span className="font-bold text-gray-300 mr-1.5">@{m.userName} :</span>
              <span>{m.text}</span>
            </div>
          ))}
        </div>

        {/* Action Input Bar */}
        <div className="flex items-center space-x-2 pt-1">
          <form onSubmit={handleSendMessage} className="flex-1 flex items-center bg-black/50 backdrop-blur-md border border-white/15 rounded-full px-3 py-1.5">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Dire quelque chose en direct..."
              className="flex-1 bg-transparent text-xs text-white placeholder-gray-400 focus:outline-none"
            />
            <button type="submit" disabled={!newMsg.trim()} className="text-rose-400 hover:text-rose-300 disabled:opacity-30">
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Virtual Gift Button */}
          <button
            id="open-gifts-btn"
            onClick={() => setShowGiftDrawer(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 transition active:scale-95"
            title="Envoyer un cadeau tunisien virtuel"
          >
            <Gift className="w-5 h-5 text-amber-100" />
          </button>

          {/* Heart reaction button */}
          <button
            onClick={handleSendHeart}
            className="w-10 h-10 rounded-full bg-rose-600/80 hover:bg-rose-600 flex items-center justify-center text-white transition active:scale-125"
          >
            <Heart className="w-5 h-5 fill-white" />
          </button>
        </div>
      </div>

      {/* Gift Selection Bottom Sheet */}
      {showGiftDrawer && (
        <div className="absolute inset-x-0 bottom-0 z-40 bg-[#10141f] rounded-t-3xl border-t border-white/15 p-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-400" />
                Cadeaux Virtuels Tunisiens
              </h4>
              <p className="text-[11px] text-gray-400">
                Solde actuel : <strong className="text-amber-400">{userCredits} 🪙 crédits</strong>
              </p>
            </div>
            <button
              onClick={() => setShowGiftDrawer(false)}
              className="p-1 text-gray-400 hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Gifts Grid */}
          <div className="grid grid-cols-3 gap-2.5 py-3.5">
            {VIRTUAL_GIFTS.map((gift) => (
              <button
                key={gift.id}
                onClick={() => handleSelectGift(gift)}
                className="flex flex-col items-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition active:scale-95 group text-center"
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition">{gift.icon}</span>
                <span className="text-xs font-bold text-white line-clamp-1">{gift.name}</span>
                <span className="text-[11px] font-extrabold text-amber-400 mt-1">
                  {gift.priceCredits} 🪙
                </span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-gray-400">Besoin de crédits en Dinars ?</span>
            <button
              onClick={() => {
                setShowGiftDrawer(false);
                onOpenRecharge();
              }}
              className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-full hover:bg-amber-400/20 transition"
            >
              Recharger (D17 / Recharge)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
