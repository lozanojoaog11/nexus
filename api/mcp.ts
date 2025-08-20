import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';
import { z } from 'zod';

// --- Função de Inicialização do Firebase Admin SDK ---
// Garante que a inicialização ocorra apenas uma vez (singleton pattern)
function initializeFirebaseAdmin() {
  // Verificação robusta: checa se admin.apps existe ANTES de checar seu tamanho.
  if (!admin.apps || !admin.apps.length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON não está definida.');
    }
    
    let serviceAccount;
    try {
        serviceAccount = JSON.parse(serviceAccountJson);
    } catch (e) {
        throw new Error('Falha ao analisar o JSON da FIREBASE_SERVICE_ACCOUNT_JSON. Verifique o formato.');
    }
    
    const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL;
    if (!databaseURL) {
      throw new Error('A URL do banco de dados do Firebase não foi encontrada nas variáveis de ambiente.');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: databaseURL,
    });
  }
  return admin.database();
}

// --- Definição das Ferramentas ---

const habitInputSchema = z.object({
  userId: z.string(),
  name: z.string(),
  category: z.enum(['Mente', 'Corpo', 'Execução']),
  frequency: z.number().min(1).max(7),
});

async function createHabit(db: admin.database.Database, input: z.infer<typeof habitInputSchema>) {
  const { userId, name, category, frequency } = input;
  const habitsRef = db.ref(`users/${userId}/habits`);
  const newHabitRef = habitsRef.push();
  const newHabitId = newHabitRef.key;

  if (!newHabitId) {
    throw new Error('Não foi possível gerar um ID para o novo hábito.');
  }

  const newHabitData = {
    id: newHabitId,
    name,
    category,
    frequency,
    bestStreak: 0,
    currentStreak: 0,
  };

  await newHabitRef.set(newHabitData);
  return `Hábito '${name}' criado com sucesso!`;
}

// Mapeamento de ferramentas para suas funções e esquemas
const toolRegistry = {
  'habits.create': {
    execute: createHabit,
    schema: habitInputSchema,
  },
};

// --- Handler da Serverless Function ---

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Método não permitido' });
    }

    // Passo 1: Inicializa o Firebase DENTRO do handler
    const db = initializeFirebaseAdmin();

    // Passo 2: Processa a requisição
    const { tool, params } = request.body;

    if (!tool || typeof tool !== 'string' || !toolRegistry[tool]) {
      return response.status(400).json({ error: 'Ferramenta inválida ou não especificada.' });
    }

    const { execute, schema } = toolRegistry[tool];
    const validatedParams = schema.parse(params);
    const result = await execute(db, validatedParams);

    return response.status(200).json({ result });

  } catch (error) {
    console.error('Erro na API /api/mcp:', error);
    
    let errorMessage = 'Ocorreu um erro desconhecido no servidor.';
    if (error instanceof z.ZodError) {
        errorMessage = `Erro de validação nos parâmetros: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
        return response.status(400).json({ error: errorMessage });
    }
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    
    return response.status(500).json({ error: errorMessage });
  }
}
