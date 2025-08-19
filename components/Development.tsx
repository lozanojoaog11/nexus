import React, { useState, useMemo } from 'react';
import { DevelopmentGraph, DevelopmentNode, DevelopmentNodeType, Goal, Task, Book } from '../types';
import { ICON_MAP, PlusIcon } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import GraphView from './GraphView';

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

const getNodeCanvasColor = (type: DevelopmentNodeType): string => {
    const colors: Record<DevelopmentNodeType, string> = {
        'Ponto de Fuga': '#FBBF24', // amber-400
        'Objetivo': '#00A9FF',      // ACCENT_COLOR
        'Skill': '#4ADE80',         // green-400
        'Recurso': '#A78BFA',       // purple-400
        'Hábito': '#38BDF8',        // sky-400
        'Mentor': '#F472B6',        // rose-400
    };
    return colors[type] || '#9CA3AF'; // gray-400
};


const Development: React.FC<DevelopmentProps> = ({ graph, goals, tasks, books, onAddNode, onEditNode, onDeleteNode }) => {
    const { t } = useTranslation();
    const [selectedNode, setSelectedNode] = useState<DevelopmentNode | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');

    React.useEffect(() => {
        if (!selectedNode && graph.nodes.length > 0) {
            setSelectedNode(graph.nodes.find(n => n.type === 'Ponto de Fuga') || graph.nodes[0]);
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
    
    const graphData = useMemo(() => {
        const nodesWithColor = graph.nodes.map(node => ({
            ...node,
            color: getNodeCanvasColor(node.type),
            val: node.type === 'Ponto de Fuga' ? 15 : (node.type === 'Objetivo' ? 10 : 5)
        }));
        return {
            nodes: nodesWithColor,
            links: graph.edges.map(edge => ({
                source: edge.source,
                target: edge.target,
            })),
        };
    }, [graph]);

    return (
        <div className="p-8 text-white w-full h-full flex gap-8 animate-fade-in">
            <div className="w-2/3 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-3xl font-bold">{t('development.title')}</h1>
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-800 p-1 rounded-lg flex">
                             <button onClick={() => setViewMode('list')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>{t('development.view.list')}</button>
                             <button onClick={() => setViewMode('graph')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'graph' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>{t('development.view.graph')}</button>
                        </div>
                        <button onClick={onAddNode} className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"><PlusIcon className="w-5 h-5"/></button>
                    </div>
                </div>
                <p className="text-gray-400 mb-6">{t('development.subtitle')}</p>
                <div className="flex-grow overflow-hidden bg-gray-900/50 rounded-lg border border-gray-700 relative">
                    {viewMode === 'list' && (
                        <ul className="overflow-y-auto h-full p-2">
                            {graph.nodes.map(node => (
                                <li key={node.id}
                                    onClick={() => setSelectedNode(node)}
                                    className={`p-3 mb-2 rounded-lg cursor-pointer border-l-4 transition-colors duration-200 ${selectedNode?.id === node.id ? 'bg-white/10 border-[#00A9FF]' : 'bg-gray-800/50 border-transparent hover:bg-white/5'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            {node.icon && React.createElement(ICON_MAP[node.icon], {className: `w-5 h-5 mr-3 ${getNodeColor(node.type).split(' ')[1]}`})}
                                            <p className="font-medium text-white">{node.label}</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-1 border rounded-full ${getNodeColor(node.type)}`}>
                                            {t(`devAreaModal.types.${node.type.replace(/\s/g, '').replace(/[()]/g, '')}`, {defaultValue: node.type})}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {viewMode === 'graph' && (
                        <GraphView 
                            graphData={graphData} 
                            onNodeClick={(node) => setSelectedNode(node as DevelopmentNode)}
                        />
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