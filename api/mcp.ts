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

// 🔥 Função para criar tarefa
async function createTask(params: any) {
  const { userId, projectId, content } = params;
  if (!userId || !projectId || !content) {
    throw new Error("Parâmetros inválidos para criar tarefa: userId, projectId e content são obrigatórios.");
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
    isMIT: false,
  };

  await newTaskRef.set(newTaskData);
  return { taskId: newTaskId };
}

// 🔥 Função para atualizar status da tarefa
async function updateTaskStatus(params: any) {
  const { userId, taskId, newStatus } = params;
  if (!userId || !taskId || !newStatus) {
    throw new Error("Parâmetros inválidos para atualizar status da tarefa: userId, taskId e newStatus são obrigatórios.");
  }

  const validStatus = ['A Fazer', 'Em Progresso', 'Concluído'];
  if (!validStatus.includes(newStatus)) {
      throw new Error(`Status inválido: '${newStatus}'. Use um dos seguintes: ${validStatus.join(', ')}`);
  }

  const db = admin.database();
  const taskRef = db.ref(`users/${userId}/tasks/${taskId}`);
  
  await taskRef.update({ status: newStatus });
  return { message: "Status da tarefa atualizado com sucesso." };
}

// 🔥 Função para atualizar detalhes da tarefa
async function updateTask(params: any) {
    const { userId, taskId, updates } = params;
    if (!userId || !taskId || !updates || typeof updates !== 'object') {
        throw new Error("Parâmetros inválidos: userId, taskId e um objeto 'updates' são obrigatórios.");
    }

    const allowedUpdates = ['content', 'notes', 'deadline', 'relatedDevelopmentNodeId', 'relatedHabitId'];
    const finalUpdates: { [key: string]: any } = {};

    for (const key in updates) {
        if (allowedUpdates.includes(key)) {
            finalUpdates[key] = updates[key];
        }
    }

    if (Object.keys(finalUpdates).length === 0) {
        throw new Error("Nenhum campo válido para atualização foi fornecido.");
    }

    const db = admin.database();
    const taskRef = db.ref(`users/${userId}/tasks/${taskId}`);
    await taskRef.update(finalUpdates);

    return { message: "Tarefa atualizada com sucesso." };
}

// 🔥 Função para deletar tarefa
async function deleteTask(params: any) {
    const { userId, taskId } = params;
    if (!userId || !taskId) {
        throw new Error("Parâmetros inválidos: userId e taskId são obrigatórios.");
    }

    const db = admin.database();
    const taskRef = db.ref(`users/${userId}/tasks/${taskId}`);
    await taskRef.remove();

    return { message: "Tarefa deletada com sucesso." };
}

// 🔥 Função para marcar/desmarcar tarefa como MIT
async function toggleTaskMIT(params: any) {
    const { userId, taskId, isMIT } = params;
    if (!userId || !taskId || typeof isMIT !== 'boolean') {
        throw new Error("Parâmetros inválidos: userId, taskId e um booleano 'isMIT' são obrigatórios.");
    }

    const db = admin.database();
    const taskRef = db.ref(`users/${userId}/tasks/${taskId}`);
    await taskRef.update({ isMIT });

    return { message: `Tarefa marcada como ${isMIT ? 'MIT' : 'não MIT'} com sucesso.` };
}

// 🔥 Função para criar projeto
async function createProject(params: any) {
    const { userId, name } = params;
    if (!userId || !name) {
        throw new Error("Parâmetros inválidos: userId e name são obrigatórios.");
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
    return { projectId: newProjectId };
}

// 🔥 Função para atualizar projeto
async function updateProject(params: any) {
    const { userId, projectId, name } = params;
    if (!userId || !projectId || !name) {
        throw new Error("Parâmetros inválidos: userId, projectId e name são obrigatórios.");
    }

    const db = admin.database();
    const projectRef = db.ref(`users/${userId}/projects/${projectId}`);
    await projectRef.update({ name });

    return { message: "Projeto atualizado com sucesso." };
}

// 🔥 Função para deletar projeto e suas tarefas
async function deleteProject(params: any) {
    const { userId, projectId } = params;
    if (!userId || !projectId) {
        throw new Error("Parâmetros inválidos: userId e projectId são obrigatórios.");
    }

    const db = admin.database();
    const updates: { [key: string]: null } = {};

    // 1. Marcar o projeto para deleção
    updates[`/users/${userId}/projects/${projectId}`] = null;

    // 2. Encontrar e marcar todas as tarefas associadas para deleção
    const tasksRef = db.ref(`users/${userId}/tasks`);
    const tasksSnapshot = await tasksRef.orderByChild('projectId').equalTo(projectId).get();

    if (tasksSnapshot.exists()) {
        tasksSnapshot.forEach(taskSnapshot => {
            updates[`/users/${userId}/tasks/${taskSnapshot.key}`] = null;
        });
    }

    // 3. Executar a deleção atômica
    await db.ref().update(updates);

    return { message: "Projeto e todas as suas tarefas foram deletados com sucesso." };
}

// 🔥 Função para listar projetos
async function listProjects(params: any) {
    const { userId } = params;
    if (!userId) {
        throw new Error("Parâmetro inválido: userId é obrigatório.");
    }

    const db = admin.database();
    const projectsRef = db.ref(`users/${userId}/projects`);
    const snapshot = await projectsRef.get();

    return snapshot.val() || {};
}

// 🔥 Função para criar meta
async function createGoal(params: any) {
    const { userId, name, horizon, deadline, areaId, description, expectedResults, successMetrics, tags } = params;
    if (!userId || !name || !horizon || !deadline || !areaId) {
        throw new Error("Parâmetros inválidos: userId, name, horizon, deadline e areaId são obrigatórios.");
    }

    const validHorizons = ['Curto Prazo (até 3 meses)', 'Médio Prazo (3-12 meses)', 'Longo Prazo (>1 ano)'];
    if (!validHorizons.includes(horizon)) {
        throw new Error(`Horizonte inválido: '${horizon}'. Use um dos seguintes: ${validHorizons.join(', ')}`);
    }

    const db = admin.database();
    const goalsRef = db.ref(`users/${userId}/goals`);
    const newGoalRef = goalsRef.push();
    const newGoalId = newGoalRef.key;

    if (!newGoalId) {
        throw new Error("Não foi possível gerar um ID para a nova meta no Firebase.");
    }

    const newGoalData = {
        id: newGoalId,
        name,
        horizon,
        deadline,
        areaId,
        description: description || "",
        expectedResults: expectedResults || "",
        successMetrics: successMetrics || "",
        tags: tags || "",
        // Milestones are stored separately, so no need to initialize here.
    };
    
    const updates: { [key: string]: any } = {};
    updates[`/users/${userId}/goals/${newGoalId}`] = newGoalData;
    updates[`/users/${userId}/milestones/${newGoalId}`] = {}; // Initialize milestones node

    await db.ref().update(updates);

    return { goalId: newGoalId };
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
      case "tasks.create":
        result = await createTask(params);
        break;
      case "tasks.updateStatus":
        result = await updateTaskStatus(params);
        break;
      case "tasks.update":
        result = await updateTask(params);
        break;
      case "tasks.delete":
        result = await deleteTask(params);
        break;
      case "tasks.toggleMIT":
        result = await toggleTaskMIT(params);
        break;
      case "projects.create":
        result = await createProject(params);
        break;
      case "projects.update":
        result = await updateProject(params);
        break;
      case "projects.delete":
        result = await deleteProject(params);
        break;
      case "projects.list":
        result = await listProjects(params);
        break;
      case "goals.create":
        result = await createGoal(params);
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
