
import React, { useState, useCallback } from 'react';
import { AnalysisReport, SeoCopy, RewrittenScript } from '../types';
import * as geminiService from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { CheckCircleIcon, XCircleIcon, LightBulbIcon, TrendingUpIcon, ClipboardCopyIcon } from './icons';

interface ReportViewProps {
    report: AnalysisReport;
    seoCopy: SeoCopy;
    transcript: string;
    videoTopic: string;
    onReset: () => void;
}

const SeverityBadge: React.FC<{ severity: 'Low' | 'Medium' | 'High' }> = ({ severity }) => {
    const severityClasses = {
        Low: 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50',
        Medium: 'bg-orange-900/50 text-orange-300 border-orange-700/50',
        High: 'bg-red-900/50 text-red-300 border-red-700/50',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${severityClasses[severity]}`}>
            {severity} Severity
        </span>
    );
};

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-gray-700/50 rounded-md hover:bg-gray-600 transition">
           {copied ? <CheckCircleIcon className="w-4 h-4 text-green-400" /> : <ClipboardCopyIcon className="w-4 h-4 text-gray-400" />}
        </button>
    );
};


const ReportView: React.FC<ReportViewProps> = ({ report, seoCopy, transcript, videoTopic, onReset }) => {
    const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);
    const [generatedThumbnails, setGeneratedThumbnails] = useState<string[]>([]);
    const [thumbnailPrompt, setThumbnailPrompt] = useState(videoTopic);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    
    const [isRewritingScript, setIsRewritingScript] = useState(false);
    const [rewrittenScript, setRewrittenScript] = useState<RewrittenScript | null>(null);

    const handleGenerateThumbnails = useCallback(async () => {
        setIsGeneratingThumbnails(true);
        setGeneratedThumbnails([]);
        try {
            const images = await geminiService.generateThumbnails(thumbnailPrompt, aspectRatio);
            setGeneratedThumbnails(images);
        } catch (error) {
            console.error("Thumbnail generation failed:", error);
        } finally {
            setIsGeneratingThumbnails(false);
        }
    }, [thumbnailPrompt, aspectRatio]);
    
    const handleRewriteScript = useCallback(async () => {
        setIsRewritingScript(true);
        setRewrittenScript(null);
        try {
            const script = await geminiService.rewriteScript(transcript, report);
            setRewrittenScript(script);
        } catch(error) {
            console.error("Script rewriting failed:", error);
        } finally {
            setIsRewritingScript(false);
        }
    }, [transcript, report]);

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Analysis Complete</h2>
                <p className="text-gray-400 mt-1">Here is the detailed optimization report for your video.</p>
            </div>

            {/* Main Report Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pros */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-green-400"><CheckCircleIcon className="w-6 h-6 mr-2" /> Strengths</h3>
                    <ul className="space-y-3 list-disc list-inside text-gray-300">
                        {report.pros.map((pro, index) => <li key={index}>{pro}</li>)}
                    </ul>
                </div>
                {/* Cons */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-red-400"><XCircleIcon className="w-6 h-6 mr-2" /> Areas for Improvement</h3>
                    <ul className="space-y-4 text-gray-300">
                        {report.cons.map((con, index) => (
                            <li key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <span>{con.text}</span>
                                <SeverityBadge severity={con.severity} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Optimizations */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center text-indigo-400"><LightBulbIcon className="w-6 h-6 mr-2" />Actionable Optimizations</h3>
                <div className="space-y-4">
                    {report.optimizations.map((opt, index) => (
                        <details key={index} className="bg-gray-900/70 p-4 rounded-lg cursor-pointer">
                            <summary className="font-semibold">{opt.title}</summary>
                            <p className="mt-2 text-gray-400">{opt.description}</p>
                        </details>
                    ))}
                </div>
            </div>

            {/* Premium Features Section */}
             <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                 <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Premium Optimization Tools</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* SEO Copy */}
                    <div className="bg-gray-900/70 p-6 rounded-lg space-y-4">
                        <h3 className="text-xl font-semibold flex items-center"><TrendingUpIcon className="w-6 h-6 mr-2 text-cyan-400" /> SEO Copy</h3>
                        <div className="relative">
                           <label className="text-sm font-medium text-gray-400">Title</label>
                           <p className="mt-1 p-2 bg-gray-800 rounded-md text-gray-200">{seoCopy.title}</p>
                           <CopyButton textToCopy={seoCopy.title} />
                        </div>
                        <div className="relative">
                           <label className="text-sm font-medium text-gray-400">Description</label>
                           <p className="mt-1 p-2 bg-gray-800 rounded-md text-gray-200 text-sm max-h-24 overflow-y-auto">{seoCopy.description}</p>
                           <CopyButton textToCopy={seoCopy.description} />
                        </div>
                        <div className="relative">
                           <label className="text-sm font-medium text-gray-400">Tags</label>
                           <p className="mt-1 p-2 bg-gray-800 rounded-md text-gray-400 text-sm">{seoCopy.tags.join(', ')}</p>
                           <CopyButton textToCopy={seoCopy.tags.join(', ')} />
                        </div>
                    </div>
                    
                    {/* Thumbnail Generator */}
                     <div className="bg-gray-900/70 p-6 rounded-lg">
                         <h3 className="text-xl font-semibold mb-4">Thumbnail Generator</h3>
                         <div className="space-y-4">
                             <div>
                                 <label htmlFor="thumbnail-prompt" className="block text-sm font-medium text-gray-400 mb-1">Thumbnail Prompt</label>
                                 <input
                                     type="text"
                                     id="thumbnail-prompt"
                                     value={thumbnailPrompt}
                                     onChange={e => setThumbnailPrompt(e.target.value)}
                                     placeholder="e.g., A high-contrast image of a perfect sourdough loaf"
                                     className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                             </div>
                             <div>
                                <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-400 mb-1">Aspect Ratio</label>
                                 <select 
                                    id="aspect-ratio"
                                    value={aspectRatio} 
                                    onChange={e => setAspectRatio(e.target.value)} 
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                                    <option value="16:9">16:9 (Widescreen)</option>
                                    <option value="1:1">1:1 (Square)</option>
                                    <option value="9:16">9:16 (Vertical)</option>
                                 </select>
                             </div>
                             <button onClick={handleGenerateThumbnails} disabled={isGeneratingThumbnails} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                                 {isGeneratingThumbnails ? <LoadingSpinner size="h-5 w-5"/> : 'Generate Thumbnails'}
                             </button>
                         </div>
                         {generatedThumbnails.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                {generatedThumbnails.map((src, index) => <img key={index} src={src} alt={`Generated thumbnail ${index + 1}`} className="rounded-md" />)}
                            </div>
                         )}
                     </div>
                 </div>
                 
                 {/* Script Rewriter */}
                 <div className="mt-6 bg-gray-900/70 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Optimized Script Rewriter</h3>
                    <button onClick={handleRewriteScript} disabled={isRewritingScript} className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                         {isRewritingScript ? <LoadingSpinner size="h-5 w-5" /> : 'Rewrite My Script'}
                     </button>
                     {rewrittenScript && (
                        <div className="mt-4 p-4 bg-gray-800 rounded-md relative">
                            <h4 className="text-lg font-bold mb-3 text-gray-100">{rewrittenScript.title}</h4>
                            <div className="space-y-4 text-sm text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto pr-8">
                                {rewrittenScript.sections.map((section, index) => (
                                    <div key={index}>
                                        <h5 className="font-semibold text-indigo-400 mb-1">{section.heading}</h5>
                                        <p className="text-gray-400">{section.content}</p>
                                    </div>
                                ))}
                            </div>
                            <CopyButton textToCopy={
                                `${rewrittenScript.title}\n\n` +
                                rewrittenScript.sections.map(s => `${s.heading}\n${s.content}`).join('\n\n')
                            } />
                        </div>
                     )}
                 </div>
             </div>

            <div className="text-center mt-8">
                <button onClick={onReset} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">
                    Analyze Another Video
                </button>
            </div>
        </div>
    );
};

export default ReportView;