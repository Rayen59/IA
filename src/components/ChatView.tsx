import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, ChatMode, Attachment, UserAccount } from '../types';
import { speechSynth } from '../services/mkEngine';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Plus, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  FileText, 
  Image as ImageIcon, 
  X, 
  ChevronDown,
  Brain,
  Trash2,
  Sparkles,
  Camera,
  Star
} from 'lucide-react';

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, mode: ChatMode, attachments?: Attachment[]) => void;
  userAccount: UserAccount;
  onStartLiveVoice: () => void;
  onDeleteMessage?: (messageId: string) => void;
  onClearChat?: () => void;
}

const MODE_OPTIONS: { id: ChatMode; label: string; icon: string; desc: string }[] = [
  { id: 'fast', label: 'Artisan Rapide', icon: '⚡', desc: 'Inférence instantanée sans attente' },
  { id: 'reasoning', label: 'Raisonnement & Vision', icon: '🧠', desc: 'Analyse approfondie & décodage photos' },
  { id: 'deep', label: 'Précision Technique', icon: '📐', desc: 'Expertise code & calculs structurés' },
  { id: 'unfiltered', label: 'Libre & Créatif', icon: '✒️', desc: 'Artisanat littéraire & création libre' },
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  onSendMessage,
  userAccount,
  onStartLiveVoice,
  onDeleteMessage,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<ChatMode>('fast');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputText]);

  // Speech Recognition for input
  const handleToggleVoiceInput = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onStartLiveVoice();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = userAccount.language === 'ar' ? 'ar-SA' : userAccount.language === 'en' ? 'en-US' : 'fr-FR';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Text-to-speech speaker
  const handleToggleSpeak = (msg: Message) => {
    if (speakingMessageId === msg.id) {
      speechSynth.stop();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(msg.id);
      const voiceLang = userAccount.language === 'ar' ? 'ar-SA' : userAccount.language === 'en' ? 'en-US' : 'fr-FR';
      speechSynth.speak(
        msg.content,
        voiceLang,
        userAccount.voiceSpeed,
        userAccount.voicePitch,
        () => setSpeakingMessageId(msg.id),
        () => setSpeakingMessageId(null),
        () => setSpeakingMessageId(null)
      );
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // File upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();

      if (file.type.startsWith('image/')) {
        reader.onload = () => {
          setPendingAttachments((prev) => [
            ...prev,
            {
              id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: file.name,
              size: file.size,
              type: file.type || 'image/jpeg',
              content: reader.result as string
            }
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = () => {
          setPendingAttachments((prev) => [
            ...prev,
            {
              id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: file.name,
              size: file.size,
              type: file.type || 'text/plain',
              content: reader.result as string
            }
          ]);
        };
        reader.readAsText(file);
      }
    });

    if (e.target) e.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if ((!trimmed && pendingAttachments.length === 0) || isLoading) return;

    onSendMessage(trimmed, selectedMode, pendingAttachments);
    setInputText('');
    setPendingAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentModeInfo = MODE_OPTIONS.find((m) => m.id === selectedMode) || MODE_OPTIONS[0];

  return (
    <div className="relative flex flex-col flex-1 h-[calc(100vh-8.5rem)] max-w-4xl w-full mx-auto overflow-hidden bg-[#e6d8c3] dark:bg-[#121110] text-[#241c14] dark:text-[#f3ede3] transition-colors duration-200">
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept=".txt,.md,.pdf,.json,.csv,.js,.ts,.tsx,.py,.html,.css,image/*"
        className="hidden"
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-4">
        {messages.length === 0 ? (
          /* Empty State - Authentic Craftsman Motif & Prompts */
          <div className="h-full flex flex-col items-center justify-center text-center select-none py-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative my-auto flex flex-col items-center"
            >
              {/* Woodcut artisan icon */}
              <div className="w-16 h-16 text-[#3b2f23] dark:text-[#d4a359] mb-2">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                  <circle cx="50" cy="24" r="11" />
                  <path d="M50 11 C42 11 39 17 39 24 C39 31 43 36 50 36 C57 36 61 31 61 24 C61 17 58 11 50 11 Z M33 21 L67 21 L65 17 L35 17 Z" />
                  <path d="M26 44 C26 38 34 36 50 36 C66 36 74 38 74 44 L80 62 L68 62 L64 48 L56 54 L56 64 L44 64 L44 54 L36 48 L32 62 L20 62 Z" />
                  <rect x="14" y="66" width="72" height="10" rx="2" />
                  <rect x="20" y="76" width="10" height="18" />
                  <rect x="70" y="76" width="10" height="18" />
                  <path d="M42 66 L58 66 L54 60 L46 60 Z" />
                </svg>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-[0.14em] uppercase font-serif text-[#1c1611] dark:text-[#f8f4ec]">
                ATELIER CONVERSATION & VISION
              </h2>
              <p className="text-xs text-[#554536] dark:text-[#a89987] font-mono mt-1 max-w-sm mx-auto">
                Posez vos questions, lisez n'importe quelle photo ou analysez vos documents
              </p>
            </motion.div>

            {/* Quick craft prompts */}
            <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-2 mt-auto pb-2">
              {[
                { title: '📷 Lire une Photo', prompt: 'Analyse cette photo avec précision : que vois-tu ?', icon: <Camera className="w-3.5 h-3.5 text-[#b8863b]" /> },
                { title: '⚡ Synthèse Rapide', prompt: 'Donne-moi un résumé structuré et concis de mes idées.', icon: <Sparkles className="w-3.5 h-3.5 text-[#b8863b]" /> },
                { title: '📄 Analyser un Document', prompt: 'Indexe ce document et extrais les points clés essentiels.', icon: <FileText className="w-3.5 h-3.5 text-[#b8863b]" /> },
                { title: '🤝 Dialogue Co-Ami', prompt: 'Comment peux-tu m\'accompagner au quotidien fidèlement ?', icon: <Star className="w-3.5 h-3.5 text-[#b8863b]" /> },
              ].map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSendMessage(sug.prompt, selectedMode)}
                  className="p-2.5 rounded-sm bg-[#dfcfba] dark:bg-[#1e1c19] hover:bg-[#d4c3ac] dark:hover:bg-[#282521] border border-[#bfae96] dark:border-[#383129] text-left transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {sug.icon}
                    <p className="font-bold text-xs font-mono text-[#241c14] dark:text-[#f3ede3]">{sug.title}</p>
                  </div>
                  <p className="text-[10px] text-[#554536] dark:text-[#9e8f7f] font-mono truncate">{sug.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation Message List */
          <div className="space-y-4 pb-28">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={`group flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Attachments preview */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 p-1.5 rounded-sm bg-[#dfcfba] dark:bg-[#1e1c19] border border-[#bfae96] dark:border-[#3d362d] text-xs font-mono text-[#241c14] dark:text-[#f3ede3] shadow-xs"
                      >
                        {att.type.startsWith('image/') ? (
                          <div className="w-10 h-10 rounded-xs overflow-hidden bg-black/20 shrink-0">
                            <img src={att.content} alt={att.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <FileText className="w-4 h-4 text-[#b8863b] shrink-0" />
                        )}
                        <span className="truncate max-w-[140px] font-bold">{att.name}</span>
                        <span className="text-[10px] text-[#6b5843] dark:text-[#9e8f7f]">
                          ({Math.round(att.size / 1024)} Ko)
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message Bubble Container with Craft Card Style */}
                <div className="relative max-w-[92%] sm:max-w-[85%]">
                  <div
                    className={`rounded-sm px-4 py-3 text-sm leading-relaxed transition-all shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-[#dfcfba] dark:bg-[#28241f] border border-[#bfae96] dark:border-[#42392f] text-[#221a12] dark:text-[#faf5ed] font-medium'
                        : 'bg-[#f5eedf] dark:bg-[#1a1815] border border-[#cfbfa9] dark:border-[#383129] text-[#221a12] dark:text-[#f4eee3]'
                    }`}
                  >
                    {/* Reasoning block for assistant */}
                    {msg.reasoning && (
                      <details className="mb-3 p-2 rounded-xs bg-[#ebdcc7] dark:bg-[#121110] border border-[#c4b39b] dark:border-[#2e2820] text-xs">
                        <summary className="font-semibold text-[#554536] dark:text-[#d4a359] cursor-pointer select-none flex items-center gap-1.5 font-mono">
                          <Brain className="w-3.5 h-3.5" />
                          <span>Dossier d'analyse MK</span>
                        </summary>
                        <pre className="mt-2 text-[11px] text-[#44372a] dark:text-[#c4b6a4] whitespace-pre-wrap font-mono leading-normal">
                          {msg.reasoning}
                        </pre>
                      </details>
                    )}

                    <div className="whitespace-pre-wrap select-text font-normal font-sans text-[13px] sm:text-sm">
                      {msg.content}
                    </div>
                  </div>

                  {/* Actions: Delete message + Copy + Speak */}
                  <div className={`flex items-center gap-1.5 mt-1 px-1 text-xs text-[#6b5843] dark:text-[#9e8f7f] ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    
                    {/* Speak Button */}
                    {msg.role === 'assistant' && (
                      <button
                        type="button"
                        onClick={() => handleToggleSpeak(msg)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-xs hover:bg-[#d8c7b0] dark:hover:bg-[#26231f] transition-colors cursor-pointer ${
                          speakingMessageId === msg.id ? 'text-[#b8863b] font-bold' : ''
                        }`}
                        title={speakingMessageId === msg.id ? 'Arrêter la lecture' : 'Écouter'}
                      >
                        {speakingMessageId === msg.id ? (
                          <>
                            <VolumeX className="w-3 h-3 text-[#b8863b] animate-pulse" />
                            <span className="text-[10px] font-mono">Arrêter</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span className="text-[10px] font-mono">Écouter</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="p-1 rounded-xs hover:bg-[#d8c7b0] dark:hover:bg-[#26231f] transition-colors cursor-pointer"
                      title="Copier le message"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>

                    {/* Delete Message Button */}
                    {onDeleteMessage && (
                      <button
                        type="button"
                        onClick={() => onDeleteMessage(msg.id)}
                        className="p-1 rounded-xs hover:bg-rose-200 dark:hover:bg-rose-950/60 hover:text-rose-700 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="Supprimer ce message"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-sm bg-[#f5eedf] dark:bg-[#1a1815] border border-[#cfbfa9] dark:border-[#383129] max-w-xs text-xs font-mono text-[#554536] dark:text-[#a89987]">
                <span className="w-3 h-3 border-2 border-[#b8863b] border-t-transparent rounded-full animate-spin" />
                <span>MK analyse la requête & les photos...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Input Area (Craft Card Style) */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-[#e6d8c3] via-[#e6d8c3]/95 to-transparent dark:from-[#121110] dark:via-[#121110]/95 dark:to-transparent">
        
        {/* Pending attachments pill list */}
        {pendingAttachments.length > 0 && (
          <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
            {pendingAttachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#dfcfba] dark:bg-[#221f1b] border border-[#bfae96] dark:border-[#3d362d] text-xs font-mono text-[#241c14] dark:text-[#f3ede3] shadow-xs"
              >
                {att.type.startsWith('image/') ? (
                  <Camera className="w-3.5 h-3.5 text-[#b8863b]" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-[#b8863b]" />
                )}
                <span className="truncate max-w-[120px] font-bold">{att.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(att.id)}
                  className="hover:text-rose-600 ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative rounded-sm bg-[#f2e7d7] dark:bg-[#1b1916] border-2 border-[#bfae96] dark:border-[#3d362d] shadow-md p-2.5 sm:p-3 transition-colors focus-within:border-[#967644] dark:focus-within:border-[#d4a359]">
          
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez un message ou soumettez une photo à analyser..."
            className="w-full bg-transparent px-2 pt-1 text-sm text-[#241c14] dark:text-[#f3ede3] placeholder:text-[#7d6c59] dark:placeholder:text-[#8f8273] focus:outline-none resize-none leading-relaxed font-sans"
          />

          {/* Controls Bar inside the card */}
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#dfd0be] dark:border-[#2b251f]">
            
            {/* Left Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Plus Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Ajouter un fichier ou document"
                className="w-7 h-7 rounded-sm bg-[#dfcfba] dark:bg-[#28241f] hover:bg-[#d0bea7] dark:hover:bg-[#342f28] flex items-center justify-center text-[#241c14] dark:text-[#f3ede3] border border-[#ab9981] dark:border-[#443a2f] active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              {/* Direct Photo Reader Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Lire et analyser une photo par IA"
                className="h-7 px-2.5 rounded-sm bg-[#dfcfba] dark:bg-[#28241f] hover:bg-[#d0bea7] dark:hover:bg-[#342f28] flex items-center gap-1.5 text-xs text-[#241c14] dark:text-[#d4a359] border border-[#ab9981] dark:border-[#443a2f] active:scale-95 transition-all cursor-pointer font-mono font-bold"
              >
                <Camera className="w-3.5 h-3.5 text-[#b8863b] dark:text-[#d4a359]" />
                <span className="hidden sm:inline">Photo</span>
              </button>

              {/* Mode Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                  className="h-7 px-2 rounded-sm bg-[#dfcfba] dark:bg-[#28241f] hover:bg-[#d0bea7] dark:hover:bg-[#342f28] border border-[#ab9981] dark:border-[#443a2f] flex items-center gap-1 text-xs font-mono font-bold text-[#241c14] dark:text-[#f3ede3] active:scale-95 transition-all cursor-pointer"
                >
                  <span>{currentModeInfo.icon}</span>
                  <span className="hidden md:inline">{currentModeInfo.label}</span>
                  <ChevronDown className="w-3 h-3 text-[#705e4c]" />
                </button>

                <AnimatePresence>
                  {isModeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute bottom-9 left-0 z-50 w-60 rounded-sm bg-[#e8dac6] dark:bg-[#1a1815] border-2 border-[#ab9981] dark:border-[#443a2f] shadow-xl p-1.5 space-y-1"
                    >
                      {MODE_OPTIONS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedMode(m.id);
                            setIsModeDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-xs transition-colors text-left cursor-pointer ${
                            selectedMode === m.id
                              ? 'bg-[#1e1c19] text-[#f4efe4] dark:bg-[#d4a359] dark:text-[#161412] font-bold'
                              : 'hover:bg-[#dfcfba] dark:hover:bg-[#28241f] text-[#241c14] dark:text-[#f3ede3]'
                          }`}
                        >
                          <span className="text-sm">{m.icon}</span>
                          <div>
                            <p className="font-bold">{m.label}</p>
                            <p className="text-[10px] opacity-80">{m.desc}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Clear chat button if messages exist */}
              {messages.length > 0 && onClearChat && (
                <button
                  type="button"
                  onClick={onClearChat}
                  title="Effacer la discussion en cours"
                  className="h-7 px-2 rounded-sm bg-[#dfcfba] dark:bg-[#28241f] hover:bg-rose-200 dark:hover:bg-rose-950/60 text-[#6b5843] hover:text-rose-700 dark:text-[#9e8f7f] dark:hover:text-rose-400 border border-[#ab9981] dark:border-[#443a2f] flex items-center gap-1 text-xs font-mono active:scale-95 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline text-[10px]">Effacer</span>
                </button>
              )}
            </div>

            {/* Right Controls: Mic & Send */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                title={isRecording ? 'Arrêter la dictée' : 'Dicter vocalement'}
                className={`w-8 h-8 rounded-sm flex items-center justify-center transition-all cursor-pointer border ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse border-rose-700'
                    : 'bg-[#dfcfba] dark:bg-[#28241f] text-[#241c14] dark:text-[#f3ede3] border-[#ab9981] dark:border-[#443a2f] hover:bg-[#d0bea7]'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={(!inputText.trim() && pendingAttachments.length === 0) || isLoading}
                title="Envoyer le message"
                className="h-8 px-3.5 rounded-sm bg-[#1e1c19] dark:bg-[#d4a359] hover:bg-[#342f2b] dark:hover:bg-[#e2b76e] text-[#f4efe4] dark:text-[#161412] font-mono font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <span>Envoyer</span>
                <Send className="w-3 h-3" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
