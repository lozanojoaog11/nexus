

export type PersonalityArchetype = 'Arquiteto' | 'Explorador' | 'Executor' | 'Padrão';

export type UserProfile = {
  email: string;
  createdAt: string; // ISO 8601
  name?: string;
  totalXp?: number;
  onboardingCompleted?: boolean;
  personalityArchetype?: PersonalityArchetype;
  customSystemPrompt?: string;
};

export type DailyStrategy = 'eat_the_frog' | 'small_wins' | 'deep_work_focus' | null;

export type DailyCheckin = {
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO 8601
  energia: number;
  clareza: number;
  momentum: number;
  notes?: string; // For "Brain Dump"
  completedHabitIds?: string[]; // IDs of habits completed before check-in
  directive?: string; // AI-generated daily strategic advice
  activeStrategy?: DailyStrategy;
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
  currentStreak: number;
  isKeystone?: boolean;
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

export interface CognitiveSession {
  id: string;
  type: 'dual-n-back' | 'speed-reading' | 'memory-palace' | 'reaction-time';
  score: number;
  duration: number; // seconds
  date: string;
  level: number;
  improvements?: string[];
}

export interface TrainingModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  scientificBasis: string;
  targetMetric: string;
  component: React.ComponentType<any>;
}

export interface FlowSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  focusQuality: number; // 1-10
  distractionCount: number;
  taskCompleted: string;
  flowRating: number; // 1-10
  environment: EnvironmentSettings;
  notes?: string;
}

export interface EnvironmentSettings {
  musicType: 'none' | 'focus' | 'ambient' | 'binaural' | 'nature';
  lightingLevel: number; // 1-10
  temperature: number; // celsius
  noiseLevel: 'silent' | 'minimal' | 'moderate';
  distractionsBlocked: boolean;
}

export interface BiohackingMetrics {
  date: string;
  sleep: SleepData;
  nutrition: NutritionData;
  recovery: RecoveryData;
  supplements: SupplementLog[];
  hydration: HydrationData;
  temperature: TemperatureTherapy[];
}

export interface SleepData {
  bedtime: string;
  wakeTime: string;
  duration: number;
  quality: number;
  restfulness: number;
  dreams: boolean;
  awakenings: number;
  sleepLatency: number;
  environment: {
    temperature: number;
    darkness: number;
    quietness: number;
    airQuality: number;
  };
}

export interface NutritionData {
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  meals: MealEntry[];
  fastingWindow: number;
  lastMeal: string;
  hydrationLevel: number;
  energyStability: number;
}

export interface MealEntry {
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  portion: 'small' | 'medium' | 'large';
  satisfaction: number;
}

export interface RecoveryData {
  hrvScore: number;
  restingHeartRate: number;
  stressLevel: number;
  recoveryActivities: RecoveryActivity[];
  readiness: number;
}

export interface RecoveryActivity {
  type: 'meditation' | 'breathing' | 'stretching' | 'massage' | 'nap';
  duration: number;
  quality: number;
}

export interface SupplementLog {
  name: string;
  dosage: string;
  timing: string;
  purpose: string;
  effectiveness: number;
}

export interface HydrationData {
  totalIntake: number;
  frequency: number;
  urineColor: number;
  electrolytes: boolean;
}

export interface TemperatureTherapy {
  type: 'cold' | 'heat';
  method: 'shower' | 'bath' | 'sauna' | 'cryotherapy' | 'ice_bath';
  duration: number;
  temperature: number;
  timing: 'morning' | 'afternoon' | 'evening';
  benefits: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'cognitive' | 'physical' | 'social' | 'spiritual' | 'mastery';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  icon: string;
  xpReward: number;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  requirements: AchievementRequirement[];
  badge?: string;
  scientificBasis: string;
}

export interface AchievementRequirement {
  type: 'habit_streak' | 'flow_sessions' | 'cognitive_score' | 'sleep_quality' | 'task_completion' | 'consistency';
  target: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'total';
  metric?: string;
}

export interface UserLevel {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  title: string;
  evolutionStage: string;
  capabilities: string[];
}

export interface StreakData {
  type: string;
  count: number;
  bestStreak: number;
  lastUpdate: string;
}

export type View = 'today' | 'dashboard' | 'projects' | 'guardian' | 'library' | 'development' | 'habits' | 'agenda' | 'goals' | 'cognitive' | 'flowlab' | 'biohacking' | 'achievements' | 'analytics';

// --- NEURAL ANALYTICS TYPES ---

export interface PatternInsight {
  id: string;
  type: 'correlation' | 'trend' | 'anomaly' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendation?: string;
  data: any;
  scientificBasis: string;
}

export interface PerformanceMetric {
  name: string;
  current: number;
  trend: number;
  target: number;
  unit: string;
  category: 'cognitive' | 'physical' | 'emotional' | 'productivity';
  status: 'optimal' | 'good' | 'declining' | 'critical';
}

export interface OptimizationRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string; // Translation key
  title: string; // Translation key
  description: string; // Translation key
  descriptionParams?: Record<string, string | number>;
  expectedImpact: number;
  implementation: string; // Translation key for a '|' separated list
  timeframe: 'immediate' | 'weekly' | 'monthly';
  scientificEvidence: string; // Translation key
}