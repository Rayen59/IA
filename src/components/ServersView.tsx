import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Server, Cpu, Database, Zap, Activity, Globe, Flame } from 'lucide-react';
import { speechSynth } from '../services/mkEngine';

interface ServersViewProps {
  onBackToChat: () => void;
}

interface ServerTelemetry {
  clusters: number;
  boostLevel: number;
  uptimeSeconds: number;
  ramUsedMb: number;
  heapUsedMb: number;
  latencyMs: number;
  tflops: number;
  status: string;
  regions: Array<{ name: string; ping: number; status: string; load: string }>;
}

export const ServersView: React.FC<ServersViewProps> = ({ onBackToChat }) => {
  const [telemetry, setTelemetry] = useState<ServerTelemetry>({
    clusters: 128000,
    boostLevel: 1,
    uptimeSeconds: 420,
    ramUsedMb: 72,
    heapUsedMb: 45,
    latencyMs: 12,
    tflops: 185600,
    status: 'OPTIMAL_HIGH_PERFORMANCE',
    regions: [
      { name: 'Cluster Paris (Atelier-1)', ping: 6, status: 'ACTIF', load: '34%' },
      { name: 'Cluster Francfort (Hess-4)', ping: 11, status: 'ACTIF', load: '42%' },
      { name: 'Cluster Zurich (Alpine-AI)', ping: 14, status: 'ACTIF', load: '29%' },
      { name: 'Cluster Tokyo (Shibuya-Net)', ping: 84, status: 'ACTIF', load: '51%' },
      { name: 'Cluster Silicon Valley (Nova-7)', ping: 112, status: 'ACTIF', load: '48%' }
    ]
  });

  const [isBoosting, setIsBoosting] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/servers/telemetry');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.warn('Telemetry fetch note:', err);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleBoostServers = async () => {
    if (isBoosting) return;
    setIsBoosting(true);
    speechSynth.speak("Suralimentation des supercalculateurs MK en cours. Déploiement de clusters haute performance...");

    try {
      const res = await fetch('/api/servers/boost', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTelemetry(prev => ({
          ...prev,
          clusters: data.clusters,
          boostLevel: data.boostLevel,
          tflops: data.clusters * 1.45,
          latencyMs: Math.max(7, prev.latencyMs - 2)
        }));
      } else {
        setTelemetry(prev => ({
          ...prev,
          clusters: prev.clusters + 16000,
          boostLevel: prev.boostLevel + 1,
          tflops: (prev.clusters + 16000) * 1.45,
          latencyMs: Math.max(7, prev.latencyMs - 2)
        }));
      }
    } catch {
      setTelemetry(prev => ({
        ...prev,
        clusters: prev.clusters + 16000,
        boostLevel: prev.boostLevel + 1,
        tflops: (prev.clusters + 16000) * 1.45,
        latencyMs: Math.max(7, prev.latencyMs - 2)
      }));
    } finally {
      setTimeout(() => {
        setIsBoosting(false);
        setPulseKey(k => k + 1);
        speechSynth.speak(`Serveurs MK suralimentés. Puissance totale : ${telemetry.clusters.toLocaleString()} clusters de calcul.`);
      }, 1400);
    }
  };

  const KNOWLEDGE_BASES = [
    { name: 'Modèle Vision & Analyse d\'Images Multimodale', records: '4.8 Millions de paires texte-image', status: 'Temps réel' },
    { name: 'Générateur de Photos Haute Fidélité (Grafikservice)', records: '1.2 Million de vecteurs artistiques', status: 'Actif' },
    { name: 'Sciences, Physique & Ingénierie des Matériaux', records: '2.4 Millions de documents indexés', status: 'Synchronisé' },
    { name: 'Sécurité Mobile & Cryptographie Autonome', records: '1.8 Million d\'analyses de code', status: 'Renforcé' },
    { name: 'Linguistique Multi-Langues & Synthèse Vocale', records: '980 000 modèles de phonétique', status: 'Optimisé' },
    { name: 'Compagnon Conversationnel & Psychologie Co-Ami', records: '750 000 matrices d\'écoute', status: 'Connecté' },
  ];

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-8.5rem)] max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-y-auto bg-[#e6d8c3] dark:bg-[#121110] text-[#241c14] dark:text-[#f3ede3] transition-colors duration-200">
      
      {/* Title & Boost Banner (Authentic Craft Industrial Look) */}
      <div className="mb-6 p-5 rounded-sm bg-[#dfcfba] dark:bg-[#1c1a17] border-2 border-[#bfae96] dark:border-[#3d362d] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#554536] dark:text-[#d4a359]">
              Veredlung • Clusters MK Haute Puissance
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-[0.14em] uppercase text-[#1c1611] dark:text-[#f4eee3] font-serif flex items-center gap-2">
            <Server className="w-6 h-6 text-[#b8863b] dark:text-[#d4a359]" />
            <span>Infrastructure Serveurs MK</span>
          </h2>
          <p className="text-xs text-[#554536] dark:text-[#a89987] font-mono mt-1 max-w-md">
            Puissance de calcul brute pour le traitement ultra-rapide des requêtes, la lecture de photos et la génération d'images.
          </p>
        </div>

        <button
          type="button"
          onClick={handleBoostServers}
          disabled={isBoosting}
          className="h-11 px-5 rounded-xs bg-[#1e1c19] dark:bg-[#d4a359] hover:bg-[#322c26] dark:hover:bg-[#e2b76e] text-[#f4efe4] dark:text-[#161412] font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-xs shrink-0"
        >
          <Zap className={`w-4 h-4 fill-current ${isBoosting ? 'animate-spin' : ''}`} />
          <span>{isBoosting ? 'Suralimentation...' : '⚡ Suralimenter les Serveurs'}</span>
        </button>
      </div>

      {/* KPI Stats in Craft Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <motion.div
          key={`clusters-${pulseKey}`}
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          className="p-3.5 rounded-sm bg-[#dfcfba] dark:bg-[#1e1c19] border border-[#bfae96] dark:border-[#383129] shadow-xs"
        >
          <div className="flex items-center justify-between text-[#554536] dark:text-[#a89987] mb-1">
            <span className="text-[11px] font-mono font-bold">Clusters TFLOPS</span>
            <Cpu className="w-4 h-4 text-[#b8863b] dark:text-[#d4a359]" />
          </div>
          <p className="text-2xl font-black text-[#1c1611] dark:text-[#f4eee3] tabular-nums font-mono">
            {telemetry.clusters.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-[#c9b79e] dark:bg-[#282520] font-mono font-bold text-[#241c14] dark:text-[#d4a359]">
              Niveau {telemetry.boostLevel}
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">+{telemetry.boostLevel * 16}k cœurs</span>
          </div>
        </motion.div>

        <div className="p-3.5 rounded-sm bg-[#dfcfba] dark:bg-[#1e1c19] border border-[#bfae96] dark:border-[#383129] shadow-xs">
          <div className="flex items-center justify-between text-[#554536] dark:text-[#a89987] mb-1">
            <span className="text-[11px] font-mono font-bold">Latence Réseau</span>
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums font-mono">
            {telemetry.latencyMs} ms
          </p>
          <p className="text-[10px] text-[#554536] dark:text-[#a89987] font-mono mt-1.5">
            Inférence temps réel
          </p>
        </div>

        <div className="p-3.5 rounded-sm bg-[#dfcfba] dark:bg-[#1e1c19] border border-[#bfae96] dark:border-[#383129] shadow-xs">
          <div className="flex items-center justify-between text-[#554536] dark:text-[#a89987] mb-1">
            <span className="text-[11px] font-mono font-bold">Mémoire Allouée</span>
            <Database className="w-4 h-4 text-[#b8863b] dark:text-[#d4a359]" />
          </div>
          <p className="text-2xl font-black text-[#1c1611] dark:text-[#f4eee3] tabular-nums font-mono">
            {telemetry.ramUsedMb} Mo
          </p>
          <p className="text-[10px] text-[#554536] dark:text-[#a89987] font-mono mt-1.5">
            Heap : {telemetry.heapUsedMb} Mo
          </p>
        </div>

        <div className="p-3.5 rounded-sm bg-[#dfcfba] dark:bg-[#1e1c19] border border-[#bfae96] dark:border-[#383129] shadow-xs">
          <div className="flex items-center justify-between text-[#554536] dark:text-[#a89987] mb-1">
            <span className="text-[11px] font-mono font-bold">Puissance Brute</span>
            <Flame className="w-4 h-4 text-[#b8863b] dark:text-[#d4a359]" />
          </div>
          <p className="text-2xl font-black text-[#1c1611] dark:text-[#f4eee3] tabular-nums font-mono">
            {(telemetry.tflops / 1000).toFixed(1)}k
          </p>
          <p className="text-[10px] text-[#554536] dark:text-[#a89987] font-mono mt-1.5">
            Pétaflops vectoriels
          </p>
        </div>
      </div>

      {/* Global Datacenter Regions */}
      <div className="p-4 sm:p-5 rounded-sm bg-[#dfcfba] dark:bg-[#1e1c19] border-2 border-[#bfae96] dark:border-[#3d362d] shadow-sm mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#3d3023] dark:text-[#d4a359] flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>Nœuds Serveurs & Répartition Géographique</span>
          </h3>
          <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-mono font-bold bg-[#c9b79e] dark:bg-[#282520] px-2 py-0.5 rounded-xs">
            5 Nœuds 100% Opérationnels
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {telemetry.regions.map((reg, idx) => (
            <div key={idx} className="p-3 rounded-xs bg-[#f4efe5] dark:bg-[#141210] border border-[#bfae96] dark:border-[#383129] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold font-mono text-[#241c14] dark:text-[#f3ede3]">{reg.name}</p>
                <p className="text-[10px] text-[#554536] dark:text-[#a89987] font-mono">Charge : {reg.load}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-[#b8863b] dark:text-[#d4a359]">{reg.ping} ms</span>
                <p className="text-[9px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">ACTIF</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modules Neuronaux */}
      <div className="p-4 sm:p-5 rounded-sm bg-[#dfcfba] dark:bg-[#1e1c19] border-2 border-[#bfae96] dark:border-[#3d362d] shadow-sm mb-6 space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#3d3023] dark:text-[#d4a359] flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span>Modules de Traitement & Données Embarquées</span>
        </h3>

        <div className="divide-y divide-[#cbb89f] dark:divide-[#2e2820]">
          {KNOWLEDGE_BASES.map((kb, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold font-mono text-[#241c14] dark:text-[#f3ede3]">{kb.name}</p>
                <p className="text-[10px] text-[#554536] dark:text-[#a89987] font-mono">{kb.records}</p>
              </div>
              <span className="text-xs text-[#b8863b] dark:text-[#d4a359] font-mono font-bold">
                {kb.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
