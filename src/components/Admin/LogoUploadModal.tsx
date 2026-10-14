import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Check, X, RefreshCw, Sparkles, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { AppLogo } from '../Common/AppLogo';

interface LogoUploadModalProps {
  currentLogoUrl: string | null;
  onSaveLogo: (logoUrl: string | null) => void;
  onClose: () => void;
}

export const LogoUploadModal: React.FC<LogoUploadModalProps> = ({
  currentLogoUrl,
  onSaveLogo,
  onClose,
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogoUrl);
  const [urlInput, setUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoPreview(result);
      setSuccessMessage('Photo du logo chargée avec succès ! Cliquez sur "Appliquer le logo".');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setLogoPreview(urlInput.trim());
      setSuccessMessage('URL du logo configurée !');
    }
  };

  const handleSave = () => {
    onSaveLogo(logoPreview);
    onClose();
  };

  const handleReset = () => {
    setLogoPreview(null);
    setUrlInput('');
    setSuccessMessage('Logo réinitialisé à l’emblème par défaut Allo-Allo 🇹🇳.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#10141f] border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Partager / Modifier le Logo Allo-Allo</h3>
              <p className="text-xs text-gray-400">Déposez votre photo ou image pour personnaliser l'application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Bar */}
        <div className="bg-[#0a0c13] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Aperçu en direct</span>
            <p className="text-xs text-gray-300">Voici comment votre logo s'affichera dans le header et l'auth :</p>
          </div>
          <div className="p-2 rounded-2xl bg-white/5 border border-white/10">
            <AppLogo logoUrl={logoPreview} size="lg" showText={true} />
          </div>
        </div>

        {successMessage && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Upload Zone (Drag & Drop + Click) */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            dragActive
              ? 'border-rose-500 bg-rose-500/10 scale-[1.01]'
              : 'border-white/20 bg-white/[0.02] hover:border-rose-500/50 hover:bg-white/[0.04]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-white">
              Glissez-déposez votre photo de logo ici, ou <span className="text-rose-400 underline">parcourir vos fichiers</span>
            </p>
            <p className="text-[11px] text-gray-400">
              Prend en charge PNG, JPG, JPEG, SVG ou WebP (optimisé pour affichage mobile)
            </p>
          </div>
        </div>

        {/* Alternative: URL input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
            Ou coller l'URL d'une image de logo :
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://exemple.com/mon-logo-allo-allo.png"
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl text-white transition"
            >
              Tester l'URL
            </button>
          </div>
        </div>

        {/* Tip on how to share photo with developer in chat */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-2.5 text-xs text-amber-300/90">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Astuce :</strong> Vous pouvez également joindre votre fichier image directement dans le chat de cette conversation d'assistance, ou glisser-déposer votre fichier au-dessus !
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-rose-400 flex items-center gap-1.5 transition py-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réinitialiser par défaut</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 text-xs font-semibold hover:bg-white/15 transition"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Appliquer le logo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
