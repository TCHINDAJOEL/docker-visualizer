import { generateId } from '../utils/helpers';

export const SCENARIOS = [
    {
        id: 'scenario-batch',
        title: 'Travail Batch Simple',
        description: 'Exécutez un conteneur éphémère qui effectue une tâche et se termine.',
        difficulty: 'Beginner',
        icon: 'Terminal',
        steps: [
            {
                id: 'step1',
                instruction: 'Exécutez un conteneur qui se termine immédiatement avec un message',
                hint: 'Utilisez le terminal en bas de l\'écran pour taper la commande.',
                cmd: 'docker run --name batch-job alpine echo "Job Done"',
                validation: (state) => {
                    const container = state.containers.find(c => c.name === 'batch-job');
                    return container && (container.status === 'exited' || container.logs.some(l => l.includes('Job Done')));
                }
            },
            {
                id: 'step2',
                instruction: 'Inspectez les logs du conteneur terminé pour vérifier la sortie.',
                hint: 'Sélectionnez "batch-job" dans la vue Containers et consultez les Logs, ou utilisez docker logs.',
                cmd: 'docker logs batch-job',
                autoAdvance: false
            },
            {
                id: 'step3',
                instruction: 'Supprimez le conteneur terminé pour nettoyer.',
                hint: 'Un conteneur arrêté peut être supprimé sans l\'option -f',
                cmd: 'docker rm batch-job',
                validation: (state) => !state.containers.some(c => c.name === 'batch-job')
            }
        ]
    },
    {
        id: 'scenario-first-container',
        title: 'Mon Premier Conteneur',
        description: 'Créez et gérez votre premier conteneur Docker avec nginx.',
        difficulty: 'Beginner',
        icon: 'Server',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez un conteneur nginx nommé "mon-web"',
                hint: 'Utilisez docker run avec l\'option --name',
                cmd: 'docker run -d --name mon-web nginx',
                validation: (state) => state.containers.some(c => c.name === 'mon-web' && c.status === 'running')
            },
            {
                id: 'step2',
                instruction: 'Listez tous les conteneurs en cours d\'exécution',
                hint: 'La commande docker ps affiche les conteneurs actifs',
                cmd: 'docker ps',
                autoAdvance: false
            },
            {
                id: 'step3',
                instruction: 'Arrêtez le conteneur mon-web',
                hint: 'Utilisez docker stop suivi du nom du conteneur',
                cmd: 'docker stop mon-web',
                validation: (state) => {
                    const container = state.containers.find(c => c.name === 'mon-web');
                    return container && container.status === 'exited';
                }
            },
            {
                id: 'step4',
                instruction: 'Supprimez le conteneur arrêté',
                hint: 'docker rm permet de supprimer un conteneur arrêté',
                cmd: 'docker rm mon-web',
                validation: (state) => !state.containers.some(c => c.name === 'mon-web')
            }
        ]
    },
    {
        id: 'scenario-webapp',
        title: 'Application Web 3-Tiers',
        description: 'Déployez une stack classique Nginx + API + DB, puis simulez une panne réseau.',
        difficulty: 'Intermediate',
        icon: 'Layers',
        steps: [
            {
                id: 'step1',
                instruction: 'Create a new Stack named "webapp" with Nginx, API, and Postgres services.',
                hint: 'Go to Stacks view, click Create, and use the default template or write your own.',
                validation: (state) => {
                    const stack = state.stacks.find(s => s.status === 'active');
                    return stack && stack.services && Object.keys(stack.services).length >= 3;
                }
            },
            {
                id: 'step2',
                instruction: 'Simulate a database failure by stopping the database container.',
                hint: 'Go to Containers view, find the db/redis/postgres container and click Stop.',
                validation: (state) => {
                    // Find a container that looks like a DB and is not running
                    return state.containers.some(c =>
                        (c.image.includes('redis') || c.image.includes('postgres') || c.image.includes('mongo')) &&
                        c.status !== 'running'
                    );
                }
            },
            {
                id: 'step3',
                instruction: 'Check the API container logs to see connection errors.',
                hint: 'Select the API/Web container and look at the Logs tab in the Inspector.',
                validation: (state) => {
                    // This is hard to validate automatically without tracking user UI clicks. 
                    // We'll assume if they are on the logs tab of a running container, it's good.
                    // For now, we might just provide a "Next" button for manual advance after they claim they did it.
                    return true;
                },
                autoAdvance: false // User must click Next
            }
        ]
    },
    {
        id: 'scenario-microservices',
        title: 'Microservices Evolution',
        description: 'Start with a monolith and add a worker service to handle background tasks.',
        difficulty: 'Advanced',
        icon: 'Server',
        steps: [
            {
                id: 'step1',
                instruction: 'Deploy a basic "web-stack" if not already running.',
                validation: (state) => state.stacks.some(s => s.status === 'active')
            },
            {
                id: 'step2',
                instruction: 'Edit the stack YAML to add a "worker" service (image: alpine, command: "watch echo working").',
                hint: 'Go to Stacks, Edit, add the service under "services:", then Deploy.',
                validation: (state) => {
                    return state.containers.some(c => c.name.includes('worker') && c.status === 'running');
                }
            }
        ]
    },
    {
        id: 'scenario-batch',
        title: 'Batch Processing Job',
        description: 'Run a one-off container that performs a task and exits.',
        difficulty: 'Beginner',
        icon: 'Terminal',
        steps: [
            {
                id: 'step1',
                instruction: 'Run a container that exits immediately: `docker run --name batch-job alpine echo "Job Done"`',
                hint: 'Use the Terminal at the bottom.',
                validation: (state) => {
                    const container = state.containers.find(c => c.name === 'batch-job');
                    return container && (container.status === 'exited' || container.logs.some(l => l.includes('Job Done')));
                }
            },
            {
                id: 'step2',
                instruction: 'Inspect the logs of the exited container to verify the output.',
                hint: 'Select "batch-job" in Containers view and check Logs.',
                validation: (state) => true, // Manual
                autoAdvance: false
            },
            {
                id: 'step3',
                instruction: 'Remove the exited container to clean up.',
                validation: (state) => !state.containers.some(c => c.name === 'batch-job')
            }
        ]
    },
    {
        id: 'scenario-scaling',
        title: 'Scaling & Load Balancing',
        description: 'Scale a web service to 5 replicas and observe the resource usage.',
        difficulty: 'Intermediate',
        icon: 'Activity',
        steps: [
            {
                id: 'step1',
                instruction: 'Ensure you have a running stack with a "web" service.',
                validation: (state) => state.stacks.some(s => s.status === 'active')
            },
            {
                id: 'step2',
                instruction: 'Scale the "web" service to 5 replicas.',
                hint: 'This feature might need a "Scale" button in Stacks view, or just run `docker run` 4 more times manually for now if Scale isn\'t implemented.',
                validation: (state) => {
                    const webContainers = state.containers.filter(c => c.name.includes('web'));
                    return webContainers.length >= 5;
                }
            }
        ]
    },
    {
        id: 'scenario-cleanup',
        title: 'Environment Cleanup',
        description: 'Clean up unused resources (orphans) to free up space.',
        difficulty: 'Beginner',
        icon: 'Trash2',
        steps: [
            {
                id: 'step1',
                instruction: 'Create some clutter: Run a container and stop it, create an unused volume.',
                hint: 'Run `docker run hello-world` and `docker volume create unused-vol`.',
                validation: (state) => {
                    const stopped = state.containers.some(c => c.status === 'exited');
                    const unusedVol = state.volumes.some(v => !state.containers.some(c => c.mounts?.some(m => m.source === v.name)));
                    return stopped && unusedVol;
                }
            },
            {
                id: 'step2',
                instruction: 'Run "System Prune" from the Host view.',
                validation: (state) => {
                    const stopped = state.containers.some(c => c.status === 'exited');
                    // Strict validation: no stopped containers should exist
                    return !stopped;
                }
            }
        ]
    }
];
