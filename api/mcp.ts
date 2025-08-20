// Caminho do arquivo: /api/mcp.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

// --- Função de Inicialização do Firebase Admin ---
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    console.log("Firebase Admin já está inicializado.");
    return;
  }

  console.log("Tentando inicializar o Firebase Admin...");

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL;

  // LOG DE VERIFICAÇÃO 1: As variáveis existem?
  if (!serviceAccountJson) {
    console.error("ERRO CRÍTICO: Variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON não encontrada.");
    throw new Error("Credencial de serviço do Firebase não encontrada no ambiente da Vercel.");
  }
  if (!databaseURL) {
    console.error("ERRO CRÍTICO: Variável de ambiente VITE_FIREBASE_DATABASE_URL não encontrada.");
    throw new Error("URL do banco de dados Firebase não encontrada no ambiente da Vercel.");
  }

  // LOG DE VERIFICAÇÃO 2: A credencial é um JSON válido?
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
    console.log("JSON da credencial de serviço foi parseado com sucesso.");
  } catch (error) {
    console.error("ERRO CRÍTICO ao parsear FIREBASE_SERVICE_ACCOUNT_JSON:", error);
    // Loga os primeiros 50 caracteres para depuração, escondendo o resto.
    console.error("Início do JSON recebido:", serviceAccountJson.substring(0, 50) + "..."); 
    throw new Error("O valor em FIREBASE_SERVICE_ACCOUNT_JSON não é um JSON válido.");
  }

  // LOG DE VERIFICAÇÃO 3: O objeto 'admin.credential' existe?
  if (!admin.credential || typeof admin.credential.cert !== 'function') {
      console.error("ERRO CRÍTICO: 'admin.credential.cert' não é uma função. O pacote 'firebase-admin' pode não estar carregado corretamente.");
      throw new Error("O SDK do Firebase Admin parece estar corrompido ou não foi importado corretamente.");
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: databaseURL,
    });
    console.log("Firebase Admin SDK inicializado com SUCESSO.");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("ERRO na chamada de admin.initializeApp:", errorMessage);
    throw new Error(`Falha na inicialização do Firebase Admin: ${errorMessage}`);
  }
}

// --- Lógica das Ferramentas (sem alterações) ---
async function createHabit(params: any) {
  const { userId, name, category, frequency } = params;
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
  const newHabitData = { id: newHabitId, name, category, frequency, bestStreak: 0, currentStreak: 0 };
  await newHabitRef.set(newHabitData);
  return `Hábito '${name}' criado com sucesso!`;
}

// --- Handler Principal (sem alterações) ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    initializeFirebaseAdmin();
    const { tool, params } = req.body;
    let result;
    switch (tool) {
      case 'habits.create':
        result = await createHabit(params);
        break;
      default:
        throw new Error(`Ferramenta desconhecida: '${tool}'`);
    }
    return res.status(200).json({ result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido no servidor.";
    console.error("ERRO GERAL NA FUNÇÃO:", errorMessage);
    return res.status(500).json({ error: `Falha na execução da função: ${errorMessage}` });
  }
}
