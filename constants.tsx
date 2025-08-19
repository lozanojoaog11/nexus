import { Project, Book, View, DevelopmentGraph, Habit, CalendarEvent, Goal, IconName } from './types';

export const ACCENT_COLOR = '#00A9FF';

export const INITIAL_HABITS: Habit[] = [
  { id: 'h1', name: 'Meditação Mindfulness', category: 'Mente', frequency: 7, history: [], bestStreak: 0 },
  { id: 'h2', name: 'Bloco de Deep Work (90 min)', category: 'Execução', frequency: 5, history: [], bestStreak: 0 },
  { id: 'h3', name: 'Leitura Focada (15 min)', category: 'Mente', frequency: 7, history: [], bestStreak: 0 },
  { id: 'h4', name: 'Treino de Força / Exercício', category: 'Corpo', frequency: 4, history: [], bestStreak: 0 },
  { id: 'h5', name: 'Protocolo Noturno (Wind down)', category: 'Corpo', frequency: 7, history: [], bestStreak: 0 },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'd.IA.logo',
    tasks: [
      { id: 't1', content: 'Definir a MIT para o dia', status: 'A Fazer', isMIT: true, relatedDevelopmentNodeId: 'obj1', relatedHabitId: 'h2' },
      { id: 't2', content: 'Estruturar mini-curso (Block 3)', status: 'A Fazer', isMIT: false, relatedDevelopmentNodeId: 'skill3', relatedHabitId: 'h2' },
      { id: 't3', content: 'Revisar a Física do Desenvolvimento', status: 'Em Progresso', isMIT: false },
      { id: 't4', content: 'Planejar próximo sprint', status: 'Concluído', isMIT: false },
    ],
  },
];

export const INITIAL_BOOKS: Book[] = [
    {
        id: 'b1',
        title: 'Deep Work',
        author: 'Cal Newport',
        status: 'Lendo',
        notes: [
            {id: 'n1', content: 'O conceito de desligamento completo é a chave para evitar o burnout que sinto no final do dia.', createdAt: new Date().toISOString()}
        ],
        relatedDevelopmentNodeId: 'res1'
    },
    {
        id: 'b2',
        title: 'Building a Second Brain',
        author: 'Tiago Forte',
        status: 'Lendo',
        notes: [],
        relatedDevelopmentNodeId: 'res2'
    },
    {
        id: 'b3',
        title: 'Sapiens: Uma Breve História da Humanidade',
        author: 'Yuval Noah Harari',
        status: 'Quero Ler',
        notes: [],
        relatedDevelopmentNodeId: 'res3'
    }
];

export const INITIAL_AGENDA_EVENTS: CalendarEvent[] = [
    { id: 'e1', title: 'Reunião de Alinhamento Semanal', date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '10:30' },
    { id: 'e2', title: 'Bloco de Deep Work: Mini-Curso', date: new Date().toISOString().split('T')[0], startTime: '11:00', endTime: '12:30' },
];

const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);

export const INITIAL_GOALS: Goal[] = [
    {
        id: 'g1',
        name: 'Lançar Mini-Curso Assinatura',
        areaId: 'obj1',
        horizon: 'Médio Prazo (3-12 meses)',
        deadline: '2024-12-31',
        description: 'Criar e lançar um produto de conhecimento que opere de forma semi-autônoma, gerando uma nova fonte de receita e autoridade.',
        expectedResults: 'Curso lançado com pelo menos 100 alunos na primeira turma. Feedback positivo acima de 8/10.',
        successMetrics: 'Faturamento de R$50k no lançamento. Taxa de conclusão do curso de 40%.',
        tags: 'educação, ia, marketing',
        relatedProjectIds: ['p1'],
        milestones: [
            { id: 'm1', name: 'Estrutura do curso definida', date: new Date().toISOString().split('T')[0] },
            { id: 'm2', name: 'Gravação dos módulos concluída', date: nextWeek.toISOString().split('T')[0] },
        ]
    }
];

export const INITIAL_DEVELOPMENT_DATA: DevelopmentGraph = {
    nodes: [
        { id: 'pf1', type: 'Ponto de Fuga', label: 'R$1M com d.IA.logo', description: 'Materializar a "potência realizada" através do sucesso do ecossistema educacional.', icon: 'Foguete', successMetrics: 'Atingir R$1M de faturamento em 18-24 meses.' },
        { id: 'obj1', type: 'Objetivo', label: 'Lançar Mini-Curso Assinatura', description: 'Criar e lançar um produto de conhecimento que opere de forma semi-autônoma (Skill Pipeline, Block 3).', icon: 'Negocios', targetDate: '2024-12-31' },
        { id: 'obj2', type: 'Objetivo', label: 'Dominar Foco Profundo', description: 'Instalar o hábito de Deep Work consistente para combater a "Gestão Atencional Volátil".', icon: 'Centro', targetDate: '2024-09-30' },
        { id: 'skill1', type: 'Skill', label: 'Foco Profundo (Deep Work)', description: 'Capacidade de produzir trabalho de alta intensidade sem distrações.', icon: 'Estudos' },
        { id: 'skill2', type: 'Skill', label: 'Engenharia de Ofertas', description: 'Criar ofertas irresistíveis para produtos de conhecimento, baseado em Hormozi.', icon: 'Educacao' },
        { id: 'skill3', type: 'Skill', label: 'Arquitetura Cognitiva de IA', description: 'Sintetizar IA, ensino e vendas para criar produtos únicos.', icon: 'Global' },
        { id: 'res1', type: 'Recurso', label: 'Livro: Deep Work', description: 'Cal Newport. O manual para desenvolver a skill de Foco Profundo.' },
        { id: 'res2', type: 'Recurso', label: 'Livro: Building a Second Brain', description: 'Tiago Forte. Sistema para organizar o universo criativo e intelectual.' },
        { id: 'res3', type: 'Recurso', label: 'Livro: Sapiens', description: 'Yuval Noah Harari. Entender as narrativas que governam a sociedade.' },
        { id: 'mentor1', type: 'Mentor', label: 'Tiago Forte', description: 'Referência em produtividade e negócios de conhecimento.' },
    ],
    edges: [
        { id: 'e1', source: 'obj1', target: 'pf1', label: 'viabiliza' },
        { id: 'e2', source: 'obj2', target: 'pf1', label: 'viabiliza' },
        { id: 'e3', source: 'skill1', target: 'obj2', label: 'viabiliza' },
        { id: 'e4', source: 'skill2', target: 'obj1', label: 'viabiliza' },
        { id: 'e5', source: 'skill3', target: 'obj1', label: 'viabiliza' },
        { id: 'e6', source: 'res1', target: 'skill1', label: 'desenvolve' },
        { id: 'e7', source: 'res2', target: 'skill3', label: 'suporta' },
        { id: 'e8', source: 'mentor1', target: 'skill3', label: 'inspirado por' },
    ]
};

// --- ICONS ---

export const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

const CentroIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M12 2v4M12 18v4M22 12h-4M6 12H2M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const FogueteIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M5.31 18.69L6.72 17.28C7.61 16.39 8.87 16 10.18 16H11C13.21 16 15 14.21 15 12V11C15 8.79 16.79 7 19 7H20V6C20 4.9 19.1 4 18 4H17.72C16.54 4 15.44 4.43 14.65 5.22L11.22 8.65C10.43 9.44 10 10.54 10 11.72V12C10 13.13 9.61 14.19 8.93 14.93L8 15.86C7.17 16.69 6.82 17.81 7.05 18.95L7.5 21L4 19.5L5.05 15.95C5.28 15.18 5.09 14.33 4.56 13.79L4 13.23M15 12H19"></path></svg>
);
const NegociosIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M20 7L12 3L4 7L12 11L20 7Z"></path><path d="M4 7V17L12 21L20 17V7"></path><path d="M12 11V21"></path></svg>
);
const EstudosIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
);
const EducacaoIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 1.66 4 3 6 3s6-1.34 6-3v-5"></path></svg>
);
const GlobalIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20zM2 12h20"></path></svg>
);
const SaudeIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);
const MetasIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
);


export const ICON_MAP: Record<IconName, React.FC<{className?: string}>> = {
    'Centro': CentroIcon,
    'Foguete': FogueteIcon,
    'Negocios': NegociosIcon,
    'Estudos': EstudosIcon,
    'Educacao': EducacaoIcon,
    'Global': GlobalIcon,
    'Saude': SaudeIcon,
    'Metas': MetasIcon,
};


export const DevelopmentIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M9.34241 2.34241L10.3787 5.4938L13.5301 6.53012M14.6576 21.6576L13.6213 18.5062L10.4699 17.4699M3 10.5L6.5 10.5M17.5 13.5H21M12 12L17.5 3.5M12 12L6.5 20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
);


export const DashboardIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3 13V3H13V13H3Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 21V17H7V21H3Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 13V17" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 7H21" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 13V21H21V13H13Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

export const KanbanIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M7 3V21" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 3V21" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17 3V21" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 8H10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 12H20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

export const GuardianIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 21V12M12 12L20.2588 7.31056M12 12L3.74121 7.31056M12 21L3.74121 16.3106M12 21L20.2588 16.3106M20.2588 7.31056L12 3L3.74121 7.31056L12 12M20.2588 7.31056L20.2588 16.3106" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const LibraryIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M4 6.5H20" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 12H20" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 17.5H20" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
);

export const HabitsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 10L12 3L21 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 13.5V21H5V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21V14C9 13.4477 9.44772 13 10 13H14C14.5523 13 15 13.4477 15 14V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AgendaIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.5 9.09H20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.9955 13.7H12.0045" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.29431 13.7H8.3033" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.29431 16.7H8.3033" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const GoalsIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
);

export const CognitiveIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 21C12 21 4 17 4 12C4 7 8 3 12 3C16 3 20 7 20 12C20 17 12 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 12C14.7614 12 17 9.76142 17 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 12C9.23858 12 7 9.76142 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15C13.6569 15 15 13.6569 15 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15C10.3431 15 9 13.6569 9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 17V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const BiohackingIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 3V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 7L8 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 17L8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const TrophyIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M12 22s8-4 8-10V4H4v8c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 12V6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 9l-3-3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 9h-3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 9H6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const AnalyticsIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M7 20V10M12 20V4M17 20V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


export const FlowLabIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M12 8V4H8" />
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 12h4" />
        <path d="M12 16h4" />
    </svg>
);


export const NAV_ITEMS = [
  { view: 'dashboard' as View, labelKey: 'sidebar.dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
  { view: 'habits' as View, labelKey: 'sidebar.habits', icon: <HabitsIcon className="w-6 h-6" /> },
  { view: 'projects' as View, labelKey: 'sidebar.projects', icon: <KanbanIcon className="w-6 h-6" /> },
  { view: 'goals' as View, labelKey: 'sidebar.goals', icon: <GoalsIcon className="w-6 h-6" /> },
  { view: 'agenda' as View, labelKey: 'sidebar.agenda', icon: <AgendaIcon className="w-6 h-6" /> },
  { view: 'development' as View, labelKey: 'sidebar.development', icon: <DevelopmentIcon className="w-6 h-6" /> },
  { view: 'cognitive' as View, labelKey: 'sidebar.cognitive', icon: <CognitiveIcon className="w-6 h-6" /> },
  { view: 'flowlab' as View, labelKey: 'sidebar.flowLab', icon: <FlowLabIcon className="w-6 h-6" /> },
  { view: 'biohacking' as View, labelKey: 'sidebar.biohacking', icon: <BiohackingIcon className="w-6 h-6" /> },
  { view: 'achievements' as View, labelKey: 'sidebar.achievements', icon: <TrophyIcon className="w-6 h-6" /> },
  { view: 'analytics' as View, labelKey: 'sidebar.analytics', icon: <AnalyticsIcon className="w-6 h-6" /> },
  { view: 'guardian' as View, labelKey: 'sidebar.guardian', icon: <GuardianIcon className="w-6 h-6" /> },
  { view: 'library' as View, labelKey: 'sidebar.library', icon: <LibraryIcon className="w-6 h-6" /> },
];
