import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatSession, UserAccount } from '../types';
import { 
  Search, 
  Plus, 
  Trash2, 
  Pin, 
  Settings, 
  X, 
  MessageSquare,
  Sparkles,
  Server,
  Star
} from 'lucide-react';

interface SlidingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePinSession: (id: string) => void;
  onClearAllChats?: () => void;
  userAccount: UserAccount;
  onOpenSettings: () => void;
  onOpenServers: () => void;
  onOpenEmailModal: () => void;
  onLogout: () => void;
}

export const SlidingPanel: React.FC<SlidingPanelProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onTogglePinSession,
  onClearAllChats,
  onOpenSettings,
  onOpenServers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedSessions = filteredSessions.filter(s => s.isPinned);
  const regularSessions = filteredSessions.filter(s => !s.isPinned);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel (Craft Parchment & Charcoal) */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-80 sm:w-88 bg-[#dfcfba] dark:bg-[#1a1815] border-r-2 border-[#3d3329] dark:border-[#2d2720] flex flex-col shadow-2xl overflow-hidden text-[#241c14] dark:text-[#f3ede3] transition-colors duration-200"
          >
            {/* Header with Artisan Emblem & Close */}
            <div className="p-4 bg-[#d6c5ad] dark:bg-[#151311] border-b border-[#ab9981] dark:border-[#2b251f] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xs bg-[#241c14] dark:bg-[#d4a359] text-white dark:text-[#161412] flex items-center justify-center text-xs font-serif font-black">
                  MK
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-[#1c1611] dark:text-[#faf6ee]">
                    TEXTILSCHMIEDE
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-[#554536] dark:text-[#a89987] font-mono">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>Atelier Historique & Archives</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-xs flex items-center justify-center text-[#554536] dark:text-[#a89987] hover:bg-[#c4b197] dark:hover:bg-[#28241f] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions & Search */}
            <div className="p-3.5 space-y-2.5 bg-[#dfcfba] dark:bg-[#1a1815] border-b border-[#cbb89f] dark:border-[#2e2820]">
              <button
                type="button"
                onClick={() => {
                  onNewSession();
                  onClose();
                }}
                className="w-full h-10 rounded-xs bg-[#1e1c19] dark:bg-[#d4a359] hover:bg-[#342f2b] dark:hover:bg-[#e2b76e] text-[#f4efe4] dark:text-[#161412] font-mono font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer uppercase tracking-wider"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Nouvelle discussion</span>
              </button>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#705e4c] dark:text-[#8f8273] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher dans les archives..."
                  className="w-full h-9 pl-8 pr-3 text-xs rounded-xs bg-[#f4efe5] dark:bg-[#141210] border border-[#ab9981] dark:border-[#383129] text-[#241c14] dark:text-[#f3ede3] placeholder:text-[#7d6c59] dark:placeholder:text-[#6e6356] focus:outline-none focus:border-[#967644] dark:focus:border-[#d4a359] font-sans"
                />
              </div>
            </div>

            {/* Session History List */}
            <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3">
              {pinnedSessions.length > 0 && (
                <div>
                  <div className="px-2 pb-1 text-[10px] font-mono font-bold text-[#6b5843] dark:text-[#d4a359] uppercase tracking-wider flex items-center gap-1">
                    <Pin className="w-3 h-3" />
                    <span>Discussions Épinglées</span>
                  </div>
                  <div className="space-y-1">
                    {pinnedSessions.map((session) => (
                      <SessionRow
                        key={session.id}
                        session={session}
                        isActive={session.id === activeSessionId}
                        onSelect={() => {
                          onSelectSession(session.id);
                          onClose();
                        }}
                        onDelete={() => onDeleteSession(session.id)}
                        onTogglePin={() => onTogglePinSession(session.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="px-2 pb-1 text-[10px] font-mono font-bold text-[#6b5843] dark:text-[#a89987] uppercase tracking-wider">
                  Discussions Récentes ({regularSessions.length})
                </div>
                {regularSessions.length === 0 ? (
                  <p className="text-xs text-[#705e4c] dark:text-[#7f7468] italic px-2 py-3 font-mono">
                    Aucune archive trouvée
                  </p>
                ) : (
                  <div className="space-y-1">
                    {regularSessions.map((session) => (
                      <SessionRow
                        key={session.id}
                        session={session}
                        isActive={session.id === activeSessionId}
                        onSelect={() => {
                          onSelectSession(session.id);
                          onClose();
                        }}
                        onDelete={() => onDeleteSession(session.id)}
                        onTogglePin={() => onTogglePinSession(session.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Panel Actions: Wiping history & Settings */}
            <div className="p-3 bg-[#d6c5ad] dark:bg-[#151311] border-t border-[#ab9981] dark:border-[#2b251f] space-y-2">
              {onClearAllChats && sessions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Voulez-vous supprimer tout l'historique des discussions ?")) {
                      onClearAllChats();
                      onClose();
                    }
                  }}
                  className="w-full h-8 px-2.5 rounded-xs bg-[#c9b79e] dark:bg-[#221f1b] hover:bg-rose-200 dark:hover:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-[#ab9981] dark:border-[#383129] font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Effacer tout l'historique</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenServers();
                    onClose();
                  }}
                  className="flex-1 h-8 rounded-xs bg-[#c9b79e] dark:bg-[#221f1b] hover:bg-[#bfae96] dark:hover:bg-[#2c2823] text-[#241c14] dark:text-[#f3ede3] font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#ab9981] dark:border-[#383129]"
                >
                  <Server className="w-3.5 h-3.5 text-[#b8863b] dark:text-[#d4a359]" />
                  <span>Serveurs</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenSettings();
                    onClose();
                  }}
                  className="h-8 px-3 rounded-xs bg-[#c9b79e] dark:bg-[#221f1b] hover:bg-[#bfae96] dark:hover:bg-[#2c2823] text-[#241c14] dark:text-[#f3ede3] font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#ab9981] dark:border-[#383129]"
                  title="Paramètres de l'Atelier"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

interface SessionRowProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

const SessionRow: React.FC<SessionRowProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onTogglePin
}) => {
  return (
    <div
      className={`group relative flex items-center justify-between p-2 rounded-xs text-xs font-mono transition-all cursor-pointer ${
        isActive
          ? 'bg-[#1e1c19] text-[#f4efe4] dark:bg-[#d4a359] dark:text-[#161412] font-bold shadow-xs'
          : 'bg-[#f4efe5] dark:bg-[#141210] hover:bg-[#ebe0cf] dark:hover:bg-[#221f1b] text-[#241c14] dark:text-[#f3ede3] border border-[#ab9981] dark:border-[#332b23]'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 truncate pr-2">
        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
        <span className="truncate">{session.title}</span>
      </div>

      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className="p-1 hover:text-[#b8863b] cursor-pointer"
          title={session.isPinned ? "Détacher" : "Épingler"}
        >
          <Pin className={`w-3 h-3 ${session.isPinned ? 'fill-current' : ''}`} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:text-rose-600 cursor-pointer"
          title="Supprimer la discussion"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
