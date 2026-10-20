import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount, SocialNotification, PhoneSecurityStatus } from '../types';
import { INITIAL_SOCIAL_NOTIFICATIONS, speechSynth } from '../services/mkEngine';
import { 
  MessageCircle, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Send, 
  CheckCircle2, 
  Smartphone, 
  Battery, 
  AlertTriangle, 
  RefreshCw, 
  Bell, 
  Lock, 
  Plus
} from 'lucide-react';

interface CoAmiViewProps {
  userAccount: UserAccount;
  onStartLiveVoice: () => void;
}

export const CoAmiView: React.FC<CoAmiViewProps> = ({
  userAccount,
  onStartLiveVoice
}) => {
  const [notifications, setNotifications] = useState<SocialNotification[]>(INITIAL_SOCIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'missions' | 'security'>('missions');
  const [speakingNotifId, setSpeakingNotifId] = useState<string | null>(null);
  const [customReplyText, setCustomReplyText] = useState<{ [id: string]: string }>({});

  // Phone Security State
  const [securityStatus, setSecurityStatus] = useState<PhoneSecurityStatus>({
    protectionActive: true,
    threatLevel: 'safe',
    lastScanTime: 'Aujourd\'hui à 10:48',
    scannedApps: 142,
    batteryLevel: 94,
    batteryHealth: 'Excellente (34°C)',
    blockedTrackers: 67,
    phishingShield: true,
    networkEncrypted: true
  });
  const [isScanning, setIsScanning] = useState(false);

  // Play Notification Aloud
  const handleReadAloud = (notif: SocialNotification) => {
    if (speakingNotifId === notif.id) {
      speechSynth.stop();
      setSpeakingNotifId(null);
      return;
    }

    setSpeakingNotifId(notif.id);

    const voiceLang = userAccount.language === 'ar' ? 'ar-SA' : userAccount.language === 'en' ? 'en-US' : 'fr-FR';
    
    let speechText = '';
    if (userAccount.language === 'ar') {
      speechText = `رسالة جديدة من ${notif.sender} على تطبيق ${notif.app}. الرسالة تقول: ${notif.message}`;
    } else if (userAccount.language === 'en') {
      speechText = `New message from ${notif.sender} on ${notif.app}. Message reads: ${notif.message}`;
    } else {
      speechText = `${notif.sender} t'a envoyé un message sur ${notif.app.toUpperCase()} : "${notif.message}". Veux-tu que je réponde pour toi ?`;
    }

    speechSynth.speak(
      speechText,
      voiceLang,
      userAccount.voiceSpeed,
      userAccount.voicePitch,
      () => setSpeakingNotifId(notif.id),
      () => setSpeakingNotifId(null),
      () => setSpeakingNotifId(null)
    );
  };

  // Reply to Notification
  const handleSendReply = (notifId: string, replyText: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notifId
          ? { ...n, status: 'replied', replySent: replyText }
          : n
      )
    );

    const voiceLang = userAccount.language === 'ar' ? 'ar-SA' : userAccount.language === 'en' ? 'en-US' : 'fr-FR';
    const confirmMessage = userAccount.language === 'ar'
      ? `تم إرسال الرد بنجاح: "${replyText}"`
      : `Réponse envoyée avec succès : "${replyText}"`;
    speechSynth.speak(confirmMessage, voiceLang);

    setCustomReplyText((prev) => ({ ...prev, [notifId]: '' }));
  };

  // Simulate Incoming Notification
  const handleSimulateNewNotification = () => {
    const SAMPLE_SENDERS = [
      { name: 'Youssef M.', app: 'whatsapp', msg: 'On valide le dossier pour la réunion de demain matin ?' },
      { name: 'Nadia Atelier', app: 'instagram', msg: 'Magnifiques rendus pour la nouvelle collection Textilschmiede !' },
      { name: 'Thomas B.', app: 'facebook', msg: 'Est-ce que tu es disponible pour un échange rapide ce midi ?' },
    ];
    const pick = SAMPLE_SENDERS[Math.floor(Math.random() * SAMPLE_SENDERS.length)];
    const chosenApp = pick.app as 'whatsapp' | 'instagram' | 'facebook';

    const newNotif: SocialNotification = {
      id: `notif-${Date.now()}`,
      app: chosenApp,
      sender: pick.name,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      message: pick.msg,
      timestamp: 'À l\'instant',
      suggestedReplies: [
        'Parfait, je regarde ça immédiatement !',
        'Oui bien sûr, contactons-nous maintenant.',
        'Merci beaucoup pour le message !'
      ],
      status: 'unread'
    };

    setNotifications(prev => [newNotif, ...prev]);
    handleReadAloud(newNotif);
  };

  // Run Antivirus & Protection Scan
  const handleRunSecurityScan = () => {
    if (isScanning) return;
    setIsScanning(true);

    const voiceLang = userAccount.language === 'ar' ? 'ar-SA' : userAccount.language === 'en' ? 'en-US' : 'fr-FR';
    speechSynth.speak("Inspection de sécurité de votre smartphone par MK...", voiceLang);

    setTimeout(() => {
      setIsScanning(false);
      setSecurityStatus((prev) => ({
        ...prev,
        lastScanTime: 'À l\'instant',
        scannedApps: prev.scannedApps + 3,
        blockedTrackers: prev.blockedTrackers + 12
      }));

      speechSynth.speak(
        "Analyse de sécurité terminée. Aucune menace détectée. Votre smartphone est parfaitement protégé.",
        voiceLang
      );
    }, 2000);
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-8.5rem)] max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-y-auto bg-[#e6d8c3] dark:bg-[#121110] text-[#241c14] dark:text-[#f3ede3] transition-colors duration-200">
      
      {/* Co-Ami Hero Banner */}
      <div className="relative rounded-sm bg-[#dfcfba] dark:bg-[#1e1c19] border-2 border-[#bfae96] dark:border-[#3d362d] p-5 shadow-sm mb-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-14 h-14 rounded-xs bg-[#c9b79e] dark:bg-[#282520] border border-[#ab9981] dark:border-[#42392f] flex items-center justify-center text-2xl shadow-xs">
              🤝
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-black text-[#1c1611] dark:text-[#f4eee3] font-serif uppercase tracking-wider">
                  Textilien • Co-Ami & Mobile
                </h2>
                <span className="px-2 py-0.5 rounded-xs bg-emerald-800 text-white text-[10px] font-mono font-bold">
                  Actif
                </span>
              </div>
              <p className="text-xs text-[#554536] dark:text-[#a89987] font-mono mt-0.5">
                Compagnon d'écoute loyal, lecture vocale de messages et protecteur de smartphone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onStartLiveVoice}
            className="w-full sm:w-auto h-10 px-5 rounded-xs bg-[#1e1c19] dark:bg-[#d4a359] hover:bg-[#342f2b] dark:hover:bg-[#e2b76e] text-[#f4efe4] dark:text-[#161412] text-xs font-mono font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Volume2 className="w-4 h-4" />
            <span>Parler avec Co-Ami</span>
          </button>
        </div>

        {/* Tab switch inside Co-Ami */}
        <div className="flex items-center gap-2 mt-5 pt-3.5 border-t border-[#cbb89f] dark:border-[#2e2820]">
          <button
            type="button"
            onClick={() => setActiveTab('missions')}
            className={`px-3 py-1.5 rounded-xs text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'missions'
                ? 'bg-[#1e1c19] text-[#f4efe4] dark:bg-[#d4a359] dark:text-[#161412]'
                : 'text-[#554536] dark:text-[#a89987] hover:text-black dark:hover:text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Messages & Notifications ({notifications.filter(n => n.status === 'unread').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-xs text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#1e1c19] text-[#f4efe4] dark:bg-[#d4a359] dark:text-[#161412]'
                : 'text-[#554536] dark:text-[#a89987] hover:text-black dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sécurité Smartphone</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'missions' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#3d3023] dark:text-[#d4a359] flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>Notifications Récentes & Réponses Autonomes</span>
            </h3>

            <button
              type="button"
              onClick={handleSimulateNewNotification}
              className="px-2.5 py-1 rounded-xs bg-[#dfcfba] dark:bg-[#1e1c19] hover:bg-[#d0bea7] dark:hover:bg-[#282520] text-[#241c14] dark:text-[#f3ede3] text-[11px] font-mono font-bold flex items-center gap-1 border border-[#bfae96] dark:border-[#3d362d] cursor-pointer shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>Simuler notification</span>
            </button>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 rounded-sm bg-[#dfcfba] dark:bg-[#1e1c19] border border-[#bfae96] dark:border-[#383129] shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-xs text-[#1c1611] dark:text-[#f4eee3] uppercase">
                      {notif.sender}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-[#c9b79e] dark:bg-[#282520] font-mono text-[#554536] dark:text-[#a89987] uppercase">
                      {notif.app}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6b5843] dark:text-[#8f8273] font-mono">
                    {notif.timestamp}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#221a12] dark:text-[#faf5ed] font-sans mb-3">
                  "{notif.message}"
                </p>

                {/* Reply state or actions */}
                {notif.status === 'replied' ? (
                  <div className="p-2 rounded-xs bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs font-mono text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Réponse transmise : "{notif.replySent}"</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {notif.suggestedReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendReply(notif.id, reply)}
                          className="text-[11px] px-2.5 py-1 rounded-xs bg-[#f4efe5] dark:bg-[#141210] hover:bg-[#1e1c19] hover:text-white dark:hover:bg-[#d4a359] dark:hover:text-[#161412] text-[#33281c] dark:text-[#dcd1c2] border border-[#ab9981] dark:border-[#383129] font-mono transition-colors cursor-pointer"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleReadAloud(notif)}
                        className="text-[11px] font-mono text-[#6b5843] dark:text-[#a89987] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {speakingNotifId === notif.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{speakingNotifId === notif.id ? 'Arrêter la lecture' : 'Lire à voix haute'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Phone Security Tab */
        <div className="space-y-4">
          <div className="p-4 rounded-sm bg-[#dfcfba] dark:bg-[#1e1c19] border-2 border-[#bfae96] dark:border-[#3d362d] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold font-mono text-[#1c1611] dark:text-[#f4eee3] uppercase">
                  Bouclier Autonome MK
                </h4>
                <p className="text-xs text-[#554536] dark:text-[#a89987] font-mono">
                  Dernier scan : {securityStatus.lastScanTime} • {securityStatus.scannedApps} applications vérifiées
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunSecurityScan}
              disabled={isScanning}
              className="h-9 px-4 rounded-xs bg-[#1e1c19] dark:bg-[#d4a359] hover:bg-[#342f2b] dark:hover:bg-[#e2b76e] text-[#f4efe4] dark:text-[#161412] font-mono font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Analyse...' : 'Scanner'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-sm bg-[#dfcfba] dark:bg-[#1e1c19] border border-[#bfae96] dark:border-[#383129]">
              <span className="text-[10px] font-mono text-[#554536] dark:text-[#a89987] uppercase">Batterie & Système</span>
              <p className="text-xl font-bold font-mono text-[#1c1611] dark:text-[#f4eee3] mt-1">{securityStatus.batteryLevel}%</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">{securityStatus.batteryHealth}</p>
            </div>

            <div className="p-3.5 rounded-sm bg-[#dfcfba] dark:bg-[#1e1c19] border border-[#bfae96] dark:border-[#383129]">
              <span className="text-[10px] font-mono text-[#554536] dark:text-[#a89987] uppercase">Pisteurs Bloqués</span>
              <p className="text-xl font-bold font-mono text-[#1c1611] dark:text-[#f4eee3] mt-1">{securityStatus.blockedTrackers}</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">Réseau 100% Chiffré</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
