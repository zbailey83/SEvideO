import React, { useState, useCallback } from 'react';
import { AppState, AgentState, AgentName, AgentStatus, AnalysisReport, SeoCopy, GeneratedThumbnail } from './types';
import * as geminiService from './services/geminiService';
import { SparklesIcon, XCircleIcon, CheckCircleIcon } from './components/icons';
import LoadingSpinner from './components/LoadingSpinner';
import ReportView from './components/ReportView';

const INITIAL_AGENTS: AgentState[] = [
    { name: AgentName.VIDEO_ANALYZER, status: AgentStatus.PENDING, description: "Analyzes video URL for visual appeal and pacing." },
    { name: AgentName.TRANSCRIPT_ANALYZER, status: AgentStatus.PENDING, description: "Evaluates the script for clarity, engagement, and keywords." },
    { name: AgentName.SEO_AGENT, status: AgentStatus.PENDING, description: "Researches trends to generate optimized titles, tags, etc." },
    { name: AgentName.REPORT_WRITER, status: AgentStatus.PENDING, description: "Synthesizes all data into a final, actionable report." },
];

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.INPUT);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [transcript, setTranscript] = useState('');
    const [topic, setTopic] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
    const [report, setReport] = useState<AnalysisReport | null>(null);
    const [seoCopy, setSeoCopy] = useState<SeoCopy | null>(null);
    const [thumbnails, setThumbnails] = useState<GeneratedThumbnail[]>([]);

    const updateAgentStatus = (name: AgentName, status: AgentStatus, result?: string) => {
        setAgents(prev => prev.map(agent => 
            agent.name === name ? { ...agent, status, result } : agent
        ));
    };

    const handleAnalyze = async () => {
        if (!youtubeUrl || !transcript || !topic) {
            setError("Please provide a YouTube URL, transcript, and topic.");
            return;
        }
        setAppState(AppState.LOADING);
        setError(null);
        setAgents(INITIAL_AGENTS);

        try {
            // Agent 1: Video Analysis
            updateAgentStatus(AgentName.VIDEO_ANALYZER, AgentStatus.WORKING);
            const videoAnalysis = await geminiService.analyzeYouTubeVideoByUrl(youtubeUrl, topic);
            updateAgentStatus(AgentName.VIDEO_ANALYZER, AgentStatus.DONE, videoAnalysis);

            // Agent 2: Transcript Analysis
            updateAgentStatus(AgentName.TRANSCRIPT_ANALYZER, AgentStatus.WORKING);
            const transcriptAnalysis = await geminiService.analyzeTranscript(transcript, topic);
            updateAgentStatus(AgentName.TRANSCRIPT_ANALYZER, AgentStatus.DONE, transcriptAnalysis);
            
            // Agent 3: SEO Metadata
            updateAgentStatus(AgentName.SEO_AGENT, AgentStatus.WORKING);
            const generatedSeoCopy = await geminiService.generateSeoMetadata(topic);
            setSeoCopy(generatedSeoCopy);
            updateAgentStatus(AgentName.SEO_AGENT, AgentStatus.DONE, "SEO metadata generated.");

            // Agent 4: Final Report
            updateAgentStatus(AgentName.REPORT_WRITER, AgentStatus.WORKING);
            const finalReport = await geminiService.generateFinalReport(videoAnalysis, transcriptAnalysis, topic);
            setReport(finalReport);
            updateAgentStatus(AgentName.REPORT_WRITER, AgentStatus.DONE, "Report compiled.");

            setAppState(AppState.REPORT);

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Analysis failed: ${errorMessage}`);
            setAppState(AppState.ERROR);
        }
    };
    
    const handleReset = () => {
        setAppState(AppState.INPUT);
        setYoutubeUrl('');
        setTranscript('');
        setTopic('');
        setError(null);
        setReport(null);
        setSeoCopy(null);
        setThumbnails([]);
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
                                    <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-1">Video Topic</label>
                                    <input type="text" id="topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., 'How to Bake Sourdough Bread'" className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                                </div>
                                <div>
                                    <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-300 mb-1">YouTube Video URL</label>
                                    <input type="url" id="youtube-url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                                </div>
                                <div>
                                    <label htmlFor="transcript" className="block text-sm font-medium text-gray-300 mb-1">Paste Transcript</label>
                                    <textarea id="transcript" value={transcript} onChange={e => setTranscript(e.target.value)} rows={8} placeholder="Paste your full video transcript here for content analysis..." className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"></textarea>
                                </div>
                            </div>
                            <div className="mt-8">
                                <button onClick={handleAnalyze} disabled={!youtubeUrl || !transcript || !topic} className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out shadow-lg">
                                    <SparklesIcon className="w-5 h-5" />
                                    <span>Analyze Video</span>
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
                            <p className="text-center text-gray-400 mb-8">Your video is being analyzed by our team of specialized AI agents.</p>
                            <div className="space-y-4">
                                {agents.map(agent => (
                                    <div key={agent.name} className="flex items-start p-4 bg-gray-900/50 rounded-lg">
                                        <div className="mr-4">
                                            {agent.status === AgentStatus.WORKING && <LoadingSpinner />}
                                            {agent.status === AgentStatus.DONE && <CheckCircleIcon className="h-6 w-6 text-green-400" />}
                                            {agent.status === AgentStatus.PENDING && <div className="h-6 w-6 rounded-full border-2 border-gray-500"></div>}
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
                 if (!report || !seoCopy) {
                    setError("Failed to generate report data.");
                    setAppState(AppState.ERROR);
                    return null;
                }
                return <ReportView report={report} seoCopy={seoCopy} transcript={transcript} videoTopic={topic} onReset={handleReset} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">Video SEO Optimizer</h1>
                <p className="mt-2 text-lg text-gray-400 max-w-3xl mx-auto">Leverage a swarm of AI agents to boost your video's CTR, SEO, and retention.</p>
            </div>
            <main>
                {renderContent()}
            </main>
        </div>
    );
};

export default App;