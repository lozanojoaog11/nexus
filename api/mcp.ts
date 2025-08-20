import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';
import { z } from 'zod';

// --- Inicialização do Firebase Admin SDK ---
// As credenciais devem ser configuradas como variáveis de ambiente no Vercel
try {
  if (!admin.apps.length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON não está definida.');
    }
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    });
  }
} catch (error) {
  console.error('Erro ao inicializar o Firebase Admin SDK:', error);
}

const db = admin.database();

// --- Definição das Ferramentas ---

const habitInputSchema = z.object({
  userId: z.string(),
  name: z.string(),
  category: z.enum(['Mente', 'Corpo', 'Execução']),
  frequency: z.number().min(1).max(7),
});

async function createHabit(input: z.infer<typeof habitInputSchema>) {
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
  // Futuras ferramentas (ex: 'tasks.create') serão adicionadas aqui
};

// --- Handler da Serverless Function ---

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { tool, params } = request.body;

    if (!tool || typeof tool !== 'string' || !toolRegistry[tool]) {
      return response.status(400).json({ error: 'Ferramenta inválida ou não especificada.' });
    }

    const { execute, schema } = toolRegistry[tool];

    // Valida os parâmetros de entrada usando o esquema Zod
    const validatedParams = schema.parse(params);

    // Executa a função da ferramenta com os parâmetros validados
    const result = await execute(validatedParams);

    return response.status(200).json({ result });

  } catch (error) {
    console.error('Erro ao executar a ferramenta:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return response.status(500).json({ error: errorMessage });
  }
}
