import React, { useState, useCallback } from 'react';
import { AppState, AgentState, AgentName, AgentStatus, VideoPlan } from './types';
import * as geminiService from './services/geminiService';
import { SparklesIcon, XCircleIcon, CheckCircleIcon } from './components/icons';
import LoadingSpinner from './components/LoadingSpinner';
import ReportView from './components/ReportView';

const INITIAL_AGENTS: AgentState[] = [
    { name: AgentName.CONTEXT_GATHERER, status: AgentStatus.PENDING, description: "Researching topic or analyzing reference URL." },
    { name: AgentName.SCRIPT_WRITER, status: AgentStatus.PENDING, description: "Crafting an engaging and structured video script." },
    { name: AgentName.SEO_AGENT, status: AgentStatus.PENDING, description: "Generating optimized title, description, and tags." },
    { name: AgentName.THUMBNAIL_ARTIST, status: AgentStatus.PENDING, description: "Designing two high-impact thumbnail concepts." },
    { name: AgentName.REPORT_WRITER, status: AgentStatus.PENDING, description: "Compiling production recommendations." },
];

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.INPUT);
    const [inputType, setInputType] = useState<'topic' | 'url'>('topic');
    const [inputValue, setInputValue] = useState('');
    const [tone, setTone] = useState('Educational');
    const [targetAudience, setTargetAudience] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
    const [videoPlan, setVideoPlan] = useState<VideoPlan | null>(null);

    const updateAgentStatus = (name: AgentName, status: AgentStatus, result?: string) => {
        setAgents(prev => prev.map(agent => 
            agent.name === name ? { ...agent, status, result } : agent
        ));
    };

    const handleAnalyze = async () => {
        if (!inputValue || !targetAudience) {
            setError("Please provide a topic/URL and a target audience.");
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
            updateAgentStatus(AgentName.REPORT_WRITER, AgentStatus.DONE, "Report compiled.");
            setAppState(AppState.REPORT);

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Analysis failed: ${errorMessage}`);
            setAppState(AppState.ERROR);
            // Also mark the current working agent as error
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
                    <div className="w-full max-w-2xl mx-auto">
                        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
                             {error && (
                                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center">
                                    <XCircleIcon className="h-5 w-5 mr-3" />
                                    <span>{error}</span>
                                </div>
                            )}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">What's your video about?</label>
                                    <div className="flex rounded-md shadow-sm">
                                        <button 
                                            onClick={() => setInputType('topic')} 
                                            className={`px-4 py-2 border border-gray-600 rounded-l-md text-sm font-medium transition ${inputType === 'topic' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                            Topic
                                        </button>
                                        <button 
                                            onClick={() => setInputType('url')} 
                                            className={`px-4 py-2 border border-l-0 border-gray-600 rounded-r-md text-sm font-medium transition ${inputType === 'url' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                            Similar URL
                                        </button>
                                    </div>
                                    <input 
                                      type={inputType === 'url' ? 'url' : 'text'}
                                      value={inputValue}
                                      onChange={e => setInputValue(e.target.value)}
                                      placeholder={inputType === 'topic' ? "e.g., 'How to Bake Sourdough Bread'" : "https://www.youtube.com/watch?v=..."}
                                      className="mt-2 w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="tone" className="block text-sm font-medium text-gray-300 mb-1">Desired Tone</label>
                                        <select id="tone" value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                                            <option>Educational</option>
                                            <option>Entertaining</option>
                                            <option>Inspirational</option>
                                            <option>Humorous</option>
                                            <option>Professional</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="audience" className="block text-sm font-medium text-gray-300 mb-1">Target Audience</label>
                                        <input type="text" id="audience" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="e.g., 'Beginner bakers'" className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <button onClick={handleAnalyze} disabled={!inputValue || !targetAudience} className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out shadow-lg">
                                    <SparklesIcon className="w-5 h-5" />
                                    <span>Generate Video Plan</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case AppState.LOADING:
                return (
                    <div className="w-full max-w-2xl mx-auto">
                        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
                            <h2 className="text-2xl font-bold text-center mb-2">AI Agent Swarm is Working...</h2>
                            <p className="text-center text-gray-400 mb-8">Your video plan is being generated by our team of specialized AI agents.</p>
                            <div className="space-y-4">
                                {agents.map(agent => (
                                    <div key={agent.name} className="flex items-start p-4 bg-gray-900/50 rounded-lg">
                                        <div className="mr-4 mt-1">
                                            {agent.status === AgentStatus.WORKING && <LoadingSpinner />}
                                            {agent.status === AgentStatus.DONE && <CheckCircleIcon className="h-6 w-6 text-green-400" />}
                                            {agent.status === AgentStatus.PENDING && <div className="h-6 w-6 rounded-full border-2 border-gray-500"></div>}
                                            {agent.status === AgentStatus.ERROR && <XCircleIcon className="h-6 w-6 text-red-400" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{agent.name}</p>
                                            <p className="text-sm text-gray-400">{agent.description}</p>
                                            <p className="text-sm font-mono mt-1 text-indigo-400">{agent.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case AppState.REPORT:
                 if (!videoPlan) {
                    setError("Failed to generate video plan.");
                    setAppState(AppState.ERROR);
                    return null;
                }
                return <ReportView videoPlan={videoPlan} onReset={handleReset} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">Video SEO Optimizer</h1>
                <p className="mt-2 text-lg text-gray-400 max-w-3xl mx-auto">Leverage a swarm of AI agents to generate a complete, optimized video plan from a single idea.</p>
            </div>
            <main>
                {renderContent()}
            </main>
        </div>
    );
};

export default App;