import { GoogleGenAI, Type } from "@google/genai";
import { DailyCheckin, Habit, Project, Task, DevelopmentNode, Goal, UserProfile } from '../types';
import { JARVIS_TOOLS } from './jarvisTools';

const apiKey = import.meta.env.VITE_API_KEY;

if (!apiKey) {
    console.error("VITE_API_KEY environment variable not set!");
}

const ai = new GoogleGenAI({ apiKey: apiKey! });

// --- MCP API Caller ---
async function callMcpTool(tool: string, params: any, userId: string): Promise<any> {
    try {
        const response = await fetch('/api/mcp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tool, params: { ...params, userId } }),
        });
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`MCP API Error: ${errorBody.error || response.statusText}`);
        }
        const result = await response.json();
        return result.result;
    } catch (error) {
        console.error(`Failed to call MCP tool '${tool}':`, error);
        return { error: `Failed to execute tool: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
}

// --- Jarvis Core Logic ---

const JARVIS_MANIFESTO = `Você é Jarvis, o co-piloto de IA do sistema operacional Eixo OS. Sua função primária é ser um parceiro estratégico no crescimento e na execução do usuário (o Arquiteto). Você é proativo, analítico e focado em resultados.

**Protocolo de Interação com Ferramentas:**
- Sua principal forma de agir é através do uso de ferramentas. Para usar uma ferramenta, sua resposta DEVE ser um único objeto JSON contendo as chaves "tool" e "params".
- Se a solicitação do usuário for ambígua, NÃO adivinhe. Faça uma pergunta para obter os detalhes que faltam.
- Se a solicitação não exigir uma ferramenta, responda normalmente como texto.`;

// Function to generate a text description of tools for the prompt
function generateToolDescription(): string {
    let description = "\n--- FERRAMENTAS DISPONÍVEIS ---\n";
    JARVIS_TOOLS.forEach((tool, index) => {
        description += `${index + 1}. ${tool.name}\n`;
        description += `   - Descrição: ${tool.description}\n`;
        description += `   - Parâmetros (params):\n`;
        const params = tool.parameters.properties as { [key: string]: any };
        for (const key in params) {
            const req = tool.parameters.required?.includes(key) ? "obrigatório" : "opcional";
            description += `     - ${key} (${params[key].type}, ${req}): ${params[key].description}\n`;
        }
    });
    description += "--- FIM DAS FERRAMENTAS ---\n";
    return description;
}

interface JarvisContext {
    profile?: UserProfile;
    checkin?: DailyCheckin;
    habits?: Habit[];
    goals?: Goal[];
    tasks?: Task[];
    projects?: Project[];
    developmentNodes?: DevelopmentNode[];
}

export const askGuardian = async (
    query: string,
    userId: string,
    context: JarvisContext,
    language: string
): Promise<string> => {
    if (!apiKey) {
        return Promise.resolve("A chave da API para o Gemini não está configurada. A IA está offline.");
    }

    const langInstruction = {
        'pt-BR': 'Responda sempre em Português do Brasil.',
        'en-US': 'Always respond in English (US).',
        'es-ES': 'Responde siempre en Español (España).'
    }[language] || 'Responda sempre em Português do Brasil.';

    let contextSummary = "\n--- CONTEXTO ATUAL DO ARQUITETO ---\n";
    if (context.profile?.name) contextSummary += `- Nome: ${context.profile.name}\n`;
    if (context.goals && context.goals.length > 0) contextSummary += `- Metas Ativas: ${context.goals.map(g => g.name).join(', ')}\n`;
    if (context.projects && context.projects.length > 0) contextSummary += `- Projetos Ativos: ${context.projects.map(p => p.name).join(', ')}\n`;
    const mitTasks = context.tasks?.filter(t => t.isMIT);
    if (mitTasks && mitTasks.length > 0) contextSummary += `- Tarefas MIT de Hoje: ${mitTasks.map(t => t.content).join(', ')}\n`;
    contextSummary += "--- FIM DO CONTEXTO ---\n";

    const systemPrompt = `${JARVIS_MANIFESTO}\n${generateToolDescription()}\n${contextSummary}\n${langInstruction}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: query,
            config: {
                systemInstruction: systemPrompt,
            }
        });

        const responseText = response.text.trim();
        
        // Check if the response is a JSON object for a tool call
        if (responseText.startsWith('{') && responseText.endsWith('}')) {
            try {
                const toolCall = JSON.parse(responseText);
                if (toolCall.tool && toolCall.params) {
                    console.log("Jarvis decided to use a tool:", toolCall.tool, "with args:", toolCall.params);
                    const apiResult = await callMcpTool(toolCall.tool, toolCall.params, userId);
                    // Return a simple confirmation message after tool execution
                    return `Ação '${toolCall.tool}' executada. Resultado: ${JSON.stringify(apiResult)}`;
                }
            } catch (e) {
                // Not a valid JSON or not a tool call, so treat as plain text
                return responseText;
            }
        }
        
        return responseText;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Ocorreu um erro ao conectar com a IA. Verifique o console para mais detalhes.";
    }
};

// --- Legacy Functions ---
export const generateDailyDirective = async (checkin: Omit<DailyCheckin, 'date' | 'directive' | 'timestamp'>, userContext: string, language: string): Promise<string> => {
    console.warn("generateDailyDirective is a legacy function.");
    return askGuardian(`Gere a diretriz diária para o seguinte check-in: Energia ${checkin.energia}/10, Clareza ${checkin.clareza}/10, Momentum ${checkin.momentum}/10, Notas: ${checkin.notes}`, 'temp-user-id', { checkin: checkin as DailyCheckin }, language);
};

export const generateInitialEcosystem = async (conversationTranscript: string): Promise<any> => {
    console.warn("generateInitialEcosystem is a specialized function and does not use the new Jarvis tools.");
    if (!apiKey) throw new Error("API Key for Gemini is not configured.");
    const systemPrompt = `Você é um Coach de Performance de elite...`; // Truncated
    const userPrompt = `--- TRANSCRIÇÃO DA CONVERSA DE DIAGNÓSTICO ---\n${conversationTranscript}\n--- FIM DA TRANSCRIÇÃO ---\n\nGere o objeto JSON de configuração inicial para este usuário.`;
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
