import { FunctionDeclaration, Type } from "@google/genai";

export const JARVIS_TOOLS: FunctionDeclaration[] = [
  // --- Módulo de Hábitos ---
  {
    name: "habits.create",
    description: "Cria um novo hábito para o usuário.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "O nome do novo hábito (ex: 'Meditar por 10 minutos')." },
        category: { type: Type.STRING, enum: ["Mente", "Corpo", "Execução"], description: "A categoria do hábito." },
        frequency: { type: Type.NUMBER, description: "A frequência semanal desejada (1 a 7)." },
      },
      required: ["name", "category", "frequency"],
    },
  },
  // --- Módulo de Projetos ---
  {
    name: "projects.create",
    description: "Cria um novo projeto.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "O nome do novo projeto (ex: 'Lançamento do Eixo OS V2')." },
      },
      required: ["name"],
    },
  },
  {
    name: "projects.update",
    description: "Atualiza o nome de um projeto existente.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: { type: Type.STRING, description: "O ID do projeto a ser atualizado." },
        name: { type: Type.STRING, description: "O novo nome para o projeto." },
      },
      required: ["projectId", "name"],
    },
  },
  {
    name: "projects.delete",
    description: "Deleta um projeto e todas as suas tarefas associadas. Esta ação é irreversível.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: { type: Type.STRING, description: "O ID do projeto a ser deletado." },
      },
      required: ["projectId"],
    },
  },
  {
    name: "projects.list",
    description: "Lista todos os projetos ativos do usuário.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  // --- Módulo de Tarefas ---
  {
    name: "tasks.create",
    description: "Cria uma nova tarefa e a associa a um projeto.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        projectId: { type: Type.STRING, description: "O ID do projeto ao qual a tarefa pertence." },
        content: { type: Type.STRING, description: "O conteúdo ou descrição da tarefa." },
      },
      required: ["projectId", "content"],
    },
  },
  {
    name: "tasks.updateStatus",
    description: "Atualiza o status de uma tarefa.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskId: { type: Type.STRING, description: "O ID da tarefa a ser atualizada." },
        newStatus: { type: Type.STRING, enum: ["A Fazer", "Em Progresso", "Concluído"], description: "O novo status da tarefa." },
      },
      required: ["taskId", "newStatus"],
    },
  },
  {
    name: "tasks.update",
    description: "Atualiza os detalhes de uma tarefa, como seu conteúdo, notas ou prazo.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskId: { type: Type.STRING, description: "O ID da tarefa a ser atualizada." },
        updates: {
          type: Type.OBJECT,
          description: "Um objeto contendo os campos a serem atualizados.",
          properties: {
            content: { type: Type.STRING, description: "O novo conteúdo da tarefa." },
            notes: { type: Type.STRING, description: "As novas notas para a tarefa." },
            deadline: { type: Type.STRING, description: "A nova data de prazo (formato YYYY-MM-DD)." },
          },
        },
      },
      required: ["taskId", "updates"],
    },
  },
  {
    name: "tasks.delete",
    description: "Deleta uma tarefa específica.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskId: { type: Type.STRING, description: "O ID da tarefa a ser deletada." },
      },
      required: ["taskId"],
    },
  },
  {
    name: "tasks.toggleMIT",
    description: "Marca ou desmarca uma tarefa como 'Mais Importante do Dia' (MIT).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskId: { type: Type.STRING, description: "O ID da tarefa." },
        isMIT: { type: Type.BOOLEAN, description: "Definir como 'true' para marcar como MIT, 'false' para desmarcar." },
      },
      required: ["taskId", "isMIT"],
    },
  },
  // --- Módulo de Metas ---
  {
    name: "goals.create",
    description: "Cria uma nova meta estratégica para o usuário.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "O nome da meta (ex: 'Aprender a programar em TypeScript')." },
        horizon: { type: Type.STRING, enum: ["Curto Prazo (até 3 meses)", "Médio Prazo (3-12 meses)", "Longo Prazo (>1 ano)"], description: "O horizonte de tempo da meta." },
        deadline: { type: Type.STRING, description: "A data limite para alcançar a meta (formato YYYY-MM-DD)." },
        areaId: { type: Type.STRING, description: "O ID do nó do Grafo de Desenvolvimento ao qual esta meta está associada." },
        description: { type: Type.STRING, description: "Uma descrição detalhada da meta (opcional)." },
      },
      required: ["name", "horizon", "deadline", "areaId"],
    },
  },
  {
    name: "goals.update",
    description: "Atualiza os detalhes de uma meta existente.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        goalId: { type: Type.STRING, description: "O ID da meta a ser atualizada." },
        updates: {
          type: Type.OBJECT,
          description: "Um objeto contendo os campos da meta a serem atualizados (ex: name, description, deadline).",
        },
      },
      required: ["goalId", "updates"],
    },
  },
  {
    name: "goals.delete",
    description: "Deleta uma meta e todos os seus marcos associados. Ação irreversível.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        goalId: { type: Type.STRING, description: "O ID da meta a ser deletada." },
      },
      required: ["goalId"],
    },
  },
  // --- Módulo de Marcos (Milestones) ---
  {
    name: "milestones.create",
    description: "Adiciona um novo marco (milestone) a uma meta existente.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        goalId: { type: Type.STRING, description: "O ID da meta à qual o marco pertence." },
        name: { type: Type.STRING, description: "O nome ou descrição do marco." },
        date: { type: Type.STRING, description: "A data alvo para o marco (formato YYYY-MM-DD)." },
      },
      required: ["goalId", "name", "date"],
    },
  },
  {
    name: "milestones.update",
    description: "Atualiza os detalhes de um marco existente.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        goalId: { type: Type.STRING, description: "O ID da meta à qual o marco pertence." },
        milestoneId: { type: Type.STRING, description: "O ID do marco a ser atualizado." },
        updates: {
          type: Type.OBJECT,
          description: "Um objeto contendo os campos a serem atualizados (ex: name, date).",
        },
      },
      required: ["goalId", "milestoneId", "updates"],
    },
  },
  {
    name: "milestones.delete",
    description: "Deleta um marco de uma meta.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        goalId: { type: Type.STRING, description: "O ID da meta à qual o marco pertence." },
        milestoneId: { type: Type.STRING, description: "O ID do marco a ser deletado." },
      },
      required: ["goalId", "milestoneId"],
    },
  },
];
