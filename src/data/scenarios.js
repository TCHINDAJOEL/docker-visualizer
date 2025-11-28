export const SCENARIOS = [
    // ========== NIVEAU DÉBUTANT ==========
    {
        id: 'scenario-first-container',
        title: '1. Mon Premier Conteneur',
        description: 'Créez et gérez votre premier conteneur Docker avec nginx.',
        difficulty: 'Beginner',
        icon: 'Server',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez un conteneur nginx nommé "mon-web"',
                hint: 'Utilisez docker run avec l\'option --name et -d pour le mode détaché',
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
        id: 'scenario-batch',
        title: '2. Travail Batch (Éphémère)',
        description: 'Exécutez un conteneur éphémère qui effectue une tâche et se termine.',
        difficulty: 'Beginner',
        icon: 'Terminal',
        steps: [
            {
                id: 'step1',
                instruction: 'Exécutez un conteneur qui se termine immédiatement avec un message',
                hint: 'Sans l\'option -d, le conteneur s\'exécute au premier plan et se termine',
                cmd: 'docker run --name batch-job alpine echo "Job Done"',
                validation: (state) => {
                    const container = state.containers.find(c => c.name === 'batch-job');
                    return container && container.status === 'exited';
                }
            },
            {
                id: 'step2',
                instruction: 'Inspectez les logs pour voir le message',
                hint: 'docker logs affiche la sortie standard du conteneur',
                cmd: 'docker logs batch-job',
                autoAdvance: false
            },
            {
                id: 'step3',
                instruction: 'Supprimez le conteneur terminé',
                hint: 'Un conteneur exited peut être supprimé sans force',
                cmd: 'docker rm batch-job',
                validation: (state) => !state.containers.some(c => c.name === 'batch-job')
            }
        ]
    },
    {
        id: 'scenario-ports',
        title: '3. Exposition de Ports',
        description: 'Apprenez à exposer des ports pour accéder à vos applications.',
        difficulty: 'Beginner',
        icon: 'Network',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez un serveur web accessible sur le port 8080',
                hint: 'L\'option -p mappe un port host:container',
                cmd: 'docker run -d --name web-server -p 8080:80 nginx',
                validation: (state) => {
                    const container = state.containers.find(c => c.name === 'web-server');
                    return container && container.status === 'running' &&
                           container.ports && container.ports.some(p => p.includes('8080'));
                }
            },
            {
                id: 'step2',
                instruction: 'Inspectez le conteneur pour voir les ports mappés',
                hint: 'docker inspect affiche tous les détails d\'un conteneur',
                cmd: 'docker inspect web-server',
                autoAdvance: false
            },
            {
                id: 'step3',
                instruction: 'Nettoyez en supprimant le conteneur',
                hint: 'Utilisez -f pour forcer la suppression d\'un conteneur running',
                cmd: 'docker rm -f web-server',
                validation: (state) => !state.containers.some(c => c.name === 'web-server')
            }
        ]
    },
    {
        id: 'scenario-env-vars',
        title: '4. Variables d\'Environnement',
        description: 'Configurez vos conteneurs avec des variables d\'environnement.',
        difficulty: 'Beginner',
        icon: 'Server',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez un conteneur avec une variable d\'environnement APP_ENV=production',
                hint: 'L\'option -e permet de définir des variables d\'environnement',
                cmd: 'docker run -d --name app-prod -e APP_ENV=production nginx',
                validation: (state) => {
                    const container = state.containers.find(c => c.name === 'app-prod');
                    return container && container.env &&
                           container.env.some(e => e.includes('APP_ENV=production'));
                }
            },
            {
                id: 'step2',
                instruction: 'Créez un second conteneur avec APP_ENV=development',
                hint: 'Vous pouvez avoir plusieurs conteneurs de la même image avec des configs différentes',
                cmd: 'docker run -d --name app-dev -e APP_ENV=development nginx',
                validation: (state) => state.containers.some(c => c.name === 'app-dev')
            },
            {
                id: 'step3',
                instruction: 'Listez tous les conteneurs pour voir vos deux environnements',
                hint: 'docker ps -a affiche tous les conteneurs',
                cmd: 'docker ps -a',
                autoAdvance: false
            },
            {
                id: 'step4',
                instruction: 'Nettoyez les deux conteneurs',
                hint: 'Vous pouvez utiliser docker rm -f pour les deux',
                cmd: 'docker rm -f app-prod app-dev',
                validation: (state) =>
                    !state.containers.some(c => c.name === 'app-prod') &&
                    !state.containers.some(c => c.name === 'app-dev')
            }
        ]
    },

    // ========== NIVEAU INTERMÉDIAIRE ==========
    {
        id: 'scenario-volumes',
        title: '5. Volumes et Persistence',
        description: 'Persistez vos données au-delà de la vie d\'un conteneur avec les volumes.',
        difficulty: 'Intermediate',
        icon: 'Database',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez un volume nommé "data-vol"',
                hint: 'docker volume create crée un volume persistant',
                cmd: 'docker volume create data-vol',
                validation: (state) => state.volumes.some(v => v.name === 'data-vol')
            },
            {
                id: 'step2',
                instruction: 'Créez un conteneur qui utilise ce volume',
                hint: 'L\'option -v monte un volume dans un conteneur',
                cmd: 'docker run -d --name app-with-data -v data-vol:/app/data nginx',
                validation: (state) => {
                    const container = state.containers.find(c => c.name === 'app-with-data');
                    return container && container.mounts &&
                           container.mounts.some(m => m.source === 'data-vol');
                }
            },
            {
                id: 'step3',
                instruction: 'Supprimez le conteneur (le volume reste)',
                hint: 'Les volumes survivent à la suppression des conteneurs',
                cmd: 'docker rm -f app-with-data',
                validation: (state) =>
                    !state.containers.some(c => c.name === 'app-with-data') &&
                    state.volumes.some(v => v.name === 'data-vol')
            },
            {
                id: 'step4',
                instruction: 'Listez les volumes pour confirmer que data-vol existe toujours',
                hint: 'docker volume ls liste tous les volumes',
                cmd: 'docker volume ls',
                autoAdvance: false
            }
        ]
    },
    {
        id: 'scenario-custom-network',
        title: '6. Réseaux Personnalisés',
        description: 'Créez des réseaux isolés pour vos applications.',
        difficulty: 'Intermediate',
        icon: 'Network',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez un réseau personnalisé nommé "backend-net"',
                hint: 'docker network create crée un nouveau réseau bridge',
                cmd: 'docker network create backend-net',
                validation: (state) => state.networks.some(n => n.name === 'backend-net')
            },
            {
                id: 'step2',
                instruction: 'Lancez un conteneur dans ce réseau',
                hint: 'L\'option --net spécifie le réseau',
                cmd: 'docker run -d --name api --net backend-net nginx',
                validation: (state) => {
                    const container = state.containers.find(c => c.name === 'api');
                    return container && container.networks.includes('backend-net');
                }
            },
            {
                id: 'step3',
                instruction: 'Lancez un second conteneur dans le même réseau',
                hint: 'Les conteneurs sur le même réseau peuvent communiquer',
                cmd: 'docker run -d --name db --net backend-net postgres',
                validation: (state) => {
                    const container = state.containers.find(c => c.name === 'db');
                    return container && container.networks.includes('backend-net');
                }
            },
            {
                id: 'step4',
                instruction: 'Vérifiez que les deux conteneurs sont sur backend-net',
                hint: 'Allez dans la vue Networks ou utilisez docker network inspect',
                cmd: 'docker network ls',
                autoAdvance: false
            }
        ]
    },
    {
        id: 'scenario-multi-container',
        title: '7. Application Multi-Conteneurs',
        description: 'Déployez une application avec frontend et backend communicants.',
        difficulty: 'Intermediate',
        icon: 'Layers',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez un réseau pour votre application',
                hint: 'Un réseau dédié isole votre application',
                cmd: 'docker network create app-network',
                validation: (state) => state.networks.some(n => n.name === 'app-network')
            },
            {
                id: 'step2',
                instruction: 'Lancez un conteneur backend (API)',
                hint: 'Le backend tourne généralement sur un port comme 3000',
                cmd: 'docker run -d --name backend --net app-network node',
                validation: (state) => state.containers.some(c =>
                    c.name === 'backend' && c.networks.includes('app-network')
                )
            },
            {
                id: 'step3',
                instruction: 'Lancez un conteneur frontend (Web)',
                hint: 'Le frontend se connecte au backend via le nom du conteneur',
                cmd: 'docker run -d --name frontend --net app-network -p 80:80 nginx',
                validation: (state) => state.containers.some(c =>
                    c.name === 'frontend' && c.networks.includes('app-network')
                )
            },
            {
                id: 'step4',
                instruction: 'Vérifiez la topologie dans la vue Dashboard',
                hint: 'Vous devriez voir vos deux conteneurs dans le réseau app-network',
                autoAdvance: false
            }
        ]
    },
    {
        id: 'scenario-database-app',
        title: '8. Application avec Base de Données',
        description: 'Déployez une application complète avec persistence des données.',
        difficulty: 'Intermediate',
        icon: 'Database',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez un volume pour la base de données',
                hint: 'Les données de la DB doivent persister',
                cmd: 'docker volume create db-data',
                validation: (state) => state.volumes.some(v => v.name === 'db-data')
            },
            {
                id: 'step2',
                instruction: 'Créez un réseau pour isoler votre stack',
                hint: 'Isolation réseau = meilleure sécurité',
                cmd: 'docker network create db-network',
                validation: (state) => state.networks.some(n => n.name === 'db-network')
            },
            {
                id: 'step3',
                instruction: 'Lancez PostgreSQL avec le volume',
                hint: 'Combinez -v pour le volume, --net pour le réseau, -e pour les variables',
                cmd: 'docker run -d --name postgres-db --net db-network -v db-data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=secret postgres',
                validation: (state) => {
                    const container = state.containers.find(c => c.name === 'postgres-db');
                    return container &&
                           container.networks.includes('db-network') &&
                           container.mounts?.some(m => m.source === 'db-data');
                }
            },
            {
                id: 'step4',
                instruction: 'Lancez l\'application qui se connecte à la DB',
                hint: 'L\'app peut accéder à la DB via le nom "postgres-db"',
                cmd: 'docker run -d --name app --net db-network -e DATABASE_URL=postgres://postgres-db:5432 node',
                validation: (state) => state.containers.some(c =>
                    c.name === 'app' && c.networks.includes('db-network')
                )
            }
        ]
    },

    // ========== NIVEAU AVANCÉ ==========
    {
        id: 'scenario-wordpress-stack',
        title: '9. Stack WordPress Complète',
        description: 'Déployez un site WordPress avec MySQL et volumes persistants.',
        difficulty: 'Advanced',
        icon: 'Layers',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez les volumes nécessaires',
                hint: 'Vous avez besoin de deux volumes: un pour MySQL, un pour WordPress',
                cmd: 'docker volume create wp-db && docker volume create wp-data',
                validation: (state) =>
                    state.volumes.some(v => v.name === 'wp-db') &&
                    state.volumes.some(v => v.name === 'wp-data')
            },
            {
                id: 'step2',
                instruction: 'Créez un réseau wordpress-net',
                cmd: 'docker network create wordpress-net',
                validation: (state) => state.networks.some(n => n.name === 'wordpress-net')
            },
            {
                id: 'step3',
                instruction: 'Lancez MySQL avec les bonnes configurations',
                hint: 'MySQL nécessite MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, etc.',
                cmd: 'docker run -d --name wp-mysql --net wordpress-net -v wp-db:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=wordpress -e MYSQL_USER=wpuser -e MYSQL_PASSWORD=wppass postgres',
                validation: (state) => {
                    const container = state.containers.find(c => c.name === 'wp-mysql');
                    return container && container.networks.includes('wordpress-net');
                }
            },
            {
                id: 'step4',
                instruction: 'Lancez WordPress connecté à MySQL',
                hint: 'WordPress doit connaître l\'hôte DB et les credentials',
                cmd: 'docker run -d --name wordpress --net wordpress-net -p 8000:80 -v wp-data:/var/www/html -e WORDPRESS_DB_HOST=wp-mysql -e WORDPRESS_DB_USER=wpuser -e WORDPRESS_DB_PASSWORD=wppass wordpress',
                validation: (state) => {
                    const wp = state.containers.find(c => c.name === 'wordpress');
                    const mysql = state.containers.find(c => c.name === 'wp-mysql');
                    return wp && mysql &&
                           wp.networks.includes('wordpress-net') &&
                           mysql.networks.includes('wordpress-net');
                }
            },
            {
                id: 'step5',
                instruction: 'Vérifiez votre stack WordPress complète',
                hint: 'Allez voir la topologie - vous devriez voir 2 conteneurs, 1 réseau, 2 volumes',
                autoAdvance: false
            }
        ]
    },
    {
        id: 'scenario-microservices',
        title: '10. Architecture Microservices',
        description: 'Déployez une architecture microservices avec plusieurs réseaux.',
        difficulty: 'Advanced',
        icon: 'Server',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez deux réseaux: frontend-net et backend-net',
                hint: 'Séparation des couches = meilleure sécurité',
                cmd: 'docker network create frontend-net && docker network create backend-net',
                validation: (state) =>
                    state.networks.some(n => n.name === 'frontend-net') &&
                    state.networks.some(n => n.name === 'backend-net')
            },
            {
                id: 'step2',
                instruction: 'Lancez la base de données sur backend-net uniquement',
                cmd: 'docker run -d --name db --net backend-net postgres',
                validation: (state) => {
                    const container = state.containers.find(c => c.name === 'db');
                    return container && container.networks.includes('backend-net');
                }
            },
            {
                id: 'step3',
                instruction: 'Lancez l\'API sur les DEUX réseaux',
                hint: 'L\'API doit communiquer avec la DB et le frontend',
                cmd: 'docker run -d --name api --net backend-net node',
                validation: (state) => state.containers.some(c => c.name === 'api')
            },
            {
                id: 'step4',
                instruction: 'Connectez l\'API au réseau frontend',
                hint: 'docker network connect ajoute un conteneur à un réseau',
                cmd: 'docker network connect frontend-net api',
                validation: (state) => {
                    const container = state.containers.find(c => c.name === 'api');
                    return container &&
                           container.networks.includes('frontend-net') &&
                           container.networks.includes('backend-net');
                }
            },
            {
                id: 'step5',
                instruction: 'Lancez le frontend sur frontend-net',
                cmd: 'docker run -d --name web --net frontend-net -p 3000:80 nginx',
                validation: (state) => state.containers.some(c => c.name === 'web')
            },
            {
                id: 'step6',
                instruction: 'Observez votre architecture dans la vue Dashboard',
                hint: 'La DB est isolée, seule l\'API peut y accéder. Le web ne voit que l\'API.',
                autoAdvance: false
            }
        ]
    },
    {
        id: 'scenario-monitoring',
        title: '11. Monitoring et Logs',
        description: 'Apprenez à surveiller et débugger vos conteneurs.',
        difficulty: 'Advanced',
        icon: 'Activity',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez plusieurs conteneurs pour la surveillance',
                cmd: 'docker run -d --name web1 nginx && docker run -d --name web2 nginx && docker run -d --name web3 nginx',
                validation: (state) =>
                    state.containers.some(c => c.name === 'web1') &&
                    state.containers.some(c => c.name === 'web2') &&
                    state.containers.some(c => c.name === 'web3')
            },
            {
                id: 'step2',
                instruction: 'Consultez les statistiques de web1',
                hint: 'Allez dans la vue Monitoring ou cliquez sur web1 pour voir ses stats',
                autoAdvance: false
            },
            {
                id: 'step3',
                instruction: 'Consultez les logs de web2',
                cmd: 'docker logs web2',
                autoAdvance: false
            },
            {
                id: 'step4',
                instruction: 'Arrêtez web3 pour simuler un problème',
                cmd: 'docker stop web3',
                validation: (state) => {
                    const container = state.containers.find(c => c.name === 'web3');
                    return container && container.status === 'exited';
                }
            },
            {
                id: 'step5',
                instruction: 'Vérifiez tous les conteneurs (y compris arrêtés)',
                cmd: 'docker ps -a',
                autoAdvance: false
            }
        ]
    },
    {
        id: 'scenario-cleanup',
        title: '12. Nettoyage et Optimisation',
        description: 'Nettoyez les ressources inutilisées pour optimiser votre environnement.',
        difficulty: 'Advanced',
        icon: 'Trash2',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez du "désordre" : plusieurs conteneurs arrêtés',
                cmd: 'docker run --name tmp1 alpine echo test && docker run --name tmp2 alpine echo test && docker run --name tmp3 alpine echo test',
                validation: (state) => {
                    const stopped = state.containers.filter(c => c.status === 'exited');
                    return stopped.length >= 3;
                }
            },
            {
                id: 'step2',
                instruction: 'Créez des volumes inutilisés',
                cmd: 'docker volume create unused1 && docker volume create unused2',
                validation: (state) => state.volumes.length >= 3
            },
            {
                id: 'step3',
                instruction: 'Listez tous les conteneurs arrêtés',
                cmd: 'docker ps -a',
                autoAdvance: false
            },
            {
                id: 'step4',
                instruction: 'Supprimez tous les conteneurs arrêtés',
                hint: 'Allez dans la vue Host et cliquez sur "System Prune"',
                validation: (state) => {
                    const stopped = state.containers.filter(c => c.status === 'exited');
                    return stopped.length === 0;
                }
            },
            {
                id: 'step5',
                instruction: 'Nettoyez les volumes inutilisés',
                hint: 'docker volume prune supprime les volumes non utilisés',
                cmd: 'docker volume prune',
                autoAdvance: false
            },
            {
                id: 'step6',
                instruction: 'Vérifiez votre environnement propre',
                hint: 'Félicitations ! Vous savez maintenant maintenir un environnement Docker propre.',
                autoAdvance: false
            }
        ]
    }
];
