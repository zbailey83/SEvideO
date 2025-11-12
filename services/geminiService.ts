import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisReport, SeoCopy, RewrittenScript } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeYouTubeVideoByUrl = async (url: string, topic: string): Promise<string> => {
  const prompt = `As an expert video analyst, analyze the YouTube video at this URL: ${url}. The video is about "${topic}".
  
  Use your search capabilities to find information about this video, including its title, description, thumbnail, and general public reception if available.
  
  Based on your findings and your expertise in video engagement, provide a detailed analysis of the following:
  1.  **Visuals & Branding**: Comment on the likely quality of the visuals, editing style, and use of branding based on the thumbnail and any available information.
  2.  **Pacing & Structure**: Infer the video's pacing and structure. Is it likely to be fast-paced, slow and deliberate, etc.? How might this affect viewer retention?
  3.  **Engagement Potential**: Assess how well the video is likely to engage its target audience.
  
  Provide a concise summary of its visual strengths and weaknesses, focusing on what could be optimized for user retention and click-through rates.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      tools: [{googleSearch: {}}],
    },
  });

  return response.text;
};


export const analyzeTranscript = async (transcript: string, topic: string): Promise<string> => {
    const prompt = `Analyze this video transcript for a video about "${topic}". Focus on clarity, engagement, keyword usage for SEO, and the presence of clear calls-to-action. Provide a summary of its strengths and weaknesses regarding audience retention and SEO.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `${prompt}\n\nTranscript:\n${transcript}`,
    });
    return response.text;
};

export const generateSeoMetadata = async (topic: string): Promise<SeoCopy> => {
    const prompt = `Based on current search trends for "${topic}", generate an optimized YouTube video title, a compelling video description, 20 relevant tags, and 5 relevant hashtags.

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
            tools: [{googleSearch: {}}],
        },
    });

    let jsonText = response.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7, jsonText.length - 3).trim();
    }
    
    try {
        return JSON.parse(jsonText) as SeoCopy;
    } catch (e) {
        console.error("Failed to parse SEO JSON:", jsonText, e);
        throw new Error("Gemini returned invalid JSON for SEO metadata.");
    }
};

export const generateFinalReport = async (
    videoAnalysis: string,
    transcriptAnalysis: string,
    topic: string
): Promise<AnalysisReport> => {
    const prompt = `You are a professional video optimization consultant. Synthesize the following analyses for a video about "${topic}" into a professional report.

Video Visuals Analysis:
${videoAnalysis}

Transcript & Content Analysis:
${transcriptAnalysis}

Based on this, create a final report with:
1. "pros": A list of 3-5 key strengths.
2. "cons": A list of 3-5 key weaknesses, each with a "severity" rating ('Low', 'Medium', or 'High').
3. "optimizations": A list of the top 5 most impactful, actionable recommendations to improve CTR, SEO, and retention. Each optimization should have a title and a short description.

Return the report as a JSON object.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: 'OBJECT',
                properties: {
                    pros: {
                        type: 'ARRAY',
                        items: { type: 'STRING' }
                    },
                    cons: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                text: { type: 'STRING' },
                                severity: { type: 'STRING', enum: ['Low', 'Medium', 'High'] }
                            },
                            required: ["text", "severity"]
                        }
                    },
                    optimizations: {
                        type: 'ARRAY',
                        items: {
                             type: 'OBJECT',
                             properties: {
                                title: { type: 'STRING' },
                                description: { type: 'STRING' }
                             },
                             required: ["title", "description"]
                        }
                    }
                },
                required: ["pros", "cons", "optimizations"]
            }
        }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisReport;
};


export const generateThumbnails = async (prompt: string, aspectRatio: string): Promise<string[]> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `Generate a visually striking, high click-through-rate YouTube thumbnail for a video about: "${prompt}". Minimal text, bold colors, and clear subject focus.`,
        config: {
            numberOfImages: 4,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        },
    });

    return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
};

export const rewriteScript = async (transcript: string, report: AnalysisReport): Promise<RewrittenScript> => {
    const prompt = `Given the original video transcript and this optimization report, rewrite the transcript to be more engaging, SEO-friendly, and to have a stronger call to action. Incorporate the feedback from the report.

Original Transcript:
${transcript}

Optimization Report:
Pros: ${report.pros.join(', ')}
Cons: ${report.cons.map(c => `${c.text} (Severity: ${c.severity})`).join(', ')}
Recommendations: ${report.optimizations.map(o => `${o.title}: ${o.description}`).join('\n')}

Break the rewritten script down into logical sections (e.g., "Intro / Hook", "Main Content", "Call to Action", "Outro").

Return the result as a single JSON object with the following structure, and nothing else:
{
  "title": "A new, catchy title for the script",
  "sections": [
    { "heading": "Section 1 Title (e.g., Intro)", "content": "The rewritten content for section 1..." },
    { "heading": "Section 2 Title", "content": "The rewritten content for section 2..." }
  ]
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING' },
                    sections: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                heading: { type: 'STRING' },
                                content: { type: 'STRING' }
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
    return JSON.parse(jsonText) as RewrittenScript;
};