import { Profile, VideoPost, LiveStream, VirtualGift, PendingPaymentTransaction, UserReport, AppBrandingSettings } from '../types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'usr_nour',
    name: 'Nour',
    age: 25,
    gender: 'woman',
    status: 'local',
    currentCity: 'La Marsa, Tunis',
    currentCountry: 'Tunisie',
    originCity: 'Tunis',
    distanceKm: 4,
    bio: 'Architecte d’intérieur & amoureuse de Sidi Bou Saïd. J’adore cuisiner le vrai couscous au mérou et refaire le monde devant un café direct au coucher du soleil 🌅☕',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
    ],
    jobTitle: 'Architecte d’intérieur',
    education: 'ENAU Sidi Bou Said',
    interests: ['Architecture', 'Café Direct', 'Carthage', 'Plage La Marsa', 'Art contemporain'],
    languages: ['Arabe tunisien (Darija)', 'Français', 'Anglais'],
    isVerified: true,
    isPremium: true,
    isBoosted: true,
    discreetMode: false,
    hideExactLocation: true,
    onlineStatus: 'online'
  },
  {
    id: 'usr_yassine',
    name: 'Yassine',
    age: 28,
    gender: 'man',
    status: 'diaspora',
    currentCity: 'Paris',
    currentCountry: 'France',
    originCity: 'Sousse',
    distanceKm: 1480,
    bio: 'Ingénieur IA à Paris 🗼 mais mon cœur bat toujours au rythme du Sahel et de la plage de Boujaafar 🏖️. De retour au pays chaque été et pour les fêtes !',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80'
    ],
    jobTitle: 'Ingénieur IA & Tech Lead',
    education: 'INSAT Tunis & Télécom Paris',
    interests: ['Tech & Startups', 'Sousse', 'Tennis', 'Gastronomie tunisienne', 'Voyages'],
    languages: ['Arabe tunisien', 'Français', 'Anglais'],
    isVerified: true,
    isPremium: false,
    discreetMode: false,
    hideExactLocation: true,
    onlineStatus: 'online'
  },
  {
    id: 'usr_selim',
    name: 'Selim',
    age: 31,
    gender: 'man',
    status: 'diaspora',
    currentCity: 'Montréal',
    currentCountry: 'Canada',
    originCity: 'Djerba la Douce',
    distanceKm: 6800,
    bio: 'Djerbien fier installé au Québec 🍁 ! Fan de kite-surf, de thé à la menthe pignons et d’aventures spontanées. Prêt à rentrer au pays fonder un projet.',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80'
    ],
    jobTitle: 'Fondateur de startup EdTech',
    education: 'HEC Montréal',
    interests: ['Kitesurf', 'Djerba', 'Musique Mezoued moderne', 'Outdoor', 'Thé aux pignons'],
    languages: ['Arabe tunisien', 'Français', 'Anglais'],
    isVerified: true,
    isPremium: true,
    discreetMode: false,
    hideExactLocation: true,
    onlineStatus: 'recent'
  },
  {
    id: 'usr_sarah',
    name: 'Sarah',
    age: 26,
    gender: 'woman',
    status: 'foreigner',
    currentCity: 'Rome',
    currentCountry: 'Italie',
    originCity: 'Rome',
    distanceKm: 600,
    bio: 'Photographe italienne passionnée par l’histoire de Carthage et les médinas tunisiennes. J’apprends la Darija tunisienne et je viens souvent à Nabeul pour la céramique ! 🏺',
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80'
    ],
    jobTitle: 'Photographe d’art',
    education: 'Accademia di Belle Arti Roma',
    interests: ['Photographie Médina', 'Céramique Nabeul', 'Histoire carthaginoise', 'Langues'],
    languages: ['Italien', 'Français', 'Anglais', 'Arabe débutant'],
    isVerified: false,
    isPremium: false,
    discreetMode: false,
    hideExactLocation: true,
    onlineStatus: 'online'
  },
  {
    id: 'usr_kenza',
    name: 'Kenza',
    age: 27,
    gender: 'woman',
    status: 'diaspora',
    currentCity: 'Lyon',
    currentCountry: 'France',
    originCity: 'Bizerte',
    distanceKm: 1350,
    bio: 'Interne en médecine hospitalière 🩺. D’origine bizertine, amoureuse du vieux port et des balades au Cap Blanc. Esprit positif, passionnée de cinéma et de randonnées.',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80'
    ],
    jobTitle: 'Médecin résidente',
    education: 'Faculté de Médecine de Tunis & Lyon 1',
    interests: ['Cap Blanc Bizerte', 'Cinéma', 'Randonnée Zaghouan', 'Livres', 'Santé'],
    languages: ['Arabe tunisien', 'Français', 'Anglais'],
    isVerified: true,
    isPremium: false,
    discreetMode: false,
    hideExactLocation: true,
    onlineStatus: 'online'
  },
  {
    id: 'usr_amine',
    name: 'Amine',
    age: 29,
    gender: 'man',
    status: 'local',
    currentCity: 'Hammamet',
    currentCountry: 'Tunisie',
    originCity: 'Hammamet',
    distanceKm: 65,
    bio: 'Skipper professionnel & guide nautique ⛵. Toujours sur l’eau ou en train d’organiser des sorties en catamaran. Fan d’ojja merguez maison et de bonne musique.',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80'
    ],
    jobTitle: 'Capitaine nautique & Skipper',
    education: 'Institut Supérieur des Études Maritimes',
    interests: ['Voile & Catamaran', 'Hammamet', 'Plongée sous-marine', 'Ojja', 'Musique acoustique'],
    languages: ['Arabe tunisien', 'Français', 'Italien', 'Anglais'],
    isVerified: true,
    isPremium: true,
    discreetMode: false,
    hideExactLocation: true,
    onlineStatus: 'recent'
  }
];

export const CURRENT_USER: Profile = {
  id: 'me_current_user',
  name: 'Karim',
  age: 28,
  gender: 'man',
  status: 'diaspora',
  currentCity: 'Paris',
  currentCountry: 'France',
  originCity: 'Tunis',
  distanceKm: 0,
  bio: 'Diaspora tunisienne active, passionné d’innovation, de voyages et de culture tunisienne. Toujours prêt pour un bon café à La Marsa !',
  photos: [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80'
  ],
  jobTitle: 'Consultant Tech & Stratégie',
  education: 'Polytechnique Tunis',
  interests: ['Startups', 'Cuisine tunisienne', 'Kite Surf', 'Voyages', 'Diaspora Networking'],
  languages: ['Arabe tunisien', 'Français', 'Anglais'],
  isVerified: true,
  isPremium: true,
  discreetMode: false,
  hideExactLocation: true,
  onlineStatus: 'online',
  email: 'karim.diaspora@allo-allo.tn',
  phoneNumber: '+33 6 12 34 56 78',
  isAdmin: false
};

export const DEFAULT_WIFE_PROFILE: Profile = {
  id: 'usr_wife_mariem',
  name: 'Mariem (Ma Femme)',
  age: 27,
  gender: 'woman',
  status: 'diaspora',
  currentCity: 'Paris',
  currentCountry: 'France',
  originCity: 'Sousse',
  distanceKm: 0,
  bio: 'Épouse de Karim ❤️ Passionnée de voyages, de gastronomie tunisienne et de notre beau pays 🇹🇳 !',
  photos: [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
  ],
  jobTitle: 'Designer & Passionnée Déco',
  education: 'Sorbonne & Beaux-Arts de Tunis',
  interests: ['Café Direct ☕', 'Sidi Bou Saïd 💙', 'Couscous Tunisien 🍲', 'Voyages ✈️'],
  languages: ['Arabe tunisien', 'Français', 'Anglais'],
  isVerified: true,
  isPremium: true,
  discreetMode: false,
  hideExactLocation: true,
  onlineStatus: 'online',
  email: 'mariem.belhssen@allo-allo.tn',
  phoneNumber: '+33 6 98 76 54 32',
  isAdmin: false
};

export const ADMIN_USER: Profile = {
  id: 'admin_master',
  name: 'Direction Allo-Allo',
  age: 32,
  gender: 'man',
  status: 'local',
  currentCity: 'Tunis',
  currentCountry: 'Tunisie',
  originCity: 'Carthage',
  distanceKm: 0,
  bio: 'Super-Administrateur Allo-Allo 🇹🇳. Modération, sécurité et conformité réglementaire de la communauté.',
  photos: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80'
  ],
  jobTitle: 'Super Administrateur Allo-Allo',
  interests: ['Sécurité & IA', 'Tunisie Tech', 'Modération'],
  languages: ['Arabe tunisien', 'Français', 'Anglais'],
  isVerified: true,
  isPremium: true,
  discreetMode: false,
  hideExactLocation: false,
  onlineStatus: 'online',
  email: 'admin@allo-allo.tn',
  phoneNumber: '+216 71 000 000',
  isAdmin: true
};


export const INITIAL_VIDEOS: VideoPost[] = [
  {
    id: 'vid_1',
    author: INITIAL_PROFILES[0], // Nour
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-walking-along-the-beach-with-her-dog-42618-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    caption: 'Coucher de soleil magique depuis le Café des Délices à Sidi Bou Saïd 🇹🇳💙 Qui a envie d’un thé aux pignons ?',
    tags: ['#SidiBouSaid', '#Tunisie', '#DiasporaLove', '#TunisVibes'],
    category: 'local',
    likesCount: 1420,
    commentsCount: 88,
    sharesCount: 34,
    isLikedByMe: true,
    musicTitle: 'Ghalia Benali - Nafas El Ward (Acoustic)',
    comments: [
      { id: 'c1', userName: 'Yassine Paris', userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', text: 'La vue la plus apaisante au monde, ça me manque tellement depuis Paris !', timeAgo: 'Il y a 2h' },
      { id: 'c2', userName: 'Amine_H', userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', text: 'Superbe lumière Nour !', timeAgo: 'Il y a 1h' }
    ]
  },
  {
    id: 'vid_2',
    author: INITIAL_PROFILES[1], // Yassine
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-walking-down-the-street-looking-around-42610-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    caption: 'Rassemblement de la diaspora tunisienne à Paris ce weekend 🗼🇹🇳 La convivialité et la harissa au rendez-vous !',
    tags: ['#DiasporaTunisienne', '#Paris', '#TunisiensDuMonde', '#Ambiance'],
    category: 'diaspora',
    likesCount: 980,
    commentsCount: 52,
    sharesCount: 19,
    isLikedByMe: false,
    musicTitle: 'Balti - Ya Lili (Remix Lounge)',
    comments: [
      { id: 'c3', userName: 'Kenza Lyon', userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', text: 'Top ! On doit organiser la même chose à Lyon !', timeAgo: 'Il y a 3h' }
    ]
  },
  {
    id: 'vid_3',
    author: INITIAL_PROFILES[2], // Selim
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-surfer-through-the-waves-of-the-sea-1262-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    caption: 'Session Kite surf en direct de Djerba la douce ! 🌊 Le vent est parfait aujourd’hui.',
    tags: ['#Djerba', '#KiteSurf', '#TourismeTunisie', '#Soleil'],
    category: 'local',
    likesCount: 2310,
    commentsCount: 112,
    sharesCount: 75,
    isLikedByMe: true,
    musicTitle: 'Djerba Sounds - Traditional Mezoued Electronic',
    comments: [
      { id: 'c4', userName: 'Sarah Rome', userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', text: 'Incroyable ! Je viens à Djerba le mois prochain !', timeAgo: 'Il y a 5h' }
    ]
  }
];

export const INITIAL_LIVES: LiveStream[] = [
  {
    id: 'live_1',
    host: INITIAL_PROFILES[0],
    title: 'Live Chill & Discussion : Réseautage Diaspora & Projets en Tunisie',
    category: 'diaspora',
    viewerCount: 245,
    streamPoster: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    isActive: true,
    messages: [
      { id: 'm1', userName: 'Sami_Tunis', text: 'Marhba bikom ! 🇹🇳' },
      { id: 'm2', userName: 'Leila_Berlin', text: 'Coucou depuis Berlin ! Heureuse de vous voir !' },
      { id: 'm3', userName: 'Yassine_Paris', text: 'Super initiative ce live !', isGift: true, giftIcon: '🌸' }
    ]
  },
  {
    id: 'live_2',
    host: INITIAL_PROFILES[5], // Amine
    title: 'Coucher de soleil en voilier au large d’Hammamet ⛵🌊',
    category: 'local',
    viewerCount: 130,
    streamPoster: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
    isActive: true,
    messages: [
      { id: 'm4', userName: 'Nadia_Marseille', text: 'Quelle mer magnifique !' },
      { id: 'm5', userName: 'Karim_Paris', text: 'Magnifique coucher de soleil !' }
    ]
  }
];

export const VIRTUAL_GIFTS: VirtualGift[] = [
  {
    id: 'gift_jasmine',
    name: 'Fleur de Jasmin',
    icon: '🌸',
    priceCredits: 5,
    description: 'Le symbole traditionnel de l’accueil tunisien et de la douceur'
  },
  {
    id: 'gift_cafe',
    name: 'Café Direct',
    icon: '☕',
    priceCredits: 10,
    description: 'Offrez un café direct mousseux comme au bistrot de La Marsa'
  },
  {
    id: 'gift_chechia',
    name: 'Chéchia Tunisienne',
    icon: '🧢',
    priceCredits: 25,
    description: 'La chéchia rouge brodée, emblème d’élégance et d’authenticité'
  },
  {
    id: 'gift_makroudh',
    name: 'Boîte de Makroudh',
    icon: '🍯',
    priceCredits: 50,
    description: 'Makroudh de Kairouan au miel d’oranger et dattes fines'
  },
  {
    id: 'gift_camel',
    name: 'Dromadaire Royal',
    icon: '🐪',
    priceCredits: 150,
    description: 'Le cadeau prestige du Sahara, fait briller tout le live !'
  }
];

export const INITIAL_PENDING_PAYMENTS: PendingPaymentTransaction[] = [
  {
    id: 'tx_d17_8921',
    userId: 'usr_yassine',
    userName: 'Yassine (Paris)',
    userPhone: '+33 6 12 88 99 00',
    method: 'd17',
    methodLabel: 'D17 Poste Tunisienne',
    amountTND: 25,
    creditsToAward: 150,
    referenceCode: 'D17-EDINAR-88392102',
    status: 'pending',
    createdAt: 'Il y a 12 min'
  },
  {
    id: 'tx_ooredoo_4412',
    userId: 'usr_amine',
    userName: 'Amine (Hammamet)',
    userPhone: '+216 22 411 902',
    method: 'ooredoo',
    methodLabel: 'Recharge Ooredoo 14 Chiffres',
    amountTND: 10,
    creditsToAward: 50,
    referenceCode: '9381 2049 8192 14',
    status: 'pending',
    createdAt: 'Il y a 28 min'
  },
  {
    id: 'tx_orange_1192',
    userId: 'usr_nour',
    userName: 'Nour (La Marsa)',
    userPhone: '+216 55 102 938',
    method: 'orange',
    methodLabel: 'Recharge Orange Tunisie',
    amountTND: 50,
    creditsToAward: 350,
    referenceCode: '7102 9948 1029 44',
    status: 'approved',
    createdAt: 'Hier à 18h40'
  }
];

export const INITIAL_REPORTS: UserReport[] = [
  {
    id: 'rep_102',
    reporterName: 'Sonia (Tunis)',
    targetUserId: 'usr_fake_99',
    targetUserName: 'Faux Profil Signalé',
    reason: 'fake_profile',
    reasonLabel: 'Faux profil / Usurpation d’identité',
    details: 'Utilise des photos de mannequin sans vérification selfie.',
    status: 'pending',
    timestamp: 'Il y a 45 min'
  },
  {
    id: 'rep_103',
    reporterName: 'Yassine',
    targetUserId: 'usr_spammer_3',
    targetUserName: 'CryptoSpam216',
    reason: 'scam',
    reasonLabel: 'Arnaque / Spam financier',
    details: 'Envoie des liens de cryptomonnaie douteux en message privé.',
    status: 'pending',
    timestamp: 'Il y a 2h'
  }
];

export const DEFAULT_BRANDING: AppBrandingSettings = {
  appName: 'Allo-Allo',
  tagline: 'Rencontres & Vidéos pour la Tunisie et sa Diaspora',
  logoUrl: '/alloallo_logo.jpg', // Logo officiel AlloAllo avec cœur stylisé et silhouettes
  primaryColor: '#e11d48',
  allowFreeMatches: true,
  freeLikesPerDay: 50,
  diasporaModeEnabled: true
};

