import { MCPServer, Tool } from '@modelcontextprotocol/server';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carrega as variáveis de ambiente do arquivo .env na pasta atual
dotenv.config({ path: path.resolve(__dirname, '.env') });

// --- Inicialização do Firebase Admin SDK ---

// Tenta inicializar a partir do JSON na variável de ambiente, caso contrário, usa o caminho do arquivo.
// Isso oferece flexibilidade na configuração das credenciais.
try {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    });
    console.log('Firebase Admin SDK inicializado com sucesso usando JSON da variável de ambiente.');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
     admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    });
    console.log('Firebase Admin SDK inicializado com sucesso usando GOOGLE_APPLICATION_CREDENTIALS.');
  } else {
    throw new Error('Nenhuma credencial do Firebase Admin foi encontrada. Defina FIREBASE_SERVICE_ACCOUNT_JSON ou GOOGLE_APPLICATION_CREDENTIALS no arquivo .env');
  }
} catch (error) {
  console.error('Erro ao inicializar o Firebase Admin SDK:', error);
  process.exit(1); // Encerra o processo se a inicialização falhar
}

const db = admin.database();

// --- Definição da Ferramenta `habits.create` ---

const habitInputSchema = z.object({
  userId: z.string().describe("O ID do usuário para quem o hábito será criado."),
  name: z.string().describe('O nome do novo hábito (Ex: "Meditação Matinal").'),
  category: z.enum(['Mente', 'Corpo', 'Execução']).describe("A categoria do hábito."),
  frequency: z.number().min(1).max(7).describe("A frequência semanal (1 a 7)."),
});

const createHabitTool = new Tool({
  name: 'habits.create',
  description: 'Cria um novo hábito no sistema Eixo OS para um usuário específico.',
  
  // Define o esquema de entrada usando Zod para validação automática
  inputSchema: habitInputSchema,

  // A lógica que será executada quando a ferramenta for chamada
  async execute(input: z.infer<typeof habitInputSchema>) {
    const { userId, name, category, frequency } = input;
    
    try {
      // Referência para o nó de hábitos do usuário específico
      const habitsRef = db.ref(`users/${userId}/habits`);
      
      // Gera um novo ID único para o hábito
      const newHabitRef = habitsRef.push();
      const newHabitId = newHabitRef.key;

      if (!newHabitId) {
        throw new Error('Não foi possível gerar um ID para o novo hábito.');
      }

      // Monta o objeto do novo hábito, replicando a lógica do app React
      const newHabitData = {
        id: newHabitId,
        name,
        category,
        frequency,
        bestStreak: 0,
        currentStreak: 0,
        // 'history' não é inicializado, assim como no hook useDatabase.ts
      };

      // Salva o novo hábito no Firebase Realtime Database
      await newHabitRef.set(newHabitData);

      console.log(`Hábito '${name}' criado com sucesso para o usuário ${userId}.`);
      
      // Retorna uma mensagem de sucesso
      return `Hábito '${name}' criado com sucesso!`;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
      console.error('Erro ao criar o hábito:', errorMessage);
      // Retorna uma mensagem de erro detalhada
      throw new Error(`Falha ao criar o hábito: ${errorMessage}`);
    }
  },
});

// --- Inicialização do Servidor MCP ---

const server = new MCPServer({
  port: 8080, // Porta padrão para o servidor MCP
  tools: [createHabitTool], // Registra a ferramenta no servidor
  // Adiciona o middleware de CORS para permitir requisições do frontend
  middlewares: [cors()],
});

server.start().then(() => {
  console.log('🚀 HabitServer MCP está rodando na porta 8080');
  console.log('Ferramentas disponíveis: habits.create');
});
