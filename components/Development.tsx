
import React, { useState, useMemo } from 'react';
import { DevelopmentGraph, DevelopmentNode, DevelopmentNodeType, Goal, Task, Book } from '../types';
import { ICON_MAP, PlusIcon } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

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
    const { t } = useTranslation();
    const [selectedNode, setSelectedNode] = useState<DevelopmentNode | null>(null);

    React.useEffect(() => {
        if (!selectedNode && graph.nodes.length > 0) {
            setSelectedNode(graph.nodes[0]);
        }
        if (selectedNode && !graph.nodes.find(n => n.id === selectedNode.id)) {
            setSelectedNode(graph.nodes.length > 0 ? graph.nodes[0] : null);
        }
    }, [graph.nodes, selectedNode]);

    const linkedItems = useMemo(() => {
        if (!selectedNode) return { linkedGoals: [], linkedTasks: [], linkedBooks: [] };

        const linkedGoals = goals.filter(g => g.areaId === selectedNode.id);
        const linkedTasks = tasks.filter(t => t.relatedDevelopmentNodeId === selectedNode.id);
        const linkedBooks = books.filter(b => b.relatedDevelopmentNodeId === selectedNode.id);

        return { linkedGoals, linkedTasks, linkedBooks };
    }, [selectedNode, goals, tasks, books]);

    return (
        <div className="p-8 text-white w-full h-full flex gap-8 animate-fade-in">
            <div className="w-2/3 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-3xl font-bold">{t('development.title')}</h1>
                    <button onClick={onAddNode} className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"><PlusIcon className="w-5 h-5"/></button>
                </div>
                <p className="text-gray-400 mb-6">{t('development.subtitle')}</p>
                <div className="flex-grow overflow-y-auto bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    {graph.nodes.length > 0 ? (
                        graph.nodes.map(node => {
                            const IconComponent = node.icon ? ICON_MAP[node.icon] : null;
                            const colorClass = getNodeColor(node.type);
                            
                            return (
                                <div
                                    key={node.id}
                                    onClick={() => setSelectedNode(node)}
                                    className={`group flex items-center justify-between p-4 mb-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedNode?.id === node.id ? `${colorClass} bg-white/5` : 'border-gray-800 bg-gray-800/50 hover:border-gray-700'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        {IconComponent && <IconComponent className={`w-6 h-6 ${selectedNode?.id === node.id ? colorClass.split(' ')[1] : 'text-gray-400'}`} />}
                                        <div>
                                            <p className="font-semibold text-white">{node.label}</p>
                                            <p className={`text-xs font-medium ${colorClass.split(' ')[1]}`}>{t(`devAreaModal.types.${node.type.replace(/\s/g, '').replace(/[()]/g, '')}`, {defaultValue: node.type})}</p>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); onEditNode(node); }} className="p-1 text-gray-400 hover:text-white"><EditIcon className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }} className="p-1 text-gray-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-gray-500 pt-16">
                            <p>{t('development.noNodes')}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="w-1/3 bg-gray-900/50 rounded-lg p-6 border border-gray-700 flex flex-col">
                {selectedNode ? (
                    <>
                        <div className="flex-shrink-0 mb-6 text-center">
                            {selectedNode.icon && React.createElement(ICON_MAP[selectedNode.icon], {className: `w-12 h-12 mx-auto mb-3 ${getNodeColor(selectedNode.type).split(' ')[1]}`})}
                            <h2 className="text-2xl font-bold">{selectedNode.label}</h2>
                            <p className={`font-semibold ${getNodeColor(selectedNode.type).split(' ')[1]}`}>{t(`devAreaModal.types.${selectedNode.type.replace(/\s/g, '').replace(/[()]/g, '')}`, {defaultValue: selectedNode.type})}</p>
                            <p className="text-sm text-gray-400 mt-2">{selectedNode.description}</p>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2">
                             {linkedItems.linkedGoals.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">{t('development.linkedGoals')}</h3>
                                    {linkedItems.linkedGoals.map(g => <div key={g.id} className="bg-gray-800/70 p-2 rounded text-sm mb-1">{g.name}</div>)}
                                </div>
                            )}
                             {linkedItems.linkedTasks.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">{t('development.linkedTasks')}</h3>
                                    {linkedItems.linkedTasks.map(t => <div key={t.id} className="bg-gray-800/70 p-2 rounded text-sm mb-1">{t.content}</div>)}
                                </div>
                            )}
                             {linkedItems.linkedBooks.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">{t('development.linkedBooks')}</h3>
                                    {linkedItems.linkedBooks.map(b => <div key={b.id} className="bg-gray-800/70 p-2 rounded text-sm mb-1">{b.title}</div>)}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>{t('development.selectNode')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Development;
