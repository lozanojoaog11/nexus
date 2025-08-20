// Importa os tipos necessários da Vercel e do Firebase Admin
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// --- Inicialização do Firebase Admin SDK ---

// Verifica se o app do Firebase já foi inicializado para evitar erros em ambientes serverless
// onde a função pode ser "quente" (reutilizada).
if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountJson) {
      throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON não está definida.');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    });
    console.log('Firebase Admin SDK inicializado com sucesso.');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro crítico ao inicializar o Firebase Admin SDK:', errorMessage);
    // Se a inicialização falhar, não podemos continuar.
    // As funções que tentarem usar o 'db' vão falhar, o que é o comportamento esperado.
  }
}

const db = admin.database();

// --- Handler Principal da Função Serverless ---

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // --- Configuração do CORS ---
  // Permite que o frontend (rodando em qualquer domínio) faça requisições para esta API.
  // Em produção, você pode querer restringir isso a domínios específicos.
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // O browser envia uma requisição "preflight" OPTIONS antes do POST para verificar o CORS.
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Garante que apenas o método POST seja aceito para a execução das ferramentas.
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    // Extrai o nome da ferramenta e os parâmetros do corpo da requisição.
    const { tool, params } = request.body;

    if (!tool || !params) {
      return response.status(400).json({ error: 'Requisição inválida. "tool" e "params" são obrigatórios.' });
    }

    let result;

    // --- Roteador de Ferramentas ---
    // O switch decide qual bloco de código executar com base no nome da ferramenta.
    switch (tool) {
      case 'habits.create':
        // Validação básica dos parâmetros para a ferramenta específica.
        const { userId, name, category, frequency } = params;
        if (!userId || !name || !category || !frequency) {
          return response.status(400).json({ error: 'Parâmetros faltando para habits.create. São necessários: userId, name, category, frequency.' });
        }

        // --- Lógica da Ferramenta `habits.create` ---
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

        console.log(`Hábito '${name}' criado com sucesso para o usuário ${userId}.`);
        result = `Hábito '${name}' criado com sucesso!`;
        break;

      // Adicione outros 'case' aqui para futuras ferramentas.
      // case 'tasks.create':
      //   // Lógica para criar tarefas...
      //   break;

      default:
        // Se a ferramenta solicitada não existir, retorna um erro.
        return response.status(404).json({ error: `Ferramenta "${tool}" não encontrada.` });
    }

    // Se a execução da ferramenta for bem-sucedida, retorna o resultado.
    return response.status(200).json({ result });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido no servidor.';
    console.error('Erro ao executar a ferramenta:', errorMessage);
    // Em caso de qualquer erro durante a execução, retorna um status 500.
    return response.status(500).json({ error: `Falha ao executar a ferramenta: ${errorMessage}` });
  }
}
