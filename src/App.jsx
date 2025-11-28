import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import TopologyMap from './components/features/TopologyMap';
import InspectorPanel from './components/features/InspectorPanel';
import Terminal from './components/features/Terminal';
import CreateContainerModal from './components/features/CreateContainerModal';
import HostView from './components/features/HostView';
import ContainersView from './components/features/ContainersView';
import ImagesView from './components/features/ImagesView';
import NetworksView from './components/features/NetworksView';
import VolumesView from './components/features/VolumesView';
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
      setHistory(prev => [...prev,
      { type: 'info', content: `Deleted Containers: ${stoppedContainers.length}` }
      ]);
    } else {
      setHistory(prev => [...prev, { type: 'info', content: 'Total reclaimed space: 0B' }]);
    }

    // Remove unused images (mock logic: remove images not used by running containers)
    addTimelineEvent('delete', 'Pruned dangling images and build cache');
  };

  const handleSecurityCheck = () => {
    addTimelineEvent('info', 'Security audit started...');
    setHistory(prev => [...prev,
    { type: 'info', content: '🔒 Running security audit...' }
    ]);

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

  // --- Image Management Handlers ---

  const handlePullImage = (repoTag) => {
    if (!repoTag) return;
    const [repo, tag = 'latest'] = repoTag.split(':');

    addTimelineEvent('info', `Pulling ${repo}:${tag}...`);
    setHistory(prev => [...prev, { type: 'info', content: `Pulling from library/${repo}...` }]);

    setTimeout(() => {
      // Check if already exists
      const exists = images.find(i => i.repository === repo && i.tag === tag);
      if (exists) {
        setHistory(prev => [...prev, { type: 'info', content: `Image ${repo}:${tag} is up to date` }]);
        return;
      }

      const newImage = {
        id: generateId(),
        repository: repo,
        tag: tag,
        size: `${Math.floor(Math.random() * 500) + 20}MB`,
        layers: Array(5).fill(0).map((_, i) => ({ id: generateId(), size: '10MB', cmd: `Layer ${i + 1} instruction` })),
        config: {
          env: ['PATH=/usr/local/sbin:/usr/local/bin'],
          cmd: ['/bin/sh'],
          entrypoint: null,
          exposedPorts: {},
          volumes: {}
        },
        created: new Date().toISOString(),
        protected: false
      };

      setImages(prev => [...prev, newImage]);
      addTimelineEvent('create', `Image ${repo}:${tag} downloaded`);
      setHistory(prev => [...prev, { type: 'success', content: `Status: Downloaded newer image for ${repo}:${tag}` }]);
    }, 1500);
  };

  const handlePushImage = (imageId) => {
    const img = images.find(i => i.id === imageId);
    if (!img) return;

    addTimelineEvent('info', `Pushing ${img.repository}:${img.tag}...`);
    setHistory(prev => [...prev, { type: 'info', content: `The push refers to repository [docker.io/library/${img.repository}]` }]);

    setTimeout(() => {
      addTimelineEvent('success', `Image ${img.repository}:${img.tag} pushed`);
      setHistory(prev => [...prev, { type: 'success', content: `${img.tag}: digest: sha256:${generateId()} size: ${img.size}` }]);
    }, 1500);
  };

  const handleTagImage = (imageId, newRepoTag) => {
    const img = images.find(i => i.id === imageId);
    if (!img || !newRepoTag) return;

    const [newRepo, newTag = 'latest'] = newRepoTag.split(':');

    // In Docker, tagging creates an alias (same ID). For this mock, we'll just duplicate the object with same ID but different repo/tag in the view, 
    // OR we can create a new entry with same ID. 
    // Let's create a new entry with a NEW ID for simplicity in React keys, but logically it should be same ID.
    // To avoid key conflicts, we'll generate a new ID but link them in spirit.

    const newImage = { ...img, id: generateId(), repository: newRepo, tag: newTag };
    setImages(prev => [...prev, newImage]);
    addTimelineEvent('info', `Tagged ${img.repository}:${img.tag} as ${newRepo}:${newTag}`);
  };

  const handleRemoveImage = (imageId) => {
    const img = images.find(i => i.id === imageId);
    if (!img) return;

    if (img.protected) {
      setHistory(prev => [...prev, { type: 'error', content: `Error: Image ${img.repository}:${img.tag} is protected.` }]);
      return;
    }

    // Check if used by running containers
    const isUsed = containers.some(c => c.image === img.repository); // Simplified check
    if (isUsed) {
      setHistory(prev => [...prev, { type: 'error', content: `Error: conflict: unable to delete ${img.id} (cannot be forced) - image is being used by running container` }]);
      return;
    }

    setImages(prev => prev.filter(i => i.id !== imageId));
    addTimelineEvent('delete', `Image ${img.repository}:${img.tag} deleted`);
    setHistory(prev => [...prev, { type: 'output', content: `Deleted: ${img.id}` }]);
  };

  const handleToggleProtection = (imageId) => {
    setImages(prev => prev.map(img =>
      img.id === imageId ? { ...img, protected: !img.protected } : img
    ));
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

  // --- Container Management Handlers ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateContainer = (formData) => {
    const image = images.find(i => i.repository === formData.image) || images[0];
    const newContainer = {
      id: generateId(),
      name: formData.name || `${formData.image}_${generateId().substr(0, 6)}`,
      image: formData.image,
      status: 'created',
      network: formData.network,
      created: new Date(),
      stats: { cpu: 0, mem: 0, cpuHistory: new Array(20).fill(0), memHistory: new Array(20).fill(0) },
      env: formData.env.filter(e => e.key).map(e => `${e.key}=${e.value}`),
      ports: formData.ports.filter(p => p.host).map(p => `${p.host}:${p.container}`),
      restartPolicy: formData.restartPolicy,
      logs: [`[entrypoint] Container created from ${formData.image}`]
    };

    setContainers(prev => [...prev, newContainer]);
    addTimelineEvent('create', `Container ${newContainer.name} created`);
    setHistory(prev => [...prev, { type: 'success', content: `Container ${newContainer.id} created` }]);
  };

  const handlePauseContainer = (id) => {
    setContainers(prev => prev.map(c => c.id === id ? { ...c, status: 'paused' } : c));
    addTimelineEvent('status', `Container ${id} paused`);
  };

  const handleUnpauseContainer = (id) => {
    setContainers(prev => prev.map(c => c.id === id ? { ...c, status: 'running' } : c));
    addTimelineEvent('status', `Container ${id} unpaused`);
  };

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
        } else {
          newHistory.push({ type: 'error', content: `Error: No such container: ${target}` });
        }
      }
      // PAUSE
      else if (action === 'pause') {
        const target = args[2];
        const container = containers.find(c => c.id.startsWith(target) || c.name === target);
        if (container) {
          handlePauseContainer(container.id);
          newHistory.push({ type: 'output', content: container.name });
        }
      }
      // UNPAUSE
      else if (action === 'unpause') {
        const target = args[2];
        const container = containers.find(c => c.id.startsWith(target) || c.name === target);
        if (container) {
          handleUnpauseContainer(container.id);
          newHistory.push({ type: 'output', content: container.name });
        }
      }
      // RESTART
      else if (action === 'restart') {
        const target = args[2];
        const container = containers.find(c => c.id.startsWith(target) || c.name === target);
        if (container) {
          addTimelineEvent('status', `Conteneur ${container.name} redémarré`);
          newHistory.push({ type: 'output', content: container.name });
        } else {
          newHistory.push({ type: 'error', content: `Error: No such container: ${target}` });
        }
      }
      // LOGS
      else if (action === 'logs') {
        const target = args[2];
        const container = containers.find(c => c.id.startsWith(target) || c.name === target);
        if (container) {
          newHistory.push({ type: 'output', content: `=== Logs for ${container.name} ===` });
          container.logs.forEach(log => {
            newHistory.push({ type: 'output', content: log });
          });
        } else {
          newHistory.push({ type: 'error', content: `Error: No such container: ${target}` });
        }
      }
      // INSPECT
      else if (action === 'inspect') {
        const target = args[2];
        const container = containers.find(c => c.id.startsWith(target) || c.name === target);
        if (container) {
          const inspectData = JSON.stringify({
            Id: container.id,
            Name: container.name,
            Image: container.image,
            State: { Status: container.status, Running: container.status === 'running' },
            NetworkSettings: { Networks: { [container.network]: { IPAddress: `172.17.0.${containers.findIndex(c2 => c2.id === container.id) + 2}` } } }
          }, null, 2);
          newHistory.push({ type: 'output', content: inspectData });
        } else {
          newHistory.push({ type: 'error', content: `Error: No such container: ${target}` });
        }
      }
      // EXEC
      else if (action === 'exec') {
        const target = args.find(arg => !arg.startsWith('-') && arg !== 'docker' && arg !== 'exec');
        const container = containers.find(c => c.id.startsWith(target) || c.name === target);
        if (container) {
          if (container.status !== 'running') {
            newHistory.push({ type: 'error', content: `Error: Container ${target} is not running` });
          } else {
            const command = args.slice(args.indexOf(target) + 1).join(' ');
            newHistory.push({ type: 'info', content: `Executing in ${container.name}: ${command}` });
            newHistory.push({ type: 'output', content: '# (interactive shell session - type "exit" to return)' });
          }
        } else {
          newHistory.push({ type: 'error', content: `Error: No such container: ${target}` });
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
      // PS
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
      // IMAGES
      else if (action === 'images') {
        newHistory.push({ type: 'output', content: 'REPOSITORY     TAG       IMAGE ID      SIZE' });
        images.forEach(img => {
          newHistory.push({ type: 'output', content: `${img.repository.padEnd(14)} ${img.tag.padEnd(9)} ${img.id.substr(0, 12)} ${img.size}` });
        });
      }
      // NETWORK LS
      else if (action === 'network' && args[2] === 'ls') {
        newHistory.push({ type: 'output', content: 'NETWORK ID    NAME      DRIVER    SCOPE' });
        networks.forEach(net => {
          newHistory.push({ type: 'output', content: `${net.id.substr(0, 12)}  ${net.name.padEnd(9)} ${net.driver.padEnd(9)} ${net.scope}` });
        });
      }
      // NETWORK RM
      else if (action === 'network' && args[2] === 'rm') {
        const netId = args[3];
        const network = networks.find(n => n.id.startsWith(netId) || n.name === netId);
        if (network) {
          if (['bridge', 'host', 'none'].includes(network.name)) {
            newHistory.push({ type: 'error', content: `Error: Cannot remove system network ${network.name}` });
          } else {
            const connectedContainers = containers.filter(c => c.network === network.name);
            if (connectedContainers.length > 0) {
              newHistory.push({ type: 'error', content: `Error: network ${network.name} has active endpoints` });
            } else {
              setNetworks(prev => prev.filter(n => n.id !== network.id));
              addTimelineEvent('delete', `Réseau ${network.name} supprimé`);
              newHistory.push({ type: 'output', content: network.id });
            }
          }
        } else {
          newHistory.push({ type: 'error', content: `Error: No such network: ${netId}` });
        }
      }
      // RMI (remove image)
      else if (action === 'rmi') {
        const imgId = args[2];
        const image = images.find(i => i.id.startsWith(imgId) || i.repository === imgId);
        if (image) {
          const usingContainers = containers.filter(c => c.image === image.repository);
          if (usingContainers.length > 0) {
            newHistory.push({ type: 'error', content: `Error: image ${image.repository} is being used by containers` });
          } else {
            setImages(prev => prev.filter(i => i.id !== image.id));
            addTimelineEvent('delete', `Image ${image.repository} supprimée`);
            newHistory.push({ type: 'output', content: `Untagged: ${image.repository}:${image.tag}` });
            newHistory.push({ type: 'output', content: `Deleted: ${image.id}` });
          }
        } else {
          newHistory.push({ type: 'error', content: `Error: No such image: ${imgId}` });
        }
      }
      else {
        newHistory.push({ type: 'error', content: `Commande non reconnue ou non implémentée dans cette démo.` });
      }
    } else if (command === 'clear') {
      setHistory([]);
      return;
    } else if (command === 'help') {
      newHistory.push({ type: 'info', content: '=== Commandes disponibles ===' });
      newHistory.push({ type: 'info', content: 'Containers:' });
      newHistory.push({ type: 'info', content: '  docker run [--name <name>] [--net <network>] [-d] <image>' });
      newHistory.push({ type: 'info', content: '  docker ps [-a]' });
      newHistory.push({ type: 'info', content: '  docker stop <container>' });
      newHistory.push({ type: 'info', content: '  docker start <container>' });
      newHistory.push({ type: 'info', content: '  docker restart <container>' });
      newHistory.push({ type: 'info', content: '  docker rm [-f] <container>' });
      newHistory.push({ type: 'info', content: '  docker logs <container>' });
      newHistory.push({ type: 'info', content: '  docker inspect <container>' });
      newHistory.push({ type: 'info', content: '  docker exec [-it] <container> <command>' });
      newHistory.push({ type: 'info', content: 'Images:' });
      newHistory.push({ type: 'info', content: '  docker images' });
      newHistory.push({ type: 'info', content: '  docker rmi <image>' });
      newHistory.push({ type: 'info', content: 'Networks:' });
      newHistory.push({ type: 'info', content: '  docker network create <name>' });
      newHistory.push({ type: 'info', content: '  docker network ls' });
      newHistory.push({ type: 'info', content: '  docker network rm <network>' });
      newHistory.push({ type: 'info', content: 'Other:' });
      newHistory.push({ type: 'info', content: '  clear - Effacer le terminal' });
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
          ) : activeView === 'containers' ? (
            <div className="flex-1 relative overflow-hidden">
              <ContainersView
                containers={containers}
                setSelectedItem={setSelectedItem}
                setShowInspector={setShowInspector}
                executeCommand={executeCommand}
                onCreate={() => setIsCreateModalOpen(true)}
              />
            </div>
          ) : activeView === 'images' ? (
            <div className="flex-1 relative overflow-hidden">
              <ImagesView
                images={images}
                executeCommand={executeCommand}
                onPull={handlePullImage}
                onPush={handlePushImage}
                onTag={handleTagImage}
                onRemove={handleRemoveImage}
                onProtect={handleToggleProtection}
              />
            </div>
          ) : activeView === 'networks' ? (
            <div className="flex-1 relative overflow-hidden">
              <NetworksView
                networks={networks}
                containers={containers}
                executeCommand={executeCommand}
              />
            </div>
          ) : activeView === 'volumes' ? (
            <div className="flex-1 relative overflow-hidden">
              <VolumesView />
            </div>
          ) : (
            <>
              {/* Toolbar du haut de la carte */}
              <div className="h-10 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="font-bold text-slate-200">Vue Topologique</span>
                  <span className="bg-slate-800 px-1.5 rounded text-[10px]">Live</span>
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

      {/* Modals */}
      <CreateContainerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        images={images}
        networks={networks}
        onCreate={handleCreateContainer}
      />
    </div>
  );
};

export default App;
