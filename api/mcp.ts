/// api/mcp.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "firebase-admin";

// 🔥 Inicialização do Firebase Admin direto no mesmo arquivo
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) return;

  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 não definida nas variáveis de ambiente.");
  }

  // Decodifica o JSON inteiro do service account
  const serviceAccount = JSON.parse(
    Buffer.from(base64, "base64").toString("utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  });

  console.log("✅ Firebase Admin inicializado com sucesso!");
}

// 🔥 Função para criar hábito
async function createHabit(params: any) {
  const { userId, name, category, frequency } = params;
  if (!userId || !name || !category || !frequency) {
    throw new Error("Parâmetros inválidos para criar hábito.");
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

  await newHabitRef.set(newHabitData);
  return `Hábito '${name}' criado com sucesso!`;
}

// 🔥 Função para criar projeto
async function createProject(params: any) {
  const { userId, name } = params;
  if (!userId || !name) {
    throw new Error("Parâmetros inválidos para criar projeto.");
  }

  const db = admin.database();
  const projectsRef = db.ref(`users/${userId}/projects`);
  const newProjectRef = projectsRef.push();
  const newProjectId = newProjectRef.key;

  if (!newProjectId) {
    throw new Error("Não foi possível gerar um ID para o novo projeto no Firebase.");
  }

  const newProjectData = {
    id: newProjectId,
    name,
  };

  await newProjectRef.set(newProjectData);
  return newProjectId;
}

// 🔥 Função para criar tarefa
async function createTask(params: any) {
  const { userId, projectId, content, isMIT } = params;
  if (!userId || !projectId || !content) {
    throw new Error("Parâmetros inválidos para criar tarefa.");
  }

  const db = admin.database();
  const tasksRef = db.ref(`users/${userId}/tasks`);
  const newTaskRef = tasksRef.push();
  const newTaskId = newTaskRef.key;

  if (!newTaskId) {
    throw new Error("Não foi possível gerar um ID para a nova tarefa no Firebase.");
  }

  const newTaskData = {
    id: newTaskId,
    projectId,
    content,
    status: 'A Fazer',
    isMIT: isMIT || false,
  };

  await newTaskRef.set(newTaskData);
  return newTaskId;
}

// 🔥 Função para atualizar status da tarefa
async function updateTaskStatus(params: any) {
  const { userId, taskId, newStatus } = params;
  if (!userId || !taskId || !newStatus) {
    throw new Error("Parâmetros inválidos para atualizar status da tarefa.");
  }

  const validStatuses: string[] = ['A Fazer', 'Em Progresso', 'Concluído'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Status inválido: '${newStatus}'. Use um dos seguintes: ${validStatuses.join(', ')}`);
  }

  const db = admin.database();
  const taskRef = db.ref(`users/${userId}/tasks/${taskId}`);
  
  await taskRef.update({ status: newStatus });
  return `Status da tarefa atualizado para '${newStatus}' com sucesso.`;
}

// 🔥 Handler principal da API
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    initializeFirebaseAdmin();

    const { tool, params } = req.body;
    let result;

    switch (tool) {
      case "habits.create":
        result = await createHabit(params);
        break;
      case "projects.create":
        result = await createProject(params);
        break;
      case "tasks.create":
        result = await createTask(params);
        break;
      case "tasks.updateStatus":
        result = await updateTaskStatus(params);
        break;
      default:
        throw new Error(`Ferramenta desconhecida: '${tool}'`);
    }

    return res.status(200).json({ result });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido.";
    console.error("ERRO GERAL NA FUNÇÃO:", errorMessage);
    return res
      .status(500)
      .json({ error: `Falha na execução da função: ${errorMessage}` });
  }
}
