import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface TranscriptSegment {
  speaker: string;
  timestamp: string;
  text: string;
}

export interface AudioAnalysisResult {
  transcription: TranscriptSegment[];
  summary: string;
  actionItems: string[];
}

export async function analyzeAudio(file: File): Promise<AudioAnalysisResult> {
  const base64Data = await fileToBase64(file);
  
  const audioPart = {
    inlineData: {
      mimeType: file.type || 'audio/mp3', // Fallback to mp3 if type is empty
      data: base64Data.split(',')[1] // Remove data URL prefix
    }
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        audioPart,
        { text: "Please analyze this audio. Provide a full transcription structured as JSON (array of segments with speaker, timestamp, and text), a detailed summary formatted in rich Markdown, and a list of all pertinent action items and tasks identified." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transcription: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING, description: "The identified speaker (e.g., Speaker 1, John)" },
                timestamp: { type: Type.STRING, description: "The timestamp of the segment (e.g., 00:00)" },
                text: { type: Type.STRING, description: "The transcribed text for this segment" }
              },
              required: ["speaker", "timestamp", "text"]
            },
            description: "The full transcription of the audio as structured data."
          },
          summary: {
            type: Type.STRING,
            description: "A detailed summary of the audio content, formatted in rich Markdown."
          },
          actionItems: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            },
            description: "A list of pertinent action items and tasks identified in the audio."
          }
        },
        required: ["transcription", "summary", "actionItems"]
      }
    }
  });

  const jsonStr = response.text?.trim() || "{}";
  try {
    return JSON.parse(jsonStr) as AudioAnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    throw new Error("Failed to parse analysis result.");
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
