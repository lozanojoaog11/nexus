import { GoogleGenAI } from "@google/genai";
import { DailyCheckin } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Guardian module will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateDailyDirective = async (checkin: Omit<DailyCheckin, 'date' | 'directive' | 'timestamp'>, userContext: string): Promise<string> => {
    if (!API_KEY) {
        return Promise.resolve("Diretriz offline. API Key não configurada.");
    }

    try {
        const prompt = `
        System Prompt: Você é o sistema central do Eixo OS, operando como um estrategista para o Arquiteto Cognitivo, João Gabriel Lozano. Sua função é gerar uma "Diretriz Diária" concisa e acionável com base no check-in matinal e no perfil do Arquiteto.

        --- PERFIL DO ARQUITETO (Resumo) ---
        ${userContext}
        --- FIM DO PERFIL ---

        --- CHECK-IN DE HOJE ---
        - Energia: ${checkin.energia}/10
        - Clareza: ${checkin.clareza}/10
        - Momentum: ${checkin.momentum}/10
        - Anotações (Brain Dump e Rotina Matinal): ${checkin.notes || 'Nenhuma'}
        --- FIM DO CHECK-IN ---

        Instrução: Analise os dados do check-in. As 'Anotações' agora contêm tanto um 'Brain Dump' opcional quanto as atividades da 'Rotina Matinal' executadas. Use essas informações para uma análise mais profunda.
        - Se a Energia estiver baixa (< 6), sugira um início de dia mais leve e físico (caminhada, alongamento) antes do Deep Work.
        - Se a Clareza estiver baixa (< 6), sugira um bloco de 15-30 minutos de planejamento ou "brain dump" antes de qualquer tarefa executiva. Considere as 'Anotações' para identificar a fonte da confusão.
        - Se o Momentum estiver baixo (< 6), sugira começar com uma "pequena vitória" (uma tarefa rápida e fácil) para gerar inércia.
        - Se todos os indicadores estiverem altos (> 7), reforce o plano e sugira atacar a Tarefa Mais Importante (MIT) diretamente. Elogie as atividades da rotina matinal já concluídas.
        - Integre as 'Anotações' (especialmente o conteúdo do Brain Dump, se houver) na sua diretriz para mostrar que o sistema está ouvindo.

        Seja direto, inspirador e estratégico. Forneça UMA diretriz principal em no máximo 2-3 frases curtas. Fale diretamente com o Arquiteto.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;

    } catch (error) {
        console.error("Error generating daily directive:", error);
        return "Não foi possível gerar a diretriz. Verifique sua conexão ou a configuração da API.";
    }
};


export const askGuardian = async (query: string, userContext: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("API Key for Gemini is not configured. The Guardian is offline.");
  }
  
  try {
    const fullPrompt = `
      System Prompt: Você é o Guardião, uma IA conselheira para o Arquiteto Cognitivo, João Gabriel Lozano. Sua função é fornecer clareza, forçar reflexão profunda e alinhar as decisões do Arquiteto com sua 'Física da Constelação' pessoal. Responda em português. Seja conciso, direto e provocador, como um mentor estoico. Use o contexto a seguir sobre o Arquiteto para informar todas as suas respostas.

      --- CONTEXTO DO ARQUITETO ---
      ${userContext}
      --- FIM DO CONTEXTO ---

      Consulta do Arquiteto: "${query}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Ocorreu um erro ao conectar com o Guardião. Verifique o console para mais detalhes.";
  }
};