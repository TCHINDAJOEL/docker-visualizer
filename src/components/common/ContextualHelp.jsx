import React, { useState } from 'react';
import { HelpCircle, X, Terminal, Box, Network, Database, Activity, Server, BookOpen } from 'lucide-react';

/**
 * Composant d'aide contextuelle qui affiche des informations selon la vue active
 * Fournit des conseils et exemples adaptés au contexte de l'utilisateur
 */
const ContextualHelp = ({ activeView, mode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const helpContent = {
        dashboard: {
            icon: Activity,
            title: 'Vue Topologique',
            description: 'Visualisez vos conteneurs organisés par réseau Docker. Les conteneurs verts sont en cours d\'exécution, les rouges sont arrêtés.',
            tips: [
                'Cliquez sur un conteneur pour voir ses détails',
                'Les réseaux sont représentés par des boîtes bleues',
                'Utilisez le terminal en bas pour créer de nouveaux conteneurs'
            ],
            examples: [
                { cmd: 'docker run nginx', desc: 'Créer un conteneur nginx' },
                { cmd: 'docker ps', desc: 'Lister les conteneurs actifs' }
            ]
        },
        terminal: {
            icon: Terminal,
            title: 'Terminal Docker',
            description: 'Exécutez des commandes Docker comme si vous étiez sur une vraie machine.',
            tips: [
                'Tapez "help" pour voir toutes les commandes',
                'Utilisez Tab pour l\'auto-complétion',
                'Les commandes sont simulées mais fonctionnent comme Docker'
            ],
            examples: [
                { cmd: 'docker run --name web nginx', desc: 'Créer un conteneur nommé' },
                { cmd: 'docker exec -it web bash', desc: 'Se connecter au conteneur' },
                { cmd: 'docker network create mynet', desc: 'Créer un réseau' }
            ]
        },
        containers: {
            icon: Box,
            title: 'Gestion des Conteneurs',
            description: 'Consultez et gérez tous vos conteneurs Docker. Créez, démarrez, arrêtez ou supprimez des conteneurs.',
            tips: [
                'Les conteneurs peuvent être dans plusieurs états: running, exited, paused',
                'Vous pouvez vous connecter à un conteneur running',
                'Les statistiques CPU/RAM sont mises à jour en temps réel'
            ],
            examples: [
                { cmd: 'docker stop <container>', desc: 'Arrêter un conteneur' },
                { cmd: 'docker rm <container>', desc: 'Supprimer un conteneur' },
                { cmd: 'docker logs <container>', desc: 'Voir les logs' }
            ]
        },
        networks: {
            icon: Network,
            title: 'Réseaux Docker',
            description: 'Les réseaux permettent aux conteneurs de communiquer entre eux. Créez des réseaux personnalisés pour isoler vos applications.',
            tips: [
                'Le réseau "bridge" est le réseau par défaut',
                'Les conteneurs sur le même réseau peuvent communiquer',
                'Vous pouvez connecter un conteneur à plusieurs réseaux'
            ],
            examples: [
                { cmd: 'docker network create backend', desc: 'Créer un réseau' },
                { cmd: 'docker network connect backend app', desc: 'Connecter un conteneur' }
            ]
        },
        volumes: {
            icon: Database,
            title: 'Volumes Docker',
            description: 'Les volumes permettent de persister les données au-delà de la vie d\'un conteneur.',
            tips: [
                'Les volumes survivent à la suppression des conteneurs',
                'Partagez des volumes entre plusieurs conteneurs',
                'Utilisez "prune" pour nettoyer les volumes non utilisés'
            ],
            examples: [
                { cmd: 'docker volume create mydata', desc: 'Créer un volume' },
                { cmd: 'docker run -v mydata:/app/data nginx', desc: 'Monter un volume' }
            ]
        },
        scenarios: {
            icon: BookOpen,
            title: 'Scénarios d\'Apprentissage',
            description: 'Suivez des tutoriels guidés pour apprendre Docker étape par étape. Parfait pour les débutants!',
            tips: [
                'Commencez par les scénarios "Beginner"',
                'Chaque étape valide automatiquement vos actions',
                'Les scénarios couvrent les cas d\'usage réels'
            ],
            examples: []
        },
        host: {
            icon: Server,
            title: 'Informations Hôte',
            description: 'Consultez les informations du daemon Docker et du système hôte. Effectuez des opérations de maintenance.',
            tips: [
                'System Prune nettoie les ressources inutilisées',
                'Security Audit vérifie la sécurité de vos conteneurs',
                'Surveillez l\'utilisation CPU/RAM du système'
            ],
            examples: []
        }
    };

    const content = helpContent[activeView] || helpContent.dashboard;
    const Icon = content.icon;

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group"
                title="Aide contextuelle"
            >
                <HelpCircle className="text-white" size={24} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-40 w-96 bg-gradient-to-br from-slate-900 to-slate-800 border border-blue-500/30 rounded-2xl shadow-2xl animate-slideInRight">
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Icon className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{content.title}</h3>
                            <p className="text-xs text-slate-400">Aide contextuelle</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <p className="text-sm text-slate-300 mb-4 leading-relaxed">{content.description}</p>

                {content.tips.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 Astuces</h4>
                        <ul className="space-y-2">
                            {content.tips.map((tip, idx) => (
                                <li key={idx} className="text-sm text-slate-300 flex gap-2">
                                    <span className="text-blue-400">•</span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {content.examples.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-purple-400 mb-2">📝 Exemples</h4>
                        <div className="space-y-2">
                            {content.examples.map((example, idx) => (
                                <div key={idx} className="bg-black/30 rounded-lg p-3 border border-white/5">
                                    <code className="text-xs text-green-400 font-mono block mb-1">{example.cmd}</code>
                                    <p className="text-xs text-slate-400">{example.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {mode === 'beginner' && (
                    <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-xs text-blue-300">
                            🎓 Mode Débutant activé - consultez les Scénarios pour apprendre pas à pas
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContextualHelp;
