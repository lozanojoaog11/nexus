
import { GoogleGenAI } from "@google/genai";
import { DailyCheckin } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Guardian module will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateDailyDirective = async (checkin: Omit<DailyCheckin, 'date' | 'directive' | 'timestamp'>, userContext: string, language: string): Promise<string> => {
    if (!API_KEY) {
        return Promise.resolve("Diretriz offline. API Key não configurada.");
    }

    const langInstruction = {
        'pt-BR': 'Responda concisamente em Português do Brasil.',
        'en-US': 'Respond concisely in English (US).',
        'es-ES': 'Responde concisamente en Español (España).'
    }[language] || 'Responda concisamente em Português do Brasil.';

    try {
        const systemPrompt = `You are the central system of Eixo OS, operating as a strategist for the Cognitive Architect. Your function is to generate a concise and actionable "Daily Directive" based on the morning check-in and the Architect's profile.
Analyze the check-in data. The 'Notes' contain a 'Brain Dump' and 'Morning Routine' activities. Use this for a deeper analysis.
- If Energy is low (< 6), suggest a lighter, physical start.
- If Clarity is low (< 6), suggest a planning/dump block.
- If Momentum is low (< 6), suggest a "small win".
- If all are high (> 7), reinforce the main plan (MIT).
- Integrate the 'Notes' content into your directive.

Be direct, inspiring, and strategic. Provide ONE main directive in a maximum of 2-3 short sentences. Speak directly to the Architect. ${langInstruction}`;
        
        const userPrompt = `
        --- ARCHITECT'S PROFILE (Summary) ---
        ${userContext}
        --- END OF PROFILE ---

        --- TODAY'S CHECK-IN ---
        - Energy: ${checkin.energia}/10
        - Clarity: ${checkin.clareza}/10
        - Momentum: ${checkin.momentum}/10
        - Notes (Brain Dump and Morning Routine): ${checkin.notes || 'None'}
        --- END OF CHECK-IN ---
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
            }
        });

        return response.text;

    } catch (error) {
        console.error("Error generating daily directive:", error);
        return "Could not generate directive. Check your connection or API configuration.";
    }
};


export const askGuardian = async (query: string, systemPrompt: string, language: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("API Key for Gemini is not configured. The AI is offline.");
  }

  const langInstruction = {
    'pt-BR': 'Always respond in Portuguese (Brazil).',
    'en-US': 'Always respond in English (US).',
    'es-ES': 'Always respond in Spanish (Spain).'
  }[language] || 'Always respond in Portuguese (Brazil).';
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: `${systemPrompt}\n\n${langInstruction}`
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "An error occurred while connecting with the AI. Check the console for more details.";
  }
};
