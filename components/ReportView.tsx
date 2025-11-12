import React, { useState } from 'react';
import { VideoPlan } from '../types';
import { CheckCircleIcon, LightBulbIcon, TrendingUpIcon, ClipboardCopyIcon, SparklesIcon } from './icons';

interface ReportViewProps {
    videoPlan: VideoPlan;
    onReset: () => void;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button onClick={handleCopy} title="Copy to clipboard" className="absolute top-3 right-3 p-1.5 bg-gray-700/50 rounded-md hover:bg-gray-600 transition">
           {copied ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <ClipboardCopyIcon className="w-5 h-5 text-gray-400" />}
        </button>
    );
};

const ReportView: React.FC<ReportViewProps> = ({ videoPlan, onReset }) => {
    const { report, seoCopy, script, thumbnails } = videoPlan;

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold">Your AI-Generated Video Plan is Ready!</h2>
                <p className="text-gray-400 mt-1">Here is the complete creative package for your next video.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column (2/3 width) - Script */}
                <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700 rounded-xl p-6 relative">
                    <h3 className="text-2xl font-semibold mb-4 flex items-center"><SparklesIcon className="w-6 h-6 mr-3 text-purple-400"/> Generated Script</h3>
                    <div className="bg-gray-900/70 p-4 rounded-md">
                         <h4 className="text-xl font-bold mb-4 text-gray-100">{script.title}</h4>
                         <div className="space-y-5 text-gray-300 whitespace-pre-wrap max-h-[80vh] overflow-y-auto pr-4">
                            {script.sections.map((section, index) => (
                                <div key={index}>
                                    <h5 className="font-semibold text-indigo-400 mb-1 text-lg">{section.heading}</h5>
                                    <p className="text-gray-400 leading-relaxed">{section.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                     <CopyButton textToCopy={
                        `${script.title}\n\n` +
                        script.sections.map(s => `${s.heading}\n${s.content}`).join('\n\n')
                    } />
                </div>
                
                {/* Right Column (1/3 width) - Other Assets */}
                <div className="space-y-6">
                    {/* Thumbnails */}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-xl font-semibold mb-4">Thumbnail Concepts</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            {thumbnails.map((src, index) => (
                                <img key={index} src={src} alt={`Generated thumbnail ${index + 1}`} className="rounded-lg w-full object-cover aspect-video" />
                            ))}
                        </div>
                    </div>

                    {/* SEO Copy */}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                         <h3 className="text-xl font-semibold flex items-center mb-4"><TrendingUpIcon className="w-6 h-6 mr-2 text-cyan-400" /> SEO Copy</h3>
                         <div className="space-y-4">
                            <div className="relative">
                               <label className="text-sm font-medium text-gray-400">Title</label>
                               <p className="mt-1 p-3 pr-12 bg-gray-900/70 rounded-md text-gray-200">{seoCopy.title}</p>
                               <CopyButton textToCopy={seoCopy.title} />
                            </div>
                            <div className="relative">
                               <label className="text-sm font-medium text-gray-400">Description</label>
                               <p className="mt-1 p-3 pr-12 bg-gray-900/70 rounded-md text-gray-200 text-sm max-h-32 overflow-y-auto">{seoCopy.description}</p>
                               <CopyButton textToCopy={seoCopy.description} />
                            </div>
                            <div className="relative">
                               <label className="text-sm font-medium text-gray-400">Tags</label>
                               <p className="mt-1 p-3 pr-12 bg-gray-900/70 rounded-md text-gray-400 text-sm">{seoCopy.tags.join(', ')}</p>
                               <CopyButton textToCopy={seoCopy.tags.join(', ')} />
                            </div>
                         </div>
                    </div>
                    
                    {/* Report */}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center text-green-400"><CheckCircleIcon className="w-6 h-6 mr-2" /> Strengths of this Plan</h3>
                        <ul className="space-y-2 list-disc list-inside text-gray-300 text-sm">
                            {report.strengths.map((pro, index) => <li key={index}>{pro}</li>)}
                        </ul>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center text-indigo-400"><LightBulbIcon className="w-6 h-6 mr-2" />Production Recommendations</h3>
                        <div className="space-y-3">
                            {report.recommendations.map((opt, index) => (
                                <div key={index} className="bg-gray-900/70 p-3 rounded-lg">
                                    <p className="font-semibold text-sm">{opt.title}</p>
                                    <p className="mt-1 text-gray-400 text-xs">{opt.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center pt-4">
                <button onClick={onReset} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">
                    Create Another Video Plan
                </button>
            </div>
        </div>
    );
};

export default ReportView;