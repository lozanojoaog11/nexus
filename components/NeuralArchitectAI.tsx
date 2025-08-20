import React, { useState, useRef, useEffect, useMemo } from 'react';
import { askGuardian } from '../services/geminiService';
import { Message, DailyCheckin, Habit, Task, Goal, DevelopmentNode, DailyStrategy, UserProfile } from '../types';
import { useTranslation } from '../hooks/useTranslation';

// NOVOS TIPOS:
interface CoachingModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
  color: string;
}

interface SessionContext {
  currentGoals: Goal[];
  todayHabits: Habit[];
  recentTasks: Task[];
  checkinData: DailyCheckin | null;
  userState: 'energized' | 'focused' | 'creative' | 'overwhelmed' | 'neutral';
}

interface NeuralArchitectProps {
  userId: string | null;
  profile: UserProfile | null;
  checkin: DailyCheckin | null;
  habits: Habit[];
  goals: Goal[];
  tasks: Task[];
  developmentNodes: DevelopmentNode[];
}

const NeuralArchitectAI: React.FC<NeuralArchitectProps> = ({ 
  userId, profile, checkin, habits, goals, tasks, developmentNodes 
}) => {
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'guardian', 
      text: t('neuralArchitect.initialMessage')
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const coachingModules: CoachingModule[] = useMemo(() => [
    { id: 'focus', name: t('neuralArchitect.modules.focus.name'), description: t('neuralArchitect.modules.focus.description'), icon: '🎯', color: 'from-blue-500 to-cyan-500', prompt: t('neuralArchitect.modules.focus.prompt') },
    { id: 'creativity', name: t('neuralArchitect.modules.creativity.name'), description: t('neuralArchitect.modules.creativity.description'), icon: '⚡', color: 'from-purple-500 to-pink-500', prompt: t('neuralArchitect.modules.creativity.prompt') },
    { id: 'discipline', name: t('neuralArchitect.modules.discipline.name'), description: t('neuralArchitect.modules.discipline.description'), icon: '⚙️', color: 'from-green-500 to-teal-500', prompt: t('neuralArchitect.modules.discipline.prompt') },
    { id: 'performance', name: t('neuralArchitect.modules.performance.name'), description: t('neuralArchitect.modules.performance.description'), icon: '🚀', color: 'from-orange-500 to-red-500', prompt: t('neuralArchitect.modules.performance.prompt') },
    { id: 'strategic', name: t('neuralArchitect.modules.strategic.name'), description: t('neuralArchitect.modules.strategic.description'), icon: '🧠', color: 'from-indigo-500 to-purple-500', prompt: t('neuralArchitect.modules.strategic.prompt') },
    { id: 'strategy', name: t('neuralArchitect.modules.strategy.name'), description: t('neuralArchitect.modules.strategy.description'), icon: '🧭', color: 'from-gray-500 to-gray-600', prompt: t('neuralArchitect.modules.strategy.prompt') }
  ], [t]);

  const generateSessionContext = (): SessionContext => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayHabits = habits.filter(h => 
      (h.history || []).some(entry => entry.date === todayStr)
    );
    let userState: SessionContext['userState'] = 'neutral';
    if (checkin) {
      const avgScore = (checkin.energia + checkin.clareza + checkin.momentum) / 3;
      if (avgScore >= 8) userState = 'energized';
      else if (checkin.clareza >= 8) userState = 'focused';
      else if (checkin.momentum >= 8) userState = 'creative';
      else if (avgScore <= 4) userState = 'overwhelmed';
    }
    return {
      currentGoals: goals.slice(0, 3),
      todayHabits,
      recentTasks: tasks.filter(t => t.status !== 'Concluído').slice(0, 5),
      checkinData: checkin,
      userState
    };
  };

  const invokeTool = async (toolName: string, params: any) => {
    try {
      // Chama a nossa nova rota de API interna, que agora funciona como o gateway
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: toolName,
          params: params,
        }),
      });

      if (!response.ok) {
        // Tenta ler a resposta como JSON, mas se falhar, usa o texto bruto
        try {
            const errorData = await response.json();
            throw new Error(errorData.error || `A execução da ferramenta falhou com o status: ${response.status}`);
        } catch (e) {
            const errorText = await response.text();
            throw new Error(`A execução da ferramenta falhou com o status ${response.status}: ${errorText}`);
        }
      }

      const result = await response.json();
      return result.result; // O servidor encapsula o resultado em uma chave 'result'
    } catch (error) {
      console.error(`Erro ao invocar a ferramenta ${toolName}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
      return `Erro ao executar a ferramenta: ${errorMessage}`;
    }
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;
      recognitionRef.current.onresult = (event: any) => {
        setInput(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, [language]);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const context = generateSessionContext();
      const strategyKeyMap: { [key in Exclude<DailyStrategy, null>]: string } = {
          'eat_the_frog': 'eatTheFrog',
          'small_wins': 'smallWins',
          'deep_work_focus': 'deepWorkFocus'
      };
      const strategyNameKey = checkin?.activeStrategy ? `todayView.strategy.names.${strategyKeyMap[checkin.activeStrategy]}` : 'todayView.strategy.names.none';
      const strategyName = t(strategyNameKey);

      const contextString = `
${t('neuralArchitect.context.currentState')}
- ${t('neuralArchitect.context.energy')}: ${context.checkinData?.energia || 'N/A'}/10
- ${t('neuralArchitect.context.clarity')}: ${context.checkinData?.clareza || 'N/A'}/10  
- ${t('neuralArchitect.context.momentum')}: ${context.checkinData?.momentum || 'N/A'}/10
- ${t('neuralArchitect.context.userState')}: ${context.userState}
- ${t('neuralArchitect.context.activeStrategy')}: ${strategyName}
- ${t('neuralArchitect.context.activeGoals')}: ${context.currentGoals.map(g => g.name).join(', ')}
- ${t('neuralArchitect.context.habitsToday')}: ${context.todayHabits.length}
- ${t('neuralArchitect.context.pendingTasks')}: ${context.recentTasks.length}

${t('neuralArchitect.context.focusAreas')}
${developmentNodes.map(node => `- ${node.type}: ${node.label}`).join('\n')}
`;

      let query = `${currentInput}\n\nCONTEXT: ${contextString}`;
      const systemPrompt = profile?.customSystemPrompt || t('neuralArchitect.systemPrompt');

      const module = selectedModule ? coachingModules.find(m => m.id === selectedModule) : null;
      if (module && module.prompt) {
          let modulePrompt = module.prompt.replace('{{CONTEXT}}', contextString);
           if (module.id === 'strategy') {
              modulePrompt = modulePrompt.replace('{{STRATEGY}}', strategyName);
           }
          query = modulePrompt + `\n\n${t('neuralArchitect.userQueryLabel')}: ${currentInput}`;
      }

      const response = await askGuardian(query, systemPrompt, language);
      
      // Extrai o texto antes do JSON e o próprio JSON
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
      const match = response.match(jsonRegex);
      
      let introductoryText = response;
      let toolCallResult: Message | null = null;

      if (match && match[1]) {
        const jsonString = match[1];
        introductoryText = response.substring(0, match.index).trim();
        
        try {
          const potentialToolCall = JSON.parse(jsonString);
          if (potentialToolCall.tool && potentialToolCall.params) {
            if (!userId) {
              throw new Error("ID do usuário não encontrado. Não é possível executar a ferramenta.");
            }
            
            const { tool, params } = potentialToolCall;
            
            // Injeta o userId automaticamente nos parâmetros da ferramenta
            const finalParams = { ...params, userId };

            // Invoca a ferramenta através da nossa função de gateway interno
            const result = await invokeTool(tool, finalParams);
            
            toolCallResult = { sender: 'guardian', text: `**[Ação Executada]**\n${result}` };
          }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Formato de JSON inválido.';
            toolCallResult = { sender: 'guardian', text: `**[Falha na Ação]**\n${errorMessage}` };
        }
      }

      // Adiciona as mensagens na ordem correta
      const newMessages: Message[] = [];
      if (introductoryText) {
        newMessages.push({ sender: 'guardian', text: introductoryText });
      }
      if (toolCallResult) {
        newMessages.push(toolCallResult);
      }
      
      if (newMessages.length > 0) {
        setMessages(prev => [...prev, ...newMessages]);
      } else {
        // Fallback para o caso de não haver nem texto introdutório nem chamada de ferramenta
        setMessages(prev => [...prev, { sender: 'guardian', text: response }]);
      }

    } catch (error) {
      setMessages(prev => [...prev, { sender: 'guardian', text: t('neuralArchitect.error') }]);
    } finally {
      setIsLoading(false);
      setSelectedModule(null);
    }
  };

  const generateContextAnalysis = async () => {
    setIsLoading(true);
    const context = generateSessionContext();
    const completedHabits = (context.todayHabits || []).filter(h => {
        const today = new Date().toISOString().split('T')[0];
        return (h.history || []).some(entry => entry.date === today && entry.completed);
    }).length;
    
    const contextString = `
${t('neuralArchitect.context.currentState')}
- ${t('neuralArchitect.context.energy')}: ${context.checkinData?.energia || 'N/A'}/10
- ${t('neuralArchitect.context.clarity')}: ${context.checkinData?.clareza || 'N/A'}/10  
- ${t('neuralArchitect.context.momentum')}: ${context.checkinData?.momentum || 'N/A'}/10
- ${t('neuralArchitect.context.userState')}: ${context.userState}
- ${t('neuralArchitect.context.activeGoals')}: ${context.currentGoals.map(g => g.name).join(', ')}
- ${t('neuralArchitect.context.completedHabits')}: ${completedHabits}/${(context.todayHabits || []).length}
- ${t('neuralArchitect.context.pendingMITs')}: ${context.recentTasks.filter(t => t.isMIT).length}`;

    const analysisPrompt = t('neuralArchitect.contextAnalysisPrompt', { context: contextString });
    try {
      const response = await askGuardian(analysisPrompt, t('neuralArchitect.contextAnalysisSystemPrompt'), language);
      setMessages(prev => [...prev, { sender: 'guardian', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'guardian', text: t('neuralArchitect.analysisError') }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="p-8 text-white w-full h-full flex flex-col">
      <div className="flex-shrink-0 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {t('neuralArchitect.title')}
            </h1>
            <p className="text-gray-400">{t('neuralArchitect.subtitle')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          {coachingModules.map(module => (
            <button
              key={module.id}
              onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
              className={`p-3 rounded-lg border transition-all text-center ${
                selectedModule === module.id
                  ? `bg-gradient-to-r ${module.color} text-white border-transparent`
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600 text-gray-300'
              }`}
            >
              <div className="text-lg mb-1">{module.icon}</div>
              <div className="text-xs font-medium">{module.name}</div>
            </button>
          ))}
        </div>
        {selectedModule && (
          <div className="bg-gray-800/30 p-3 rounded-lg mb-4 border border-gray-700">
            <p className="text-sm text-gray-400 mt-1">
              {coachingModules.find(m => m.id === selectedModule)?.description}
            </p>
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto mb-4 p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'guardian' && (
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 border border-blue-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              )}
              <div className={`max-w-3xl p-4 rounded-xl ${
                msg.sender === 'user' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-12' 
                  : 'bg-gray-800/70 text-gray-100 border border-gray-700/50'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 border border-blue-500/30">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="max-w-3xl p-4 rounded-xl bg-gray-800/70 border border-gray-700/50">
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex-shrink-0">
        <div className="flex gap-2 mb-4">
          <button
            onClick={generateContextAnalysis}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {t('neuralArchitect.quickActions.analyze')}
          </button>
          <button
            onClick={() => setInput(t('neuralArchitect.quickActions.focusGuidance'))}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
          >
            {t('neuralArchitect.quickActions.focusGuidance')}
          </button>
          <button
            onClick={() => setInput(t('neuralArchitect.quickActions.energyOptimization'))}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium"
          >
            {t('neuralArchitect.quickActions.energyOptimization')}
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('neuralArchitect.askPlaceholder')}
              className="w-full bg-gray-800/70 text-white p-4 pr-12 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={isLoading}
            />
            <button
              onClick={startListening}
              disabled={isLoading || isListening}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold p-4 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NeuralArchitectAI;
