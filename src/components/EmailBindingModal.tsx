import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ShieldCheck, AlertCircle, CheckCircle2, X, Zap } from 'lucide-react';
import { UserAccount } from '../types';

interface EmailBindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  onUpdateEmail: (email: string) => void;
}

export const EmailBindingModal: React.FC<EmailBindingModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  onUpdateEmail,
}) => {
  const [emailInput, setEmailInput] = useState(userAccount.email || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const email = emailInput.trim().toLowerCase();

    // Basic email format check
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Veuillez saisir une adresse email valide (ex: utilisateur@domaine.com).');
      return;
    }

    // Retrieve used emails list from persistent storage
    let usedEmails: string[] = [];
    try {
      const stored = localStorage.getItem('mk_registered_emails');
      if (stored) {
        usedEmails = JSON.parse(stored);
      }
    } catch {
      usedEmails = [];
    }

    // Strict rule: An email can only be used ONCE
    // If the email is already registered and does not belong to this active session
    if (usedEmails.includes(email) && userAccount.email?.toLowerCase() !== email) {
      setError('⛔ Cette adresse email a déjà été utilisée sur MK. Conformément à la règle de sécurité, un email ne peut être utilisé qu’une seule et unique fois.');
      return;
    }

    // Register email uniquely
    if (!usedEmails.includes(email)) {
      usedEmails.push(email);
      try {
        localStorage.setItem('mk_registered_emails', JSON.stringify(usedEmails));
      } catch (err) {
        console.warn('Failed saving used emails', err);
      }
    }

    onUpdateEmail(email);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
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
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#0b1120] border border-cyan-500/25 rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Identification par Email Unique
              </h3>
              <p className="text-xs text-cyan-400/80 font-medium">
                Pas de compte ni mot de passe • Usage unique garanti
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Règle de sécurité stricte :</span> Chaque adresse email ne peut être associée qu'<strong>une seule et unique fois</strong> dans le système MK. Aucun mot de passe n'est requis.
                </div>
              </div>
            </div>

            {userAccount.email && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs">
                <span className="text-slate-400">Email actuellement lié :</span>
                <span className="font-mono text-cyan-300 font-semibold">{userAccount.email}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Votre adresse email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="nom@exemple.com"
                    autoFocus
                    className="w-full h-11 pl-4 pr-10 text-sm rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Email validé et réservé avec succès !</span>
                </motion.div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-md"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Valider l'email unique</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
