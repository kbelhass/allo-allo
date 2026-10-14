import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  ShieldCheck 
} from 'lucide-react';
import { Profile } from '../../types';

interface WebRTCCallModalProps {
  partner: Profile;
  isVideo: boolean;
  onEndCall: () => void;
}

export const WebRTCCallModal: React.FC<WebRTCCallModalProps> = ({
  partner,
  isVideo: initialIsVideo,
  onEndCall,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideo, setIsVideo] = useState(initialIsVideo);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected'>('connecting');

  // Call timer simulation
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 2000);

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(interval);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090b10] flex flex-col justify-between p-6 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between z-20">
        <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Appel chiffré de bout en bout</span>
        </div>
        <span className="text-xs text-gray-400 font-mono">
          {callStatus === 'connecting' ? 'Connexion en cours...' : formatDuration(callDuration)}
        </span>
      </div>

      {/* Main Video / Avatar Center Stage */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 relative">
        {isVideo ? (
          <div className="relative w-full h-full max-h-[460px] rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl">
            {/* Partner simulated video feed */}
            <img
              src={partner.photos[0]}
              alt={partner.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />

            {/* Self camera miniature (Picture in Picture) */}
            <div className="absolute top-4 right-4 w-24 h-32 rounded-2xl overflow-hidden border-2 border-white/40 shadow-xl bg-gray-800">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80"
                alt="Me"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1.5 text-[9px] bg-black/60 text-white px-1 rounded">
                Moi
              </span>
            </div>

            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-bold">{partner.name}</h3>
              <p className="text-xs text-gray-300">{partner.currentCity}</p>
            </div>
          </div>
        ) : (
          /* Voice Call Avatar Stage */
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-rose-500 shadow-2xl">
                <img
                  src={partner.photos[0]}
                  alt={partner.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -inset-2 rounded-full border border-rose-500/40 animate-ping pointer-events-none" />
            </div>

            <h2 className="text-2xl font-black text-white">{partner.name}</h2>
            <p className="text-xs text-gray-400 mt-1">
              {partner.status === 'diaspora' ? '🇹🇳 Diaspora' : '📍 Tunisie'} • {partner.currentCity}
            </p>
            <p className="text-sm font-semibold text-rose-400 mt-3">
              {callStatus === 'connecting' ? 'Sonnerie en cours...' : 'En communication audio'}
            </p>
          </div>
        )}
      </div>

      {/* Call Action Controls */}
      <div className="flex items-center justify-center space-x-6 pb-6 z-20">
        {/* Mute Mic */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition active:scale-95 ${
            isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title={isMuted ? "Activer le micro" : "Couper le micro"}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* End Call Button */}
        <button
          id="end-call-btn"
          onClick={onEndCall}
          className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 transition active:scale-90"
          title="Raccrocher"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

        {/* Toggle Video */}
        <button
          onClick={() => setIsVideo(!isVideo)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition active:scale-95 ${
            !isVideo ? 'bg-white/10 text-gray-400' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
          }`}
          title={isVideo ? "Désactiver la caméra" : "Activer la caméra"}
        >
          {isVideo ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};
