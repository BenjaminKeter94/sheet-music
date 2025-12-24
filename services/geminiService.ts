
import { GoogleGenAI, Type } from "@google/genai";
import { ArrangementConfig, ArrangementResult } from "../types";

const DIFFICULTY_DETAILS: Record<number, string> = {
  1: "Single notes in RH, simple block chords or single bass notes in LH.",
  2: "Basic accompaniment patterns like Alberti bass or simple arpeggios.",
  3: "Full four-part harmony, syncopation, and basic hand independence.",
  4: "Complex rhythms, wide-ranging LH patterns (stride/tenths), and decorative RH runs.",
  5: "Lisztian virtuosity: rapid chromatic scales, grand arpeggios, and dense polyphonic textures."
};

export const morphMusic = async (
  inputData: string, // Can be ABC text or base64 image
  isImage: boolean,
  config: ArrangementConfig
): Promise<ArrangementResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const textPrompt = `
    You are a world-class piano arranger. ${isImage ? "Analyze the attached image of sheet music and transform it" : "Transform the following ABC music notation"} into a PIANO-SPECIFIC arrangement.
    
    Parameters:
    - Difficulty: ${config.difficulty}/5 (${DIFFICULTY_DETAILS[config.difficulty]})
    - Style: ${config.style}
    - Hand Size Constraint: ${config.handSize}
    - Piece Title: ${config.title}

    PIANO ARRANGEMENT RULES:
    1. Output MUST be valid ABC notation.
    2. Use piano-specific textures: Alberti bass for classical, stride LH for jazz, lush rolling 7th/9th chords for lo-fi.
    3. For high difficulty (4-5), include rapid scale runs, complex arpeggiations across octaves, and independent inner voices.
    4. For Hand Size "${config.handSize}":
       - If "Small (Max Octave)", strictly avoid intervals larger than an 8th in one hand.
       - If "Petite (Max 7th)", strictly avoid intervals of an 8th or larger.
    5. Ensure the notation is readable for a pianist with separate LH and RH voices.

    Return the result in JSON format.
  `;

  const contents = isImage ? {
    parts: [
      { inlineData: { data: inputData.split(',')[1] || inputData, mimeType: "image/jpeg" } },
      { text: textPrompt }
    ]
  } : {
    parts: [{ text: `Input ABC: ${inputData}\n\n${textPrompt}` }]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          abcNotation: { type: Type.STRING, description: 'The complete piano-optimized ABC notation' },
          explanation: { type: Type.STRING, description: 'Details about the piano-specific techniques used' },
          metadata: {
            type: Type.OBJECT,
            properties: {
              complexity: { type: Type.STRING },
              styleNotes: { type: Type.STRING }
            },
            required: ['complexity', 'styleNotes']
          }
        },
        required: ['abcNotation', 'explanation', 'metadata']
      }
    }
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error("No text content returned from the arrangement model.");
  }

  return JSON.parse(resultText);
};
