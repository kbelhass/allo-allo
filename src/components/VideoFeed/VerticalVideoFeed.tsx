import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Volume2, 
  VolumeX, 
  Radio, 
  PlusCircle, 
  Send, 
  X, 
  Music, 
  CheckCircle2, 
  Flag,
  Sparkles
} from 'lucide-react';
import { VideoPost, LiveStream, UserStatus } from '../../types';

interface VerticalVideoFeedProps {
  videos: VideoPost[];
  lives: LiveStream[];
  onOpenLive: (live: LiveStream) => void;
  onStartLive: () => void;
  onPostVideo: () => void;
  onViewAuthorProfile: (authorId: string) => void;
}

export const VerticalVideoFeed: React.FC<VerticalVideoFeedProps> = ({
  videos,
  lives,
  onOpenLive,
  onStartLive,
  onPostVideo,
  onViewAuthorProfile,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | UserStatus>('all');
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoList, setVideoList] = useState<VideoPost[]>(videos);
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [showLivesModal, setShowLivesModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const filteredVideos = activeCategory === 'all' 
    ? videoList 
    : videoList.filter(v => v.category === activeCategory);

  const currentVideo = filteredVideos[activeVideoIndex] || filteredVideos[0];

  const handleLikeVideo = (videoId: string) => {
    setVideoList(prev => prev.map(v => {
      if (v.id === videoId) {
        const isLiked = !v.isLikedByMe;
        return {
          ...v,
          isLikedByMe: isLiked,
          likesCount: isLiked ? v.likesCount + 1 : v.likesCount - 1
        };
      }
      return v;
    }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentVideo) return;
    const newComment = {
      id: 'c_' + Date.now(),
      userName: 'Moi (Karim)',
      userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
      text: newCommentText.trim(),
      timeAgo: 'À l’instant'
    };

    setVideoList(prev => prev.map(v => {
      if (v.id === currentVideo.id) {
        return {
          ...v,
          commentsCount: v.commentsCount + 1,
          comments: [newComment, ...v.comments]
        };
      }
      return v;
    }));
    setNewCommentText('');
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col justify-between max-w-lg mx-auto">
      {/* Top Bar with Feeds Switcher & Live Button */}
      <div className="absolute top-0 inset-x-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-3 pb-8 px-3">
        <div className="flex items-center justify-between">
          {/* Live broadcast shortcut */}
          <button
            id="video-feed-lives-btn"
            onClick={() => setShowLivesModal(true)}
            className="flex items-center space-x-1.5 bg-rose-600/90 hover:bg-rose-600 text-white px-2.5 py-1 rounded-full text-xs font-bold transition shadow-lg shadow-rose-600/30 active:scale-95"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-white" />
            <span>Lives ({lives.length})</span>
          </button>

          {/* Category Tabs: Pour toi / Diaspora / Locaux / Étrangers */}
          <div className="flex items-center space-x-1 bg-black/40 backdrop-blur-md p-0.5 rounded-full border border-white/10 text-xs">
            <button
              onClick={() => { setActiveCategory('all'); setActiveVideoIndex(0); }}
              className={`px-2.5 py-0.5 rounded-full font-semibold transition ${
                activeCategory === 'all' ? 'bg-white text-black' : 'text-gray-300'
              }`}
            >
              Pour toi
            </button>
            <button
              onClick={() => { setActiveCategory('diaspora'); setActiveVideoIndex(0); }}
              className={`px-2.5 py-0.5 rounded-full font-semibold transition ${
                activeCategory === 'diaspora' ? 'bg-rose-500 text-white' : 'text-gray-300'
              }`}
            >
              Diaspora
            </button>
            <button
              onClick={() => { setActiveCategory('local'); setActiveVideoIndex(0); }}
              className={`px-2.5 py-0.5 rounded-full font-semibold transition ${
                activeCategory === 'local' ? 'bg-emerald-500 text-white' : 'text-gray-300'
              }`}
            >
              Locaux
            </button>
          </div>

          {/* Post video button */}
          <button
            id="video-feed-post-btn"
            onClick={onPostVideo}
            className="p-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition active:scale-95"
            title="Poster une vidéo courte"
          >
            <PlusCircle className="w-5 h-5 text-rose-400" />
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      {currentVideo ? (
        <div className="relative w-full h-full flex-1 flex items-center justify-center bg-black">
          {/* Simulated Vertical Video with poster background */}
          <div className="relative w-full h-full">
            <img
              src={currentVideo.posterUrl}
              alt={currentVideo.caption}
              className="w-full h-full object-cover"
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />

            {/* Simulated video progress bar */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
              <div className="h-full bg-rose-500 w-2/3 animate-pulse" />
            </div>

            {/* Audio volume button */}
            <button
              id="video-sound-toggle-btn"
              onClick={() => setIsMuted(!isMuted)}
              className="absolute top-16 right-4 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition"
              title={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-gray-300" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Video navigation indicators (up / down) */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col space-y-2 opacity-60 hover:opacity-100 transition">
              {filteredVideos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveVideoIndex(idx)}
                  className={`w-1.5 rounded-full transition-all ${
                    idx === activeVideoIndex ? 'h-6 bg-rose-500' : 'h-2 bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Right sidebar action buttons (TikTok style) */}
            <div className="absolute right-3 bottom-16 z-20 flex flex-col items-center space-y-4">
              {/* Author Avatar with Plus follow */}
              <div className="relative cursor-pointer" onClick={() => onViewAuthorProfile(currentVideo.author.id)}>
                <img
                  src={currentVideo.author.photos[0]}
                  alt={currentVideo.author.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-rose-500 shadow-md"
                />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">
                  +
                </div>
              </div>

              {/* Like button */}
              <button
                id={`video-like-btn-${currentVideo.id}`}
                onClick={() => handleLikeVideo(currentVideo.id)}
                className="flex flex-col items-center group transition active:scale-125"
              >
                <div className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition ${
                  currentVideo.isLikedByMe ? 'bg-rose-600/80 text-white' : 'bg-black/40 text-white hover:bg-black/60'
                }`}>
                  <Heart className={`w-6 h-6 ${currentVideo.isLikedByMe ? 'fill-white' : ''}`} />
                </div>
                <span className="text-xs font-semibold text-white mt-1 shadow-sm">
                  {currentVideo.likesCount}
                </span>
              </button>

              {/* Comments button */}
              <button
                id={`video-comments-btn-${currentVideo.id}`}
                onClick={() => setShowComments(true)}
                className="flex flex-col items-center group transition active:scale-110"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-white mt-1">
                  {currentVideo.commentsCount}
                </span>
              </button>

              {/* Share button */}
              <button
                id={`video-share-btn-${currentVideo.id}`}
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('Lien de la vidéo Allo-Allo copié dans le presse-papier !');
                }}
                className="flex flex-col items-center group transition active:scale-110"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-white mt-1">
                  {currentVideo.sharesCount}
                </span>
              </button>

              {/* Report button (Safety) */}
              <button
                onClick={() => {
                  setReportSuccess(true);
                  setTimeout(() => setReportSuccess(false), 3000);
                }}
                className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-rose-400 transition"
                title="Signaler un contenu inapproprié"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom video details & author info */}
            <div className="absolute left-4 bottom-4 right-16 z-20 text-white">
              {/* Author name & badge */}
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="font-bold text-base tracking-tight hover:underline cursor-pointer" onClick={() => onViewAuthorProfile(currentVideo.author.id)}>
                  @{currentVideo.author.name}
                </span>
                {currentVideo.author.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
                )}
                <span className="text-[10px] bg-rose-600/80 px-2 py-0.5 rounded-full font-bold uppercase">
                  {currentVideo.author.status === 'diaspora' ? 'Diaspora 🇹🇳' : 'Tunisie 📍'}
                </span>
              </div>

              {/* Caption */}
              <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed mb-2 font-normal">
                {currentVideo.caption}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-2">
                {currentVideo.tags.map((tag, i) => (
                  <span key={i} className="text-[11px] font-semibold text-rose-400">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Music sound banner */}
              <div className="flex items-center space-x-2 text-[11px] text-gray-300 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full w-fit max-w-[240px] truncate border border-white/10">
                <Music className="w-3 h-3 text-rose-400 shrink-0 animate-spin" />
                <span className="truncate">{currentVideo.musicTitle}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Report Toast Notification */}
      {reportSuccess && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Signalement transmis à la modération Allo-Allo. Merci !
        </div>
      )}

      {/* Comments Bottom Sheet Drawer */}
      {showComments && currentVideo && (
        <div className="absolute inset-x-0 bottom-0 z-40 bg-[#121622] rounded-t-3xl border-t border-white/15 p-4 max-h-[70%] flex flex-col shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="text-sm font-bold text-white">
              Commentaires ({currentVideo.comments.length})
            </h4>
            <button
              onClick={() => setShowComments(false)}
              className="p-1 text-gray-400 hover:text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3.5 no-scrollbar">
            {currentVideo.comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-2.5">
                <img
                  src={comment.userAvatar}
                  alt={comment.userName}
                  className="w-8 h-8 rounded-full object-cover border border-white/10"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-200">{comment.userName}</span>
                    <span className="text-[10px] text-gray-400">{comment.timeAgo}</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add comment input */}
          <form onSubmit={handleAddComment} className="pt-2 border-t border-white/10 flex items-center space-x-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Ajouter un commentaire sympa..."
              className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl disabled:opacity-40 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Active Lives Drawer Modal */}
      {showLivesModal && (
        <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
              <h3 className="text-base font-bold text-white">Lives en direct Tunisie & Diaspora</h3>
            </div>
            <button
              onClick={() => setShowLivesModal(false)}
              className="p-1 text-gray-400 hover:text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lives grid */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {lives.map((live) => (
              <div
                key={live.id}
                onClick={() => {
                  setShowLivesModal(false);
                  onOpenLive(live);
                }}
                className="relative rounded-2xl overflow-hidden border border-white/15 cursor-pointer group hover:border-rose-500 transition shadow-xl"
              >
                <img
                  src={live.streamPoster}
                  alt={live.title}
                  className="w-full h-36 object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-2">
                  <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    LIVE
                  </span>
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    👥 {live.viewerCount} spectateurs
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="text-sm font-bold line-clamp-1">{live.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <img
                      src={live.host.photos[0]}
                      alt={live.host.name}
                      className="w-5 h-5 rounded-full object-cover border border-rose-500"
                    />
                    <span className="text-xs text-gray-200">@{live.host.name}</span>
                    <span className="text-[10px] text-gray-400">• {live.host.currentCity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Start live button */}
          <div className="pt-3 border-t border-white/10">
            <button
              id="start-live-stream-btn"
              onClick={() => {
                setShowLivesModal(false);
                onStartLive();
              }}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-500 hover:brightness-110 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/30 transition"
            >
              <Radio className="w-4 h-4" />
              <span>Lancer mon propre Live 🔴 (Réservé Premium / 10 crédits)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
