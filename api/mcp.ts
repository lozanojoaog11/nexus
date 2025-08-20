// Importa os tipos necessários da Vercel e do Firebase Admin
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// --- Função de Inicialização Segura do Firebase Admin ---
// Garante que o SDK seja inicializado apenas uma vez e lida com erros de configuração.
function initializeFirebaseAdmin() {
  // Se o app já estiver inicializado, retorna a instância existente.
  if (admin.apps.length) {
    return admin.app();
  }

  console.log('Tentando inicializar o Firebase Admin SDK...');

  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL;

    // Câmera 1: Verifica se as variáveis de ambiente essenciais existem.
    if (!serviceAccountJson) {
      throw new Error('Variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON não encontrada.');
    }
    if (!databaseURL) {
      throw new Error('Variável de ambiente VITE_FIREBASE_DATABASE_URL não encontrada.');
    }

    // Câmera 2: Tenta fazer o parse do JSON da service account.
    const serviceAccount = JSON.parse(serviceAccountJson);

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: databaseURL,
    });

    console.log('Firebase Admin SDK inicializado com sucesso.');
    return app;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    // Câmera 3: Loga o erro exato da inicialização.
    console.error('Erro CRÍTICO ao inicializar o Firebase Admin SDK:', errorMessage);
    // Lança o erro para que o handler principal possa capturá-lo e reportá-lo.
    throw new Error(`Falha na configuração do Firebase: ${errorMessage}`);
  }
}

// --- Handler Principal da Função Serverless ---

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Configuração do CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  // Câmera 4: Log de início da requisição.
  console.log(`Recebida requisição para a ferramenta: ${request.body?.tool || 'desconhecida'}`);

  try {
    // Garante que o Firebase está inicializado antes de prosseguir.
    initializeFirebaseAdmin();
    const db = admin.database();

    const { tool, params } = request.body;

    if (!tool || !params) {
      return response.status(400).json({ error: 'Requisição inválida. "tool" e "params" são obrigatórios.' });
    }

    let result;

    // Roteador de Ferramentas
    switch (tool) {
      case 'habits.create':
        // Câmera 5: Log específico para a ferramenta 'habits.create'.
        console.log('Executando a ferramenta "habits.create" com os parâmetros:', params);
        
        const { userId, name, category, frequency } = params;
        if (!userId || !name || !category || !frequency) {
          return response.status(400).json({ error: 'Parâmetros faltando para habits.create: userId, name, category, frequency são necessários.' });
        }

        const habitsRef = db.ref(`users/${userId}/habits`);
        const newHabitRef = habitsRef.push();
        const newHabitId = newHabitRef.key;

        if (!newHabitId) {
          throw new Error('Não foi possível gerar um ID para o novo hábito no Firebase.');
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

        console.log(`Hábito '${name}' criado com sucesso para o usuário ${userId}.`);
        result = `Hábito '${name}' criado com sucesso!`;
        break;

      default:
        console.warn(`Tentativa de chamada de ferramenta não encontrada: "${tool}"`);
        return response.status(404).json({ error: `Ferramenta "${tool}" não encontrada.` });
    }

    return response.status(200).json({ result });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido no servidor.';
    // Câmera 6: Log do erro final capturado pelo handler.
    console.error('Erro ao executar a ferramenta:', error);
    
    // Retorna a mensagem de erro específica para o cliente para facilitar a depuração.
    return response.status(500).json({ error: `Falha na execução da função: ${errorMessage}` });
  }
}
