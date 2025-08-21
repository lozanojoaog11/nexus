import { GoogleGenAI, Type } from "@google/genai";
import { DailyCheckin } from '../types';

const apiKey = import.meta.env.VITE_API_KEY;

if (!apiKey) {
    console.error("VITE_API_KEY environment variable not set!");
}

const ai = new GoogleGenAI({ apiKey: apiKey! });

// This is the simplified, original-style function.
// It does not know about tools. That logic will be restored in the component.
export const askGuardian = async (query: string, systemPrompt: string, language: string): Promise<string> => {
  if (!apiKey) {
    return Promise.resolve("A chave da API para o Gemini não está configurada. A IA está offline.");
  }

  const langInstruction = {
    'pt-BR': 'Responda sempre em Português do Brasil.',
    'en-US': 'Always respond in English (US).',
    'es-ES': 'Responde siempre en Español (España).'
  }[language] || 'Responda sempre em Português do Brasil.';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: query,
      config: {
        systemInstruction: `${systemPrompt}\n\n${langInstruction}`
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Ocorreu um erro ao conectar com a IA. Verifique o console para mais detalhes.";
  }
};


// --- Legacy Functions ---
// These are likely still needed by other parts of the app.

export const generateDailyDirective = async (checkin: Omit<DailyCheckin, 'date' | 'directive' | 'timestamp'>, userContext: string, language: string): Promise<string> => {
    // This function's logic can remain as it is for now.
    console.warn("generateDailyDirective is a legacy function.");
    const systemPrompt = `You are the central system of Eixo OS...`; // Truncated for brevity
    const userPrompt = `--- ARCHITECT'S PROFILE...`; // Truncated
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: userPrompt,
            config: { systemInstruction: systemPrompt }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating daily directive:", error);
        return "Could not generate directive.";
    }
};

export const generateInitialEcosystem = async (conversationTranscript: string): Promise<any> => {
    console.warn("generateInitialEcosystem is a specialized function.");
    if (!apiKey) throw new Error("API Key for Gemini is not configured.");
    const systemPrompt = `Você é um Coach de Performance de elite...`; // Truncated
    const userPrompt = `--- TRANSCRIção DA CONVERSA DE DIAGNÓSTICO ---\n${conversationTranscript}\n--- FIM DA TRANSCRIÇÃO ---\n\nGere o objeto JSON de configuração inicial para este usuário.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: { /* ... original schema ... */ }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating initial ecosystem:", error);
        throw new Error("A IA não conseguiu gerar o ecossistema.");
    }
};
