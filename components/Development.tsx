import React, { useState, useMemo } from 'react';
import { DevelopmentGraph, DevelopmentNode, DevelopmentNodeType, Goal, Task, Book } from '../types';
import { ACCENT_COLOR, ICON_MAP, PlusIcon } from '../constants';

interface DevelopmentProps {
  graph: DevelopmentGraph;
  goals: Goal[];
  tasks: Task[];
  books: Book[];
  onAddNode: () => void;
  onEditNode: (node: DevelopmentNode) => void;
  onDeleteNode: (nodeId: string) => void;
}

const getNodeColor = (type: DevelopmentNodeType) => {
    const colors: Record<DevelopmentNodeType, string> = {
        'Ponto de Fuga': 'border-amber-400 text-amber-400',
        'Objetivo': `border-[#00A9FF] text-[#00A9FF]`,
        'Skill': 'border-green-400 text-green-400',
        'Recurso': 'border-purple-400 text-purple-400',
        'Hábito': 'border-sky-400 text-sky-400',
        'Mentor': 'border-rose-400 text-rose-400',
    }
    return colors[type] || 'border-gray-500 text-gray-300';
}

const EditIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
);
const TrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
);


const Development: React.FC<DevelopmentProps> = ({ graph, goals, tasks, books, onAddNode, onEditNode, onDeleteNode }) => {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(graph.nodes[0]?.id || null);

    const selectedNode = useMemo(() => {
        const node = graph.nodes.find(n => n.id === selectedNodeId);
        if (node) return node;
        if (graph.nodes.length > 0) {
            setSelectedNodeId(graph.nodes[0].id);
            return graph.nodes[0];
        }
        return null;
    }, [graph.nodes, selectedNodeId]);

    const linkedEntities = useMemo(() => {
        if (!selectedNodeId) return { goals: [], tasks: [], books: [] };
        return {
            goals: goals.filter(g => g.areaId === selectedNodeId),
            tasks: tasks.filter(t => t.relatedDevelopmentNodeId === selectedNodeId),
            books: books.filter(b => b.relatedDevelopmentNodeId === selectedNodeId)
        }
    }, [selectedNodeId, goals, tasks, books]);
    
    const IconComponent = selectedNode?.icon ? ICON_MAP[selectedNode.icon] : null;

    return (
        <div className="p-8 text-white w-full h-full flex gap-8 animate-fade-in">
            <div className="w-1/3 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Desenvolvimento</h1>
                        <p className="text-gray-400">Seu mapa de expansão estratégica.</p>
                    </div>
                    <button onClick={onAddNode} className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"><PlusIcon className="w-5 h-5"/></button>
                </div>
                <div className="flex-grow overflow-y-auto bg-gray-900/50 rounded-lg p-2 border border-gray-700">
                    {graph.nodes.map(node => (
                        <div key={node.id}
                            onClick={() => setSelectedNodeId(node.id)}
                            className={`group p-3 mb-1 rounded-md cursor-pointer transition-all duration-200 flex justify-between items-center ${
                                selectedNodeId === node.id 
                                ? `bg-[#00A9FF]/20` 
                                : `bg-transparent hover:bg-gray-700/50`
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {node.icon && React.createElement(ICON_MAP[node.icon], { className: `w-5 h-5 flex-shrink-0 ${getNodeColor(node.type).split(' ')[1]}` })}
                                <span className="font-medium text-white">{node.label}</span>
                            </div>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => {e.stopPropagation(); onEditNode(node);}} className="p-1 text-gray-400 hover:text-white"><EditIcon className="w-4 h-4" /></button>
                                <button onClick={(e) => {e.stopPropagation(); onDeleteNode(node.id);}} className="p-1 text-gray-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-2/3 bg-gray-900/50 rounded-lg p-8 border border-gray-700 flex flex-col">
                {selectedNode ? (
                    <>
                        <div className="flex-shrink-0 mb-6 border-b border-white/10 pb-6">
                            <div className="flex items-center gap-4">
                                {IconComponent && <IconComponent className={`w-10 h-10 ${getNodeColor(selectedNode.type).split(' ')[1]}`} />}
                                <div>
                                    <span className={`text-sm font-semibold mb-1 inline-block ${getNodeColor(selectedNode.type).split(' ')[1]}`}>{selectedNode.type}</span>
                                    <h2 className="text-3xl font-bold">{selectedNode.label}</h2>
                                </div>
                            </div>
                            <p className="text-gray-400 mt-4">{selectedNode.description}</p>
                            {selectedNode.successMetrics && <p className="text-sm mt-2 text-gray-300"><strong className="text-gray-500">Métrica:</strong> {selectedNode.successMetrics}</p>}
                            {selectedNode.targetDate && <p className="text-sm mt-1 text-gray-300"><strong className="text-gray-500">Data Alvo:</strong> {new Date(selectedNode.targetDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>}
                        </div>
                        <div className="flex-grow overflow-y-auto">
                           <h3 className="text-lg font-semibold mb-4 text-gray-300">Entidades Vinculadas</h3>
                           <div className="space-y-4">
                                <div>
                                    <h4 className="text-gray-400 text-sm font-semibold mb-2">Metas</h4>
                                    {linkedEntities.goals.length > 0 ? linkedEntities.goals.map(g => <div key={g.id} className="text-sm bg-gray-800 p-2 rounded border border-gray-700">{g.name}</div>) : <p className="text-sm text-gray-500">Nenhuma meta vinculada.</p>}
                                </div>
                                <div>
                                    <h4 className="text-gray-400 text-sm font-semibold mb-2">Tarefas</h4>
                                    {linkedEntities.tasks.length > 0 ? linkedEntities.tasks.map(t => <div key={t.id} className="text-sm bg-gray-800 p-2 rounded border border-gray-700 mb-1">{t.content}</div>) : <p className="text-sm text-gray-500">Nenhuma tarefa vinculada.</p>}
                                </div>
                                <div>
                                    <h4 className="text-gray-400 text-sm font-semibold mb-2">Livros</h4>
                                    {linkedEntities.books.length > 0 ? linkedEntities.books.map(b => <div key={b.id} className="text-sm bg-gray-800 p-2 rounded border border-gray-700">{b.title}</div>) : <p className="text-sm text-gray-500">Nenhum livro vinculado.</p>}
                                </div>
                           </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Selecione ou crie uma Área de Desenvolvimento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


export default Development;