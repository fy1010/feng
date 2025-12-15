import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// SECURITY NOTE: The API key is accessed via process.env.API_KEY.
// In a production environment, ensure your build tool (like Vite) is configured 
// to inject this variable, and ensure .env files are not committed to version control.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a base64 string (data:image/...) to a raw base64 string without the prefix
 */
const cleanBase64 = (dataUrl: string): string => {
  return dataUrl.split(',')[1];
};

export type EditMode = 'general' | 'eraser';

/**
 * Calls Gemini to edit the image based on mode and instructions
 */
export const editImage = async (
  imageBase64: string,
  mimeType: string,
  mode: EditMode,
  customInstruction?: string
): Promise<string> => {
  try {
    const cleanData = cleanBase64(imageBase64);
    
    let systemPrompt = "";

    if (mode === 'eraser') {
      // Magic Eraser Mode logic
      systemPrompt = "The user has marked specific areas of this image with RED strokes/scribbles. Your task is to act as a 'Magic Eraser'. Remove the red markings AND the objects or defects underneath them. Inpaint the removed areas to match the surrounding background seamlessly, ensuring high consistency and natural lighting. Do NOT leave any red marks.";
    } else {
      // General/Watermark Mode logic
      const basePrompt = "You are an expert image editor. ";
      
      if (!customInstruction || customInstruction.trim() === "") {
         // Default behavior if no instruction: Remove watermarks
         systemPrompt = `${basePrompt} Remove all watermarks, text overlays, logos, and copyright stamps from this image. Reconstruct the background where the watermarks were removed to look natural.`;
      } else {
         // Custom instruction behavior
         systemPrompt = `${basePrompt} Follow this instruction strictly: ${customInstruction}. If the instruction implies removing something, fill the background naturally. If it implies style transfer (like filters), apply it while keeping the main subject intact.`;
      }
    }

    // Using gemini-2.5-flash-image for image editing tasks
    const model = 'gemini-2.5-flash-image';

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanData,
              mimeType: mimeType
            }
          },
          {
            text: systemPrompt
          }
        ]
      }
    });

    // Extract the image from the response
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data returned from Gemini.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};