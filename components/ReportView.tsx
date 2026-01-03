import React, { useState } from 'react';
import { VideoPlan, ReportPoint } from '../types';
import { CheckCircleIcon, LightBulbIcon, TrendingUpIcon, ClipboardCopyIcon, SparklesIcon, ThumbUpIcon, ThumbDownIcon, ChevronDownIcon, ChevronUpIcon, DownloadIcon } from './icons';
import { motion } from 'framer-motion';

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
        <button 
            onClick={handleCopy} 
            className={`p-2 transition-all duration-200 border ${copied ? 'bg-brand-gold text-white border-brand-gold' : 'text-stone-400 border-stone-200 dark:border-stone-800 hover:border-brand-gold hover:text-brand-gold'}`}
        >
           {copied ? <CheckCircleIcon className="w-3 h-3" /> : <ClipboardCopyIcon className="w-3 h-3" />}
        </button>
    );
};

const SectionHeading = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <div className="mb-10 border-l-4 border-brand-gold pl-6">
        <h3 className="text-4xl font-serif font-bold text-stone-850 dark:text-offWhite">{title}</h3>
        {subtitle && <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-stone-400 mt-2">{subtitle}</p>}
    </div>
);

const ReportView: React.FC<ReportViewProps> = ({ videoPlan, onReset }) => {
    const { report, seoCopy, script, thumbnails } = videoPlan;
    const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());

    const toggleSection = (index: number) => {
        setCollapsedSections(prev => {
            const next = new Set(prev);
            next.has(index) ? next.delete(index) : next.add(index);
            return next;
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-24">
            {/* Action Bar */}
            <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-12">
                <div>
                    <span className="text-brand-gold font-mono text-[10px] tracking-[0.4em] uppercase mb-2 block">Synthesis Output</span>
                    <h2 className="text-6xl font-serif font-bold text-stone-850 dark:text-offWhite">The Intelligence Dossier</h2>
                </div>
                <div className="flex gap-4">
                    <button onClick={onReset} className="px-6 py-3 border border-stone-200 dark:border-stone-700 text-[10px] font-mono uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold transition-all">New Inquiry</button>
                    <button className="px-8 py-3 bg-stone-850 dark:bg-offWhite text-white dark:text-stone-900 text-[10px] font-mono uppercase tracking-widest hover:bg-brand-gold dark:hover:bg-brand-gold dark:hover:text-white transition-all flex items-center gap-2 shadow-xl shadow-brand-gold/10">
                        <DownloadIcon className="w-3 h-3" />
                        Download Archive
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-16">
                {/* Visual Assets & SEO Column */}
                <div className="lg:col-span-4 space-y-16">
                    <section>
                        <SectionHeading title="Visual Concepts" subtitle="AI Rendered Previews" />
                        <div className="grid gap-6">
                            {thumbnails.map((src, idx) => (
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    key={idx} 
                                    className="group relative border border-stone-200 dark:border-stone-800 overflow-hidden"
                                >
                                    <img src={src} className="w-full grayscale group-hover:grayscale-0 transition-all duration-700" alt="Generated Concept" />
                                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-stone-900/90 px-3 py-1 text-[8px] font-mono border border-stone-200 dark:border-stone-800 uppercase tracking-widest">
                                        Frame_0{idx + 1}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-cream dark:bg-stone-900/50 p-8 border border-stone-200 dark:border-stone-800">
                        <SectionHeading title="Semantic Layer" subtitle="Metadata Optimization" />
                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-3 block">Primary Descriptor</label>
                                <p className="text-xl font-serif font-bold text-stone-850 dark:text-offWhite leading-snug">{seoCopy.title}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-3 block">Abstract</label>
                                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-sans">{seoCopy.description}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {seoCopy.tags.slice(0, 10).map(tag => (
                                    <span key={tag} className="px-3 py-1 text-[9px] border border-brand-gold/20 text-brand-gold uppercase font-mono tracking-tighter">#{tag.replace(/\s+/g, '')}</span>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Narrative Sequence Column */}
                <div className="lg:col-span-5 space-y-12">
                    <section>
                        <div className="flex justify-between items-center mb-10">
                            <SectionHeading title="Narrative Structure" subtitle="The Scientific Script" />
                            <CopyButton textToCopy={script.sections.map(s => `[${s.heading}]\n${s.content}`).join('\n\n')} />
                        </div>
                        <div className="space-y-6">
                            {script.sections.map((section, idx) => (
                                <div key={idx} className="border-b border-stone-100 dark:border-stone-800 pb-6 group">
                                    <button 
                                        onClick={() => toggleSection(idx)}
                                        className="w-full flex justify-between items-center py-4 text-left"
                                    >
                                        <div className="flex items-center gap-6">
                                            <span className="text-2xl font-serif italic text-brand-gold opacity-50">0{idx + 1}</span>
                                            <h4 className="text-xl font-serif font-semibold text-stone-850 dark:text-offWhite group-hover:text-brand-gold transition-colors">{section.heading}</h4>
                                        </div>
                                        <ChevronDownIcon className={`w-4 h-4 text-stone-300 transform transition-transform ${collapsedSections.has(idx) ? 'rotate-180' : ''}`} />
                                    </button>
                                    {!collapsedSections.has(idx) && (
                                        <motion.p 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="text-stone-600 dark:text-stone-400 text-base leading-relaxed pl-14 pr-4"
                                        >
                                            {section.content}
                                        </motion.p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Strategic Analysis Column */}
                <div className="lg:col-span-3">
                    <section className="sticky top-32 space-y-12">
                        <div>
                            <SectionHeading title="Critical Strengths" />
                            <div className="space-y-6">
                                {report.strengths.map((s, idx) => (
                                    <div key={idx} className="bg-white dark:bg-stone-850 border border-stone-100 dark:border-stone-800 p-6 hover:border-brand-gold transition-colors">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CheckCircleIcon className="w-4 h-4 text-brand-gold" />
                                            <h5 className="font-mono text-[10px] font-bold uppercase tracking-widest text-stone-850 dark:text-offWhite">{s.title}</h5>
                                        </div>
                                        <p className="text-[11px] text-stone-500 leading-relaxed font-sans">{s.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <SectionHeading title="Strategic Advice" />
                            <div className="space-y-6">
                                {report.recommendations.map((r, idx) => (
                                    <div key={idx} className="relative pl-10">
                                        <div className="absolute left-0 top-1 w-6 h-[1px] bg-brand-gold" />
                                        <h5 className="font-serif font-bold text-lg text-stone-850 dark:text-offWhite mb-2">{r.title}</h5>
                                        <p className="text-[11px] text-stone-500 leading-relaxed">{r.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Quote/Decorative Footer */}
            <div className="text-center pt-24 border-t border-stone-200 dark:border-stone-800">
                <blockquote className="text-4xl font-serif italic text-stone-300 dark:text-stone-700 max-w-3xl mx-auto">
                    "Intelligence is the ability to adapt to change, especially in the digital landscape."
                </blockquote>
                <p className="font-mono text-[10px] tracking-[0.4em] text-brand-gold uppercase mt-8">— VIDSEO SWARM ARCHIVE</p>
            </div>
        </div>
    );
};

export default ReportView;