import React, { useState, useEffect, useMemo } from 'react';
import { AppState, AgentState, AgentName, AgentStatus, VideoPlan } from './types';
import * as geminiService from './services/geminiService';
import { SparklesIcon, XCircleIcon, CheckCircleIcon, SunIcon, MoonIcon, SearchIcon, DocumentTextIcon, TrendingUpIcon, PhotographIcon } from './components/icons';
import LoadingSpinner from './components/LoadingSpinner';
import ReportView from './components/ReportView';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_AGENTS: AgentState[] = [
    { 
        name: AgentName.CONTEXT_GATHERER, 
        status: AgentStatus.PENDING, 
        description: "Synthesizing cross-platform metadata and analyzing semantic structures to establish a robust research foundation." 
    },
    { 
        name: AgentName.SCRIPT_WRITER, 
        status: AgentStatus.PENDING, 
        description: "Architecting a multi-layered narrative framework, balancing intellectual depth with audience retention protocols." 
    },
    { 
        name: AgentName.SEO_AGENT, 
        status: AgentStatus.PENDING, 
        description: "Optimizing discoverability matrices through high-frequency keyword derivation and semantic resonance calculation." 
    },
    { 
        name: AgentName.THUMBNAIL_ARTIST, 
        status: AgentStatus.PENDING, 
        description: "Conceptualizing high-impact visual artifacts designed to trigger cognitive engagement and curiosity." 
    },
    { 
        name: AgentName.REPORT_WRITER, 
        status: AgentStatus.PENDING, 
        description: "Finalizing the strategic dossier by distilling cross-agent insights into actionable executive-level recommendations." 
    },
];

const Header = ({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-4 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md border-b border-brand-gold/10' : 'py-8'}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border border-brand-gold flex items-center justify-center text-brand-gold font-serif italic text-xl">V</div>
                    <span className="font-serif font-bold text-xl tracking-tight text-stone-850 dark:text-offWhite">VIDSEO</span>
                </div>
                
                <nav className="hidden md:flex items-center gap-8">
                    {['Intelligence', 'Protocols', 'Archive'].map((item) => (
                        <a key={item} href="#" className="text-[10px] uppercase tracking-[0.3em] font-medium text-stone-500 hover:text-brand-gold transition-colors">{item}</a>
                    ))}
                </nav>

                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full border border-stone-200 dark:border-stone-800 text-stone-400 hover:border-brand-gold hover:text-brand-gold transition-all"
                >
                    {theme === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
                </button>
            </div>
        </header>
    );
};

const FeaturePill = ({ active, icon: Icon, label }: { active: boolean; icon: any; label: string }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col items-center gap-3 p-6 rounded-none border-r border-stone-200 dark:border-stone-800 last:border-0 transition-all duration-500 ${active ? 'bg-brand-gold/5' : ''}`}
    >
        <div className={`transition-colors duration-500 ${active ? 'text-brand-gold' : 'text-stone-300 dark:text-stone-700'}`}>
            <Icon className="w-5 h-5" />
        </div>
        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] transition-colors duration-500 ${active ? 'text-brand-gold' : 'text-stone-400 dark:text-stone-600'}`}>
            {label}
        </span>
    </motion.div>
);

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.INPUT);
    const [inputType, setInputType] = useState<'topic' | 'url'>('topic');
    const [inputValue, setInputValue] = useState('');
    const [tone, setTone] = useState('Professional');
    const [targetAudience, setTargetAudience] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
    const [videoPlan, setVideoPlan] = useState<VideoPlan | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const progressPercent = useMemo(() => {
        const doneCount = agents.filter(a => a.status === AgentStatus.DONE).length;
        return (doneCount / agents.length) * 100;
    }, [agents]);

    const handleAnalyze = async () => {
        if (!inputValue || !targetAudience) {
            setError("Required parameters for synthesis are missing.");
            return;
        }
        setAppState(AppState.LOADING);
        setError(null);
        setAgents(INITIAL_AGENTS);

        try {
            const plan = await geminiService.generateVideoPlan(
                inputType,
                inputValue,
                tone,
                targetAudience,
                (name, status, result) => {
                    setAgents(prev => prev.map(a => a.name === name ? { ...a, status, result } : a));
                }
            );
            setVideoPlan(plan);
            setAppState(AppState.REPORT);
        } catch (err) {
            setError(err instanceof Error ? err.message : "A system failure has occurred.");
            setAppState(AppState.ERROR);
        }
    };

    const renderInput = () => (
        <div className="w-full max-w-4xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
            >
                <span className="text-brand-gold font-mono text-[10px] tracking-[0.4em] uppercase mb-4 block">Quantum Content Analysis</span>
                <h2 className="text-6xl md:text-8xl font-serif font-bold text-stone-850 dark:text-offWhite mb-6 leading-tight">
                    Refine your <br /> <span className="italic">intellectual</span> vision.
                </h2>
                <p className="text-stone-500 dark:text-stone-400 font-sans text-lg max-w-xl mx-auto leading-relaxed">
                    Harness a swarm of Gemini researchers to transform simple concepts into prestigious video artifacts.
                </p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden"
            >
                <div className="flex border-b border-stone-100 dark:border-stone-800">
                    <button 
                        onClick={() => setInputType('topic')}
                        className={`flex-1 py-6 text-[10px] tracking-[0.2em] font-bold font-mono transition-all ${inputType === 'topic' ? 'text-brand-gold bg-cream dark:bg-stone-900 border-b-2 border-brand-gold' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'}`}
                    >
                        [ CONCEPT ]
                    </button>
                    <button 
                        onClick={() => setInputType('url')}
                        className={`flex-1 py-6 text-[10px] tracking-[0.2em] font-bold font-mono transition-all ${inputType === 'url' ? 'text-brand-gold bg-cream dark:bg-stone-900 border-b-2 border-brand-gold' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'}`}
                    >
                        [ REFERENCE URL ]
                    </button>
                </div>

                <div className="p-10 space-y-10">
                    <div className="relative">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-mono text-stone-400 mb-2 block">
                            {inputType === 'topic' ? 'Research Topic' : 'Source Archive URL'}
                        </label>
                        <input 
                            type="text"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            placeholder={inputType === 'topic' ? "Quantum mechanics applied to storytelling..." : "https://archive.youtube.com/..."}
                            className="w-full bg-transparent border-b border-stone-200 dark:border-stone-700 py-4 text-2xl font-serif text-stone-850 dark:text-offWhite focus:border-brand-gold outline-none transition-colors placeholder:text-stone-200 dark:placeholder:text-stone-800"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-mono text-stone-400 mb-2 block">Intellectual Tone</label>
                            <select 
                                value={tone} 
                                onChange={e => setTone(e.target.value)}
                                className="w-full bg-transparent border-b border-stone-200 dark:border-stone-700 py-3 font-sans text-stone-700 dark:text-stone-300 outline-none focus:border-brand-gold appearance-none"
                            >
                                <option>Professional</option>
                                <option>Academic</option>
                                <option>Cinematic</option>
                                <option>Investigative</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-mono text-stone-400 mb-2 block">Target Audience</label>
                            <input 
                                type="text"
                                value={targetAudience}
                                onChange={e => setTargetAudience(e.target.value)}
                                placeholder="Post-doctoral scholars..."
                                className="w-full bg-transparent border-b border-stone-200 dark:border-stone-700 py-3 font-sans text-stone-700 dark:text-stone-300 outline-none focus:border-brand-gold"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            onClick={handleAnalyze}
                            className="w-full bg-stone-850 dark:bg-offWhite text-white dark:text-stone-900 py-6 px-10 font-serif font-bold text-xl hover:bg-brand-gold dark:hover:bg-brand-gold dark:hover:text-white transition-all group flex items-center justify-center gap-4"
                        >
                            Begin Synthesis
                            <SparklesIcon className="w-5 h-5 text-brand-gold group-hover:text-white" />
                        </button>
                    </div>
                    
                    {error && (
                        <p className="text-center font-mono text-[10px] text-red-500 uppercase tracking-widest">{error}</p>
                    )}
                </div>
                
                <div className="grid grid-cols-4 border-t border-stone-100 dark:border-stone-800">
                    <FeaturePill active={false} icon={SearchIcon} label="Research" />
                    <FeaturePill active={false} icon={DocumentTextIcon} label="Drafting" />
                    <FeaturePill active={false} icon={TrendingUpIcon} label="SEO" />
                    <FeaturePill active={false} icon={PhotographIcon} label="Visuals" />
                </div>
            </motion.div>
        </div>
    );

    const renderLoading = () => (
        <div className="w-full max-w-3xl mx-auto pt-20">
            <div className="bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800 shadow-2xl relative overflow-hidden">
                {/* Horizontal Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-stone-100 dark:bg-stone-900">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="h-full bg-brand-gold shadow-[0_0_10px_#C5A059]"
                    />
                </div>

                <div className="p-12">
                    <div className="flex flex-col items-center mb-12">
                        <div className="mb-6 relative">
                            <LoadingSpinner size="h-16 w-16" />
                            <SparklesIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-brand-gold/50" />
                        </div>
                        <h3 className="text-3xl font-serif italic text-stone-850 dark:text-offWhite">Orchestrating the swarm...</h3>
                        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-stone-400 mt-4">Research Protocol In Progress</p>
                    </div>

                    {/* Miniature Swarm Visualization */}
                    <div className="flex justify-center gap-8 mb-16">
                        {agents.map((agent, i) => {
                            const isWorking = agent.status === AgentStatus.WORKING;
                            const isDone = agent.status === AgentStatus.DONE;
                            return (
                                <div key={`node-${i}`} className="flex flex-col items-center gap-3">
                                    <motion.div 
                                        animate={isWorking ? { 
                                            scale: [1, 1.2, 1],
                                            boxShadow: [
                                                "0 0 0px #C5A059",
                                                "0 0 15px #EF4444",
                                                "0 0 15px #3B82F6",
                                                "0 0 15px #22C55E",
                                                "0 0 0px #C5A059"
                                            ]
                                        } : {}}
                                        transition={isWorking ? { repeat: Infinity, duration: 2 } : {}}
                                        className={`w-4 h-4 rounded-full border-2 transition-all duration-700 ${
                                            isDone ? 'bg-brand-gold border-brand-gold' : 
                                            isWorking ? 'border-brand-gold scale-110' : 
                                            'bg-transparent border-stone-200 dark:border-stone-700'
                                        }`}
                                    />
                                    <span className={`text-[8px] font-mono tracking-tighter uppercase transition-colors duration-500 ${isWorking || isDone ? 'text-brand-gold' : 'text-stone-300'}`}>
                                        Node_{i+1}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Detailed List with Elaborate Descriptions */}
                    <div className="space-y-6">
                        {agents.map((agent, i) => (
                            <motion.div 
                                key={agent.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-6 p-6 border border-stone-100 dark:border-stone-800 relative group overflow-hidden"
                            >
                                {/* Rainbow Flow Background for active agent */}
                                {agent.status === AgentStatus.WORKING && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.05 }}
                                        className="absolute inset-0 z-0 bg-gradient-to-r from-red-500 via-blue-500 to-green-500 bg-[length:200%_auto]"
                                        style={{
                                            animation: 'rainbow-flow 3s linear infinite'
                                        }}
                                    />
                                )}

                                <div className="w-6 flex justify-center z-10 shrink-0">
                                    {agent.status === AgentStatus.WORKING ? <div className="w-2 h-2 rounded-full bg-brand-gold animate-ping" /> : 
                                     agent.status === AgentStatus.DONE ? <CheckCircleIcon className="w-5 h-5 text-brand-gold" /> : 
                                     <div className="w-2 h-2 rounded-full bg-stone-200 dark:bg-stone-700" />}
                                </div>
                                <div className="flex-1 z-10">
                                    <span className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-stone-850 dark:text-offWhite block mb-1">{agent.name}</span>
                                    <p className="text-[10px] font-sans text-stone-500 dark:text-stone-400 leading-relaxed italic">{agent.description}</p>
                                </div>
                                <div className="shrink-0 text-right z-10">
                                    <span className={`text-[9px] font-mono uppercase tracking-widest transition-colors ${agent.status === AgentStatus.WORKING ? 'text-brand-gold font-bold' : 'text-stone-400'}`}>
                                        {agent.status === AgentStatus.WORKING ? 'Synthesizing...' : agent.status}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Visual injection for rainbow flow animation */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes rainbow-flow {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
            `}} />
        </div>
    );

    return (
        <div className="min-h-screen relative flex flex-col pt-32 pb-20">
            <div className="fixed inset-0 bg-academic-grid dark:bg-academic-grid-dark bg-grid opacity-20 pointer-events-none" />
            <Header theme={theme} toggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} />
            
            <main className="relative z-10 px-6">
                <AnimatePresence mode="wait">
                    {appState === AppState.INPUT || appState === AppState.ERROR ? (
                        <motion.div key="input" exit={{ opacity: 0, y: -20 }}>{renderInput()}</motion.div>
                    ) : appState === AppState.LOADING ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{renderLoading()}</motion.div>
                    ) : (
                        <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <ReportView videoPlan={videoPlan!} onReset={() => setAppState(AppState.INPUT)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default App;
