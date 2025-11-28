import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowRight, Box, Layers, Shield, Globe } from 'lucide-react';

const LandingPage = ({ onEnter }) => {
    const { t, toggleLanguage, language } = useLanguage();

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30 flex flex-col">

            {/* Header */}
            <header className="fixed top-0 w-full z-50 glass border-b-0">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Box className="text-white" size={20} />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            {t('appName')}
                        </span>
                    </div>
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium"
                    >
                        <Globe size={14} />
                        <span className="uppercase">{language}</span>
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-10 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] -z-10 animate-pulse duration-[10000ms]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] -z-10 animate-pulse duration-[10000ms] delay-1000"></div>

                <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                        {t('landingTitle')}
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
                        {t('landingSubtitle')}
                    </p>

                    <div className="pt-8">
                        <button
                            onClick={onEnter}
                            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-semibold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                        >
                            {t('enterApp')}
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full px-4">
                    <FeatureCard
                        icon={<Box className="text-blue-400" />}
                        title={t('featureVisualizer')}
                        desc={t('featureVisualizerDesc')}
                    />
                    <FeatureCard
                        icon={<Layers className="text-purple-400" />}
                        title={t('featureScenarios')}
                        desc={t('featureScenariosDesc')}
                    />
                    <FeatureCard
                        icon={<Shield className="text-green-400" />}
                        title={t('featureSecurity')}
                        desc={t('featureSecurityDesc')}
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 text-center text-zinc-600 text-sm">
                <p>&copy; 2024 Docker Visualizer. Designed for Engineers.</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 group cursor-default border border-white/5 hover:border-white/20">
        <div className="mb-4 p-3 bg-zinc-900/50 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300 border border-white/5">
            {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-zinc-100">{title}</h3>
        <p className="text-zinc-400 leading-relaxed">{desc}</p>
    </div>
);

export default LandingPage;
