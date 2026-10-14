import React from 'react';
import { X, Upload, Sparkles, Image as ImageIcon, CheckCircle, ArrowRight, MessageSquare, Globe } from 'lucide-react';
import { AppLogo } from '../Common/AppLogo';

interface LogoGuideModalProps {
  currentLogoUrl: string | null;
  onOpenUpload: () => void;
  onClose: () => void;
}

export const LogoGuideModal: React.FC<LogoGuideModalProps> = ({
  currentLogoUrl,
  onOpenUpload,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#10141f] border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Comment Partager la Photo du Logo 🇹🇳</h3>
              <p className="text-xs text-gray-400">Guide pratique pour appliquer votre logo officiel sur Allo-Allo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Logo Preview */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AppLogo logoUrl={currentLogoUrl} size="md" showText={false} />
            <div>
              <div className="text-xs font-bold text-white">Logo Actuel de l'Application</div>
              <div className="text-[10px] text-gray-400">
                {currentLogoUrl ? 'Logo personnalisé actif' : 'Logo par défaut Allo-Allo 🇹🇳'}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenUpload();
            }}
            className="py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Changer maintenant</span>
          </button>
        </div>

        {/* Step-by-step methods */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            3 Méthodes Simples pour Transmettre Votre Logo :
          </h4>

          {/* Méthode 1 */}
          <div className="p-4 rounded-2xl bg-[#141926] border border-rose-500/20 space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
              <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-xs">1</div>
              <span>Téléversement Direct dans l'App (Recommandé)</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Cliquez simplement sur l'icône du logo tout en haut à gauche de l'écran, ou cliquez sur <strong>"Uploader le Logo"</strong>. Vous pouvez ensuite glisser-déposer votre fichier image (PNG, JPG, WebP, SVG) ou le sélectionner depuis votre téléphone/ordinateur. L'application l'applique instantanément !
            </p>
          </div>

          {/* Méthode 2 */}
          <div className="p-4 rounded-2xl bg-[#141926] border border-amber-500/20 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">2</div>
              <span>Partager la Photo dans la Discussion</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Vous pouvez déposer ou joindre votre photo directement dans cette boîte de discussion (chat de l'assistant IA) ou envoyer un fichier image dans la fenêtre de message. Je l'intégrerai alors comme logo source permanent du projet.
            </p>
          </div>

          {/* Méthode 3 */}
          <div className="p-4 rounded-2xl bg-[#141926] border border-sky-500/20 space-y-2">
            <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs">
              <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-xs">3</div>
              <span>Lien / URL Web d'une Image</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Si votre image est déjà hébergée sur le web (Imgur, Cloudinary, votre site ou hébergeur), il vous suffit de copier son lien et de le coller dans le champ URL de la fenêtre de modification du logo.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
          >
            Fermer
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenUpload();
            }}
            className="py-2.5 px-4 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center space-x-1.5 transition active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Ouvrir l'Uploader de Logo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
