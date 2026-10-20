import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../types';
import { speechSynth } from '../services/mkEngine';
import { 
  X, 
  Settings as SettingsIcon, 
  Volume2, 
  Sun, 
  Moon, 
  Globe, 
  Trash2, 
  Check, 
  ShieldCheck,
  User,
  Sliders
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  onUpdateAccount: (updated: UserAccount) => void;
  onClearAllChats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  onUpdateAccount,
  onClearAllChats
}) => {
  const [speed, setSpeed] = useState(userAccount.voiceSpeed || 1.0);
  const [pitch, setPitch] = useState(userAccount.voicePitch || 1.0);
  const [lang, setLang] = useState(userAccount.language || 'fr');
  const [displayName, setDisplayName] = useState(userAccount.displayName);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTestVoice = () => {
    setIsTestingVoice(true);
    const text = lang === 'ar'
      ? 'مرحباً بك! هذه تجربة لجودة ووضوح النطق الصوتي لمحرك إم كيه الخاص.'
      : lang === 'en'
      ? 'Hello! This is a real-time sample of MK fluid speech synthesis.'
      : 'Bonjour ! Ceci est un test de la synthèse vocale fluide et naturelle du moteur MK.';

    const voiceLang = lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : 'fr-FR';

    speechSynth.speak(
      text,
      voiceLang,
      speed,
      pitch,
      () => setIsTestingVoice(true),
      () => setIsTestingVoice(false),
      () => setIsTestingVoice(false)
    );
  };

  const handleSave = () => {
    const updated: UserAccount = {
      ...userAccount,
      displayName: displayName.trim() || userAccount.displayName,
      language: lang,
      voiceSpeed: speed,
      voicePitch: pitch
    };

    onUpdateAccount(updated);
    localStorage.setItem('mk_user_account', JSON.stringify(updated));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#0c1322] border border-cyan-500/25 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-cyan-500/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <SettingsIcon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white font-mono">
                Configuration MK Ultra
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            
            {/* User Profile */}
            <div>
              <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                <User className="w-3.5 h-3.5" />
                <span>Identité Utilisateur</span>
              </h4>
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-slate-900 border border-slate-800">{userAccount.avatar}</span>
                <div className="flex-1">
                  <label className="text-[11px] text-slate-400">Nom d'affichage</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl bg-slate-900 border border-slate-700/80 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Unique Email Status Section */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Email Unique (Usage 1x)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-mono">
                  {userAccount.email ? 'Associé' : 'Sans mot de passe'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                {userAccount.email 
                  ? `Adresse réservée et vérifiée : ${userAccount.email}` 
                  : "Aucune création de compte requise. Les emails ne peuvent être utilisés qu'une seule fois."}
              </p>
            </div>

            {/* Vocal Synthesis Settings */}
            <div>
              <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-mono">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Synthèse Vocale Haute Définition</span>
              </h4>

              <div className="space-y-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                {/* Language Picker */}
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span>Langue de diction</span>
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'fr', label: 'Français' },
                      { id: 'ar', label: 'العربية' },
                      { id: 'en', label: 'English' }
                    ].map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLang(l.id)}
                        className={`py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          lang === l.id
                            ? 'bg-cyan-500 text-slate-950 border-transparent font-bold shadow-xs'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>Vitesse de parole</span>
                    <span className="font-mono text-cyan-400">{speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.4"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                {/* Pitch Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>Tonalité de la voix (Pitch)</span>
                    <span className="font-mono text-cyan-400">{pitch.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                {/* Test Voice button */}
                <button
                  type="button"
                  onClick={handleTestVoice}
                  className="w-full h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isTestingVoice ? 'Lecture en cours...' : 'Tester la voix MK'}</span>
                </button>
              </div>
            </div>

            {/* Privacy & Storage */}
            <div>
              <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Gestion de l'historique</span>
              </h4>
              <p className="text-[11px] text-slate-400 mb-3">
                Vous pouvez purger instantanément l'intégralité de vos sessions et messages enregistrés sur ce navigateur.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Voulez-vous supprimer définitivement toutes vos discussions enregistrées ?")) {
                    onClearAllChats();
                    onClose();
                  }
                }}
                className="w-full h-10 rounded-xl border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Effacer tout l'historique des discussions</span>
              </button>
            </div>

          </div>

          {/* Footer Save */}
          <div className="pt-4 border-t border-cyan-500/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Enregistré !</span>
                </>
              ) : (
                <span>Enregistrer</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
