import { GoogleGenAI, Type } from "@google/genai";
import { DailyCheckin, Habit, Project, Task, DevelopmentNode, DevelopmentEdge } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Guardian module will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateDailyDirective = async (checkin: Omit<DailyCheckin, 'date' | 'directive' | 'timestamp'>, userContext: string, language: string): Promise<string> => {
    if (!process.env.API_KEY) {
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
  if (!process.env.API_KEY) {
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
  if (!process.env.API_KEY) {
    throw new Error("API Key for Gemini is not configured. The AI is offline.");
  }

  const systemPrompt = `Você é um Coach de Performance de elite e Arquiteto de Sistemas de Produtividade, especializado em psicologia (DISC, Eneagrama) e neurociência. Sua missão é analisar a transcrição de uma conversa de diagnóstico com um novo usuário do Eixo OS e gerar uma configuração inicial perfeitamente personalizada.

**Sua análise tem duas saídas:**

**SAÍDA 1: DIAGNÓSTICO DE ARQUÉTIPO**
Com base na resposta à pergunta sobre o estilo de trabalho e no tom geral, classifique o usuário em um dos três arquétipos:
- **Arquiteto**: Se ele prefere planos claros e estrutura.
- **Explorador**: Se ele prefere explorar e conectar ideias de forma livre.
- **Executor**: Se ele é focado em resultados e eficiência.

**SAÍDA 2: GERAÇÃO DO ECOSSISTEMA INICIAL (JSON)**
Com base na transcrição E no arquétipo diagnosticado, gere um objeto JSON contendo:
- **habits**: 2-3 hábitos. Um deve ser o hábito que o usuário mencionou. Os outros devem combater o obstáculo que ele descreveu, adaptados ao arquétipo dele.
- **projects**: 1 projeto baseado no "Ponto de Fuga" do usuário.
- **tasks**: 2 tarefas iniciais para o projeto. A primeira deve ser a MIT e deve ser acionável para a "primeira vitória" que ele mencionou.
- **developmentGraph**: Um 'node' tipo 'Ponto de Fuga' para a missão, um 'node' tipo 'Skill' para superar o obstáculo, e uma 'edge' ligando os dois.

**SAÍDA 3: GERAÇÃO DO SYSTEM PROMPT PERSONALIZADO**
Crie um \`systemPrompt\` para o \`NeuralArchitectAI\` interno do app. Ele deve ser adaptado ao arquétipo e aos objetivos do usuário.
- **Exemplo para Arquiteto**: "Você é o Neural Architect AI. Seu operador é um Arquiteto, que prospera com estrutura e clareza. Sempre forneça planos passo a passo e ajude-o a construir sistemas robustos para alcançar [OBJETIVO DO USUÁRIO]."
- **Exemplo para Explorador**: "Você é o Neural Architect AI. Seu operador é um Explorador, que se energiza conectando ideias. Ajude-o a visualizar possibilidades e a canalizar sua criatividade para o [OBJETIVO DO USUÁRIO], fornecendo ferramentas para evitar a dispersão."

**Sua resposta final DEVE ser um único objeto JSON contendo as chaves \`ecosystem\` e \`profileUpdate\`.**`;

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
            ecosystem: {
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
                          type: { type: Type.STRING, enum: ['Ponto de Fuga', 'Objetivo', 'Skill'] },
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
                          label: { type: Type.STRING, enum: ['desenvolve', 'viabiliza'] }
                        },
                        required: ['id', 'source', 'target', 'label']
                      }
                    }
                  },
                  required: ['nodes', 'edges']
                }
              },
              required: ['habits', 'projects', 'tasks', 'developmentGraph']
            },
            profileUpdate: {
              type: Type.OBJECT,
              properties: {
                personalityArchetype: {
                  type: Type.STRING,
                  enum: ['Arquiteto', 'Explorador', 'Executor', 'Padrão']
                },
                customSystemPrompt: {
                  type: Type.STRING
                }
              },
              required: ['personalityArchetype', 'customSystemPrompt']
            }
          },
          required: ['ecosystem', 'profileUpdate']
        }
      }
    });

    return JSON.parse(response.text);

  } catch (error) {
    console.error("Error generating initial ecosystem:", error);
    throw new Error("A IA não conseguiu gerar o ecossistema. Por favor, tente novamente ou comece com o modelo padrão.");
  }
};
