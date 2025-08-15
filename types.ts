
export type UserProfile = {
  email: string;
  createdAt: string; // ISO 8601
  name?: string;
};

export type DailyCheckin = {
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO 8601
  energia: number;
  clareza: number;
  momentum: number;
  notes?: string; // For "Brain Dump"
  completedHabitIds?: string[]; // IDs of habits completed before check-in
  directive?: string; // AI-generated daily strategic advice
};

export type Habit = {
  id: string;
  name: string;
  category: 'Corpo' | 'Mente' | 'Execução';
  frequency: number; // Target times per week
  history: {
    date: string; // YYYY-MM-DD
    completed: boolean;
  }[];
  bestStreak: number;
};

export type TaskStatus = 'A Fazer' | 'Em Progresso' | 'Concluído';

export type Task = {
  id: string;
  content: string;
  status: TaskStatus;
  isMIT: boolean; // Most Important Task
  notes?: string;
  relatedDevelopmentNodeId?: string; // Links task to a node in the Development Graph
  deadline?: string; // YYYY-MM-DD
  projectId?: string;
  relatedHabitId?: string; // Links task to a supporting habit
};

export type CalendarEvent = {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
};

export type Project = {
  id: string;
  name: string;
  tasks: Task[];
};

export type BookNote = {
  id: string;
  content: string;
  createdAt: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  status: 'Lendo' | 'Lido' | 'Quero Ler';
  notes: BookNote[];
  relatedDevelopmentNodeId?: string;
};

export type Message = {
    sender: 'user' | 'guardian';
    text: string;
};

export type Milestone = {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
};

export type GoalHorizon = 'Curto Prazo (até 3 meses)' | 'Médio Prazo (3-12 meses)' | 'Longo Prazo (>1 ano)';

export type Goal = {
    id: string;
    name: string;
    areaId: string; // Link to DevelopmentNode id
    horizon: GoalHorizon;
    deadline: string; // YYYY-MM-DD
    description?: string;
    expectedResults?: string;
    successMetrics?: string;
    tags?: string; // Comma-separated for simplicity
    relatedProjectIds?: string[];
    milestones: Milestone[];
};


// --- Development Graph Types ---
export type DevelopmentNodeType = 'Ponto de Fuga' | 'Objetivo' | 'Skill' | 'Recurso' | 'Hábito' | 'Mentor';

export type IconName = 'Centro' | 'Foguete' | 'Negocios' | 'Estudos' | 'Educacao' | 'Global' | 'Saude' | 'Metas';

export interface DevelopmentNode {
    id: string;
    type: DevelopmentNodeType;
    label: string;
    description: string;
    icon?: IconName;
    successMetrics?: string;
    targetDate?: string; // YYYY-MM-DD
}

export interface DevelopmentEdge {
    id: string;
    source: string; // from node id
    target: string; // to node id
    label: 'suporta' | 'desenvolve' | 'viabiliza' | 'inspirado por';
}

export type DevelopmentGraph = {
    nodes: DevelopmentNode[];
    edges: DevelopmentEdge[];
}

export type View = 'dashboard' | 'projects' | 'guardian' | 'library' | 'development' | 'habits' | 'agenda' | 'goals';