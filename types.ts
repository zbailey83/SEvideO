
export enum AppState {
  INPUT,
  LOADING,
  REPORT,
  ERROR,
}

export enum AgentName {
    VIDEO_ANALYZER = 'Video Structure Analyzer',
    TRANSCRIPT_ANALYZER = 'Transcript & Content Analyst',
    SEO_AGENT = 'SEO & Metadata Agent',
    REPORT_WRITER = 'Final Report Synthesizer',
}

export enum AgentStatus {
    PENDING = 'Pending',
    WORKING = 'Working...',
    DONE = 'Done',
    ERROR = 'Error'
}

export interface AgentState {
    name: AgentName;
    status: AgentStatus;
    description: string;
    result?: string;
}

export interface AnalysisReport {
    pros: string[];
    cons: {
        text: string;
        severity: 'Low' | 'Medium' | 'High';
    }[];
    optimizations: {
        title: string;
        description: string;
    }[];
}

export interface SeoCopy {
    title: string;
    description: string;
    tags: string[];
    hashtags: string[];
}

export interface GeneratedThumbnail {
    prompt: string;
    imageUrl: string;
}

export interface RewrittenScript {
    title: string;
    sections: {
        heading: string;
        content: string;
    }[];
}