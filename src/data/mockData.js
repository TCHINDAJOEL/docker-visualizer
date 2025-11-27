export const MOCK_IMAGES = [
    { id: 'img1', repository: 'ubuntu', tag: 'latest', size: '72MB', layers: 4 },
    { id: 'img2', repository: 'nginx', tag: 'alpine', size: '23MB', layers: 6 },
    { id: 'img3', repository: 'redis', tag: '6.0', size: '104MB', layers: 3 },
    { id: 'img4', repository: 'node', tag: '14-slim', size: '180MB', layers: 8 },
    { id: 'img5', repository: 'postgres', tag: '13', size: '350MB', layers: 5 },
    { id: 'img6', repository: 'wordpress', tag: 'latest', size: '550MB', layers: 12 }
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
