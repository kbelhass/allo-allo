import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  MapPin, 
  Users, 
  Heart, 
  Sparkles, 
  Check, 
  Crown,
  Lock
} from 'lucide-react';
import { Profile, UserStatus } from '../../types';

interface FilterDrawerProps {
  allProfiles: Profile[];
  isPremium: boolean;
  selectedStatus: 'all' | UserStatus;
  onChangeStatus: (status: 'all' | UserStatus) => void;
  onSelectProfile: (profile: Profile) => void;
  onOpenRecharge: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  allProfiles,
  isPremium,
  selectedStatus,
  onChangeStatus,
  onSelectProfile,
  onOpenRecharge,
}) => {
  const [genderFilter, setGenderFilter] = useState<'all' | 'woman' | 'man'>('all');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(65);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'explore' | 'likes'>('explore');

  // Filter profiles based on state
  const filteredProfiles = allProfiles.filter(p => {
    if (genderFilter !== 'all' && p.gender !== genderFilter) return false;
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
    if (p.age < minAge || p.age > maxAge) return false;
    if (selectedCity !== 'all' && !p.currentCity.toLowerCase().includes(selectedCity.toLowerCase())) return false;
    return true;
  });

  // "Qui m'a liké" list: In Allo-Allo (80% gratuit), everyone can see who liked them for free (first 2 revealed for free, all for Gold)
  const profilesWhoLikedMe = allProfiles.slice(0, 4);

  return (
    <div className="w-full h-full flex flex-col bg-[#090b10] max-w-lg mx-auto overflow-y-auto no-scrollbar p-4 space-y-4">
      {/* Top Header Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Explorer & Filtres</h2>
          <p className="text-xs text-gray-400">Recherche ciblée Diaspora & Tunisie</p>
        </div>

        {/* Tab switch between Explorer and "Qui m'a liké" */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-3 py-1 rounded-xl font-semibold transition ${
              activeTab === 'explore' ? 'bg-rose-600 text-white' : 'text-gray-400'
            }`}
          >
            Explorer
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`px-3 py-1 rounded-xl font-semibold transition flex items-center gap-1 ${
              activeTab === 'likes' ? 'bg-rose-600 text-white' : 'text-gray-400'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            <span>Likes reçus ({profilesWhoLikedMe.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'explore' ? (
        <>
          {/* Gender Preference Selector */}
          <div className="p-4 rounded-2xl bg-[#121622] border border-white/10 space-y-2.5">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-rose-400" />
                Je recherche
              </span>
              <span className="text-[11px] font-normal text-gray-400">
                {filteredProfiles.length} profil(s) trouvé(s)
              </span>
            </h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'all', label: '✨ Tout le monde' },
                { id: 'woman', label: '👩 Femmes' },
                { id: 'man', label: '👨 Hommes' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setGenderFilter(item.id as any)}
                  className={`py-2 px-2 rounded-xl border font-bold text-center transition ${
                    genderFilter === item.id
                      ? 'bg-rose-600/20 border-rose-500 text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Status Selector (Diaspora / Locaux / Étrangers) */}
          <div className="p-4 rounded-2xl bg-[#121622] border border-white/10 space-y-2.5">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-rose-400" />
              Catégorie de Profils
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'all', label: '🌍 Tous les profils' },
                { id: 'diaspora', label: '🇹🇳 Diaspora uniquement' },
                { id: 'local', label: '📍 En Tunisie uniquement' },
                { id: 'foreigner', label: '🕊️ Passionnés de Tunisie' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChangeStatus(item.id as any)}
                  className={`p-2.5 rounded-xl border font-semibold text-left transition ${
                    selectedStatus === item.id
                      ? 'bg-rose-600/20 border-rose-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age range slider */}
          <div className="p-4 rounded-2xl bg-[#121622] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-300 uppercase tracking-wider">Tranche d'âge</span>
              <span className="font-bold text-rose-400">{minAge} ans - {maxAge} ans</span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="18"
                max="60"
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>

          {/* City shortcuts */}
          <div className="p-4 rounded-2xl bg-[#121622] border border-white/10 space-y-2">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Filtrer par Ville ou Pays
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {['all', 'Tunis', 'Paris', 'Sousse', 'Montréal', 'Djerba', 'Rome', 'Lyon'].map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                    selectedCity === city
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {city === 'all' ? 'Toutes les villes' : city}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400">
              Profils correspondants ({filteredProfiles.length})
            </p>
            <div className="grid grid-cols-2 gap-3">
              {filteredProfiles.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProfile(p)}
                  className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#141722] cursor-pointer group hover:border-rose-500 transition shadow-lg"
                >
                  <div className="h-44 w-full relative">
                    <img
                      src={p.photos[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    
                    <span className="absolute top-2 left-2 text-[10px] bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full font-semibold">
                      {p.status === 'diaspora' ? '🇹🇳 Diaspora' : '📍 Tunisie'}
                    </span>
                  </div>

                  <div className="p-2.5 text-white">
                    <h4 className="text-sm font-bold truncate">
                      {p.name}, {p.age}
                    </h4>
                    <p className="text-[11px] text-gray-300 truncate">{p.currentCity}</p>
                    <p className="text-[10px] text-rose-400 font-medium truncate mt-0.5">{p.jobTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* "Qui m'a liké" Section (80% gratuit : visible sans mur payant restrictif) */
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/30 to-amber-950/30 border border-rose-500/20">
            <div className="flex items-center space-x-2 text-rose-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-bold text-white">Politique 80% Gratuit Allo-Allo</h3>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Contrairement à Tinder, vous n'êtes pas bloqué(e) par un écran payant ! Vous pouvez découvrir les profils qui vous ont liké et matcher directement.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {profilesWhoLikedMe.map((p, idx) => {
              const isBlurred = !isPremium && idx >= 2;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (isBlurred) {
                      onOpenRecharge();
                    } else {
                      onSelectProfile(p);
                    }
                  }}
                  className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#141722] cursor-pointer group shadow-lg"
                >
                  <div className="h-44 w-full relative">
                    <img
                      src={p.photos[0]}
                      alt={p.name}
                      className={`w-full h-full object-cover transition ${
                        isBlurred ? 'blur-md brightness-50' : 'group-hover:scale-105'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {isBlurred ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center text-white">
                        <Lock className="w-6 h-6 text-amber-400 mb-1" />
                        <span className="text-xs font-bold">Débloquer avec Gold</span>
                        <span className="text-[10px] text-gray-300">9.990 DT/mois</span>
                      </div>
                    ) : (
                      <span className="absolute top-2 right-2 text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold">
                        A liké votre profil ❤️
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 text-white">
                    <h4 className="text-sm font-bold truncate">
                      {isBlurred ? 'Profil mystère' : `${p.name}, ${p.age}`}
                    </h4>
                    <p className="text-[11px] text-gray-300 truncate">
                      {isBlurred ? 'Tunisie / Diaspora' : p.currentCity}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
