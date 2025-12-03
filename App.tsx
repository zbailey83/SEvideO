import React, { useState, useEffect } from 'react';
import { AppState, AgentState, AgentName, AgentStatus, VideoPlan } from './types';
import * as geminiService from './services/geminiService';
import { SparklesIcon, XCircleIcon, CheckCircleIcon, SunIcon, MoonIcon, SearchIcon, DocumentTextIcon, TrendingUpIcon, PhotographIcon } from './components/icons';
import LoadingSpinner from './components/LoadingSpinner';
import ReportView from './components/ReportView';

const INITIAL_AGENTS: AgentState[] = [
    { name: AgentName.CONTEXT_GATHERER, status: AgentStatus.PENDING, description: "Initializing research protocols..." },
    { name: AgentName.SCRIPT_WRITER, status: AgentStatus.PENDING, description: "Synthesizing narrative structure..." },
    { name: AgentName.SEO_AGENT, status: AgentStatus.PENDING, description: "Optimizing metadata vectors..." },
    { name: AgentName.THUMBNAIL_ARTIST, status: AgentStatus.PENDING, description: "Rendering visual concepts..." },
    { name: AgentName.REPORT_WRITER, status: AgentStatus.PENDING, description: "Compiling final production artifacts..." },
];

const FeaturePill = ({ 
    active, 
    icon: Icon, 
    label 
}: { 
    active: boolean; 
    icon: any; 
    label: string 
}) => (
    <div className="relative group cursor-default">
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 rounded-xl blur opacity-0 transition-opacity duration-500 ${active ? 'opacity-70 animate-pulse' : 'group-hover:opacity-30'}`}></div>
        <div className="relative flex items-center gap-3 px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-black shadow-md transition-all duration-300 h-full bg-white dark:bg-zinc-950">
            <div className={`p-2 rounded-full transition-colors ${active ? 'bg-primary-500/20' : 'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-primary-500/20'}`}>
                <Icon className={`w-4 h-4 transition-colors ${active ? 'text-primary-500' : 'text-primary-500'}`} />
            </div>
            <span className={`text-[11px] font-mono font-bold uppercase tracking-wider transition-colors ${active ? 'text-primary-600 dark:text-primary-400' : 'text-zinc-600 dark:text-zinc-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'}`}>
                {label}
            </span>
        </div>
    </div>
);

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.INPUT);
    const [inputType, setInputType] = useState<'topic' | 'url'>('topic');
    const [inputValue, setInputValue] = useState('');
    const [tone, setTone] = useState('Educational');
    const [targetAudience, setTargetAudience] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
    const [videoPlan, setVideoPlan] = useState<VideoPlan | null>(null);

    // Theme state
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const updateAgentStatus = (name: AgentName, status: AgentStatus, result?: string) => {
        setAgents(prev => prev.map(agent => 
            agent.name === name ? { ...agent, status, result } : agent
        ));
    };

    const isAgentWorking = (name: AgentName) => agents.find(a => a.name === name)?.status === AgentStatus.WORKING;

    const handleAnalyze = async () => {
        if (!inputValue || !targetAudience) {
            setError("Input parameters missing.");
            return;
        }
        setAppState(AppState.LOADING);
        setError(null);
        setAgents(INITIAL_AGENTS);

        const progressCallback = (agentName: AgentName, status: AgentStatus, result?: string) => {
            updateAgentStatus(agentName, status, result);
        };

        try {
            const plan = await geminiService.generateVideoPlan(
                inputType,
                inputValue,
                tone,
                targetAudience,
                progressCallback
            );
            
            setVideoPlan(plan);
            updateAgentStatus(AgentName.REPORT_WRITER, AgentStatus.DONE, "Artifacts compiled.");
            setAppState(AppState.REPORT);

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Unknown system failure.";
            setError(`Analysis failed: ${errorMessage}`);
            setAppState(AppState.ERROR);
             setAgents(prev => prev.map(agent => 
                agent.status === AgentStatus.WORKING ? { ...agent, status: AgentStatus.ERROR } : agent
            ));
        }
    };
    
    const handleReset = () => {
        setAppState(AppState.INPUT);
        setInputValue('');
        setTargetAudience('');
        setError(null);
        setVideoPlan(null);
    };

    const renderContent = () => {
        switch (appState) {
            case AppState.INPUT:
            case AppState.ERROR:
                return (
                    <div className="w-full max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-500 relative group">
                        {/* Technical Card with Glowing Rainbow Border */}
                        
                        {/* Default Rainbow Glow (Visible by default, fades out on hover) */}
                        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 opacity-20 blur transition-opacity duration-500 group-hover:opacity-0 animate-pulse"></div>
                        
                        {/* Green Hover Glow (Hidden by default, fades in on hover) */}
                        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary-500 via-emerald-400 to-primary-600 opacity-0 blur transition-opacity duration-500 group-hover:opacity-40 animate-pulse"></div>
                        
                        <div className="relative rounded-xl overflow-hidden p-[1px]">
                             {/* Rainbow Spinner (Default) */}
                             <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#EF4444_0%,#F59E0B_14%,#FCD34D_28%,#10B981_42%,#3B82F6_57%,#6366F1_71%,#8B5CF6_85%,#EF4444_100%)] transition-opacity duration-500 group-hover:opacity-0" />
                             
                             {/* Green Spinner (Hover) */}
                             <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#10b981_0%,#34d399_50%,#059669_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                             
                             <div className="bg-white dark:bg-zinc-950 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden relative transition-colors duration-300 h-full">
                                 {/* Top highlight line */}
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>

                                <div className="p-8 relative z-10 bg-white/90 dark:bg-zinc-950/90">
                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 px-4 py-3 rounded mb-6 flex items-center text-sm font-mono">
                                            <XCircleIcon className="h-4 w-4 mr-3 flex-shrink-0" />
                                            <span>ERROR: {error}</span>
                                        </div>
                                    )}

                                    <div className="space-y-8">
                                        {/* Input Type Selector */}
                                        <div>
                                            <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">Input Source</label>
                                            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800/50 transition-colors duration-300">
                                                <button 
                                                    onClick={() => setInputType('topic')} 
                                                    className={`flex-1 py-2 text-xs font-mono font-medium rounded-md transition-all duration-200 ${inputType === 'topic' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                                                    TOPIC
                                                </button>
                                                <button 
                                                    onClick={() => setInputType('url')} 
                                                    className={`flex-1 py-2 text-xs font-mono font-medium rounded-md transition-all duration-200 ${inputType === 'url' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                                                    REFERENCE URL
                                                </button>
                                            </div>
                                        </div>

                                        {/* Main Input */}
                                        <div>
                                             <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
                                                {inputType === 'topic' ? 'Video Topic' : 'Source URL'}
                                             </label>
                                             <div className="relative group/input">
                                                <input 
                                                    type={inputType === 'url' ? 'url' : 'text'}
                                                    value={inputValue}
                                                    onChange={e => setInputValue(e.target.value)}
                                                    placeholder={inputType === 'topic' ? "e.g., Quantum Computing Basics" : "https://youtube.com/..."}
                                                    className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-700 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all font-mono text-sm" 
                                                />
                                             </div>
                                        </div>
                                        
                                        {/* Config Grid */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="tone" className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Tone Matrix</label>
                                                <div className="relative">
                                                    <select 
                                                        id="tone" 
                                                        value={tone} 
                                                        onChange={e => setTone(e.target.value)} 
                                                        className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-zinc-300 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none font-mono text-sm"
                                                    >
                                                        <option>Educational</option>
                                                        <option>Entertaining</option>
                                                        <option>Inspirational</option>
                                                        <option>Humorous</option>
                                                        <option>Professional</option>
                                                        <option>Analytical</option>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="audience" className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Target Segment</label>
                                                <input 
                                                    type="text" 
                                                    id="audience" 
                                                    value={targetAudience} 
                                                    onChange={e => setTargetAudience(e.target.value)} 
                                                    placeholder="e.g. Tech Enthusiasts" 
                                                    className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-700 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all font-mono text-sm" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10">
                                        <button 
                                            onClick={handleAnalyze} 
                                            disabled={!inputValue || !targetAudience} 
                                            className="w-full group/btn relative overflow-hidden flex justify-center items-center gap-3 bg-primary-600 hover:bg-primary-500 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] border border-primary-400/20"
                                        >
                                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-0 group-hover/btn:opacity-20 transition-opacity"></div>
                                            <SparklesIcon className="w-4 h-4 relative z-10" />
                                            <span className="font-mono tracking-wide relative z-10">INITIATE SEQUENCE</span>
                                        </button>
                                    </div>
                                </div>
                                 {/* Decorative bottom code */}
                                 <div className="bg-zinc-50 dark:bg-zinc-950/90 border-t border-zinc-200 dark:border-zinc-800 p-3 flex justify-between items-center text-[10px] text-zinc-500 dark:text-zinc-600 font-mono transition-colors duration-300 relative z-10">
                                    <span>SYS.VER.2.5.0</span>
                                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary-500/50 animate-pulse"></span> ONLINE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case AppState.LOADING:
                return (
                    <div className="w-full max-w-xl mx-auto">
                        <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-2xl transition-colors duration-300">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800/50">
                                <h2 className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">PROCESSING REQ-ID: {Math.floor(Math.random() * 10000)}</h2>
                                <LoadingSpinner />
                            </div>
                            
                            <div className="space-y-2 font-mono text-sm">
                                {agents.map((agent, index) => (
                                    <div key={agent.name} className={`relative overflow-hidden group flex items-center p-3 rounded border transition-all duration-500 ${
                                        agent.status === AgentStatus.WORKING || agent.status === AgentStatus.DONE 
                                            ? 'border-primary-200 dark:border-primary-900/50' 
                                            : 'border-zinc-200 dark:border-zinc-800/50'
                                    }`}>
                                        {/* Progress Bar Background */}
                                        <div 
                                            className={`absolute inset-0 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 transition-transform origin-left z-0 ${
                                                agent.status === AgentStatus.PENDING ? 'scale-x-0' :
                                                agent.status === AgentStatus.WORKING ? 'scale-x-[0.8] duration-[8000ms] ease-out' : 
                                                'scale-x-100 duration-500 ease-out'
                                            }`} 
                                        />

                                        <div className="relative z-10 mr-4 w-6 flex justify-center">
                                            {agent.status === AgentStatus.WORKING && <LoadingSpinner size="h-3 w-3" />}
                                            {agent.status === AgentStatus.DONE && <CheckCircleIcon className="h-4 w-4 text-primary-600 dark:text-primary-500" />}
                                            {agent.status === AgentStatus.PENDING && <div className="h-1.5 w-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>}
                                            {agent.status === AgentStatus.ERROR && <XCircleIcon className="h-4 w-4 text-red-500" />}
                                        </div>
                                        <div className="relative z-10 flex-1 flex justify-between items-center">
                                            <span className="text-xs font-bold tracking-wide uppercase text-zinc-700 dark:text-zinc-300">{agent.name}</span>
                                            <span className={`text-[10px] uppercase tracking-widest ${
                                                agent.status === AgentStatus.WORKING ? 'text-primary-600 dark:text-primary-400 animate-pulse' : 
                                                agent.status === AgentStatus.DONE ? 'text-primary-600 dark:text-primary-500' : 'text-zinc-500 dark:text-zinc-600'
                                            }`}>
                                                {agent.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800/50">
                                <p className="text-center text-xs font-mono text-zinc-500 dark:text-zinc-600 animate-pulse">
                                    &gt; GEMINI AGENT SWARM SYNCHRONIZED...
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case AppState.REPORT:
                 if (!videoPlan) {
                    return null;
                }
                return <ReportView videoPlan={videoPlan} onReset={handleReset} />;
        }
    };

    return (
        <div className="min-h-screen w-full relative">
             {/* Background Grid */}
             <div className="fixed inset-0 bg-technical-grid dark:bg-technical-grid-dark bg-grid opacity-40 dark:opacity-20 pointer-events-none z-0 transition-colors duration-300"></div>
             
             {/* Main Layout */}
            <div className="relative z-10 p-6 lg:p-12 flex flex-col items-center justify-start min-h-screen">
                <header className="w-full max-w-[1400px] flex flex-col items-center relative mb-16 animate-in slide-in-from-top-10 duration-700 fade-in">
                     {/* Theme Toggle */}
                    <div className="absolute right-0 top-0 z-20">
                        <button 
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-lg hover:scale-105 transition-all text-zinc-600 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400"
                            title="Toggle Theme"
                        >
                            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="inline-flex items-center justify-center mb-4 relative">
                        <div className="absolute inset-0 bg-primary-500 blur-[40px] opacity-20 rounded-full"></div>
                        <h1 className="text-5xl md:text-7xl font-mono font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-500 relative z-10 select-none">
                            VIDSEO🎥 
                        </h1>
                    </div>
                    <p className="text-zinc-500 font-mono text-xs md:text-sm tracking-[0.2em] uppercase mb-8 text-center max-w-lg mx-auto leading-relaxed">
                        Content Production Agent Swarm
                    </p>

                    {/* Feature Bullet Points - Enhanced Style with Rainbow Glow */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl">
                        <FeaturePill 
                            active={isAgentWorking(AgentName.CONTEXT_GATHERER)} 
                            icon={SearchIcon} 
                            label="Context Research" 
                        />
                        <FeaturePill 
                            active={isAgentWorking(AgentName.SCRIPT_WRITER)} 
                            icon={DocumentTextIcon} 
                            label="Viral Scripting" 
                        />
                        <FeaturePill 
                            active={isAgentWorking(AgentName.SEO_AGENT)} 
                            icon={TrendingUpIcon} 
                            label="SEO Optimization" 
                        />
                        <FeaturePill 
                            active={isAgentWorking(AgentName.THUMBNAIL_ARTIST)} 
                            icon={PhotographIcon} 
                            label="Visual Assets" 
                        />
                    </div>
                </header>
                
                <main className="w-full relative z-10">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;