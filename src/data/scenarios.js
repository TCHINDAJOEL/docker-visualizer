export const SCENARIOS = [
    // ========== NIVEAU DÉBUTANT ==========
    {
        id: 'scenario-intro',
        title: '1. Hello World Docker',
        description: 'Votre première interaction avec Docker. Lancez un conteneur simple.',
        difficulty: 'Beginner',
        icon: 'Box',
        steps: [
            {
                id: 'step1',
                instruction: 'Lancez votre premier conteneur "hello-world"',
                hint: 'Utilisez la commande docker run hello-world',
                cmd: 'docker run hello-world',
                validation: (state) => state.containers.some(c => c.image === 'hello-world')
            },
            {
                id: 'step2',
                instruction: 'Listez les conteneurs pour voir qu\'il a tourné',
                hint: 'Le conteneur s\'arrête après exécution, utilisez -a pour tout voir',
                cmd: 'docker ps -a',
                autoAdvance: false
            },
            {
                id: 'step3',
                instruction: 'Supprimez le conteneur pour nettoyer',
                hint: 'Utilisez l\'ID ou le nom du conteneur',
                cmd: 'docker rm', // Validation flexible sur le rm
                validation: (state) => !state.containers.some(c => c.image === 'hello-world')
            }
        ]
    },
    {
        id: 'scenario-basic-commands',
        title: '2. Commandes de Base',
        description: 'Maîtrisez les commandes essentielles : ps, stop, start, restart.',
        difficulty: 'Beginner',
        icon: 'Terminal',
        steps: [
            {
                id: 'step1',
                instruction: 'Lancez un conteneur Nginx en arrière-plan (détaché)',
                hint: 'L\'option -d lance le conteneur en mode détaché',
                cmd: 'docker run -d --name my-nginx nginx',
                validation: (state) => state.containers.some(c => c.name === 'my-nginx' && c.status === 'running')
            },
            {
                id: 'step2',
                instruction: 'Arrêtez le conteneur',
                hint: 'docker stop arrête un conteneur en cours d\'exécution',
                cmd: 'docker stop my-nginx',
                validation: (state) => state.containers.some(c => c.name === 'my-nginx' && c.status === 'exited')
            },
            {
                id: 'step3',
                instruction: 'Redémarrez le conteneur',
                hint: 'docker start relance un conteneur arrêté',
                cmd: 'docker start my-nginx',
                validation: (state) => state.containers.some(c => c.name === 'my-nginx' && c.status === 'running')
            },
            {
                id: 'step4',
                instruction: 'Supprimez le conteneur (il doit être arrêté ou forcé)',
                hint: 'docker rm -f force la suppression',
                cmd: 'docker rm -f my-nginx',
                validation: (state) => !state.containers.some(c => c.name === 'my-nginx')
            }
        ]
    },
    {
        id: 'scenario-web-server',
        title: '3. Serveur Web Simple',
        description: 'Hébergez une page web et accédez-y via un port.',
        difficulty: 'Beginner',
        icon: 'Globe',
        steps: [
            {
                id: 'step1',
                instruction: 'Lancez un serveur web Nginx avec le port 8080 ouvert',
                hint: 'L\'option -p 8080:80 mappe le port 8080 de l\'hôte vers le 80 du conteneur',
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
    },

    // ========== NIVEAU EXPERT - PRODUCTION ==========
    {
        id: 'scenario-ml-serving',
        title: '13. Déploiement d\'IA - TensorFlow Serving',
        description: 'Déployez un modèle de Machine Learning avec TensorFlow Serving et une API REST.',
        difficulty: 'Advanced',
        icon: 'Activity',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez un réseau ml-network pour isoler l\'infrastructure ML',
                hint: 'Les services ML doivent être isolés pour la sécurité',
                cmd: 'docker network create ml-network',
                validation: (state) => state.networks.some(n => n.name === 'ml-network')
            },
            {
                id: 'step2',
                instruction: 'Lancez TensorFlow Serving (simule le serveur de modèles)',
                hint: 'TensorFlow Serving expose les modèles via gRPC et REST API',
                cmd: 'docker run -d --name tf-serving --net ml-network -p 8501:8501 -e MODEL_NAME=my_model -e MODEL_CONFIG_FILE=/models/models.config tensorflow/serving',
                validation: (state) => state.containers.some(c =>
                    c.name === 'tf-serving' && c.networks.includes('ml-network')
                )
            },
            {
                id: 'step3',
                instruction: 'Lancez une API Gateway pour router les requêtes',
                hint: 'L\'API Gateway gère l\'authentification et le load balancing',
                cmd: 'docker run -d --name ml-gateway --net ml-network -p 8000:80 -e TF_SERVING_HOST=tf-serving nginx',
                validation: (state) => state.containers.some(c => c.name === 'ml-gateway')
            },
            {
                id: 'step4',
                instruction: 'Ajoutez un cache Redis pour les prédictions fréquentes',
                hint: 'Redis réduit la latence en cachant les résultats courants',
                cmd: 'docker run -d --name ml-cache --net ml-network redis',
                validation: (state) => state.containers.some(c =>
                    c.name === 'ml-cache' && c.image.includes('redis')
                )
            },
            {
                id: 'step5',
                instruction: 'Vérifiez votre stack ML dans la topologie',
                hint: 'Vous devriez voir : Gateway → TF Serving → Cache (Redis)',
                autoAdvance: false
            }
        ]
    },
    {
        id: 'scenario-db-replication',
        title: '14. Réplication PostgreSQL Master-Slave',
        description: 'Configurez une réplication PostgreSQL pour la haute disponibilité.',
        difficulty: 'Advanced',
        icon: 'Database',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez un réseau db-replication',
                cmd: 'docker network create db-replication',
                validation: (state) => state.networks.some(n => n.name === 'db-replication')
            },
            {
                id: 'step2',
                instruction: 'Créez un volume pour le master',
                cmd: 'docker volume create pg-master-data',
                validation: (state) => state.volumes.some(v => v.name === 'pg-master-data')
            },
            {
                id: 'step3',
                instruction: 'Lancez PostgreSQL Master',
                hint: 'Le master accepte les écritures (mode PRIMARY)',
                cmd: 'docker run -d --name pg-master --net db-replication -v pg-master-data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=master123 -e REPLICATION_MODE=master postgres',
                validation: (state) => {
                    const master = state.containers.find(c => c.name === 'pg-master');
                    return master &&
                        master.networks.includes('db-replication') &&
                        master.mounts?.some(m => m.source === 'pg-master-data');
                }
            },
            {
                id: 'step4',
                instruction: 'Créez un volume pour le slave 1',
                cmd: 'docker volume create pg-slave1-data',
                validation: (state) => state.volumes.some(v => v.name === 'pg-slave1-data')
            },
            {
                id: 'step5',
                instruction: 'Lancez PostgreSQL Slave 1 (réplique lecture seule)',
                hint: 'Le slave 1 réplique les données du master',
                cmd: 'docker run -d --name pg-slave1 --net db-replication -v pg-slave1-data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=slave123 -e REPLICATION_MODE=slave -e MASTER_HOST=pg-master postgres',
                validation: (state) => state.containers.some(c => c.name === 'pg-slave1')
            },
            {
                id: 'step6',
                instruction: 'Lancez PostgreSQL Slave 2 pour load balancing',
                cmd: 'docker run -d --name pg-slave2 --net db-replication -e POSTGRES_PASSWORD=slave123 -e REPLICATION_MODE=slave -e MASTER_HOST=pg-master postgres',
                validation: (state) => state.containers.some(c => c.name === 'pg-slave2')
            },
            {
                id: 'step7',
                instruction: 'Ajoutez PgBouncer (connection pooler)',
                hint: 'PgBouncer gère les connexions et distribue les requêtes de lecture',
                cmd: 'docker run -d --name pgbouncer --net db-replication -p 6432:6432 -e DB_HOST=pg-master -e DB_READ_HOST=pg-slave1,pg-slave2 postgres',
                validation: (state) => state.containers.some(c => c.name === 'pgbouncer')
            },
            {
                id: 'step8',
                instruction: 'Vérifiez votre architecture de réplication',
                hint: 'Architecture: PgBouncer → Master (écritures) + 2 Slaves (lectures)',
                autoAdvance: false
            }
        ]
    },
    {
        id: 'scenario-etl-pipeline',
        title: '15. Pipeline ETL avec Apache Airflow',
        description: 'Construisez un pipeline de traitement de données complet.',
        difficulty: 'Advanced',
        icon: 'Activity',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez un réseau etl-network',
                cmd: 'docker network create etl-network',
                validation: (state) => state.networks.some(n => n.name === 'etl-network')
            },
            {
                id: 'step2',
                instruction: 'Créez les volumes pour les données',
                cmd: 'docker volume create airflow-dags && docker volume create postgres-data && docker volume create spark-data',
                validation: (state) =>
                    state.volumes.some(v => v.name === 'airflow-dags') &&
                    state.volumes.some(v => v.name === 'postgres-data')
            },
            {
                id: 'step3',
                instruction: 'Lancez PostgreSQL (source de données)',
                hint: 'PostgreSQL contient les données brutes à traiter',
                cmd: 'docker run -d --name etl-source-db --net etl-network -v postgres-data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=source123 postgres',
                validation: (state) => state.containers.some(c => c.name === 'etl-source-db')
            },
            {
                id: 'step4',
                instruction: 'Lancez Apache Airflow (orchestrateur)',
                hint: 'Airflow orchestre les tâches ETL via des DAGs',
                cmd: 'docker run -d --name airflow --net etl-network -v airflow-dags:/opt/airflow/dags -p 8080:8080 -e POSTGRES_HOST=etl-source-db postgres',
                validation: (state) => state.containers.some(c => c.name === 'airflow')
            },
            {
                id: 'step5',
                instruction: 'Lancez Apache Spark (traitement distribué)',
                hint: 'Spark effectue les transformations lourdes sur les données',
                cmd: 'docker run -d --name spark-master --net etl-network -p 7077:7077 -p 8081:8080 alpine',
                validation: (state) => state.containers.some(c => c.name === 'spark-master')
            },
            {
                id: 'step6',
                instruction: 'Lancez un Spark Worker',
                cmd: 'docker run -d --name spark-worker1 --net etl-network -e SPARK_MASTER=spark-master:7077 alpine',
                validation: (state) => state.containers.some(c => c.name === 'spark-worker1')
            },
            {
                id: 'step7',
                instruction: 'Ajoutez Redis (cache pour les transformations)',
                cmd: 'docker run -d --name etl-cache --net etl-network redis',
                validation: (state) => state.containers.some(c => c.name === 'etl-cache')
            },
            {
                id: 'step8',
                instruction: 'Lancez PostgreSQL (data warehouse)',
                hint: 'Le data warehouse stocke les données transformées',
                cmd: 'docker run -d --name etl-warehouse --net etl-network -e POSTGRES_PASSWORD=warehouse123 postgres',
                validation: (state) => state.containers.some(c => c.name === 'etl-warehouse')
            },
            {
                id: 'step9',
                instruction: 'Observez votre pipeline ETL complet',
                hint: 'Flux: Source DB → Airflow → Spark → Cache → Warehouse',
                autoAdvance: false
            }
        ]
    },
    {
        id: 'scenario-event-driven',
        title: '16. Architecture Event-Driven (CQRS)',
        description: 'Implémentez une architecture événementielle avec Kafka et microservices.',
        difficulty: 'Advanced',
        icon: 'Server',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez deux réseaux: frontend-net et backend-net',
                cmd: 'docker network create event-frontend && docker network create event-backend',
                validation: (state) =>
                    state.networks.some(n => n.name === 'event-frontend') &&
                    state.networks.some(n => n.name === 'event-backend')
            },
            {
                id: 'step2',
                instruction: 'Lancez Zookeeper (requis pour Kafka)',
                hint: 'Zookeeper gère la coordination du cluster Kafka',
                cmd: 'docker run -d --name zookeeper --net event-backend -e ZOOKEEPER_CLIENT_PORT=2181 alpine',
                validation: (state) => state.containers.some(c => c.name === 'zookeeper')
            },
            {
                id: 'step3',
                instruction: 'Lancez Kafka (message broker)',
                hint: 'Kafka gère les événements asynchrones entre services',
                cmd: 'docker run -d --name kafka --net event-backend -p 9092:9092 -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092 alpine',
                validation: (state) => state.containers.some(c => c.name === 'kafka')
            },
            {
                id: 'step4',
                instruction: 'Lancez le service Command (écritures)',
                hint: 'Le service Command gère les commandes et publie des événements',
                cmd: 'docker run -d --name command-service --net event-backend -e KAFKA_BOOTSTRAP_SERVERS=kafka:9092 node',
                validation: (state) => state.containers.some(c => c.name === 'command-service')
            },
            {
                id: 'step5',
                instruction: 'Lancez la base Write (PostgreSQL)',
                cmd: 'docker run -d --name write-db --net event-backend -e POSTGRES_PASSWORD=write123 postgres',
                validation: (state) => state.containers.some(c => c.name === 'write-db')
            },
            {
                id: 'step6',
                instruction: 'Lancez le service Query (lectures)',
                hint: 'Le service Query consomme les événements et construit les vues',
                cmd: 'docker run -d --name query-service --net event-backend -e KAFKA_BROKER=kafka:9092 node',
                validation: (state) => state.containers.some(c => c.name === 'query-service')
            },
            {
                id: 'step7',
                instruction: 'Lancez la base Read (MongoDB pour vues matérialisées)',
                cmd: 'docker run -d --name read-db --net event-backend postgres',
                validation: (state) => state.containers.some(c => c.name === 'read-db')
            },
            {
                id: 'step8',
                instruction: 'Connectez le Command Service au frontend',
                cmd: 'docker network connect event-frontend command-service',
                validation: (state) => {
                    const cmd = state.containers.find(c => c.name === 'command-service');
                    return cmd &&
                        cmd.networks.includes('event-frontend') &&
                        cmd.networks.includes('event-backend');
                }
            },
            {
                id: 'step9',
                instruction: 'Connectez le Query Service au frontend',
                cmd: 'docker network connect event-frontend query-service',
                validation: (state) => {
                    const query = state.containers.find(c => c.name === 'query-service');
                    return query &&
                        query.networks.includes('event-frontend') &&
                        query.networks.includes('event-backend');
                }
            },
            {
                id: 'step10',
                instruction: 'Lancez l\'API Gateway sur le frontend',
                cmd: 'docker run -d --name api-gateway --net event-frontend -p 8000:80 nginx',
                validation: (state) => state.containers.some(c => c.name === 'api-gateway')
            },
            {
                id: 'step11',
                instruction: 'Admirez votre architecture CQRS/Event-Sourcing',
                hint: 'Une architecture complexe mais puissante pour la scalabilité',
                autoAdvance: false
            }
        ]
    },
    {
        id: 'scenario-observability',
        title: '17. Stack d\'Observabilité Complète',
        description: 'Déployez Prometheus, Grafana et Loki pour monitorer vos applications.',
        difficulty: 'Advanced',
        icon: 'Activity',
        steps: [
            {
                id: 'step1',
                instruction: 'Créez un réseau monitoring',
                cmd: 'docker network create monitoring',
                validation: (state) => state.networks.some(n => n.name === 'monitoring')
            },
            {
                id: 'step2',
                instruction: 'Créez les volumes de persistence',
                cmd: 'docker volume create prometheus-data && docker volume create grafana-data && docker volume create loki-data',
                validation: (state) =>
                    state.volumes.some(v => v.name === 'prometheus-data') &&
                    state.volumes.some(v => v.name === 'grafana-data')
            },
            {
                id: 'step3',
                instruction: 'Lancez Prometheus (métriques)',
                hint: 'Prometheus collecte et stocke les métriques time-series',
                cmd: 'docker run -d --name prometheus --net monitoring -v prometheus-data:/prometheus -p 9090:9090 alpine',
                validation: (state) => state.containers.some(c => c.name === 'prometheus')
            },
            {
                id: 'step4',
                instruction: 'Lancez Grafana (visualisation)',
                hint: 'Grafana crée des dashboards à partir des données Prometheus',
                cmd: 'docker run -d --name grafana --net monitoring -v grafana-data:/var/lib/grafana -p 3000:3000 -e PROMETHEUS_URL=http://prometheus:9090 alpine',
                validation: (state) => state.containers.some(c => c.name === 'grafana')
            },
            {
                id: 'step5',
                instruction: 'Lancez Loki (logs)',
                hint: 'Loki agrège les logs de tous les conteneurs',
                cmd: 'docker run -d --name loki --net monitoring -v loki-data:/loki -p 3100:3100 alpine',
                validation: (state) => state.containers.some(c => c.name === 'loki')
            },
            {
                id: 'step6',
                instruction: 'Lancez cAdvisor (métriques conteneurs)',
                hint: 'cAdvisor expose les métriques CPU/RAM de chaque conteneur',
                cmd: 'docker run -d --name cadvisor --net monitoring -p 8080:8080 alpine',
                validation: (state) => state.containers.some(c => c.name === 'cadvisor')
            },
            {
                id: 'step7',
                instruction: 'Lancez Node Exporter (métriques système)',
                cmd: 'docker run -d --name node-exporter --net monitoring -p 9100:9100 alpine',
                validation: (state) => state.containers.some(c => c.name === 'node-exporter')
            },
            {
                id: 'step8',
                instruction: 'Lancez AlertManager (alertes)',
                hint: 'AlertManager envoie des notifications quand des seuils sont dépassés',
                cmd: 'docker run -d --name alertmanager --net monitoring -p 9093:9093 alpine',
                validation: (state) => state.containers.some(c => c.name === 'alertmanager')
            },
            {
                id: 'step9',
                instruction: 'Observez votre stack de monitoring complète',
                hint: 'Flux: Apps → Prometheus/Loki → Grafana + AlertManager',
                autoAdvance: false
            }
        ]
    }
];
