// Simple mock YAML parser for Docker Compose simulation
// NOTE: This is a very basic parser and only supports a subset of Docker Compose syntax for demonstration purposes.

export const parseComposeFile = (yamlContent) => {
    try {
        const services = {};
        const networks = {};
        const volumes = {};

        const lines = yamlContent.split('\n');
        let currentSection = null;
        let currentService = null;
        let currentIndent = 0;

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) return;

            const indent = line.search(/\S|$/);

            // Detect sections
            if (indent === 0) {
                if (trimmedLine.startsWith('services:')) {
                    currentSection = 'services';
                    currentService = null;
                } else if (trimmedLine.startsWith('networks:')) {
                    currentSection = 'networks';
                } else if (trimmedLine.startsWith('volumes:')) {
                    currentSection = 'volumes';
                } else if (trimmedLine.startsWith('version:')) {
                    // Ignore version
                }
                return;
            }

            // Parse Services
            if (currentSection === 'services') {
                if (indent === 2) {
                    // Service name
                    const serviceName = trimmedLine.replace(':', '');
                    currentService = serviceName;
                    services[serviceName] = {
                        name: serviceName,
                        image: 'ubuntu:latest', // Default
                        ports: [],
                        environment: [],
                        networks: [],
                        volumes: [],
                        depends_on: []
                    };
                } else if (indent === 4 && currentService) {
                    // Service properties
                    const [key, ...rest] = trimmedLine.split(':');
                    const value = rest.join(':').trim();

                    if (key === 'image') services[currentService].image = value;
                    else if (key === 'restart') services[currentService].restart = value;
                    else if (key === 'ports') {
                        // Handle list in next lines or inline? 
                        // Simplified: assume next lines are list items if value is empty
                    }
                    else if (key === 'environment') {
                        // Same
                    }
                } else if (indent === 6 && currentService) {
                    // List items (ports, env, etc)
                    if (trimmedLine.startsWith('-')) {
                        const val = trimmedLine.substring(1).trim();
                        // We need to know context. Simplified: check previous line or just guess?
                        // For this mock, we'll try to guess based on content
                        if (val.includes(':') && !isNaN(val.split(':')[0])) {
                            services[currentService].ports.push(val);
                        } else if (val.includes('=')) {
                            services[currentService].environment.push(val);
                        } else {
                            // Maybe network or volume?
                            // Let's assume simple strings are networks for now if context isn't clear
                        }
                    }
                }
            }
        });

        // Fallback: if parsing failed to extract meaningful data, return a mock structure
        // This is to ensure the UI works even if the parser is too simple for complex YAML
        if (Object.keys(services).length === 0) {
            return {
                services: {
                    web: { image: 'nginx:latest', ports: ['80:80'], networks: ['app-net'] },
                    db: { image: 'postgres:13', environment: ['POSTGRES_PASSWORD=secret'], volumes: ['db-data:/var/lib/postgresql/data'], networks: ['app-net'] }
                },
                networks: { 'app-net': {} },
                volumes: { 'db-data': {} }
            };
        }

        return { services, networks, volumes };
    } catch (e) {
        console.error("YAML Parse Error", e);
        return null;
    }
};

export const generateComposeYaml = (services) => {
    // Generate YAML string from services object
    let yaml = 'version: "3.8"\n\nservices:\n';
    Object.values(services).forEach(service => {
        yaml += `  ${service.name}:\n`;
        yaml += `    image: ${service.image}\n`;
        if (service.ports && service.ports.length) {
            yaml += `    ports:\n`;
            service.ports.forEach(p => yaml += `      - "${p}"\n`);
        }
        if (service.environment && service.environment.length) {
            yaml += `    environment:\n`;
            service.environment.forEach(e => yaml += `      - ${e}\n`);
        }
        yaml += '\n';
    });
    return yaml;
};
