
import React, { useState } from 'react';
import { VideoPlan, ReportPoint } from '../types';
import { CheckCircleIcon, LightBulbIcon, TrendingUpIcon, ClipboardCopyIcon, SparklesIcon, ThumbUpIcon, ThumbDownIcon, ChevronDownIcon, ChevronUpIcon, DownloadIcon } from './icons';

interface ReportViewProps {
    videoPlan: VideoPlan;
    onReset: () => void;
}

type RatedRecommendation = ReportPoint & {
    rating?: 'up' | 'down';
};

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button onClick={handleCopy} title="Copy to clipboard" className="absolute top-3 right-3 p-1.5 bg-slate-100 rounded-full hover:bg-slate-200/80 transition-all duration-200 transform hover:scale-110">
           {copied ? <CheckCircleIcon className="w-5 h-5 text-emerald-500" /> : <ClipboardCopyIcon className="w-5 h-5 text-slate-500" />}
        </button>
    );
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white border border-slate-200/80 rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${className}`}>
        {children}
    </div>
);

const ReportView: React.FC<ReportViewProps> = ({ videoPlan, onReset }) => {
    const { report, seoCopy, script, thumbnails } = videoPlan;

    const [recommendations, setRecommendations] = useState<RatedRecommendation[]>(
        report.recommendations.map(r => ({ ...r, rating: undefined }))
    );
    
    const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
    const [selectedThumbnail, setSelectedThumbnail] = useState<number | null>(null);

    const handleRating = (index: number, rating: 'up' | 'down') => {
        setRecommendations(prev => prev.map((rec, i) => {
            if (i !== index) return rec;
            // If the same rating is clicked again, toggle it off. Otherwise, set the new rating.
            return { ...rec, rating: rec.rating === rating ? undefined : rating };
        }));
    };
    
    const toggleSection = (index: number) => {
        setCollapsedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };
    
    const handleDownloadReport = () => {
        const content = `
VIDSEO: AI-GENERATED VIDEO PLAN
================================

## SEO & METADATA
-----------------
TITLE: ${seoCopy.title}

DESCRIPTION:
${seoCopy.description}

TAGS: ${seoCopy.tags.join(', ')}

HASHTAGS: ${seoCopy.hashtags.join(' ')}


## ANALYSIS & RECOMMENDATIONS
-----------------------------
STRENGTHS:
${report.strengths.map(s => `- ${s.title}: ${s.description}`).join('\n')}

RECOMMENDATIONS:
${report.recommendations.map(r => `- ${r.title}: ${r.description}`).join('\n')}


## GENERATED SCRIPT
-------------------
SCRIPT TITLE: ${script.title}
${script.sections.map(sec => `
### ${sec.heading} ###
${sec.content}
`).join('\n\n')}
        `;

        const blob = new Blob([content.trim()], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'VIDSEO_Report.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Your AI-Generated Video Plan is Ready!</h2>
                <p className="text-slate-500 mt-2">Here is the complete creative package for your next video.</p>
                 <div className="mt-6">
                    <button onClick={handleDownloadReport} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-lg transition-all duration-300 ease-in-out shadow-md hover:shadow-lg hover:-translate-y-0.5">
                        <DownloadIcon className="w-5 h-5" />
                        <span>Download Full Report</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* SEO Copy */}
                <Card className="lg:col-span-1 space-y-5">
                    <h3 className="text-xl font-bold flex items-center text-slate-800"><TrendingUpIcon className="w-6 h-6 mr-3 text-emerald-500" /> SEO & Metadata</h3>
                    <div className="relative">
                       <label className="text-sm font-semibold text-slate-500">Title</label>
                       <p className="mt-1 p-3 pr-12 bg-slate-50/70 border border-slate-200 rounded-md text-slate-700 text-base font-semibold">{seoCopy.title}</p>
                       <CopyButton textToCopy={seoCopy.title} />
                    </div>
                    <div className="relative">
                       <label className="text-sm font-semibold text-slate-500">Description</label>
                       <p className="mt-1 p-3 pr-12 bg-slate-50/70 border border-slate-200 rounded-md text-slate-600 text-sm max-h-36 overflow-y-auto">{seoCopy.description}</p>
                       <CopyButton textToCopy={seoCopy.description} />
                    </div>
                    <div className="relative">
                       <label className="text-sm font-semibold text-slate-500">Tags</label>
                       <p className="mt-1 p-3 pr-12 bg-slate-50/70 border border-slate-200 rounded-md text-slate-500 text-sm max-h-24 overflow-y-auto">{seoCopy.tags.join(', ')}</p>
                       <CopyButton textToCopy={seoCopy.tags.join(', ')} />
                    </div>
                </Card>

                 {/* Thumbnails */}
                <Card className="lg:col-span-1">
                    <h3 className="text-xl font-bold mb-4 text-slate-800">Thumbnail Concepts</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {thumbnails.map((src, index) => (
                             <div key={index} className="relative group rounded-lg overflow-hidden shadow-md">
                                <img 
                                    src={src} 
                                    alt={`Generated thumbnail ${index + 1}`} 
                                    className={`w-full object-cover aspect-video transition-transform duration-300 ease-in-out ${selectedThumbnail === index ? '' : 'group-hover:scale-105'}`} 
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                                    <button 
                                        onClick={() => setSelectedThumbnail(index)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-slate-800 font-bold py-2 px-4 rounded-full text-sm hover:bg-white transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white"
                                    >
                                        {selectedThumbnail === index ? 'Selected' : 'Use This Thumbnail'}
                                    </button>
                                </div>
                                {selectedThumbnail === index && (
                                    <>
                                        <div className="absolute inset-0 ring-4 ring-emerald-500 ring-inset rounded-lg pointer-events-none"></div>
                                        <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-lg pointer-events-none">
                                            <CheckCircleIcon className="w-5 h-5" />
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Report */}
                <Card className="lg:col-span-1 h-full flex flex-col">
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold mb-4 flex items-center text-emerald-600"><CheckCircleIcon className="w-6 h-6 mr-3" /> Strengths of this Plan</h3>
                        <div className="space-y-3 mb-6">
                            {report.strengths.map((pro, index) => (
                                <div key={index}>
                                    <p className="font-semibold text-slate-700 text-sm">{pro.title}</p>
                                    <p className="text-slate-500 text-xs mt-1">{pro.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-slate-200 my-4"></div>

                        <h3 className="text-xl font-bold mb-4 flex items-center text-sky-600"><LightBulbIcon className="w-6 h-6 mr-3" />Production Recommendations</h3>
                        <div className="space-y-4">
                            {recommendations.map((opt, index) => (
                                <div key={index} className="bg-slate-50/70 p-3 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold text-slate-700 text-sm flex-1 pr-2">{opt.title}</p>
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleRating(index, 'up')} className={`p-1.5 rounded-full transition-all duration-200 transform hover:scale-110 ${opt.rating === 'up' ? 'bg-emerald-100 text-emerald-500' : 'hover:bg-slate-200 text-slate-400'}`}><ThumbUpIcon className="w-4 h-4" /></button>
                                            <button onClick={() => handleRating(index, 'down')} className={`p-1.5 rounded-full transition-all duration-200 transform hover:scale-110 ${opt.rating === 'down' ? 'bg-red-100 text-red-500' : 'hover:bg-slate-200 text-slate-400'}`}><ThumbDownIcon className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-slate-500 text-xs">{opt.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
            
             {/* Script Card */}
            <Card className="relative">
                <h3 className="text-2xl font-bold mb-4 flex items-center text-slate-800"><SparklesIcon className="w-7 h-7 mr-3 text-emerald-500"/> Generated Script: <span className="ml-2 font-semibold text-slate-700">{script.title}</span></h3>
                <div className="space-y-4 text-slate-600 whitespace-pre-wrap max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                   {script.sections.map((section, index) => {
                       const isCollapsed = collapsedSections.has(index);
                       return (
                           <div key={index} className="border-b border-slate-200 last:border-b-0 pb-4">
                               <button
                                   onClick={() => toggleSection(index)}
                                   className="w-full flex justify-between items-center text-left py-2 group"
                                   aria-expanded={!isCollapsed}
                                   aria-controls={`section-content-${index}`}
                               >
                                   <h5 className="font-bold text-emerald-600 text-lg tracking-wide group-hover:text-emerald-700 transition-colors">{section.heading}</h5>
                                   {isCollapsed
                                       ? <ChevronDownIcon className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-transform transform" />
                                       : <ChevronUpIcon className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-transform transform" />
                                   }
                               </button>
                               <div
                                   id={`section-content-${index}`}
                                   className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}
                               >
                                   <p className="leading-relaxed pt-2">{section.content}</p>
                               </div>
                           </div>
                       )
                   })}
               </div>
                <CopyButton textToCopy={
                    `${script.title}\n\n` +
                    script.sections.map(s => `${s.heading}\n${s.content}`).join('\n\n')
                } />
            </Card>

            <div className="text-center pt-4">
                <button onClick={onReset} className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold py-2 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-md hover:shadow-lg hover:-translate-y-0.5">
                    Create Another Video Plan
                </button>
            </div>
        </div>
    );
};

export default ReportView;