import React, { useState, useEffect } from 'react';
import { UserAccount, ChatSession, Message, ChatMode, Attachment, GeneratedImage } from './types';
import { generateMKResponse } from './services/mkEngine';
import { TopNav, ActiveTab } from './components/TopNav';
import { SlidingPanel } from './components/SlidingPanel';
import { ArtisanHomeView } from './components/ArtisanHomeView';
import { ChatView } from './components/ChatView';
import { ImagineView } from './components/ImagineView';
import { CoAmiView } from './components/CoAmiView';
import { ServersView } from './components/ServersView';
import { EmailBindingModal } from './components/EmailBindingModal';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { SettingsModal } from './components/SettingsModal';

const DEFAULT_ACCOUNT: UserAccount = {
  id: 'usr-rayen',
  username: 'rayen',
  displayName: 'Rayen',
  avatar: '⚡',
  createdAt: Date.now(),
  language: 'fr',
  theme: 'dark',
  voiceSpeed: 1.0,
  voicePitch: 1.0
};

// Safe storage serializer that strips heavy base64 and huge payloads
function sanitizeSessionsForStorage(sessions: ChatSession[]): string {
  const sanitized = sessions.slice(0, 20).map((session) => ({
    ...session,
    messages: session.messages.slice(-30).map((msg) => ({
      ...msg,
      // Cap long text to prevent quota blowout
      content: msg.content.length > 15000 ? msg.content.slice(0, 15000) + '... [contenu tronqué]' : msg.content,
      // For attachments, never store heavy raw base64 data URLs in localStorage
      attachments: msg.attachments?.map((att) => ({
        id: att.id,
        name: att.name,
        size: att.size,
        type: att.type,
        content: att.type.startsWith('image/')
          ? '[Image générée MK]'
          : (att.content.length > 2000 ? att.content.slice(0, 2000) + '...' : att.content)
      }))
    }))
  }));
  return JSON.stringify(sanitized);
}

function safeSaveSessions(sessions: ChatSession[]) {
  try {
    const payload = sanitizeSessionsForStorage(sessions);
    localStorage.setItem('mk_chat_sessions', payload);
  } catch (err) {
    console.warn('LocalStorage QuotaExceededError caught, auto-pruning:', err);
    try {
      // Keep only the most recent sessions
      const minimal = sanitizeSessionsForStorage(sessions.slice(0, 3));
      localStorage.setItem('mk_chat_sessions', minimal);
    } catch {
      // Fail safely without crashing React
      try {
        localStorage.removeItem('mk_chat_sessions');
      } catch {}
    }
  }
}

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('mk_theme');
      return (saved as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // User Account state
  const [userAccount, setUserAccount] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem('mk_user_account');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ACCOUNT;
  });

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Active navigation tab (Default to artisan craft atelier as requested)
  const [activeTab, setActiveTab] = useState<ActiveTab>('atelier');
  const [tabHistory, setTabHistory] = useState<ActiveTab[]>(['atelier']);

  // Modals & Panels
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('mk_chat_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('mk_chat_sessions');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.length > 0 ? parsed[0].id : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync theme safely
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    try {
      localStorage.setItem('mk_theme', theme);
    } catch {}
  }, [theme]);

  // Persist sessions safely with quota guard
  useEffect(() => {
    safeSaveSessions(sessions);
  }, [sessions]);

  // Current session messages
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const currentMessages = activeSession ? activeSession.messages : [];

  // Tab switch
  const handleTabChange = (newTab: ActiveTab) => {
    if (newTab !== activeTab) {
      setTabHistory((prev) => [...prev, newTab]);
      setActiveTab(newTab);
    }
  };

  // Back button
  const handleGoBack = () => {
    if (tabHistory.length > 1) {
      const newHistory = [...tabHistory];
      newHistory.pop();
      const prev = newHistory[newHistory.length - 1];
      setTabHistory(newHistory);
      setActiveTab(prev);
    } else if (activeTab !== 'atelier') {
      setActiveTab('atelier');
      setTabHistory(['atelier']);
    }
  };

  // New Chat
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `ses-${Date.now()}`,
      title: 'Nouvelle discussion',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveTab('chat');
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  const handleTogglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  const handleClearAllChats = () => {
    setSessions([]);
    setActiveSessionId(null);
    try {
      localStorage.removeItem('mk_chat_sessions');
    } catch {}
  };

  // Delete an individual message (Specifically requested by user)
  const handleDeleteMessage = (messageId: string) => {
    if (!activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              updatedAt: Date.now(),
              messages: s.messages.filter((m) => m.id !== messageId)
            }
          : s
      )
    );
  };

  // Clear all messages in the currently open discussion
  const handleClearCurrentChat = () => {
    if (!activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              updatedAt: Date.now(),
              messages: []
            }
          : s
      )
    );
  };

  // Single-use unique email binding (No password, no signup hurdles)
  const handleUpdateEmail = (email: string) => {
    const updated: UserAccount = {
      ...userAccount,
      email,
      emailVerified: true
    };
    setUserAccount(updated);
    try {
      localStorage.setItem('mk_user_account', JSON.stringify(updated));
    } catch {}
  };

  // Send message
  const handleSendMessage = async (
    content: string,
    mode: ChatMode,
    attachments?: Attachment[]
  ) => {
    let targetId = activeSessionId;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments,
      mode
    };

    if (!targetId || !sessions.find(s => s.id === targetId)) {
      targetId = `ses-${Date.now()}`;
      setActiveSessionId(targetId);
      const newSession: ChatSession = {
        id: targetId,
        title: content.slice(0, 32) || (attachments ? attachments[0].name : 'Discussion MK'),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [userMessage]
      };
      setSessions((prev) => [newSession, ...prev]);
    } else {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetId
            ? {
                ...s,
                title: s.messages.length === 0 ? (content.slice(0, 32) || 'Discussion MK') : s.title,
                updatedAt: Date.now(),
                messages: [...s.messages, userMessage]
              }
            : s
        )
      );
    }

    setIsLoading(true);

    try {
      const response = await generateMKResponse(
        content,
        mode,
        currentMessages,
        attachments,
        userAccount.displayName
      );

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.text,
        reasoning: response.reasoning,
        timestamp: Date.now(),
        mode
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetId
            ? {
                ...s,
                updatedAt: Date.now(),
                messages: [...s.messages, assistantMessage]
              }
            : s
        )
      );
    } catch (err) {
      console.error('Error generating MK response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewUserVoiceMessage = (transcript: string, reply: string) => {
    let targetId = activeSessionId;
    if (!targetId) {
      targetId = `ses-${Date.now()}`;
      setActiveSessionId(targetId);
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: transcript,
      timestamp: Date.now()
    };

    const botMsg: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: reply,
      timestamp: Date.now()
    };

    setSessions((prev) => {
      const existing = prev.find(s => s.id === targetId);
      if (existing) {
        return prev.map(s =>
          s.id === targetId
            ? { ...s, updatedAt: Date.now(), messages: [...s.messages, userMsg, botMsg] }
            : s
        );
      }
      return [
        {
          id: targetId!,
          title: `Vocal : ${transcript.slice(0, 24)}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [userMsg, botMsg]
        },
        ...prev
      ];
    });
  };

  const handleSendImageToChat = (image: GeneratedImage) => {
    setActiveTab('chat');
    handleSendMessage(`J'ai créé cette image dans l'onglet Imagine : "${image.prompt}".`, 'fast', [
      {
        id: image.id,
        name: `MK-Imagine-${image.style}.png`,
        size: 512000,
        type: 'image/png',
        content: image.url
      }
    ]);
  };

  const handlePhotoSelectedForVision = (attachment: Attachment) => {
    setActiveTab('chat');
    handleSendMessage(
      "Analyse cette photo avec précision : que vois-tu ? Décris le sujet, les détails, le texte visible et le contexte.",
      'fast',
      [attachment]
    );
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="min-h-screen bg-[#e6d8c3] dark:bg-[#121110] text-[#241c14] dark:text-[#f3ede3] flex flex-col font-serif transition-colors duration-200 selection:bg-[#c9b897] selection:text-[#181614]">
      
      {/* Unique Email Identification Modal (No passwords, single-use guaranteed) */}
      <EmailBindingModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        userAccount={userAccount}
        onUpdateEmail={handleUpdateEmail}
      />

      {/* Top Header: Authentic Textilschmiede Artisan Crest with Working Dark Mode */}
      <TopNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        canGoBack={tabHistory.length > 1 || activeTab !== 'atelier'}
        onGoBack={handleGoBack}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Sliding Panel (Drawer) with history wipe and email */}
      <SlidingPanel
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          setActiveTab('chat');
        }}
        onNewSession={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onTogglePinSession={handleTogglePinSession}
        onClearAllChats={handleClearAllChats}
        userAccount={userAccount}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenServers={() => setActiveTab('servers')}
        onOpenEmailModal={() => {
          setIsEmailModalOpen(true);
          setIsDrawerOpen(false);
        }}
        onLogout={() => {
          setIsEmailModalOpen(true);
          setIsDrawerOpen(false);
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col w-full overflow-hidden">
        {activeTab === 'atelier' && (
          <ArtisanHomeView
            onNavigateTab={handleTabChange}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onPhotoSelectedForVision={handlePhotoSelectedForVision}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView
            messages={currentMessages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            userAccount={userAccount}
            onStartLiveVoice={() => setIsLiveVoiceOpen(true)}
            onDeleteMessage={handleDeleteMessage}
            onClearChat={handleClearCurrentChat}
          />
        )}

        {activeTab === 'imagine' && (
          <ImagineView onSendImageToChat={handleSendImageToChat} />
        )}

        {activeTab === 'co-ami' && (
          <CoAmiView
            userAccount={userAccount}
            onStartLiveVoice={() => setIsLiveVoiceOpen(true)}
          />
        )}

        {activeTab === 'servers' && (
          <ServersView onBackToChat={() => setActiveTab('chat')} />
        )}
      </main>

      {/* Live Voice Interactive Modal ("||| Parler") */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        userAccount={userAccount}
        onNewUserVoiceMessage={handleNewUserVoiceMessage}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userAccount={userAccount}
        onUpdateAccount={(updated) => setUserAccount(updated)}
        onClearAllChats={handleClearAllChats}
      />

    </div>
  );
}
