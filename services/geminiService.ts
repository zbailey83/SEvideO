import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AnalysisReport, SeoCopy, GeneratedScript, VideoPlan, AgentName, AgentStatus } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateSeoMetadata = async (context: string, tone: string, audience: string): Promise<SeoCopy> => {
    const prompt = `Based on the following context, generate an optimized YouTube video title, a compelling video description (around 150 words), 20 relevant tags, and 5 relevant hashtags.
    
    Context: ${context}
    Desired Tone: ${tone}
    Target Audience: ${audience}

    The title should be highly clickable and optimized for search. The description should be engaging and include a call-to-action.

    Return ONLY a valid JSON object in the following format, with no markdown formatting:
    {
      "title": "string",
      "description": "string",
      "tags": ["string"],
      "hashtags": ["string"]
    }`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "description", "tags", "hashtags"]
            }
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as SeoCopy;
};


const generateScript = async (context: string, tone: string, audience: string): Promise<GeneratedScript> => {
    const prompt = `You are an expert YouTube scriptwriter. Based on the following context, write a complete, engaging video script.

    Context: ${context}
    Desired Tone: ${tone}
    Target Audience: ${audience}

    The script must have a strong hook to capture attention within the first 15 seconds. It should be structured logically with clear sections. Include a call to action at the end.
    
    Break the script down into logical sections (e.g., "Intro / Hook", "Main Content Part 1", "Call to Action", "Outro").

    Return the result as a single JSON object with the following structure, and nothing else:
    {
      "title": "A working title for the script, matching the content",
      "sections": [
        { "heading": "Section 1 Title (e.g., Intro)", "content": "The content for section 1..." },
        { "heading": "Section 2 Title", "content": "The content for section 2..." }
      ]
    }`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    sections: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                heading: { type: Type.STRING },
                                content: { type: Type.STRING }
                            },
                            required: ["heading", "content"]
                        }
                    }
                },
                required: ["title", "sections"]
            }
        }
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as GeneratedScript;
};


const generateThumbnails = async (videoTitle: string): Promise<string[]> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `Create a visually striking, high click-through-rate YouTube thumbnail for a video titled: "${videoTitle}". Use bold colors, clear subject focus, and minimal to no text.`,
        config: {
            numberOfImages: 2,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9',
        },
    });

    return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
};


const generateFinalReport = async (context: string, seoCopy: SeoCopy, script: GeneratedScript): Promise<AnalysisReport> => {
    const prompt = `You are a YouTube strategy consultant. You have been provided with a generated video plan (including title, description, and script). Your task is to provide a brief report to help the creator produce the best possible video from this plan.

    Video Plan Context: ${context}
    Generated Title: ${seoCopy.title}
    Generated Script Summary: The script is about ${script.title} and is broken into sections like ${script.sections.map(s => s.heading).join(', ')}.

    Based on this plan, create a report with:
    1. "strengths": A list of 3-4 key strengths of this video plan. For each, provide a short "title" and a "description" explaining the strength.
    2. "recommendations": A list of 3-4 actionable recommendations for production. For each, provide a "title" and a detailed "description" explaining the 'why' and 'how'.

    Return the report as a single, valid JSON object with no markdown formatting.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    strengths: {
                        type: Type.ARRAY,
                        items: {
                             type: Type.OBJECT,
                             properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING }
                             },
                             required: ["title", "description"]
                        }
                    },
                    recommendations: {
                        type: Type.ARRAY,
                        items: {
                             type: Type.OBJECT,
                             properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING }
                             },
                             required: ["title", "description"]
                        }
                    }
                },
                required: ["strengths", "recommendations"]
            }
        }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisReport;
};


export const generateVideoPlan = async (
    inputType: 'topic' | 'url',
    inputValue: string,
    tone: string,
    audience: string,
    progressCallback: (agentName: AgentName, status: AgentStatus, result?: string) => void
): Promise<VideoPlan> => {

    // 1. Get context
    progressCallback(AgentName.CONTEXT_GATHERER, AgentStatus.WORKING);
    let context = `The user wants to create a video about "${inputValue}".`;
    if (inputType === 'url') {
        const urlAnalysisPrompt = `Analyze the YouTube video at ${inputValue}. Identify its key strengths (what makes it engaging?), weaknesses, and overall content strategy. Extract the core topic and angle. The goal is to use this as inspiration to create a new, improved video on the same topic. Provide a concise summary.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: urlAnalysisPrompt,
            config: { tools: [{ googleSearch: {} }] },
        });
        context = `The user wants to create a video similar to the one at ${inputValue}. Here's an analysis of that video to use as a baseline for improvement: ${response.text}`;
    }
    progressCallback(AgentName.CONTEXT_GATHERER, AgentStatus.DONE, "Context established.");

    // 2. Generate SEO Copy and Script in parallel
    progressCallback(AgentName.SEO_AGENT, AgentStatus.WORKING);
    progressCallback(AgentName.SCRIPT_WRITER, AgentStatus.WORKING);

    const seoPromise = generateSeoMetadata(context, tone, audience);
    const scriptPromise = generateScript(context, tone, audience);

    const seoCopy = await seoPromise;
    progressCallback(AgentName.SEO_AGENT, AgentStatus.DONE, "SEO metadata generated.");

    const script = await scriptPromise;
    progressCallback(AgentName.SCRIPT_WRITER, AgentStatus.DONE, "Script written successfully.");
    
    // 3. Generate Thumbnails
    progressCallback(AgentName.THUMBNAIL_ARTIST, AgentStatus.WORKING);
    const thumbnails = await generateThumbnails(seoCopy.title);
    progressCallback(AgentName.THUMBNAIL_ARTIST, AgentStatus.DONE, "Thumbnails created.");

    // 4. Generate Final Report
    progressCallback(AgentName.REPORT_WRITER, AgentStatus.WORKING);
    const report = await generateFinalReport(context, seoCopy, script);
    
    return {
        report,
        seoCopy,
        script,
        thumbnails,
    };
};