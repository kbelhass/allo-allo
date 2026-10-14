import React, { useState } from 'react';
import { 
  X, 
  Server, 
  Smartphone, 
  Database, 
  ShieldCheck, 
  CreditCard, 
  FileCode, 
  Copy, 
  Check, 
  ExternalLink,
  Code
} from 'lucide-react';

interface ArchitectureModalProps {
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'backend' | 'mobile' | 'payments' | 'deploy'>('architecture');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#0f121a] border border-white/15 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#151924]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
              AA
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Spécifications Techniques & Architecture Allo-Allo
              </h3>
              <p className="text-[10px] text-gray-400">
                Lead Mobile, Architecte Backend Sécurisé & UX Designer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 p-2 bg-[#121520] border-b border-white/10 overflow-x-auto text-xs no-scrollbar">
          {[
            { id: 'architecture', label: '1. Schéma Global', icon: Server },
            { id: 'backend', label: '2. Backend API & PostgreSQL', icon: Database },
            { id: 'mobile', label: '3. Mobile Android (Compose)', icon: Smartphone },
            { id: 'payments', label: '4. Passerelles Tunisiennes', icon: CreditCard },
            { id: 'deploy', label: '5. Guide Déploiement & INPDP', icon: ShieldCheck },
          ].map((tab) => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs text-gray-300 leading-relaxed font-sans no-scrollbar">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
                <h4 className="font-bold text-rose-400 text-sm mb-1">Architecture Globale du Système Allo-Allo</h4>
                <p className="text-xs text-gray-300">
                  L'application s'articule autour d'une architecture orientée services haute performance, à tolérance de panne, avec synchronisation bidirectionnelle en temps réel (WebSockets / WebRTC) et compatibilité stricte RGPD & INPDP (Instance Nationale de Protection des Données Personnelles de Tunisie).
                </p>
              </div>

              {/* Textual Architecture Diagram */}
              <div className="bg-black/60 p-4 rounded-2xl border border-white/10 font-mono text-[11px] text-gray-200 overflow-x-auto">
                <pre>{`
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           CLIENTS MOBILES                              │
  │   Android (Kotlin / Jetpack Compose)  &  iOS (Swift / SwiftUI / PWA)   │
  └───────────────────▲────────────────────────────────▲───────────────────┘
                      │ HTTPS (REST API)               │ WSS (WebSockets)
                      ▼                                ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                    REVERSE PROXY & API GATEWAY                         │
  │     Nginx / Cloudflare (Rate Limiting, DDoS, SSL Offload, WAF)         │
  └───────────────────▲────────────────────────────────▲───────────────────┘
                      │                                │
                      ▼                                ▼
  ┌─────────────────────────────────────┐  ┌───────────────────────────────┐
  │         BACKEND CORE API            │  │     REALTIME & WEBRTC HUB     │
  │  Node.js (Express/NestJS) + JWT 2FA │  │ Socket.io / Pion WebRTC Turn │
  │  - Auth (SMS OTP & Email)           │  │ - Instant Match Broadcast    │
  │  - Algorithme Diaspora Matching     │  │ - Video & Audio Calls P2P    │
  │  - Feed Vidéo & Live Stream Server  │  │ - Ephemeral Messages Engine  │
  └───────────────────▲─────────────────┘  └───────────────▲───────────────┘
                      │                                    │
       ┌──────────────┼──────────────┬─────────────────────┘
       ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐ ┌───────────────────────────┐
│  POSTGRESQL  │ │  REDIS   │ │  S3 / MINIO  │ │   PASSERELLES TUNISIE     │
│   (PostGIS)  │ │ (Cache & │ │ (Photos HD & │ │ - D17 (La Poste TN) *117# │
│ Données &    │ │ Sessions │ │ Vidéos Feed  │ │ - Recharge Ooredoo/OR/TT  │
│ Transactions │ │ Pub/Sub) │ │ chiffrées)   │ │ - Floussi Wallet & QR     │
└──────────────┘ └──────────┘ └──────────────┘ └───────────────────────────┘
`}</pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <h5 className="font-bold text-white mb-1">Algorithme de Matching Diaspora</h5>
                  <p className="text-[11px] text-gray-400">
                    Calcul d'un score de compatibilité combinant la proximité géographique (PostGIS), les centres d'intérêt communs, la ville d'origine en Tunisie (ex: Djerba, Sousse, Bizerte) et le statut (diaspora ou local).
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <h5 className="font-bold text-white mb-1">Philosophie 80% Gratuit</h5>
                  <p className="text-[11px] text-gray-400">
                    Aucun blocage artificiel de likes (limite très haute à 100/jour au lieu des 25 de Tinder). Visualisation gratuite de qui a liké sans barrière payante punitive.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Schéma SQL & Endpoints Backend</h4>
                <button
                  onClick={() => copyToClipboard('/backend/src/models/schema.sql', 'schema')}
                  className="flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-gray-200 px-2.5 py-1 rounded-lg transition"
                >
                  {copiedSection === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copier chemin schema.sql</span>
                </button>
              </div>

              <p className="text-gray-300">
                Le schéma complet a été généré dans <code className="text-rose-400 bg-black/40 px-1 py-0.5 rounded">/backend/src/models/schema.sql</code> avec les tables :
              </p>

              <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-300 bg-black/40 p-3 rounded-xl border border-white/10">
                <li><strong>users</strong> : Authentification, rôles (user, premium, modérateur, admin), solde crédits.</li>
                <li><strong>profiles</strong> : Statut diaspora/local/étranger, ville actuelle, ville d'origine, coordonnées PostGIS, mode discret.</li>
                <li><strong>identity_verifications</strong> : Stockage sécurisé des selfies et documents d'identité pour le badge Vérifié.</li>
                <li><strong>swipes & matches</strong> : Système d'interaction bilatérale, super-likes et détection de match instantané.</li>
                <li><strong>messages</strong> : Messages chiffrés, vocaux, et éphémères avec décompte TTL automatique.</li>
                <li><strong>videos & comments</strong> : Feed de vidéos courtes avec catégorisation Diaspora/Locaux.</li>
                <li><strong>live_streams & live_gifts</strong> : Lives interactifs et envoi de cadeaux virtuels tunisiens.</li>
                <li><strong>transactions</strong> : Journal financier certifié pour D17, Floussi et recharges USSD.</li>
              </ul>
            </div>
          )}

          {activeTab === 'mobile' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Implémentation Mobile Android (Jetpack Compose)</h4>
              <p className="text-gray-300">
                Le code Kotlin 100% natif a été créé dans le dossier <code className="text-rose-400 bg-black/40 px-1 py-0.5 rounded">/mobile-android/</code> :
              </p>

              <div className="space-y-2">
                <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                  <span className="font-bold text-rose-400 block mb-1">SwipeScreen.kt</span>
                  <p className="text-[11px] text-gray-400">
                    Deck de cartes avec animations physiques (Animatable offset & rotation), gestion du geste drag horizontal/vertical et intégration Coil pour le chargement fluide des photos.
                  </p>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                  <span className="font-bold text-rose-400 block mb-1">TunisianPaymentScreen.kt</span>
                  <p className="text-[11px] text-gray-400">
                    Interface de paiement optimisée pour la Tunisie : validation des numéros D17, saisie et vérification des codes de recharge téléphonique 14 chiffres, et conversion instantanée en crédits Allo-Allo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Monétisation & Passerelles Tunisiennes en Dinars (TND)</h4>
              <p className="text-gray-300">
                En Tunisie, l'absence fréquente de cartes bancaires internationales nécessite des méthodes de paiement alternatives populaires et accessibles à tous :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <h5 className="font-bold text-amber-300 mb-1">1. D17 (La Poste Tunisienne)</h5>
                  <p className="text-[11px] text-gray-400">
                    Utilisé par plus de 2 millions de Tunisiens (Carte e-Dinar). Validation via notification in-app ou par code USSD <code className="text-amber-400">*117#</code>.
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <h5 className="font-bold text-rose-400 mb-1">2. Cartes de Recharge Téléphonique</h5>
                  <p className="text-[11px] text-gray-400">
                    Achat d'une carte à gratter dans n'importe quel kiosque en Tunisie (Ooredoo, Orange, TT). L'utilisateur entre le code à 14 chiffres qui est crédité via l'API opérateur.
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <h5 className="font-bold text-sky-400 mb-1">3. Floussi & Sobflous</h5>
                  <p className="text-[11px] text-gray-400">
                    Paiement instantané par QR Code ou prélèvement sur compte portefeuille mobile national.
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <h5 className="font-bold text-emerald-400 mb-1">4. GIE Monétique (ClicToPay)</h5>
                  <p className="text-[11px] text-gray-400">
                    Pour les cartes bancaires nationales Visa/Mastercard délivrées par les banques tunisiennes (BIAT, Attijari, BNA, Amen Bank).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Guide de Déploiement & Conformité Légale</h4>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5">
                <h5 className="font-bold text-emerald-400">Conformité Légale (INPDP & RGPD)</h5>
                <p className="text-[11px] text-gray-300">
                  1. Déclaration préalable auprès de l'INPDP (Instance Nationale de Protection des Données Personnelles de Tunisie, Loi n° 2004-63).<br />
                  2. Chiffrement AES-256 au repos des identités vérifiées.<br />
                  3. Droit d'accès et d'exportation au format JSON (disponible dans l'onglet Profil).<br />
                  4. Droit à l'effacement complet des données personnelles (Droit à l'oubli).
                </p>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <h5 className="font-bold text-white">Lancer le projet en local</h5>
                <div className="bg-black/60 p-2.5 rounded-lg font-mono text-[10px] text-gray-300">
                  <code>git clone https://github.com/votre-compte/allo-allo.git<br />
                  cd allo-allo<br />
                  npm install<br />
                  npm run dev</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
