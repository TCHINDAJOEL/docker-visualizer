export const MOCK_IMAGES = [
    {
        id: 'img1',
        repository: 'ubuntu',
        tag: 'latest',
        size: '72MB',
        layers: [
            { id: 'l1', size: '29MB', cmd: '/bin/sh -c #(nop) ADD file:...' },
            { id: 'l2', size: '0B', cmd: '/bin/sh -c #(nop)  CMD ["/bin/bash"]' },
            { id: 'l3', size: '43MB', cmd: '/bin/sh -c apt-get update && apt-get install -y...' },
            { id: 'l4', size: '0B', cmd: '/bin/sh -c #(nop)  ENV LANG=C.UTF-8' }
        ],
        config: {
            env: ['PATH=/usr/local/sbin:/usr/local/bin', 'LANG=C.UTF-8'],
            cmd: ['/bin/bash'],
            entrypoint: null,
            exposedPorts: {},
            volumes: {}
        },
        created: '2023-10-15T08:00:00Z',
        protected: true
    },
    {
        id: 'img2',
        repository: 'nginx',
        tag: 'alpine',
        size: '23MB',
        layers: [
            { id: 'l1', size: '2.5MB', cmd: '/bin/sh -c #(nop) ADD file:alpine-minirootfs...' },
            { id: 'l2', size: '0B', cmd: '/bin/sh -c #(nop)  CMD ["/bin/sh"]' },
            { id: 'l3', size: '18MB', cmd: '/bin/sh -c apk add --no-cache nginx' },
            { id: 'l4', size: '0B', cmd: '/bin/sh -c #(nop)  EXPOSE 80' },
            { id: 'l5', size: '0B', cmd: '/bin/sh -c #(nop)  CMD ["nginx", "-g", "daemon off;"]' }
        ],
        config: {
            env: ['PATH=/usr/local/sbin:/usr/local/bin', 'NGINX_VERSION=1.21.6'],
            cmd: ['nginx', '-g', 'daemon off;'],
            entrypoint: ['/docker-entrypoint.sh'],
            exposedPorts: { '80/tcp': {} },
            volumes: {}
        },
        created: '2023-11-02T10:30:00Z',
        protected: false
    },
    {
        id: 'img3',
        repository: 'redis',
        tag: '6.0',
        size: '104MB',
        layers: [
            { id: 'l1', size: '50MB', cmd: '/bin/sh -c #(nop) ADD file:...' },
            { id: 'l2', size: '54MB', cmd: '/bin/sh -c apt-get update && apt-get install redis...' },
            { id: 'l3', size: '0B', cmd: '/bin/sh -c #(nop)  EXPOSE 6379' }
        ],
        config: {
            env: ['PATH=/usr/local/sbin:/usr/local/bin', 'REDIS_VERSION=6.0.9'],
            cmd: ['redis-server'],
            entrypoint: ['docker-entrypoint.sh'],
            exposedPorts: { '6379/tcp': {} },
            volumes: { '/data': {} }
        },
        created: '2023-09-20T14:15:00Z',
        protected: false
    },
    {
        id: 'img4',
        repository: 'node',
        tag: '14-slim',
        size: '180MB',
        layers: [
            { id: 'l1', size: '40MB', cmd: '/bin/sh -c #(nop) ADD file:...' },
            { id: 'l2', size: '140MB', cmd: '/bin/sh -c apt-get install nodejs...' }
        ],
        config: {
            env: ['PATH=/usr/local/sbin:/usr/local/bin', 'NODE_VERSION=14.17.0'],
            cmd: ['node'],
            entrypoint: ['docker-entrypoint.sh'],
            exposedPorts: {},
            volumes: {}
        },
        created: '2023-08-10T09:45:00Z',
        protected: false
    },
    {
        id: 'img5',
        repository: 'postgres',
        tag: '13',
        size: '350MB',
        layers: [
            { id: 'l1', size: '70MB', cmd: '/bin/sh -c #(nop) ADD file:...' },
            { id: 'l2', size: '280MB', cmd: '/bin/sh -c apt-get install postgresql...' }
        ],
        config: {
            env: ['PATH=/usr/local/sbin:/usr/local/bin', 'PG_MAJOR=13', 'POSTGRES_PASSWORD=secret'],
            cmd: ['postgres'],
            entrypoint: ['docker-entrypoint.sh'],
            exposedPorts: { '5432/tcp': {} },
            volumes: { '/var/lib/postgresql/data': {} }
        },
        created: '2023-10-05T16:20:00Z',
        protected: true
    },
    {
        id: 'img6',
        repository: 'wordpress',
        tag: 'latest',
        size: '550MB',
        layers: [
            { id: 'l1', size: '100MB', cmd: '/bin/sh -c #(nop) ADD file:...' },
            { id: 'l2', size: '450MB', cmd: '/bin/sh -c apt-get install apache2 php...' }
        ],
        config: {
            env: ['PATH=/usr/local/sbin:/usr/local/bin', 'WORDPRESS_VERSION=5.8'],
            cmd: ['apache2-foreground'],
            entrypoint: ['docker-entrypoint.sh'],
            exposedPorts: { '80/tcp': {} },
            volumes: { '/var/www/html': {} }
        },
        created: '2023-11-15T11:10:00Z',
        protected: false
    }
];

export const SCENARIOS = [
    {
        id: 's1',
        title: 'Premier Pas : Hello World',
        steps: [
            { cmd: 'docker run nginx', desc: 'Lancez un conteneur Nginx simple.' },
            { cmd: 'docker ps', desc: 'Vérifiez qu\'il tourne.' },
            { cmd: 'docker stop <id>', desc: 'Arrêtez le conteneur.' }
        ]
    },
    {
        id: 's2',
        title: 'Stack Web : App + DB',
        steps: [
            { cmd: 'docker network create app-net', desc: 'Créez un réseau isolé pour l\'application.' },
            { cmd: 'docker run -d --net app-net --name db redis', desc: 'Lancez la base de données sur le réseau.' },
            { cmd: 'docker run -d --net app-net --name web node', desc: 'Lancez l\'application connectée au même réseau.' }
        ]
    }
];
