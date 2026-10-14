import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  QrCode, 
  Sparkles, 
  ShieldCheck, 
  Coins, 
  Crown,
  PhoneCall
} from 'lucide-react';

interface TunisianPaymentModalProps {
  currentCredits: number;
  isPremium: boolean;
  onClose: () => void;
  onAddCredits: (credits: number, amountTND: number) => void;
  onUpgradePremium: () => void;
}

type GatewayType = 'd17' | 'recharge_telco' | 'floussi' | 'carte_bancaire';

export const TunisianPaymentModal: React.FC<TunisianPaymentModalProps> = ({
  currentCredits,
  isPremium,
  onClose,
  onAddCredits,
  onUpgradePremium,
}) => {
  const [selectedGateway, setSelectedGateway] = useState<GatewayType>('d17');
  const [selectedPlan, setSelectedPlan] = useState<'pack_100' | 'pack_300' | 'pack_1000' | 'gold_monthly'>('pack_300');
  
  // Form fields
  const [telcoOperator, setTelcoOperator] = useState<'ooredoo' | 'orange' | 'telecom'>('ooredoo');
  const [voucherCode, setVoucherCode] = useState('');
  const [d17Phone, setD17Phone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const plans = {
    pack_100: { credits: 100, priceTND: 5.000, label: 'Pack Découverte (100 🪙)', desc: 'Idéal pour envoyer des cadeaux en live et super-likes' },
    pack_300: { credits: 300, priceTND: 12.000, label: 'Pack Populaire (300 🪙)', desc: 'Le plus choisi pour booster son profil et ses lives' },
    pack_1000: { credits: 1000, priceTND: 35.000, label: 'Pack Prestige (1000 🪙)', desc: 'Pour les créateurs réguliers et gros streamers' },
    gold_monthly: { credits: 200, priceTND: 9.990, label: 'Allo-Allo Gold (Mensuel)', desc: 'Voir qui m’a liké + Lives illimités + Badge Gold + 200 crédits offerts' }
  };

  const currentSelection = plans[selectedPlan];

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      if (selectedPlan === 'gold_monthly') {
        onUpgradePremium();
        onAddCredits(200, currentSelection.priceTND);
        setPaymentSuccess('Félicitations ! Vous êtes désormais Membre Allo-Allo Gold avec 200 crédits offerts.');
      } else {
        onAddCredits(currentSelection.credits, currentSelection.priceTND);
        setPaymentSuccess(`Paiement de ${currentSelection.priceTND.toFixed(3)} TND validé ! ${currentSelection.credits} crédits ont été ajoutés.`);
      }
      setVoucherCode('');
      setD17Phone('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10141f] border border-white/15 rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-rose-950/30 to-amber-950/30">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Boutique Allo-Allo 🇹🇳
              </h3>
              <p className="text-[10px] text-gray-300">
                Paiements 100% en Dinars Tunisiens (TND) sans carte internationale
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

        {/* Modal Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 no-scrollbar">
          {/* Current user balance banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <span className="text-[11px] text-gray-400">Votre Solde Actuel</span>
              <p className="text-xl font-black text-amber-400">{currentCredits} 🪙 crédits</p>
            </div>
            {isPremium ? (
              <span className="text-xs font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> Membre Gold
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                Compte Standard (80% Gratuit)
              </span>
            )}
          </div>

          {/* Success feedback */}
          {paymentSuccess && (
            <div className="p-3 bg-emerald-600/20 border border-emerald-500/40 rounded-2xl flex items-center space-x-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{paymentSuccess}</span>
            </div>
          )}

          {/* Step 1: Choose Offer / Plan */}
          <div>
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">
              1. Choisissez votre pack ou abonnement
            </label>
            <div className="space-y-2">
              {/* Allo-Allo Gold Plan */}
              <div
                onClick={() => setSelectedPlan('gold_monthly')}
                className={`p-3 rounded-2xl border cursor-pointer transition relative ${
                  selectedPlan === 'gold_monthly'
                    ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 border-amber-500'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-extrabold text-white">
                      Allo-Allo Gold (Abonnement Mensuel)
                    </span>
                  </div>
                  <span className="text-xs font-black text-amber-300">9.990 TND / mois</span>
                </div>
                <p className="text-[11px] text-gray-300 mt-1">
                  Voir qui vous a liké, Lives illimités, filtres diaspora avancés + 200 crédits offerts !
                </p>
                <span className="absolute -top-2 right-4 text-[9px] bg-rose-600 text-white font-black px-2 py-0.5 rounded-full uppercase">
                  Sans Frustration
                </span>
              </div>

              {/* Credit Packs */}
              {(['pack_100', 'pack_300', 'pack_1000'] as const).map((key) => {
                const plan = plans[key];
                const isSelected = selectedPlan === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedPlan(key)}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-600/15 border-rose-500'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{plan.label}</span>
                      <span className="text-[10px] text-gray-400">{plan.desc}</span>
                    </div>
                    <span className="text-xs font-extrabold text-white">
                      {plan.priceTND.toFixed(3)} TND
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Choose Payment Method in Tunisia */}
          <div>
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">
              2. Moyen de paiement tunisien
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* D17 */}
              <button
                type="button"
                onClick={() => setSelectedGateway('d17')}
                className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  selectedGateway === 'd17'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1 text-amber-400" />
                <span className="text-xs font-bold">D17 (La Poste)</span>
                <span className="text-[9px] text-gray-400">e-Dinar & Code *117#</span>
              </button>

              {/* Recharge Téléphonique */}
              <button
                type="button"
                onClick={() => setSelectedGateway('recharge_telco')}
                className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  selectedGateway === 'recharge_telco'
                    ? 'bg-rose-500/15 border-rose-500 text-rose-300'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <PhoneCall className="w-5 h-5 mb-1 text-rose-400" />
                <span className="text-xs font-bold">Recharge Mobile</span>
                <span className="text-[9px] text-gray-400">Ooredoo / Orange / TT</span>
              </button>

              {/* Floussi */}
              <button
                type="button"
                onClick={() => setSelectedGateway('floussi')}
                className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  selectedGateway === 'floussi'
                    ? 'bg-sky-500/15 border-sky-500 text-sky-300'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1 text-sky-400" />
                <span className="text-xs font-bold">Floussi Wallet</span>
                <span className="text-[9px] text-gray-400">Paiement QR Code instantané</span>
              </button>

              {/* Carte Bancaire Nationale */}
              <button
                type="button"
                onClick={() => setSelectedGateway('carte_bancaire')}
                className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  selectedGateway === 'carte_bancaire'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1 text-emerald-400" />
                <span className="text-xs font-bold">Carte Bancaire TN</span>
                <span className="text-[9px] text-gray-400">GIE Monétique ClicToPay</span>
              </button>
            </div>
          </div>

          {/* Step 3: Interactive Payment Inputs */}
          <form onSubmit={handleProcessPayment} className="p-3.5 bg-black/40 rounded-2xl border border-white/10 space-y-3">
            {selectedGateway === 'd17' && (
              <div>
                <label className="text-xs text-gray-300 font-semibold block mb-1">
                  Numéro de téléphone mobile D17
                </label>
                <input
                  type="tel"
                  required
                  value={d17Phone}
                  onChange={(e) => setD17Phone(e.target.value)}
                  placeholder="Ex: 98 123 456 ou 22 876 543"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-amber-300/80 mt-1">
                  Une notification de validation sera envoyée sur votre appli D17 ou via le menu *117#.
                </p>
              </div>
            )}

            {selectedGateway === 'recharge_telco' && (
              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-semibold block">
                  Opérateur Télécom & Code de recharge (14 chiffres)
                </label>
                <div className="flex space-x-2">
                  {(['ooredoo', 'orange', 'telecom'] as const).map((op) => (
                    <button
                      type="button"
                      key={op}
                      onClick={() => setTelcoOperator(op)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                        telcoOperator === op
                          ? 'bg-rose-600 text-white'
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {op === 'telecom' ? 'TT' : op}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Entrez les 14 chiffres de la carte à gratter"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest focus:outline-none focus:border-rose-500"
                />
                <p className="text-[10px] text-gray-400">
                  Valide pour cartes physiques de 5 DT, 10 DT ou recharge rapide en kiosque.
                </p>
              </div>
            )}

            {selectedGateway === 'floussi' && (
              <div className="text-center py-2">
                <div className="w-28 h-28 mx-auto bg-white rounded-xl p-2 flex items-center justify-center shadow-lg mb-2">
                  <div className="w-full h-full bg-black flex items-center justify-center text-white text-[10px] font-mono">
                    [QR FLOUSSI TN]
                  </div>
                </div>
                <p className="text-xs text-sky-300 font-medium">Scannez avec votre application Floussi</p>
                <p className="text-[10px] text-gray-400">Montant exact : {currentSelection.priceTND.toFixed(3)} TND</p>
              </div>
            )}

            {selectedGateway === 'carte_bancaire' && (
              <div>
                <p className="text-xs text-gray-300 mb-2">
                  Paiement sécurisé par carte bancaire tunisienne (Visa, Mastercard, CIB locale).
                </p>
                <div className="flex items-center space-x-2 text-emerald-400 text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Chiffrement bancaire 3D-Secure 2.0</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-500 hover:brightness-110 text-white font-bold rounded-xl text-xs transition active:scale-95 shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Vérification sécurisée en cours...</span>
              ) : (
                <span>Confirmer et Payer {currentSelection.priceTND.toFixed(3)} TND</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
