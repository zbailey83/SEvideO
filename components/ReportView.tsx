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

const CopyButton: React.FC<{ textToCopy: string, className?: string }> = ({ textToCopy, className }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button 
            onClick={handleCopy} 
            className={`p-1.5 rounded-md border transition-all duration-200 ${
                copied 
                ? 'bg-primary-500/20 border-primary-500/50 text-primary-600 dark:text-primary-400' 
                : 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
            } ${className}`}
            title="Copy"
        >
           {copied ? <CheckCircleIcon className="w-4 h-4" /> : <ClipboardCopyIcon className="w-4 h-4" />}
        </button>
    );
};

const TechnicalCard: React.FC<{ children: React.ReactNode; className?: string; title?: string; icon?: React.ReactNode }> = ({ children, className = '', title, icon }) => (
    <div className={`bg-white/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 backdrop-blur-sm rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700/80 ${className}`}>
        {(title || icon) && (
            <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center space-x-3">
                {icon && <span className="text-zinc-400">{icon}</span>}
                {title && <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500">{title}</h3>}
            </div>
        )}
        <div className="p-5 flex-1">
            {children}
        </div>
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

    const handleDownloadImage = (dataUrl: string, index: number) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `vidseo_thumbnail_${index + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-700">
            
            {/* Header Actions */}
            <div className="flex flex-row justify-between items-center gap-4 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 transition-colors duration-300">
                <div>
                    <h2 className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">GENERATION COMPLETE</h2>
                    <p className="text-zinc-500 text-sm font-mono mt-1">Output ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
                <button onClick={onReset} className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-mono transition-colors">
                    RESET
                </button>
            </div>

            {/* Prominent Export Button */}
            <div className="flex justify-center w-full mb-10">
                <button 
                    onClick={handleDownloadReport}
                    className="relative inline-flex h-14 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-zinc-50 dark:focus:ring-offset-zinc-900 group hover:scale-105 transition-transform duration-300 animate-float"
                >
                    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#EF4444_0%,#F59E0B_14%,#FCD34D_28%,#10B981_42%,#3B82F6_57%,#6366F1_71%,#8B5CF6_85%,#EF4444_100%)]" />
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-950 px-10 py-1 text-sm font-bold font-mono text-white backdrop-blur-3xl transition-all group-hover:bg-zinc-800 dark:group-hover:bg-zinc-900 gap-3 uppercase tracking-widest shadow-xl">
                        <DownloadIcon className="w-5 h-5" />
                        Export Strategic Data
                    </span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Metadata & Thumbnails */}
                <div className="lg:col-span-4 space-y-6">
                    {/* SEO Card */}
                    <TechnicalCard title="SEO Metadata Vectors" icon={<TrendingUpIcon className="w-4 h-4 text-primary-500" />}>
                        <div className="space-y-6">
                            <div className="group relative">
                                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1.5 block">Title</label>
                                <div className="text-sm text-zinc-800 dark:text-zinc-100 font-medium leading-snug p-3 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                                    {seoCopy.title}
                                </div>
                                <div className="absolute top-7 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CopyButton textToCopy={seoCopy.title} />
                                </div>
                            </div>
                            
                            <div className="group relative">
                                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1.5 block">Description</label>
                                <div className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed p-3 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 max-h-40 overflow-y-auto custom-scrollbar font-mono">
                                    {seoCopy.description}
                                </div>
                                <div className="absolute top-7 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CopyButton textToCopy={seoCopy.description} />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-2 block">Keywords</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {seoCopy.tags.slice(0, 8).map(tag => (
                                        <span key={tag} className="text-[10px] px-2 py-1 rounded-sm bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 text-primary-600 dark:text-primary-400 font-mono">
                                            {tag}
                                        </span>
                                    ))}
                                    {seoCopy.tags.length > 8 && (
                                        <span className="text-[10px] px-2 py-1 rounded-sm bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-500 font-mono">+{seoCopy.tags.length - 8}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TechnicalCard>

                    {/* Thumbnails Card */}
                    <TechnicalCard title="Visual Assets" icon={<SparklesIcon className="w-4 h-4 text-purple-500" />}>
                        <div className="grid grid-cols-1 gap-4">
                            {thumbnails.map((src, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => setSelectedThumbnail(index)}
                                    className={`relative group rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${selectedThumbnail === index ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-transparent hover:border-zinc-400 dark:hover:border-zinc-600'}`}
                                >
                                    <img 
                                        src={src} 
                                        alt={`Generated thumbnail ${index + 1}`} 
                                        className="w-full object-cover aspect-video opacity-90 group-hover:opacity-100 transition-opacity" 
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950 to-transparent p-3 pointer-events-none">
                                        <p className="text-[10px] font-mono text-zinc-400">VAR_0{index + 1}</p>
                                    </div>
                                    
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadImage(src, index);
                                            }}
                                            className="p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 border border-white/10"
                                            title="Download Image"
                                        >
                                            <DownloadIcon className="w-4 h-4" />
                                        </button>

                                        {selectedThumbnail === index && (
                                            <div className="bg-primary-500 text-white rounded-md p-1.5 shadow-lg">
                                                <CheckCircleIcon className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TechnicalCard>
                </div>

                {/* Center Column: Script */}
                <div className="lg:col-span-5 h-full">
                    <TechnicalCard className="h-full min-h-[600px] flex flex-col" title="Script Sequence" icon={<div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />}>
                         <div className="mb-4 flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 transition-colors duration-300">
                             <div>
                                <h4 className="text-lg text-zinc-900 dark:text-zinc-100 font-bold leading-tight">{script.title}</h4>
                                <span className="text-[10px] font-mono text-zinc-500 uppercase mt-1 block">Script ID: {Math.floor(Math.random() * 9999)} // Length: {script.sections.length} Sections</span>
                             </div>
                             <CopyButton 
                                textToCopy={`${script.title}\n\n` + script.sections.map(s => `${s.heading}\n${s.content}`).join('\n\n')} 
                            />
                         </div>

                        <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar flex-1">
                            {script.sections.map((section, index) => {
                                const isCollapsed = collapsedSections.has(index);
                                return (
                                    <div key={index} className="border border-zinc-200 dark:border-zinc-800/50 rounded bg-zinc-50 dark:bg-zinc-950/30 overflow-hidden mb-2 transition-colors duration-300">
                                        <button
                                            onClick={() => toggleSection(index)}
                                            className="w-full flex justify-between items-center text-left p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-600">0{index + 1}</span>
                                                <h5 className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider group-hover:text-primary-500 dark:group-hover:text-primary-300">{section.heading}</h5>
                                            </div>
                                            {isCollapsed
                                                ? <ChevronDownIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                                                : <ChevronUpIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                                            }
                                        </button>
                                        <div
                                            className={`transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[800px] opacity-100'}`}
                                        >
                                            <div className="p-4 pt-0 border-t border-zinc-200 dark:border-zinc-800/30">
                                                <p className="font-sans text-sm text-zinc-700 dark:text-zinc-300 leading-7 whitespace-pre-wrap pt-3">{section.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </TechnicalCard>
                </div>

                {/* Right Column: Analysis */}
                <div className="lg:col-span-3 space-y-6">
                    <TechnicalCard title="Strategic Analysis" icon={<LightBulbIcon className="w-4 h-4 text-amber-500" />}>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-mono font-bold text-primary-600 dark:text-primary-500 mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                    IDENTIFIED STRENGTHS
                                </h4>
                                <ul className="space-y-3">
                                    {report.strengths.map((pro, index) => (
                                        <li key={index} className="text-sm">
                                            <p className="text-zinc-800 dark:text-zinc-200 font-medium text-xs mb-0.5">{pro.title}</p>
                                            <p className="text-zinc-500 text-[10px] leading-relaxed">{pro.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full"></div>

                            <div>
                                <h4 className="text-xs font-mono font-bold text-amber-600 dark:text-amber-500 mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    OPTIMIZATION TARGETS
                                </h4>
                                <div className="space-y-3">
                                    {recommendations.map((opt, index) => (
                                        <div key={index} className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="text-zinc-700 dark:text-zinc-300 font-medium text-xs">{opt.title}</p>
                                                <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleRating(index, 'up')} className={`p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${opt.rating === 'up' ? 'text-primary-500' : 'text-zinc-400 dark:text-zinc-600'}`}>
                                                        <ThumbUpIcon className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={() => handleRating(index, 'down')} className={`p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${opt.rating === 'down' ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-600'}`}>
                                                        <ThumbDownIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-zinc-500 text-[10px] mt-1 leading-relaxed">{opt.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TechnicalCard>
                </div>
            </div>
        </div>
    );
};

export default ReportView;