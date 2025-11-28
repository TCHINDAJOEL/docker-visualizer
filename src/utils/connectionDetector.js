/**
 * Détecte les connexions entre conteneurs basé sur plusieurs critères
 * Pour la mémoire visuelle - affiche les liens logiques
 */

export const detectConnections = (containers) => {
    const connections = [];

    containers.forEach((sourceContainer) => {
        if (sourceContainer.status !== 'running') return;

        containers.forEach((targetContainer) => {
            if (targetContainer.status !== 'running') return;
            if (sourceContainer.id === targetContainer.id) return;

            const connectionType = getConnectionType(sourceContainer, targetContainer);
            if (connectionType) {
                connections.push({
                    from: sourceContainer.id,
                    to: targetContainer.id,
                    type: connectionType.type,
                    label: connectionType.label,
                    color: connectionType.color
                });
            }
        });
    });

    return connections;
};

/**
 * Détermine le type de connexion entre deux conteneurs
 */
const getConnectionType = (source, target) => {
    // 1. Connexion explicite via variables d'environnement
    const envConnection = checkEnvConnection(source, target);
    if (envConnection) return envConnection;

    // 2. Connexion via patterns de noms (convention)
    const nameConnection = checkNamePattern(source, target);
    if (nameConnection) return nameConnection;

    // 3. Connexion sur le même réseau personnalisé
    const networkConnection = checkNetworkConnection(source, target);
    if (networkConnection) return networkConnection;

    return null;
};

/**
 * Vérifie les connexions via variables d'environnement
 */
const checkEnvConnection = (source, target) => {
    if (!source.env || !Array.isArray(source.env)) return null;

    const envString = source.env.join(' ').toLowerCase();

    // Patterns de connexion connus
    const patterns = [
        // Bases de données
        { match: 'postgres_host', type: 'db', label: 'PostgreSQL', color: '#336791' },
        { match: 'mysql_host', type: 'db', label: 'MySQL', color: '#4479A1' },
        { match: 'mongodb_host', type: 'db', label: 'MongoDB', color: '#47A248' },
        { match: 'redis_host', type: 'cache', label: 'Redis', color: '#DC382D' },
        { match: 'database_url', type: 'db', label: 'Database', color: '#336791' },

        // Message brokers
        { match: 'kafka_broker', type: 'events', label: 'Kafka', color: '#231F20' },
        { match: 'rabbitmq_host', type: 'queue', label: 'RabbitMQ', color: '#FF6600' },

        // Services
        { match: 'api_url', type: 'api', label: 'API', color: '#61DAFB' },
        { match: 'service_url', type: 'service', label: 'Service', color: '#4CAF50' },
        { match: 'master_host', type: 'replication', label: 'Replication', color: '#9C27B0' },
        { match: 'prometheus_url', type: 'metrics', label: 'Metrics', color: '#E6522C' },
        { match: 'spark_master', type: 'compute', label: 'Spark', color: '#E25A1C' },
        { match: 'spark_worker', type: 'compute', label: 'Spark Worker', color: '#E25A1C' },
        { match: 'kafka_bootstrap_servers', type: 'events', label: 'Kafka', color: '#231F20' },
        { match: 'kafka_zookeeper_connect', type: 'coordination', label: 'Zookeeper', color: '#85EA2D' },
        { match: 'airflow__core__sql_alchemy_conn', type: 'db', label: 'Airflow DB', color: '#336791' },
        { match: 'model_config_file', type: 'config', label: 'Model Config', color: '#FF6F00' },
    ];

    for (const pattern of patterns) {
        if (envString.includes(pattern.match) && envString.includes(target.name.toLowerCase())) {
            return pattern;
        }
    }

    return null;
};

/**
 * Vérifie les patterns de noms conventionnels
 */
const checkNamePattern = (source, target) => {
    const sourceName = source.name.toLowerCase();
    const targetName = target.name.toLowerCase();

    // Gateway → Services
    if (sourceName.includes('gateway') && (targetName.includes('service') || targetName.includes('api'))) {
        return { type: 'gateway', label: 'Route', color: '#2196F3' };
    }

    // Frontend → Backend
    if (sourceName.includes('frontend') && targetName.includes('backend')) {
        return { type: 'http', label: 'HTTP', color: '#4CAF50' };
    }

    // Web → API
    if (sourceName.includes('web') && targetName.includes('api')) {
        return { type: 'http', label: 'REST', color: '#4CAF50' };
    }

    // Service → Database
    if (targetName.includes('db') || targetName.includes('postgres') || targetName.includes('mysql')) {
        if (sourceName.includes('service') || sourceName.includes('api') || sourceName.includes('app')) {
            return { type: 'db', label: 'SQL', color: '#336791' };
        }
    }

    // Service → Cache
    if (targetName.includes('redis') || targetName.includes('cache')) {
        return { type: 'cache', label: 'Cache', color: '#DC382D' };
    }

    // Master → Slave (réplication)
    if (sourceName.includes('master') && targetName.includes('slave')) {
        return { type: 'replication', label: 'Replica', color: '#9C27B0' };
    }

    // Airflow → Worker/Spark
    if (sourceName.includes('airflow') && (targetName.includes('spark') || targetName.includes('worker'))) {
        return { type: 'orchestration', label: 'DAG', color: '#017CEE' };
    }

    // Prometheus → Exporters
    if (sourceName.includes('prometheus') && (targetName.includes('exporter') || targetName.includes('cadvisor'))) {
        return { type: 'metrics', label: 'Scrape', color: '#E6522C' };
    }

    // Grafana → Prometheus/Loki
    if (sourceName.includes('grafana') && (targetName.includes('prometheus') || targetName.includes('loki'))) {
        return { type: 'visualization', label: 'Query', color: '#F46800' };
    }

    return null;
};

/**
 * Vérifie si deux conteneurs sont sur un réseau personnalisé commun
 */
const checkNetworkConnection = (source, target) => {
    if (!source.networks || !target.networks) return null;

    // Cherche un réseau commun (sauf bridge par défaut)
    const commonNetworks = source.networks.filter(net =>
        target.networks.includes(net) && net !== 'bridge'
    );

    if (commonNetworks.length > 0) {
        // Connexion sur réseau personnalisé
        return { type: 'network', label: 'Network', color: '#607D8B' };
    }

    return null;
};

/**
 * Calcule les positions des connexions pour le rendu SVG
 */
export const calculateConnectionPositions = (connections, containers, containerPositions) => {
    return connections.map(conn => {
        const fromContainer = containers.find(c => c.id === conn.from);
        const toContainer = containers.find(c => c.id === conn.to);

        if (!fromContainer || !toContainer) return null;

        const fromPos = containerPositions[conn.from];
        const toPos = containerPositions[conn.to];

        if (!fromPos || !toPos) return null;

        return {
            ...conn,
            x1: fromPos.x + fromPos.width / 2,
            y1: fromPos.y + fromPos.height / 2,
            x2: toPos.x + toPos.width / 2,
            y2: toPos.y + toPos.height / 2
        };
    }).filter(Boolean);
};
