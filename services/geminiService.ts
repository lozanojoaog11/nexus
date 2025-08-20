

import { GoogleGenAI, Type } from "@google/genai";
import { DailyCheckin, Habit, Project, Task, DevelopmentNode, DevelopmentEdge } from '../types';

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

export const generateInitialEcosystem = async (conversationTranscript: string): Promise<any> => {
  if (!API_KEY) {
    throw new Error("API Key for Gemini is not configured. The AI is offline.");
  }

  const systemPrompt = `Você é um especialista em produtividade e coach de alta performance, configurando o sistema Eixo OS para um novo usuário. Com base na transcrição da conversa de diagnóstico, sua tarefa é gerar um objeto JSON que represente a configuração inicial ideal para este operador. O JSON deve ser conciso, acionável e perfeitamente alinhado com as respostas do usuário.

Estruture o JSON da seguinte forma:
- habits: 2-3 hábitos. Um deve ser o hábito que o usuário mencionou. Os outros devem combater diretamente o obstáculo que ele descreveu. Categoria deve ser 'Mente', 'Corpo' ou 'Execução'. Frequência é o número de vezes por semana (1-7).
- projects: 1 projeto baseado no objetivo principal do usuário.
- tasks: 2-3 tarefas para o projeto, sendo a primeira a "Tarefa Mais Importante" (isMIT: true). Devem ser os primeiros passos concretos.
- developmentGraph: Um 'node' do tipo 'Objetivo' para a meta principal e um 'node' do tipo 'Skill' para superar o obstáculo. Crie uma 'edge' ligando a skill ao objetivo.

Use IDs temporários e simples como 'h1', 'p1', 't1', 'obj1', 'skill1', 'e1'. Seja criativo e inspirador nos nomes e descrições. O sistema traduzirá o conteúdo, então responda em Português do Brasil.`;

  const userPrompt = `
--- TRANSCRIÇÃO DA CONVERSA DE DIAGNÓSTICO ---
${conversationTranscript}
--- FIM DA TRANSCRIÇÃO ---

Gere o objeto JSON de configuração inicial para este usuário.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            habits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ['Mente', 'Corpo', 'Execução'] },
                  frequency: { type: Type.INTEGER }
                },
                required: ['id', 'name', 'category', 'frequency']
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING }
                },
                required: ['id', 'name']
              }
            },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  content: { type: Type.STRING },
                  isMIT: { type: Type.BOOLEAN },
                  projectId: { type: Type.STRING }
                },
                required: ['id', 'content', 'isMIT', 'projectId']
              }
            },
            developmentGraph: {
              type: Type.OBJECT,
              properties: {
                nodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ['Objetivo', 'Skill'] },
                      label: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ['id', 'type', 'label', 'description']
                  }
                },
                edges: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      source: { type: Type.STRING },
                      target: { type: Type.STRING },
                      label: { type: Type.STRING, enum: ['desenvolve'] }
                    },
                    required: ['id', 'source', 'target', 'label']
                  }
                }
              },
              required: ['nodes', 'edges']
            }
          },
          required: ['habits', 'projects', 'tasks', 'developmentGraph']
        }
      }
    });

    return JSON.parse(response.text);

  } catch (error) {
    console.error("Error generating initial ecosystem:", error);
    throw new Error("A IA não conseguiu gerar o ecossistema. Por favor, tente novamente ou comece com o modelo padrão.");
  }
};
