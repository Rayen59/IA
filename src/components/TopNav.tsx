import React from 'react';
import { Sun, Moon, ArrowLeft, Star, Menu } from 'lucide-react';

export type ActiveTab = 'atelier' | 'chat' | 'imagine' | 'co-ami' | 'servers';

interface TopNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenDrawer: () => void;
  canGoBack: boolean;
  onGoBack: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onOpenDrawer,
  canGoBack,
  onGoBack,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="w-full bg-[#d6c5ad] dark:bg-[#1a1815] text-[#241c14] dark:text-[#f3ede3] border-b-2 border-[#3d3329] dark:border-[#2d2720] transition-colors duration-200 select-none shadow-sm relative z-30">
      
      {/* Top Utility Controls */}
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-1 flex items-center justify-between">
        {/* Left: Back button or EST text */}
        <div className="flex items-center gap-2">
          {canGoBack && activeTab !== 'atelier' && (
            <button
              type="button"
              onClick={onGoBack}
              title="Revenir en arrière"
              className="p-1.5 rounded-sm bg-[#c7b59c] dark:bg-[#292520] hover:bg-[#b8a58b] dark:hover:bg-[#38332c] text-[#241c14] dark:text-[#f3ede3] active:scale-95 transition-all cursor-pointer border border-[#8f7e69] dark:border-[#423a31]"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-bold text-[#554433] dark:text-[#a89987] font-mono">
            EST. MK • ATELIER
          </span>
        </div>

        {/* Right: Working Dark Mode Button + Menu Toggle */}
        <div className="flex items-center gap-2">
          {/* Functional Dark/Light Mode Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Passer en mode Kraft Clair' : 'Passer en mode Anthracite Sombre'}
            aria-label="Changer le thème"
            className="h-8 px-2.5 rounded-sm bg-[#c7b59c] dark:bg-[#292520] hover:bg-[#b8a58b] dark:hover:bg-[#38332c] text-[#241c14] dark:text-[#f3ede3] flex items-center gap-1.5 text-xs font-mono font-semibold border border-[#8f7e69] dark:border-[#423a31] active:scale-95 transition-all cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span className="hidden sm:inline text-[11px]">Clair</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#3b2f23] fill-[#3b2f23]" />
                <span className="hidden sm:inline text-[11px]">Sombre</span>
              </>
            )}
          </button>

          {/* Drawer Menu Button */}
          <button
            type="button"
            onClick={onOpenDrawer}
            title="Menu & Historique"
            aria-label="Ouvrir le menu"
            className="w-8 h-8 rounded-sm bg-[#c7b59c] dark:bg-[#292520] hover:bg-[#b8a58b] dark:hover:bg-[#38332c] flex items-center justify-center text-[#241c14] dark:text-[#f3ede3] border border-[#8f7e69] dark:border-[#423a31] active:scale-95 transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Woodcut Emblem Header (Identical to user's photo) */}
      <div 
        onClick={() => onTabChange('atelier')}
        className="flex flex-col items-center justify-center text-center px-4 pt-1 pb-3 cursor-pointer group"
      >
        {/* Woodcut artisan silhouette */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 text-[#241c14] dark:text-[#f3ede3] flex items-center justify-center transition-transform group-hover:scale-103 duration-200">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current drop-shadow-sm">
            <circle cx="50" cy="24" r="11" />
            <path d="M50 11 C42 11 39 17 39 24 C39 31 43 36 50 36 C57 36 61 31 61 24 C61 17 58 11 50 11 Z M33 21 L67 21 L65 17 L35 17 Z" />
            <path d="M26 44 C26 38 34 36 50 36 C66 36 74 38 74 44 L80 62 L68 62 L64 48 L56 54 L56 64 L44 64 L44 54 L36 48 L32 62 L20 62 Z" />
            <rect x="14" y="66" width="72" height="10" rx="2" />
            <rect x="20" y="76" width="10" height="18" />
            <rect x="70" y="76" width="10" height="18" />
            <path d="M42 66 L58 66 L54 60 L46 60 Z" />
          </svg>
        </div>

        {/* Brand Name */}
        <h1 className="text-xl sm:text-2xl font-black tracking-[0.16em] uppercase text-[#1c1610] dark:text-[#faf6ee] font-serif">
          TEXTILSCHMIEDE
        </h1>
        <p className="text-[10px] tracking-[0.25em] font-mono text-[#554536] dark:text-[#a89987] uppercase -mt-0.5">
          WWW.TEXTILSCHMIEDE.DE
        </p>

        {/* 5 Stars */}
        <div className="flex items-center gap-1.5 mt-1 text-[#241c14] dark:text-[#d4a359]">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-2.5 h-2.5 fill-current" />
          ))}
        </div>
      </div>

      {/* Workshop Navigation Tabs (Craft parchment style, no neon) */}
      <nav className="w-full bg-[#c9b79e] dark:bg-[#141210] border-t border-[#b39e83] dark:border-[#2b251f] px-2 overflow-x-auto scrollbar-none">
        <div className="max-w-xl mx-auto flex items-center justify-between sm:justify-center gap-1 sm:gap-4 py-1.5 text-xs font-mono font-bold tracking-wider uppercase">
          
          <button
            type="button"
            onClick={() => onTabChange('atelier')}
            className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'atelier'
                ? 'bg-[#1e1c19] text-[#f4efe4] dark:bg-[#d4a359] dark:text-[#161412] shadow-sm'
                : 'text-[#44372a] dark:text-[#b8aba0] hover:text-black dark:hover:text-white'
            }`}
          >
            Atelier
          </button>

          <button
            type="button"
            onClick={() => onTabChange('chat')}
            className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-[#1e1c19] text-[#f4efe4] dark:bg-[#d4a359] dark:text-[#161412] shadow-sm'
                : 'text-[#44372a] dark:text-[#b8aba0] hover:text-black dark:hover:text-white'
            }`}
          >
            Beratung (Vision)
          </button>

          <button
            type="button"
            onClick={() => onTabChange('imagine')}
            className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'imagine'
                ? 'bg-[#1e1c19] text-[#f4efe4] dark:bg-[#d4a359] dark:text-[#161412] shadow-sm'
                : 'text-[#44372a] dark:text-[#b8aba0] hover:text-black dark:hover:text-white'
            }`}
          >
            Grafikservice
          </button>

          <button
            type="button"
            onClick={() => onTabChange('co-ami')}
            className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'co-ami'
                ? 'bg-[#1e1c19] text-[#f4efe4] dark:bg-[#d4a359] dark:text-[#161412] shadow-sm'
                : 'text-[#44372a] dark:text-[#b8aba0] hover:text-black dark:hover:text-white'
            }`}
          >
            Textilien
          </button>

          <button
            type="button"
            onClick={() => onTabChange('servers')}
            className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'servers'
                ? 'bg-[#1e1c19] text-[#f4efe4] dark:bg-[#d4a359] dark:text-[#161412] shadow-sm'
                : 'text-[#44372a] dark:text-[#b8aba0] hover:text-black dark:hover:text-white'
            }`}
          >
            Veredlung
          </button>

        </div>
      </nav>

    </header>
  );
};
