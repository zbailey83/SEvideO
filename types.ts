export enum AppState {
  INPUT,
  LOADING,
  REPORT,
  ERROR,
}

export enum AgentName {
    CONTEXT_GATHERER = 'Context Gatherer',
    SCRIPT_WRITER = 'AI Script Writer',
    SEO_AGENT = 'SEO & Metadata Agent',
    THUMBNAIL_ARTIST = 'AI Thumbnail Artist',
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

export interface ReportPoint {
    title: string;
    description: string;
}

export interface AnalysisReport {
    strengths: ReportPoint[];
    recommendations: ReportPoint[];
}

export interface SeoCopy {
    title: string;
    description: string;
    tags: string[];
    hashtags: string[];
}

export interface GeneratedScript {
    title: string;
    sections: {
        heading: string;
        content: string;
    }[];
}

export interface VideoPlan {
    report: AnalysisReport;
    seoCopy: SeoCopy;
    script: GeneratedScript;
    thumbnails: string[];
}