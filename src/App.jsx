import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import TopologyMap from './components/features/TopologyMap';
import InspectorPanel from './components/features/InspectorPanel';
import Terminal from './components/features/Terminal';
import CreateContainerModal from './components/features/CreateContainerModal';
import CreateNetworkModal from './components/features/CreateNetworkModal';
import CreateVolumeModal from './components/features/CreateVolumeModal';
import HostView from './components/features/HostView';
import ContainersView from './components/features/ContainersView';
import ImagesView from './components/features/ImagesView';
import NetworksView from './components/features/NetworksView';
import VolumesView from './components/features/VolumesView';
import MonitoringView from './components/features/MonitoringView';
import StacksView from './components/features/StacksView';
import ScenariosView from './components/features/ScenariosView';
import LandingPage from './components/layout/LandingPage';
import OnboardingTour from './components/common/OnboardingTour';
import ContextualHelp from './components/common/ContextualHelp';
import { ToastContainer } from './components/common/Toast';
import { LanguageProvider } from './context/LanguageContext';
import { useToast } from './hooks/useToast';
import { MOCK_IMAGES } from './data/mockData';
import { SCENARIOS } from './data/scenarios';
import { generateId } from './utils/helpers';
import { parseComposeFile } from './utils/yamlParser';
import { createFileSystem, fsLs, fsCd, fsTouch, fsMkdir, fsCat, fsPwd } from './utils/fileSystem';

const AppContent = () => {
  // --- État Global ---
  const [showLanding, setShowLanding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mode, setMode] = useState('beginner'); // 'beginner' | 'expert'
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'containers', 'images', 'networks', 'monitoring', 'stacks', 'scenarios'
  const [selectedItem, setSelectedItem] = useState(null); // ID de l'élément inspecté
  const [showInspector, setShowInspector] = useState(true);

  // Hook pour les notifications toast
  const { toasts, removeToast, showSuccess } = useToast();

  // Vérifier si l'utilisateur a déjà vu l'onboarding
  useEffect(() => {
    if (!showLanding) {
      const hasSeenOnboarding = localStorage.getItem('onboarding-completed');
      if (!hasSeenOnboarding) {
        setTimeout(() => setShowOnboarding(true), 500);
      }
    }
  }, [showLanding]);

  // Données Docker
  const [containers, setContainers] = useState([]);
  const [networks, setNetworks] = useState([
    { id: 'net1', name: 'bridge', driver: 'bridge', scope: 'local', subnet: '172.17.0.0/16', gateway: '172.17.0.1' },
    { id: 'net2', name: 'host', driver: 'host', scope: 'local', subnet: 'N/A', gateway: '' }
  ]);
  const [volumes, setVolumes] = useState([
    { id: generateId(), name: 'my-data', driver: 'local', mountpoint: '/var/lib/docker/volumes/my-data/_data', created: new Date().toISOString(), labels: [], size: '0B' }
  ]);
  const [images, setImages] = useState(MOCK_IMAGES);
  const [stacks, setStacks] = useState([
    {
      id: 'stack1',
      name: 'web-stack',
      status: 'inactive',
      fileContent: `version: "3.8"\n\nservices:\n  web:\n    image: nginx:latest\n    ports:\n      - "8080:80"\n  redis:\n    image: redis:alpine`
    }
  ]);
  const [timeline, setTimeline] = useState([]); // Historique des événements
  const [securityReport, setSecurityReport] = useState(null); // Rapport d'audit

  // ... (Host Info State omitted for brevity, keep existing)

  // ... (Existing handlers: handlePrune, handleSecurityCheck, Image handlers)

  // --- Stack Management Handlers ---
  const handleDeployStack = (stackId) => {
    const stack = stacks.find(s => s.id === stackId);
    if (!stack) return;

    addTimelineEvent('info', `Deploying stack ${stack.name}...`);
    setHistory(prev => [...prev, { type: 'info', content: `Deploying stack ${stack.name}...` }]);

    const parsed = parseComposeFile(stack.fileContent);
    if (!parsed) {
      setHistory(prev => [...prev, { type: 'error', content: `Failed to parse docker-compose.yml for ${stack.name}` }]);
      return;
    }

    // Create resources
    const newContainers = [];
    Object.values(parsed.services).forEach(service => {
      const containerName = `${stack.name}_${service.name}_1`;
      const newContainer = {
        id: generateId(),
        name: containerName,
        image: service.image || 'ubuntu:latest',
        status: 'running',
        networks: service.networks?.length ? service.networks : ['bridge'],
        created: new Date(),
        stats: { cpu: 0, mem: 0, cpuHistory: new Array(20).fill(0), memHistory: new Array(20).fill(0) },
        health: { status: 'healthy', lastCheck: new Date() },
        env: service.environment || [],
        ports: service.ports || [],
        mounts: service.volumes?.map(v => ({ source: v.split(':')[0], target: v.split(':')[1] })) || [],
        restartPolicy: service.restart || 'no',
        restartCount: 0,
        logs: [`[entrypoint] Container ${containerName} started`]
      };
      newContainers.push(newContainer);
    });

    setTimeout(() => {
      setContainers(prev => [...prev, ...newContainers]);
      setStacks(prev => prev.map(s => s.id === stackId ? { ...s, status: 'active', services: parsed.services } : s));
      addTimelineEvent('success', `Stack ${stack.name} deployed successfully`);
      setHistory(prev => [...prev, { type: 'success', content: `Stack ${stack.name} deployed with ${newContainers.length} services` }]);
    }, 1500);
  };

  const handleStopStack = (stackId) => {
    const stack = stacks.find(s => s.id === stackId);
    if (!stack) return;

    addTimelineEvent('info', `Stopping stack ${stack.name}...`);

    setTimeout(() => {
      setContainers(prev => prev.filter(c => !c.name.startsWith(`${stack.name}_`))); // Remove them for "Stop" in this mock, or just stop them? 
      // "Stop" usually means stop but keep. "Down" means remove. Let's assume "Stop" just stops them.
      // But for simplicity in this mock, let's treat "Stop" button as "Down" (remove containers) or update status to 'exited'.
      // Let's update status to 'exited'.
      setContainers(prev => prev.map(c => c.name.startsWith(`${stack.name}_`) ? { ...c, status: 'exited' } : c));

      setStacks(prev => prev.map(s => s.id === stackId ? { ...s, status: 'inactive' } : s));
      addTimelineEvent('info', `Stack ${stack.name} stopped`);
    }, 1000);
  };

  const handleRemoveStack = (stackId) => {
    const stack = stacks.find(s => s.id === stackId);
    if (!stack) return;

    // Remove containers
    setContainers(prev => prev.filter(c => !c.name.startsWith(`${stack.name}_`)));
    setStacks(prev => prev.filter(s => s.id !== stackId));
    addTimelineEvent('delete', `Stack ${stack.name} removed`);
  };

  const handleCreateStack = () => {
    const newStack = {
      id: generateId(),
      name: `stack-${stacks.length + 1}`,
      status: 'inactive',
      fileContent: 'version: "3.8"\n\nservices:\n  app:\n    image: nginx:alpine'
    };
    setStacks(prev => [...prev, newStack]);
  };

  // ... (Rest of component)

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
      rootless: false,
      apiExposed: false // Mock API exposure
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

    // Prune volumes
    handlePruneVolumes();
  };

  const handleSecurityAudit = () => {
    addTimelineEvent('info', 'Running comprehensive security audit...');
    setHistory(prev => [...prev, { type: 'info', content: '🔒 Starting Security Audit...' }]);

    setTimeout(() => {
      const findings = [];

      // 1. Host Checks
      if (hostInfo.security.rootless === false) {
        findings.push({
          id: 'host-rootless',
          level: 'medium',
          category: 'Host',
          title: 'Docker Daemon running as Root',
          description: 'The Docker daemon is running with root privileges. If compromised, it can give full access to the host.',
          fix: 'Consider running Docker in Rootless mode to mitigate privilege escalation risks.'
        });
      }
      if (hostInfo.security.apiExposed) {
        findings.push({
          id: 'host-api',
          level: 'high',
          category: 'Host',
          title: 'Docker API Exposed',
          description: 'The Docker API port (2375/2376) appears to be exposed without TLS.',
          fix: 'Secure the API with TLS or bind it only to localhost.'
        });
      }

      // 2. Container Checks
      containers.forEach(c => {
        // Check for Root User
        if (c.security?.user === 'root' || !c.security?.user) {
          findings.push({
            id: `cont-root-${c.id}`,
            level: 'high',
            category: 'Container',
            target: c.name,
            title: 'Running as Root',
            description: `Container ${c.name} is running as root user (UID 0).`,
            fix: 'Add `USER <uid>` instruction in Dockerfile to run as non-privileged user.'
          });
        }

        // Check for Privileged Mode
        if (c.security?.privileged) {
          findings.push({
            id: `cont-priv-${c.id}`,
            level: 'critical',
            category: 'Container',
            target: c.name,
            title: 'Privileged Mode Enabled',
            description: `Container ${c.name} is running in privileged mode, giving it full access to host devices.`,
            fix: 'Avoid `--privileged`. Use `--cap-add` to grant only necessary capabilities.'
          });
        }

        // Check for Sensitive Mounts
        const sensitivePaths = ['/var/run/docker.sock', '/', '/etc'];
        c.mounts?.forEach(m => {
          if (sensitivePaths.some(p => m.source.startsWith(p))) {
            findings.push({
              id: `cont-mount-${c.id}-${m.source}`,
              level: 'high',
              category: 'Container',
              target: c.name,
              title: 'Sensitive Host Mount',
              description: `Container mounts sensitive host path: ${m.source}`,
              fix: 'Avoid mounting host system directories. Use named volumes or specific data directories.'
            });
          }
        });

        // Check for Resource Limits (Mock check)
        if (!c.stats.limitCpu && !c.stats.limitMem) {
          findings.push({
            id: `cont-limits-${c.id}`,
            level: 'low',
            category: 'Container',
            target: c.name,
            title: 'No Resource Limits',
            description: `Container ${c.name} has no CPU or Memory limits defined.`,
            fix: 'Set `--memory` and `--cpus` limits to prevent DoS.'
          });
        }
      });

      setSecurityReport({
        date: new Date().toISOString(),
        score: Math.max(0, 100 - (findings.length * 10)),
        findings
      });

      addTimelineEvent('success', `Security audit completed. Found ${findings.length} issues.`);
      setHistory(prev => [...prev,
      { type: 'success', content: `Audit Complete. Score: ${Math.max(0, 100 - (findings.length * 10))}/100` },
      { type: 'info', content: `Found ${findings.length} issues. Check Security tab for details.` }
      ]);
    }, 1500);
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
  const [history, setHistory] = useState([]);
  const [terminalContext, setTerminalContext] = useState({ type: 'host' }); // { type: 'host' } | { type: 'container', containerId: '...', cwd: '/' }
  // inputCmd moved to Terminal component

  // État Scénario
  const [activeScenario, setActiveScenario] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [validationState, setValidationState] = useState(false);

  // Scenario Logic
  const handleStartScenario = (scenarioId) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (scenario) {
      setActiveScenario(scenario);
      setCurrentStepIndex(0);
      setValidationState(false);
    }
  };

  const handleNextStep = () => {
    if (activeScenario && currentStepIndex < activeScenario.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setValidationState(false);
    } else {
      // Finish
      addTimelineEvent('success', `Scenario "${activeScenario.title}" completed!`);
      setHistory(prev => [...prev, { type: 'success', content: `Scenario "${activeScenario.title}" completed!` }]);
      setActiveScenario(null);
      setCurrentStepIndex(0);
      setValidationState(false);
    }
  };

  // Scenario Validation Effect
  useEffect(() => {
    if (activeScenario) {
      const step = activeScenario.steps[currentStepIndex];
      if (step && step.validation) {
        const isValid = step.validation({ containers, networks, volumes, stacks });
        if (isValid !== validationState) {
          setValidationState(isValid);
        }
      }
    }
  }, [containers, networks, volumes, stacks, activeScenario, currentStepIndex, validationState]);

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

        // Simulate Health Check (randomly fail 5% of time if not already failing)
        let newHealth = { ...c.health };
        if (Math.random() > 0.98) {
          newHealth.status = newHealth.status === 'healthy' ? 'unhealthy' : 'healthy';
        }

        // Simulate Logs
        let newLogs = [...c.logs];
        if (Math.random() > 0.8) {
          const logMessages = [
            `[INFO] Request processed in ${Math.floor(Math.random() * 200)}ms`,
            `[INFO] Health check passed`,
            `[WARN] High memory usage detected`,
            `[ERROR] Connection timeout to database`,
            `[INFO] Worker started task #${Math.floor(Math.random() * 1000)}`
          ];
          newLogs.push(logMessages[Math.floor(Math.random() * logMessages.length)]);
          if (newLogs.length > 100) newLogs.shift(); // Keep last 100 logs
        }

        return {
          ...c,
          stats: { cpu: newCpu, mem: newMem, cpuHistory, memHistory },
          health: newHealth,
          logs: newLogs
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
  const [isCreateNetworkModalOpen, setIsCreateNetworkModalOpen] = useState(false);
  const [isCreateVolumeModalOpen, setIsCreateVolumeModalOpen] = useState(false);

  const handleCreateContainer = (formData) => {
    const image = images.find(i => i.repository === formData.image) || images[0];
    const newContainer = {
      id: generateId(),
      name: formData.name || `${formData.image}_${generateId().substr(0, 6)}`,
      image: formData.image,
      status: 'created',
      networks: [formData.network], // Changed to array
      created: new Date(),
      stats: { cpu: 0, mem: 0, cpuHistory: new Array(20).fill(0), memHistory: new Array(20).fill(0) },
      health: { status: 'healthy', lastCheck: new Date() },
      security: {
        user: 'root', // Default to root for demo purposes
        privileged: false,
        capabilities: ['CHOWN', 'DAC_OVERRIDE', 'FOWNER', 'MKNOD', 'NET_RAW', 'SETGID', 'SETUID', 'SETFCAP', 'SETPCAP', 'NET_BIND_SERVICE', 'SYS_CHROOT', 'KILL', 'AUDIT_WRITE'],
        readOnlyRootfs: false
      },
      env: formData.env.filter(e => e.key).map(e => `${e.key}=${e.value}`),
      ports: formData.ports.filter(p => p.host).map(p => `${p.host}:${p.container}`),
      mounts: formData.mounts || [], // Add mounts
      restartPolicy: formData.restartPolicy,
      restartCount: 0,
      logs: [`[entrypoint] Container created from ${formData.image}`],
      fileSystem: createFileSystem(formData.image)
    };

    setContainers(prev => [...prev, newContainer]);
    addTimelineEvent('create', `Container ${newContainer.name} created`);
    setHistory(prev => [...prev, { type: 'success', content: `Container ${newContainer.id} created` }]);
    showSuccess(`Conteneur ${newContainer.name} créé avec succès!`);
  };

  // --- Network Management Handlers ---
  const handleCreateNetwork = (formData) => {
    const newNetwork = {
      id: generateId(),
      name: formData.name,
      driver: formData.driver,
      scope: formData.scope,
      subnet: formData.subnet || `172.${18 + networks.length}.0.0/16`,
      gateway: formData.gateway || `172.${18 + networks.length}.0.1`,
      internal: formData.internal,
      attachable: formData.attachable
    };
    setNetworks(prev => [...prev, newNetwork]);
    addTimelineEvent('network', `Network ${newNetwork.name} created`);
    setHistory(prev => [...prev, { type: 'success', content: `Network ${newNetwork.id} created` }]);
  };

  const handleConnectNetwork = (containerId, networkName) => {
    setContainers(prev => prev.map(c => {
      if (c.id === containerId && !c.networks.includes(networkName)) {
        return { ...c, networks: [...c.networks, networkName] };
      }
      return c;
    }));
    addTimelineEvent('network', `Container connected to ${networkName}`);
  };

  const handleDisconnectNetwork = (containerId, networkName) => {
    setContainers(prev => prev.map(c => {
      if (c.id === containerId) {
        return { ...c, networks: c.networks.filter(n => n !== networkName) };
      }
      return c;
    }));
    addTimelineEvent('network', `Container disconnected from ${networkName}`);
  };

  // --- Volume Management Handlers ---
  const handleCreateVolume = (formData) => {
    const newVolume = {
      id: generateId(),
      name: formData.name,
      driver: formData.driver,
      mountpoint: `/var/lib/docker/volumes/${formData.name}/_data`,
      created: new Date().toISOString(),
      labels: formData.labels,
      size: '0B'
    };
    setVolumes(prev => [...prev, newVolume]);
    addTimelineEvent('volume', `Volume ${newVolume.name} created`);
    setHistory(prev => [...prev, { type: 'success', content: `Volume ${newVolume.name} created` }]);
  };

  const handleRemoveVolume = (volumeName) => {
    const vol = volumes.find(v => v.name === volumeName || v.id === volumeName);
    if (!vol) return;

    // Check usage
    const isUsed = containers.some(c => c.mounts?.some(m => m.source === vol.name));
    if (isUsed) {
      setHistory(prev => [...prev, { type: 'error', content: `Error: volume ${vol.name} is in use` }]);
      return;
    }

    setVolumes(prev => prev.filter(v => v.id !== vol.id));
    addTimelineEvent('delete', `Volume ${vol.name} deleted`);
    setHistory(prev => [...prev, { type: 'output', content: vol.name }]);
  };

  const handlePruneVolumes = () => {
    const usedVolumeNames = new Set();
    containers.forEach(c => c.mounts?.forEach(m => usedVolumeNames.add(m.source)));

    const unusedVolumes = volumes.filter(v => !usedVolumeNames.has(v.name));
    if (unusedVolumes.length > 0) {
      setVolumes(prev => prev.filter(v => usedVolumeNames.has(v.name)));
      addTimelineEvent('delete', `Pruned ${unusedVolumes.length} volumes`);
      setHistory(prev => [...prev, { type: 'info', content: `Deleted Volumes: ${unusedVolumes.map(v => v.name).join(', ')}` }]);
    }
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

  const executeCommand = (cmdStr) => {
    if (!cmdStr || !cmdStr.trim()) return;

    // Si la commande vient de l'interface, on l'affiche aussi dans le terminal pour l'éducation
    const currentPrompt = terminalContext.type === 'container'
      ? `root@${terminalContext.containerId.substring(0, 12)}:${terminalContext.cwd}#`
      : '➜';
    const newHistory = [...history, { type: 'cmd', content: cmdStr, prompt: currentPrompt }];

    const args = cmdStr.trim().split(/\s+/);
    const command = args[0];

    // Parser basique

    // --- Context: Container ---
    if (terminalContext.type === 'container') {
      const container = containers.find(c => c.id === terminalContext.containerId);
      if (!container) {
        setTerminalContext({ type: 'host' });
        newHistory.push({ type: 'error', content: 'Container not found. Connection closed.' });
        setHistory(newHistory);
        return;
      }

      // Handle exit
      if (command === 'exit') {
        setTerminalContext({ type: 'host' });
        newHistory.push({ type: 'info', content: 'exit' });
        setHistory(newHistory);
        return;
      }

      // Handle File System Commands
      let output = '';
      let newFs = container.fileSystem || createFileSystem();
      let newCwd = terminalContext.cwd;
      let fsUpdated = false;

      if (command === 'ls') {
        const flags = args.filter(a => a.startsWith('-')).join('');
        output = fsLs(newFs, terminalContext.cwd, flags);
        newHistory.push({ type: 'output', content: output });
      } else if (command === 'pwd') {
        output = fsPwd(terminalContext.cwd);
        newHistory.push({ type: 'output', content: output });
      } else if (command === 'cd') {
        const target = args[1] || '~';
        const result = fsCd(newFs, terminalContext.cwd, target);
        if (result) {
          newCwd = result;
          setTerminalContext(prev => ({ ...prev, cwd: newCwd }));
        } else {
          newHistory.push({ type: 'error', content: `cd: ${target}: No such file or directory` });
        }
      } else if (command === 'touch') {
        const filename = args[1];
        if (filename) {
          newFs = fsTouch(newFs, terminalContext.cwd, filename);
          fsUpdated = true;
        } else {
          newHistory.push({ type: 'error', content: 'touch: missing file operand' });
        }
      } else if (command === 'mkdir') {
        const dirname = args[1];
        if (dirname) {
          newFs = fsMkdir(newFs, terminalContext.cwd, dirname);
          fsUpdated = true;
        } else {
          newHistory.push({ type: 'error', content: 'mkdir: missing operand' });
        }
      } else if (command === 'cat') {
        const filename = args[1];
        if (filename) {
          output = fsCat(newFs, terminalContext.cwd, filename);
          newHistory.push({ type: 'output', content: output });
        } else {
          newHistory.push({ type: 'error', content: 'cat: missing file operand' });
        }
      }
      // Specific Commands Handlers
      else if (command === 'nginx' && (newFs['/usr/bin'].children.includes('nginx') || container.image.includes('nginx'))) {
        if (args.includes('-v') || args.includes('-V')) {
          newHistory.push({ type: 'output', content: 'nginx version: nginx/1.21.6' });
        } else {
          newHistory.push({ type: 'output', content: 'nginx: [alert] could not open error log file: open() "/var/log/nginx/error.log" failed (13: Permission denied)' });
        }
      }
      else if (command === 'redis-cli' && (newFs['/usr/bin'].children.includes('redis-cli') || container.image.includes('redis'))) {
        if (args.includes('--version') || args.includes('-v')) {
          newHistory.push({ type: 'output', content: 'redis-cli 6.0.9' });
        } else {
          newHistory.push({ type: 'output', content: '127.0.0.1:6379> ping\nPONG\n127.0.0.1:6379> (interactive mode not fully simulated)' });
        }
      }
      else if (command === 'node' && (newFs['/usr/bin'].children.includes('node') || container.image.includes('node'))) {
        if (args.includes('-v') || args.includes('--version')) {
          newHistory.push({ type: 'output', content: 'v14.17.0' });
        } else {
          newHistory.push({ type: 'output', content: 'Welcome to Node.js v14.17.0.\nType ".help" for more information.\n> (interactive mode not fully simulated)' });
        }
      }
      else if (command === 'npm' && (newFs['/usr/bin'].children.includes('npm') || container.image.includes('node'))) {
        if (args.includes('-v') || args.includes('--version')) {
          newHistory.push({ type: 'output', content: '6.14.13' });
        } else {
          newHistory.push({ type: 'output', content: 'Usage: npm <command>\n\nwhere <command> is one of:\n    access, adduser, audit, bin, bugs, c, cache, ci, cit,\n    clean-install, clean-install-test, completion, config,\n    create, ddp, dedupe, deprecate, dist-tag, docs, doctor,\n    edit, explore, fund, get, help, help-search, hook,\n    i, init, install, install-ci-test, install-test, it,\n    link, list, ll, ln, login, logout, ls, org, outdated,\n    owner, pack, ping, prefix, profile, prune, publish,\n    r, rb, rebuild, repo, restart, root, run, run-script,\n    s, se, search, set, shrinkwrap, star, stars, start,\n    stop, t, team, test, token, tst, un, uninstall,\n    unpublish, unstar, up, update, v, version, view, whoami' });
        }
      }
      else if (command === 'psql' && (newFs['/usr/bin'].children.includes('psql') || container.image.includes('postgres'))) {
        if (args.includes('--version') || args.includes('-V')) {
          newHistory.push({ type: 'output', content: 'psql (PostgreSQL) 13.3' });
        } else {
          newHistory.push({ type: 'output', content: 'psql: error: could not connect to server: No such file or directory' });
        }
      }
      else if (command === 'python' && (newFs['/usr/bin'].children.includes('python') || container.image.includes('python'))) {
        if (args.includes('--version') || args.includes('-V')) {
          newHistory.push({ type: 'output', content: 'Python 3.9.5' });
        } else {
          newHistory.push({ type: 'output', content: 'Python 3.9.5 (default, May  4 2021, 03:33:11) \n[GCC 8.3.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>> (interactive mode not fully simulated)' });
        }
      }
      else {
        newHistory.push({ type: 'error', content: `/bin/sh: ${command}: command not found` });
      }

      if (fsUpdated) {
        setContainers(prev => prev.map(c => c.id === container.id ? { ...c, fileSystem: newFs } : c));
      }

      setHistory(newHistory);
      return;
    }

    // --- Context: Host ---
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
          networks: [networkName], // Changed to array
          created: new Date(),
          stats: { cpu: 0, mem: 0, cpuHistory: new Array(20).fill(0), memHistory: new Array(20).fill(0) },
          env: ['PATH=/usr/local/sbin:/usr/local/bin', 'LANG=C.UTF-8'],
          logs: [`[entrypoint] Starting ${imgName}...`, `[info] Server listening on port 80`]
        };

        setContainers(prev => [...prev, newContainer]);
        addTimelineEvent('create', `Conteneur ${containerName} créé`);
        newHistory.push({ type: 'output', content: newContainer.id });
        showSuccess(`✅ Conteneur ${containerName} créé et démarré`);

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
          const networkSettings = {};
          container.networks.forEach(net => {
            networkSettings[net] = { IPAddress: `172.17.0.${containers.findIndex(c2 => c2.id === container.id) + 2}` };
          });

          const inspectData = JSON.stringify({
            Id: container.id,
            Name: container.name,
            Image: container.image,
            State: { Status: container.status, Running: container.status === 'running' },
            NetworkSettings: { Networks: networkSettings }
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

            // Enter interactive mode if -it and bash/sh
            if (args.includes('-it') && (args.includes('bash') || args.includes('sh') || args.includes('/bin/bash') || args.includes('/bin/sh'))) {
              setTerminalContext({ type: 'container', containerId: container.id, cwd: '/' });
              // Initialize FS if needed
              if (!container.fileSystem) {
                setContainers(prev => prev.map(c => c.id === container.id ? { ...c, fileSystem: createFileSystem(container.image) } : c));
              }
              newHistory.push({ type: 'output', content: '' }); // Just a spacer
            } else {
              newHistory.push({ type: 'output', content: '# (interactive shell session - type "exit" to return)' });
            }
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
        handleCreateNetwork({ name: netName, driver: 'bridge', scope: 'local' });
        newHistory.push({ type: 'output', content: generateId() });

        if (activeScenario && activeScenario.steps[currentStepIndex]?.cmd.includes('network create')) {
          setCurrentStepIndex(prev => prev + 1);
        }
      }
      // NETWORK CONNECT
      else if (action === 'network' && args[2] === 'connect') {
        const netName = args[3];
        const containerName = args[4];
        const container = containers.find(c => c.name === containerName || c.id.startsWith(containerName));
        const network = networks.find(n => n.name === netName || n.id.startsWith(netName));

        if (!container) {
          newHistory.push({ type: 'error', content: `Error: No such container: ${containerName}` });
        } else if (!network) {
          newHistory.push({ type: 'error', content: `Error: No such network: ${netName}` });
        } else {
          handleConnectNetwork(container.id, network.name);
          newHistory.push({ type: 'output', content: '' }); // Success is silent usually
        }
      }
      // NETWORK DISCONNECT
      else if (action === 'network' && args[2] === 'disconnect') {
        const netName = args[3];
        const containerName = args[4];
        const container = containers.find(c => c.name === containerName || c.id.startsWith(containerName));

        if (!container) {
          newHistory.push({ type: 'error', content: `Error: No such container: ${containerName}` });
        } else {
          handleDisconnectNetwork(container.id, netName);
          newHistory.push({ type: 'output', content: '' });
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
            const connectedContainers = containers.filter(c => c.networks.includes(network.name));
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
      // VOLUME COMMANDS
      else if (action === 'volume') {
        const subCmd = args[2];

        if (subCmd === 'create') {
          const volName = args[3];
          handleCreateVolume({ name: volName, driver: 'local', labels: [] });
        }
        else if (subCmd === 'ls') {
          newHistory.push({ type: 'output', content: 'DRIVER    VOLUME NAME' });
          volumes.forEach(v => {
            newHistory.push({ type: 'output', content: `${v.driver.padEnd(9)} ${v.name}` });
          });
        }
        else if (subCmd === 'rm') {
          const volName = args[3];
          handleRemoveVolume(volName);
        }
        else if (subCmd === 'prune') {
          handlePruneVolumes();
          newHistory.push({ type: 'output', content: 'Deleted Volumes:' });
          // Note: The handler updates state, but we can't easily show the exact list here without refactoring.
          // For now, we rely on the timeline event.
        }
        else if (subCmd === 'inspect') {
          const volName = args[3];
          const vol = volumes.find(v => v.name === volName);
          if (vol) {
            newHistory.push({ type: 'output', content: JSON.stringify([vol], null, 2) });
          } else {
            newHistory.push({ type: 'error', content: `Error: No such volume: ${volName}` });
          }
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
      newHistory.push({ type: 'info', content: '  docker network connect <network> <container>' });
      newHistory.push({ type: 'info', content: '  docker network disconnect <network> <container>' });
      newHistory.push({ type: 'info', content: 'Volumes:' });
      newHistory.push({ type: 'info', content: '  docker volume create <name>' });
      newHistory.push({ type: 'info', content: '  clear - Effacer le terminal' });
    } else {
      newHistory.push({ type: 'error', content: `Commande inconnue: ${command}` });
    }

    setHistory(newHistory);
  };



  if (showLanding) {
    return <LandingPage onEnter={() => {
      window.scrollTo(0, 0);
      setShowLanding(false);
    }} />;
  }

  return (
    <div className="flex flex-col h-dvh bg-zinc-950 text-zinc-100 font-sans overflow-hidden selection:bg-blue-500/30 relative">
      {/* Onboarding Tour */}
      <OnboardingTour
        isActive={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
        onSkip={() => setShowOnboarding(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Aide Contextuelle */}
      <ContextualHelp activeView={activeView} mode={mode} />
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[128px] pointer-events-none"></div>

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
        <div className="flex-1 flex flex-col relative z-10">
          {activeView === 'host' ? (
            <div className="flex-1 relative overflow-hidden">
              <HostView
                hostInfo={hostInfo}
                onPrune={handlePrune}
                onSecurityCheck={handleSecurityAudit}
                securityReport={securityReport}
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
                onCreate={() => setIsCreateNetworkModalOpen(true)}
              />
            </div>
          ) : activeView === 'volumes' ? (
            <div className="flex-1 relative overflow-hidden">
              <VolumesView
                volumes={volumes}
                containers={containers}
                executeCommand={executeCommand}
                onCreate={() => setIsCreateVolumeModalOpen(true)}
              />
            </div>
          ) : activeView === 'monitoring' ? (
            <div className="flex-1 relative overflow-hidden">
              <MonitoringView
                containers={containers}
                timeline={timeline}
              />
            </div>
          ) : activeView === 'stacks' ? (
            <div className="flex-1 relative overflow-hidden">
              <StacksView
                stacks={stacks}
                onDeploy={handleDeployStack}
                onStop={handleStopStack}
                onRemove={handleRemoveStack}
                onCreate={handleCreateStack}
              />
            </div>
          ) : activeView === 'scenarios' ? (
            <div className="flex-1 relative overflow-hidden">
              <ScenariosView
                scenarios={SCENARIOS}
                activeScenario={activeScenario}
                onStartScenario={handleStartScenario}
                onNextStep={handleNextStep}
                currentStepIndex={currentStepIndex}
                validationState={validationState}
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
          )
          }

          {/* 4. Zone Basse : Console / Terminal */}
          <Terminal
            history={history}
            onExecute={executeCommand}
            onClear={() => setHistory([])}
            context={terminalContext}
            mode={mode}
          />
        </div >

        {/* 5. Colonne Droite : Inspecteur */}
        {
          showInspector && (
            <aside className="w-80 bg-slate-900 border-l border-slate-800 shrink-0 transition-all duration-300 shadow-xl z-20">
              <InspectorPanel
                selectedItem={selectedItem}
                containers={containers}
                volumes={volumes}
                setShowInspector={setShowInspector}
                executeCommand={executeCommand}
              />
            </aside>
          )
        }

      </div >

      {/* Modals */}
      < CreateContainerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        images={images}
        networks={networks}
        volumes={volumes}
        onCreate={handleCreateContainer}
      />
      <CreateNetworkModal
        isOpen={isCreateNetworkModalOpen}
        onClose={() => setIsCreateNetworkModalOpen(false)}
        onCreate={handleCreateNetwork}
      />
      <CreateVolumeModal
        isOpen={isCreateVolumeModalOpen}
        onClose={() => setIsCreateVolumeModalOpen(false)}
        onCreate={handleCreateVolume}
      />
    </div >
  );
};

const App = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;

