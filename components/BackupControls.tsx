import React, { useState } from 'react';
import { backupService } from '../services/firebase';

const BackupControls: React.FC = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState('');
  const [showControls, setShowControls] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    setMessage('');
    
    try {
      await backupService.backupAll();
      setMessage('✅ Backup realizado com sucesso!');
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erro ao fazer backup');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!window.confirm('Isso substituirá todos os dados locais. Continuar?')) {
      return;
    }
    
    setIsRestoring(true);
    setMessage('');
    
    try {
      const data = await backupService.restore();
      
      if (data) {
        // Restaurar cada item no localStorage
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, JSON.stringify(data[key]));
        });
        
        setMessage('✅ Dados restaurados! Recarregando...');
        
        // Recarregar a página para aplicar os dados
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage('⚠️ Nenhum backup encontrado');
      }
    } catch (error) {
      setMessage('❌ Erro ao restaurar');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleExport = () => {
    // Exportar dados locais como JSON
    const data: any = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('eixo-')) {
        data[key] = localStorage.getItem(key);
      }
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eixo-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    setMessage('📥 Dados exportados!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botão de toggle minimalista */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="bg-gray-800/90 backdrop-blur text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-all"
        title="Backup & Sync"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </button>

      {/* Painel de controles */}
      {showControls && (
        <div className="absolute bottom-16 right-0 bg-[#1C1C1C] border border-white/10 rounded-xl p-4 shadow-2xl w-72 animate-fade-in-up">
          <h3 className="text-white font-semibold mb-3">Backup & Sync</h3>
          
          <div className="space-y-2">
            <button
              onClick={handleBackup}
              disabled={isBackingUp}
              className="w-full bg-[#00A9FF]/20 text-[#00A9FF] py-2 px-4 rounded-lg hover:bg-[#00A9FF]/30 disabled:opacity-50 transition-all"
            >
              {isBackingUp ? '⏳ Salvando...' : '☁️ Backup na Nuvem'}
            </button>
            
            <button
              onClick={handleRestore}
              disabled={isRestoring}
              className="w-full bg-purple-500/20 text-purple-400 py-2 px-4 rounded-lg hover:bg-purple-500/30 disabled:opacity-50 transition-all"
            >
              {isRestoring ? '⏳ Restaurando...' : '📥 Restaurar Backup'}
            </button>
            
            <button
              onClick={handleExport}
              className="w-full bg-green-500/20 text-green-400 py-2 px-4 rounded-lg hover:bg-green-500/30 transition-all"
            >
              💾 Exportar JSON
            </button>
          </div>
          
          {message && (
            <div className="mt-3 text-sm text-center text-gray-300">
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BackupControls;
