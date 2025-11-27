import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import TopologyMap from './components/features/TopologyMap';
import InspectorPanel from './components/features/InspectorPanel';
import Terminal from './components/features/Terminal';
import HostView from './components/features/HostView';
import { MOCK_IMAGES } from './data/mockData';
import { generateId } from './utils/helpers';

const App = () => {
  // --- État Global ---
  const [mode, setMode] = useState('beginner'); // 'beginner' | 'expert'
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'containers', 'images', 'networks'
  const [selectedItem, setSelectedItem] = useState(null); // ID de l'élément inspecté
  const [showInspector, setShowInspector] = useState(true);

  // Données Docker
  const [containers, setContainers] = useState([]);
  const [networks, setNetworks] = useState([
    { id: 'net1', name: 'bridge', driver: 'bridge', scope: 'local', subnet: '172.17.0.0/16' },
    { id: 'net2', name: 'host', driver: 'host', scope: 'local', subnet: 'N/A' }
  ]);
  const [images, setImages] = useState(MOCK_IMAGES);
  const [timeline, setTimeline] = useState([]); // Historique des événements

  // Host Info State
  const [hostInfo, setHostInfo] = useState({
    clientVersion: '24.0.5',
    serverVersion: '24.0.5',
    api: '1.43',
    goVersion: 'go1.20.6',
    os: 'Docker Desktop',
    arch: 'amd64',
    storageDriver: 'overlay2',
    rootDir: '/var/lib/docker',
    networkDrivers: ['bridge', 'host', 'ipvlan', 'macvlan', 'null', 'overlay'],
    cpus: 4,
    memory: '7.65 GiB',
    kernel: '5.15.90.1-microsoft-standard-WSL2',
    daemonOptions: {
      debug: false,
      experimental: false,
      logDriver: 'json-file',
      cgroupDriver: 'cgroupfs',
      liveRestore: true,
      hosts: ['unix:///var/run/docker.sock']
    },
    security: {
      appArmor: 'enabled',
      seLinux: 'disabled',
      rootless: false
    }
  });

  const handlePrune = () => {
    // Remove stopped containers
    const stoppedContainers = containers.filter(c => c.status !== 'running');
    const runningContainers = containers.filter(c => c.status === 'running');

    if (stoppedContainers.length > 0) {
      setContainers(runningContainers);
      addTimelineEvent('delete', `Pruned ${stoppedContainers.length} stopped containers`);
    }

    // Remove unused images (mock logic: remove images not used by running containers)
    // For simplicity in this mock, we just say we pruned images without actually removing them from MOCK_IMAGES unless we track usage
    addTimelineEvent('delete', 'Pruned dangling images and build cache');

    setHistory(prev => [...prev, { type: 'info', content: 'Deleted: 0B' }]); // Mock output
  };

  const handleSecurityCheck = () => {
    addTimelineEvent('info', 'Security audit started...');
    setTimeout(() => {
      addTimelineEvent('success', 'Security audit completed: No critical issues found.');
      setHistory(prev => [...prev,
      { type: 'info', content: 'Security Check Results:' },
      { type: 'info', content: '[PASS] AppArmor enabled' },
      { type: 'info', content: '[WARN] Rootless mode disabled' },
      { type: 'info', content: '[PASS] No insecure registries' }
      ]);
    }, 1000);
  };

  // État Terminal
  const [history, setHistory] = useState([
    { type: 'info', content: 'Docker Engine v20.10.17 initialized...' },
    { type: 'info', content: 'Mode interactif activé.' }
  ]);
  // inputCmd moved to Terminal component

  // État Scénario
  const [activeScenario, setActiveScenario] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // --- Moteur de Simulation (Effets) ---

  // Simulation des ressources en temps réel
  // Simulation des ressources en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      // Update Container Stats
      setContainers(prev => prev.map(c => {
        if (c.status !== 'running') return c;
        // Simuler des variations CPU/RAM
        const newCpu = Math.max(0, Math.min(100, c.stats.cpu + (Math.random() * 10 - 5)));
        const newMem = Math.max(0, Math.min(512, c.stats.mem + (Math.random() * 20 - 10)));

        // Garder un historique pour les graphiques
        const historyLength = 20;
        const cpuHistory = [...c.stats.cpuHistory.slice(-historyLength), newCpu];
        const memHistory = [...c.stats.memHistory.slice(-historyLength), newMem];

        return {
          ...c,
          stats: { cpu: newCpu, mem: newMem, cpuHistory, memHistory }
        };
      }));

      // Update Host Stats
      setHostInfo(prev => ({
        ...prev,
        cpuLoad: Math.max(0, Math.min(100, (prev.cpuLoad || 10) + (Math.random() * 5 - 2.5))),
        memLoad: Math.max(0, Math.min(100, (prev.memLoad || 40) + (Math.random() * 5 - 2.5)))
      }));

    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- Logique Métier (Actions Docker) ---

  const addTimelineEvent = (type, message) => {
    const time = new Date().toLocaleTimeString();
    setTimeline(prev => [{ time, type, message }, ...prev].slice(0, 50));
  };

  const executeCommand = (cmdStr, fromUI = false) => {
    if (!cmdStr || !cmdStr.trim()) return;

    // Si la commande vient de l'interface, on l'affiche aussi dans le terminal pour l'éducation
    const newHistory = [...history, { type: 'cmd', content: cmdStr }];

    const args = cmdStr.trim().split(/\s+/);
    const command = args[0];

    // Parser basique
    if (command === 'docker') {
      const action = args[1];

      // RUN
      if (action === 'run') {
        const imgName = args.find(arg => !arg.startsWith('-') && arg !== 'docker' && arg !== 'run' && arg !== '-d');
        const nameArg = args.indexOf('--name');
        const netArg = args.indexOf('--net') !== -1 ? args.indexOf('--net') : args.indexOf('--network');

        const containerName = nameArg !== -1 ? args[nameArg + 1] : `${imgName}_${generateId()}`;
        const networkName = netArg !== -1 ? args[netArg + 1] : 'bridge';

        // Vérification image
        let image = images.find(i => i.repository === imgName);
        if (!image) {
          newHistory.push({ type: 'info', content: `Unable to find image '${imgName}:latest' locally` });
          newHistory.push({ type: 'info', content: `Pulling from library/${imgName}...` });
          image = { id: generateId(), repository: imgName, tag: 'latest', size: 'Unkown', layers: 3 };
          setImages(prev => [...prev, image]);
        }

        const newContainer = {
          id: generateId(),
          name: containerName,
          image: image.repository,
          status: 'running',
          network: networkName,
          created: new Date(),
          stats: { cpu: 0, mem: 0, cpuHistory: new Array(20).fill(0), memHistory: new Array(20).fill(0) },
          env: ['PATH=/usr/local/sbin:/usr/local/bin', 'LANG=C.UTF-8'],
          logs: [`[entrypoint] Starting ${imgName}...`, `[info] Server listening on port 80`]
        };

        setContainers(prev => [...prev, newContainer]);
        addTimelineEvent('create', `Conteneur ${containerName} créé`);
        newHistory.push({ type: 'output', content: newContainer.id });

        // Check scenario progress
        if (activeScenario && activeScenario.steps[currentStepIndex].cmd.includes('run')) {
          setCurrentStepIndex(prev => prev + 1);
        }
      }
      // STOP
      else if (action === 'stop') {
        const target = args[2];
        const container = containers.find(c => c.id.startsWith(target) || c.name === target);
        if (container) {
          setContainers(prev => prev.map(c => c.id === container.id ? { ...c, status: 'exited', stats: { ...c.stats, cpu: 0, mem: 0 } } : c));
          addTimelineEvent('status', `Conteneur ${container.name} arrêté`);
          newHistory.push({ type: 'output', content: container.name });

          // Check scenario
          if (activeScenario && activeScenario.steps[currentStepIndex]?.cmd.includes('stop')) {
            setCurrentStepIndex(prev => prev + 1);
          }
        } else {
          newHistory.push({ type: 'error', content: `Error: No such container: ${target}` });
        }
      }
      // START
      else if (action === 'start') {
        const target = args[2];
        const container = containers.find(c => c.id.startsWith(target) || c.name === target);
        if (container) {
          setContainers(prev => prev.map(c => c.id === container.id ? { ...c, status: 'running' } : c));
          addTimelineEvent('status', `Conteneur ${container.name} démarré`);
          newHistory.push({ type: 'output', content: container.name });
        }
      }
      // RM
      else if (action === 'rm') {
        const target = args[2];
        const container = containers.find(c => c.id.startsWith(target) || c.name === target);
        if (container) {
          if (container.status === 'running' && !args.includes('-f')) {
            newHistory.push({ type: 'error', content: `Error: Stop the container before removal or force with -f` });
          } else {
            setContainers(prev => prev.filter(c => c.id !== container.id));
            addTimelineEvent('delete', `Conteneur ${container.name} supprimé`);
            if (selectedItem === container.id) setSelectedItem(null);
            newHistory.push({ type: 'output', content: container.name });
          }
        }
      }
      // NETWORK CREATE
      else if (action === 'network' && args[2] === 'create') {
        const netName = args[3];
        setNetworks(prev => [...prev, { id: generateId(), name: netName, driver: 'bridge', scope: 'local', subnet: `172.${18 + networks.length}.0.0/16` }]);
        addTimelineEvent('network', `Réseau ${netName} créé`);
        newHistory.push({ type: 'output', content: generateId() });

        if (activeScenario && activeScenario.steps[currentStepIndex]?.cmd.includes('network create')) {
          setCurrentStepIndex(prev => prev + 1);
        }
      }
      // PS, IMAGES, ETC
      else if (action === 'ps') {
        // Simulation output handled in renderer mostly, here just log
        newHistory.push({ type: 'output', content: 'CONTAINER ID   IMAGE     STATUS    NAMES' });
        containers.filter(c => c.status === 'running' || args.includes('-a')).forEach(c => {
          newHistory.push({ type: 'output', content: `${c.id.substr(0, 8)}       ${c.image}     ${c.status}   ${c.name}` });
        });

        if (activeScenario && activeScenario.steps[currentStepIndex]?.cmd.includes('ps')) {
          setCurrentStepIndex(prev => prev + 1);
        }
      }
      else {
        newHistory.push({ type: 'error', content: `Commande non reconnue ou non implémentée dans cette démo.` });
      }
    } else if (command === 'clear') {
      setHistory([]);
      return;
    } else {
      newHistory.push({ type: 'error', content: `Commande inconnue: ${command}` });
    }

    setHistory(newHistory);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-gray-100 font-sans overflow-hidden selection:bg-blue-500/30">

      {/* 1. Header Global */}
      <Header mode={mode} setMode={setMode} />

      <div className="flex-1 flex overflow-hidden">

        {/* 2. Colonne Gauche : Navigation & Scénarios */}
        <Sidebar
          mode={mode}
          activeView={activeView}
          setActiveView={setActiveView}
          containers={containers}
          images={images}
          networks={networks}
          activeScenario={activeScenario}
          setActiveScenario={setActiveScenario}
          currentStepIndex={currentStepIndex}
          setCurrentStepIndex={setCurrentStepIndex}
          executeCommand={executeCommand}
          timeline={timeline}
        />

        {/* 3. Zone Centrale : Visualisation Graphique */}
        <div className="flex-1 flex flex-col relative bg-slate-950">
          {activeView === 'host' ? (
            <div className="flex-1 relative overflow-hidden">
              <HostView
                hostInfo={hostInfo}
                onPrune={handlePrune}
                onSecurityCheck={handleSecurityCheck}
              />
            </div>
          ) : (
            <>
              {/* Toolbar du haut de la carte */}
              <div className="h-10 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="font-bold text-slate-200">Vue Topologique</span>
                  <span className="bg-slate-800 px-1.5 rounded text-[10px]">Live</span>
                </div>
                <div className="flex gap-2">
                  {['2D Map', 'List', 'YAML'].map(view => (
                    <button key={view} className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors">
                      {view}
                    </button>
                  ))}
                </div>
              </div>

              {/* La Carte Interactive */}
              <div className="flex-1 relative overflow-hidden">
                <TopologyMap
                  networks={networks}
                  containers={containers}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  setShowInspector={setShowInspector}
                  mode={mode}
                />
              </div>
            </>
          )}

          {/* 4. Zone Basse : Console / Terminal */}
          <Terminal
            history={history}
            onExecute={executeCommand}
            onClear={() => setHistory([])}
            mode={mode}
          />
        </div>

        {/* 5. Colonne Droite : Inspecteur */}
        {showInspector && (
          <aside className="w-80 bg-slate-900 border-l border-slate-800 shrink-0 transition-all duration-300 shadow-xl z-20">
            <InspectorPanel
              selectedItem={selectedItem}
              containers={containers}
              setShowInspector={setShowInspector}
              executeCommand={executeCommand}
            />
          </aside>
        )}

      </div>
    </div>
  );
};

export default App;
