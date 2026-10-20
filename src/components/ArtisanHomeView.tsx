import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Eye, Camera } from 'lucide-react';
import { ActiveTab } from './TopNav';
import { Attachment } from '../types';

interface ArtisanHomeViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenDrawer: () => void;
  onPhotoSelectedForVision: (attachment: Attachment) => void;
}

export const ArtisanHomeView: React.FC<ArtisanHomeViewProps> = ({
  onNavigateTab,
  onPhotoSelectedForVision,
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const att: Attachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type || 'image/jpeg',
        content: base64
      };
      onPhotoSelectedForVision(att);
    };
    reader.readAsDataURL(file);
  };

  const CARDS = [
    {
      id: 'vision',
      title: 'Beratung',
      subtitle: 'Lire & Analyser Photos',
      image: '/src/assets/images/craftsman_consultant_1792475740273.jpg',
      alt: 'Artisan consultant à la table de dessin',
      onClick: () => {
        photoInputRef.current?.click();
      },
      tag: 'Vision Photos'
    },
    {
      id: 'imagine',
      title: 'Grafikservice',
      subtitle: 'Générer de Vraies Photos',
      image: '/src/assets/images/vintage_artist_drafting_1792475740157.jpg',
      alt: 'Artiste illustrateur en atelier',
      onClick: () => onNavigateTab('imagine'),
      tag: 'Génération 8K'
    },
    {
      id: 'textilien',
      title: 'Textilien',
      subtitle: 'Compagnon Loyal Co-Ami',
      image: '/src/assets/images/vintage_tailor_textiles_1792475740194.jpg',
      alt: 'Maître tailleur examinant des tissus fins',
      onClick: () => onNavigateTab('co-ami'),
      tag: 'Vocal & Amitié'
    },
    {
      id: 'veredlung',
      title: 'Veredlung',
      subtitle: 'Serveurs Haute Puissance',
      image: '/src/assets/images/vintage_machinist_craft_1792475740709.jpg',
      alt: 'Artisan maître usinier et machinerie de précision',
      onClick: () => onNavigateTab('servers'),
      tag: '128k Clusters'
    }
  ];

  return (
    <div className="flex-1 w-full max-w-xl mx-auto flex flex-col bg-[#e6d8c3] dark:bg-[#121110] text-[#241c14] dark:text-[#f3ede3] min-h-[calc(100vh-8.5rem)] pb-12 transition-colors duration-200">
      {/* Hidden file input for direct photo reading */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* MIDDLE HERO BLOCK: Charcoal / Dark Textured Craft Workshop (Identical to screenshot) */}
      <section className="bg-[#1b1917] dark:bg-[#0c0b0a] px-5 py-7 text-center border-b-2 border-[#382f25] text-[#f4efe5] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 max-w-sm mx-auto">
          <h2 className="text-xl sm:text-2xl font-black tracking-[0.18em] uppercase text-[#f7f2ea] font-serif mb-2">
            TEXTILSCHMIEDE
          </h2>
          <p className="text-xs sm:text-sm font-mono tracking-wide text-[#b8afa3] leading-relaxed mb-5">
            Ehrliches Handwerk für hochwertigen Textildruck aus Fulda & MK-Vision
          </p>

          {/* Parchment Deckled Action Button ("View Produkte") */}
          <button
            type="button"
            onClick={() => onNavigateTab('chat')}
            className="inline-block px-7 py-2.5 bg-[#dfcfba] hover:bg-[#efe0cc] active:scale-95 text-[#211a13] font-mono font-bold text-xs uppercase tracking-[0.16em] rounded-sm shadow-md border-y border-[#f3e9db] hover:shadow-lg transition-all cursor-pointer"
          >
            View Produkte
          </button>
        </div>
      </section>

      {/* 2x2 VINTAGE PHOTO CARDS GRID (With Archival Photo Mount Corner Brackets) */}
      <section className="p-4 sm:p-5 flex-1">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {CARDS.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={card.onClick}
              className="group cursor-pointer flex flex-col bg-[#cfbfa9] dark:bg-[#1e1c19] p-2 sm:p-2.5 rounded-sm border border-[#ab9981] dark:border-[#383129] shadow-sm hover:shadow-md transition-all select-none"
            >
              {/* Photo Frame Container with Authentic Album Corner Brackets */}
              <div className="relative aspect-4/3 w-full bg-[#181614] overflow-hidden p-1 shadow-inner">
                {/* Vintage Corner Brackets (Dark Metal / Cardboard mounts) */}
                <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#2a221b] dark:border-[#120f0d] z-20 pointer-events-none" />
                <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#2a221b] dark:border-[#120f0d] z-20 pointer-events-none" />
                <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#2a221b] dark:border-[#120f0d] z-20 pointer-events-none" />
                <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#2a221b] dark:border-[#120f0d] z-20 pointer-events-none" />

                <img
                  src={card.image}
                  alt={card.alt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale contrast-110 brightness-95 group-hover:scale-103 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-radial from-transparent to-black/35 pointer-events-none" />
              </div>

              {/* Parchment Label Card below photo */}
              <div className="mt-2 pt-1 pb-1.5 px-1 bg-[#e4d6c1] dark:bg-[#292520] border border-[#bfae96] dark:border-[#42392f] text-center shadow-xs">
                <p className="text-xs sm:text-sm font-mono font-bold tracking-[0.14em] text-[#221a13] dark:text-[#f4eee3] uppercase">
                  {card.title}
                </p>
                <p className="text-[10px] text-[#554637] dark:text-[#b0a291] font-mono truncate mt-0.5">
                  {card.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Direct Actions: Lire une photo & Générer photo */}
        <div className="mt-5 pt-4 border-t border-[#ab9981] dark:border-[#383129] flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#4c3d30] dark:text-[#b8aba0] font-bold px-1 uppercase tracking-wider">
            <span>Actions Directes Studio</span>
            <span className="text-[10px] text-[#6b5843] dark:text-[#d4a359]">Prêt pour l'action</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="h-10 px-3 rounded-sm bg-[#221c16] hover:bg-[#322920] dark:bg-[#292520] dark:hover:bg-[#38332c] active:scale-95 text-[#f4ede3] font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer border border-[#44382c] dark:border-[#4f4335]"
            >
              <Camera className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Lire une photo</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('imagine')}
              className="h-10 px-3 rounded-sm bg-[#221c16] hover:bg-[#322920] dark:bg-[#292520] dark:hover:bg-[#38332c] active:scale-95 text-[#f4ede3] font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer border border-[#44382c] dark:border-[#4f4335]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Générer photo</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER: Quality Seal */}
      <footer className="text-center py-4 bg-[#cfbfa9] dark:bg-[#161412] border-t border-[#ab9981] dark:border-[#2b251f] text-[10px] font-mono tracking-widest text-[#5c4d3e] dark:text-[#9e8f7f] uppercase">
        Ehrliches Handwerk • MK Intelligence Souveraine
      </footer>
    </div>
  );
};
