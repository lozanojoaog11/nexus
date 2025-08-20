// Caminho do arquivo: /api/mcp.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// --- Função de Inicialização do Firebase Admin ---
// Esta função garante que o Firebase seja inicializado apenas uma vez por "instância" da função.
function initializeFirebaseAdmin() {
  // CORREÇÃO: Verifica se 'admin.apps' existe ANTES de checar seu tamanho.
  if (admin.apps && admin.apps.length > 0) {
    return;
  }

  console.log("Tentando inicializar o Firebase Admin...");

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL;

  if (!serviceAccountJson || !databaseURL) {
    console.error("ERRO CRÍTICO: Variáveis de ambiente FIREBASE_SERVICE_ACCOUNT_JSON ou VITE_FIREBASE_DATABASE_URL não encontradas.");
    throw new Error("Configuração do servidor Firebase incompleta. Verifique as variáveis de ambiente na Vercel.");
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: databaseURL,
    });
    console.log("Firebase Admin SDK inicializado com SUCESSO.");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("ERRO ao inicializar Firebase Admin:", errorMessage);
    throw new Error(`Falha na inicialização do Firebase Admin: ${errorMessage}`);
  }
}

// --- Lógica das Ferramentas ---

async function createHabit(params: any) {
  const { userId, name, category, frequency } = params;
  console.log(`Ferramenta 'habits.create' chamada com:`, { userId, name, category, frequency });

  if (!userId || !name || !category || !frequency) {
    throw new Error("Parâmetros inválidos para criar hábito. 'userId', 'name', 'category', e 'frequency' são obrigatórios.");
  }

  const db = admin.database();
  const habitsRef = db.ref(`users/${userId}/habits`);
  const newHabitRef = habitsRef.push();
  const newHabitId = newHabitRef.key;

  if (!newHabitId) {
    throw new Error("Não foi possível gerar um ID para o novo hábito no Firebase.");
  }

  const newHabitData = {
    id: newHabitId,
    name,
    category,
    frequency,
    bestStreak: 0,
    currentStreak: 0,
  };

  console.log("Salvando novo hábito no Firebase com os dados:", newHabitData);
  await newHabitRef.set(newHabitData);
  console.log("Hábito salvo com sucesso no Firebase.");

  return `Hábito '${name}' criado com sucesso!`;
}

// --- Handler Principal da Função Serverless ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuração do CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Para desenvolvimento. Em produção, restrinja para o seu domínio.
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  console.log(`[${new Date().toISOString()}] Função /api/mcp recebendo uma requisição POST...`);

  try {
    initializeFirebaseAdmin();

    const { tool, params } = req.body;
    console.log(`Requisição para a ferramenta: '${tool}' com parâmetros:`, params);

    let result;
    switch (tool) {
      case 'habits.create':
        result = await createHabit(params);
        break;
      default:
        throw new Error(`Ferramenta desconhecida: '${tool}'`);
    }

    console.log("Execução da ferramenta bem-sucedida. Enviando resposta.");
    return res.status(200).json({ result });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido no servidor.";
    console.error("ERRO GERAL NA FUNÇÃO:", errorMessage);
    return res.status(500).json({ error: `Falha na execução da função: ${errorMessage}` });
  }
}
