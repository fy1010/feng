import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a base64 string (data:image/...) to a raw base64 string without the prefix
 */
const cleanBase64 = (dataUrl: string): string => {
  return dataUrl.split(',')[1];
};

/**
 * Calls Gemini to remove watermarks from the image
 */
export const removeWatermark = async (
  imageBase64: string,
  mimeType: string,
  customInstruction?: string
): Promise<string> => {
  try {
    const cleanData = cleanBase64(imageBase64);
    
    // Default instruction focuses on watermark removal and background reconstruction
    const defaultPrompt = "Remove all watermarks, text overlays, logos, and copyright stamps from this image. Reconstruct the background where the watermarks were removed to look natural and seamless. Do not alter the main subject of the photo.";
    
    const finalPrompt = customInstruction 
      ? `${defaultPrompt} Also focus on: ${customInstruction}`
      : defaultPrompt;

    // Using gemini-2.5-flash-image for general image editing tasks as per guidelines
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
            text: finalPrompt
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