
import React, { useMemo, useState } from 'react';
import { DailyCheckin, Habit, Task, Project, Goal, DevelopmentGraph } from '../types';

interface DashboardProps {
  checkin: DailyCheckin | null;
  hasCheckedInToday: boolean;
  onStartCheckin: () => void;
  projects: Project[];
  habits: Habit[];
  goals: Goal[];
  developmentGraph: DevelopmentGraph;
  allTasks: Task[];
}

const SummaryCard: React.FC<{ title: string; value: string; subtext: string; icon: React.ReactNode }> = ({ title, value, subtext, icon }) => (
    <div className="bg-[#1C1C1C] p-4 rounded-xl border border-white/10 flex items-start gap-4">
        <div className="bg-white/5 p-2 rounded-lg">{icon}</div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500">{subtext}</p>
        </div>
    </div>
);

const TaskRow: React.FC<{ task: Task, projectName: string }> = ({ task, projectName }) => (
    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-md">
        <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${task.status === 'Concluído' ? 'bg-green-500' : task.status === 'Em Progresso' ? 'bg-yellow-500' : 'bg-gray-500'}`}></span>
            <p className="text-white text-sm">{task.content}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-400">{projectName}</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-gray-300">{task.status}</span>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ checkin, hasCheckedInToday, onStartCheckin, projects, habits, goals, developmentGraph, allTasks }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const habitsCompletion = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const completedToday = habits.filter(h => h.history.some(e => e.date === today && e.completed)).length;
        return habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
    }, [habits]);
    
    const nextMilestone = useMemo(() => {
        const upcoming = goals
            .flatMap(g => g.milestones)
            .filter(m => new Date(m.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return upcoming[0];
    }, [goals]);

    const filteredTasks = useMemo(() => {
        return allTasks.filter(task => task.content.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allTasks, searchTerm]);
    
    const getProjectNameForTask = (taskId: string) => {
        return projects.find(p => p.tasks.some(t => t.id === taskId))?.name || 'N/A';
    }

    if (!hasCheckedInToday) {
        return (
            <div className="p-8 text-white w-full h-full flex flex-col items-center justify-center animate-fade-in-up">
                <div className="text-center p-12 bg-[#1C1C1C] rounded-2xl border border-white/10">
                    <h2 className="text-2xl font-bold text-white">Pronto para alinhar seu dia?</h2>
                    <p className="text-gray-400 mt-2 mb-6">O check-in diário é o primeiro passo para um dia de alta performance.</p>
                    <button onClick={onStartCheckin} className="bg-[#00A9FF] text-black font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-[#00A9FF]/20 animate-subtle-glow">
                        Iniciar Check-in Diário
                    </button>
                </div>
            </div>
        );
    }
  
    return (
        <div className="p-8 text-white w-full h-full overflow-y-auto animate-fade-in-up space-y-6">
            <header>
                <h1 className="text-2xl font-bold">Visão Geral</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard title="Projetos Ativos" value={projects.length.toString()} subtext="Em andamento" icon={<svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>} />
                <SummaryCard title="Hábitos" value={`${habitsCompletion}%`} subtext="Taxa de conclusão hoje" icon={<svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} />
                <SummaryCard title="Próximos Marcos" value={nextMilestone?.name || "Nenhum"} subtext={nextMilestone ? new Date(nextMilestone.date + 'T12:00:00').toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'}) : "Defina metas"} icon={<svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <SummaryCard title="Desenvolvimento" value={developmentGraph.nodes.filter(n => n.type === 'Objetivo' || n.type === 'Skill').length.toString()} subtext="Áreas em foco" icon={<svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-[#1C1C1C] p-4 rounded-xl border border-white/10">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Tracking Diário</h3>
                    <div className="flex justify-around items-center h-full">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-[#00A9FF]">{checkin?.energia || 0}/10</p>
                            <p className="text-xs text-gray-500">Energia</p>
                        </div>
                         <div className="text-center">
                            <p className="text-3xl font-bold text-[#00A9FF]">{checkin ? Math.round((checkin.clareza + checkin.momentum) / 2) : 0}/10</p>
                            <p className="text-xs text-gray-500">Foco</p>
                        </div>
                    </div>
                 </div>
                 <div className="bg-[#1C1C1C] p-4 rounded-xl border border-white/10">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Diretriz Diária</h3>
                    <p className="text-sm text-gray-200 leading-relaxed">{checkin?.directive || "Diretriz não disponível."}</p>
                 </div>
            </div>

            <div className="bg-[#1C1C1C] p-4 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Painel de Controle de Tarefas</h2>
                    <div className="w-1/3">
                        <input
                            type="text"
                            placeholder="Buscar tarefas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/30 text-white text-sm p-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00A9FF]"
                        />
                    </div>
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => <TaskRow key={task.id} task={task} projectName={getProjectNameForTask(task.id)}/>)
                    ) : (
                        <p className="text-center text-gray-500 py-4">Nenhuma tarefa encontrada.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;