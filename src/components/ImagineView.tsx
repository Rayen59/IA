import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GeneratedImage } from '../types';
import { IMAGE_STYLE_PRESETS, generateArtImage } from '../services/imageGenerator';
import { 
  Sparkles, 
  Download, 
  MessageSquare, 
  Camera,
  Check
} from 'lucide-react';

interface ImagineViewProps {
  onSendImageToChat: (image: GeneratedImage) => void;
}

export const ImagineView: React.FC<ImagineViewProps> = ({ onSendImageToChat }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial real photo demo if empty
  React.useEffect(() => {
    if (images.length === 0) {
      setImages([
        {
          id: 'demo-1',
          prompt: "Portrait 8K d'un maître artisan horloger suisse dans un atelier rétro avec engrenages de précision",
          style: 'cinematic',
          aspectRatio: '1:1',
          url: '/src/assets/images/craftsman_consultant_1792475740273.jpg',
          createdAt: Date.now() - 3600000
        },
        {
          id: 'demo-2',
          prompt: "Maître tailleur examinant des tissus de laine fine dans un atelier d'époque",
          style: 'cinematic',
          aspectRatio: '1:1',
          url: '/src/assets/images/vintage_tailor_textiles_1792475740194.jpg',
          createdAt: Date.now() - 7200000
        }
      ]);
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const newImg = await generateArtImage(prompt.trim(), selectedStyle, aspectRatio);
      setImages(prev => [newImg, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (img: GeneratedImage) => {
    const a = document.createElement('a');
    a.href = img.url;
    a.download = `MK-Grafikservice-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-8.5rem)] max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-y-auto bg-[#e6d8c3] dark:bg-[#121110] text-[#241c14] dark:text-[#f3ede3] transition-colors duration-200">
      
      {/* Studio Header */}
      <div className="mb-5 text-center max-w-lg mx-auto">
        <h2 className="text-xl sm:text-2xl font-black tracking-[0.16em] uppercase text-[#1c1611] dark:text-[#f4eee3] font-serif flex items-center justify-center gap-2">
          <span>GRAFIKSERVICE • VRAIES PHOTOS IA</span>
        </h2>
        <p className="text-xs text-[#554536] dark:text-[#a89987] font-mono mt-1">
          Génération photographique réelle haute définition • Inférence neuronale
        </p>
      </div>

      {/* Generator Prompt Box (Craft Paper Card) */}
      <form onSubmit={handleGenerate} className="bg-[#dfcfba] dark:bg-[#1e1c19] border-2 border-[#bfae96] dark:border-[#3d362d] rounded-sm p-4 sm:p-5 shadow-sm mb-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#3d3023] dark:text-[#d4a359] mb-1.5 font-mono uppercase tracking-wider">
            Prompt de Synthèse Photographique
          </label>
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Portrait 8K d'un photographe argentique dans un studio ancien..."
              className="w-full h-11 pl-3.5 pr-12 text-sm rounded-xs bg-[#f4efe5] dark:bg-[#141210] border border-[#ab9981] dark:border-[#42392f] text-[#241c14] dark:text-[#f3ede3] placeholder:text-[#7d6c59] dark:placeholder:text-[#776c5f] focus:outline-none focus:border-[#967644] dark:focus:border-[#d4a359] font-sans"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 rounded-xs bg-[#1e1c19] dark:bg-[#d4a359] hover:bg-[#322c26] dark:hover:bg-[#e2b76e] text-[#f4efe4] dark:text-[#161412] font-mono font-bold text-xs flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Real Photo Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
            <span className="text-[10px] text-[#554536] dark:text-[#a89987] font-mono shrink-0">Exemples :</span>
            {[
              "Portrait 8K d'un artisan horloger dans son atelier",
              "Supercar noire sous la pluie de nuit",
              "Chalet en bois dans la forêt alpine au coucher du soleil",
              "Machine mécanique d'imprimerie ancienne en cuivre"
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(p)}
                className="text-[10px] px-2 py-1 rounded-xs bg-[#f2e7d7] dark:bg-[#141210] hover:bg-[#e4d6c1] dark:hover:bg-[#26221c] text-[#33281c] dark:text-[#dcd1c2] border border-[#ab9981] dark:border-[#383129] shrink-0 font-mono transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Style Selector */}
        <div>
          <label className="block text-xs font-bold text-[#3d3023] dark:text-[#d4a359] mb-1.5 font-mono uppercase tracking-wider">
            Style Visuel
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {IMAGE_STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedStyle(preset.id)}
                className={`p-2 rounded-xs border text-left transition-all cursor-pointer ${
                  selectedStyle === preset.id
                    ? 'bg-[#1e1c19] text-[#f4efe4] dark:bg-[#d4a359] dark:text-[#161412] border-[#1e1c19] dark:border-[#d4a359] shadow-xs'
                    : 'bg-[#f4efe5] dark:bg-[#141210] border-[#bfae96] dark:border-[#383129] text-[#241c14] dark:text-[#f3ede3] hover:border-[#8f7e69]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{preset.icon}</span>
                  <span className="text-xs font-bold font-mono">{preset.label}</span>
                </div>
                <p className="text-[10px] opacity-75 truncate mt-0.5">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio & Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#cbb89f] dark:border-[#2e2820]">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#554536] dark:text-[#a89987] mr-1 font-mono">Format :</span>
            {(['1:1', '16:9', '9:16'] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setAspectRatio(ratio)}
                className={`px-2.5 py-1 text-xs rounded-xs font-mono font-bold transition-colors cursor-pointer ${
                  aspectRatio === ratio
                    ? 'bg-[#1e1c19] text-[#f4efe4] dark:bg-[#d4a359] dark:text-[#161412]'
                    : 'bg-[#f4efe5] dark:bg-[#141210] text-[#33281c] dark:text-[#dcd1c2] border border-[#ab9981] dark:border-[#383129]'
                }`}
              >
                {ratio === '1:1' ? '1:1 Carré' : ratio === '16:9' ? '16:9 Paysage' : '9:16 Mobile'}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="h-9 px-5 rounded-xs bg-[#1e1c19] dark:bg-[#d4a359] hover:bg-[#342f2b] dark:hover:bg-[#e2b76e] text-[#f4efe4] dark:text-[#161412] font-bold font-mono text-xs flex items-center gap-2 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                <span>Génération en cours...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span>Générer la vraie photo</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Gallery of Creations with Antique Photo Corners */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#3d3023] dark:text-[#d4a359] font-mono mb-3">
          Galerie des Épreuves Récentes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
          {images.map((img) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative rounded-xs overflow-hidden border-2 border-[#bfae96] dark:border-[#3d362d] bg-[#1a1715] p-1.5 shadow-sm"
            >
              {/* Photo corner mounts */}
              <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#d4a359] z-20 pointer-events-none" />
              <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#d4a359] z-20 pointer-events-none" />
              <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#d4a359] z-20 pointer-events-none" />
              <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#d4a359] z-20 pointer-events-none" />

              <div className="w-full h-64 overflow-hidden bg-black/40">
                <img
                  src={img.url}
                  alt={img.prompt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform group-hover:scale-102 duration-300"
                />
              </div>

              {/* Overlay with info and actions */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                <p className="text-xs font-medium line-clamp-2 mb-2 text-stone-200 font-sans">
                  {img.prompt}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/20">
                  <span className="text-[10px] text-stone-400 capitalize font-mono">
                    {img.style} • {img.aspectRatio}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(img)}
                      title="Télécharger l'image HD"
                      className="p-1.5 rounded-xs bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSendImageToChat(img)}
                      title="Analyser dans le Chat"
                      className="px-2.5 py-1.5 rounded-xs bg-[#d4a359] hover:bg-[#e2b76e] text-[#161412] font-mono font-bold transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};
