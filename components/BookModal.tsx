import React, { useState, useEffect } from 'react';
import { Book, DevelopmentNode } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { useUI } from '../contexts/UIContext';

interface BookModalProps {
  onSave: (book: Book) => Promise<void>;
  developmentNodes: DevelopmentNode[];
}

const BookModal: React.FC<BookModalProps> = ({ onSave, developmentNodes }) => {
  const { t } = useTranslation();
  const { state, close } = useUI();
  const bookToEdit = state.modalProps.book || null;
  const [isSaving, setIsSaving] = useState(false);

  const [book, setBook] = useState<Omit<Book, 'id' | 'notes'> & { notes: Book['notes'] }>({
    title: '',
    author: '',
    status: 'Quero Ler',
    relatedDevelopmentNodeId: '',
    notes: [],
  });

  useEffect(() => {
    if (bookToEdit) {
      setBook({ ...bookToEdit });
    } else {
        setBook({ title: '', author: '', status: 'Quero Ler', relatedDevelopmentNodeId: '', notes: [] });
    }
  }, [bookToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBook(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (book.title.trim() && book.author.trim()) {
        setIsSaving(true);
        try {
            const bookToSave = { ...book, id: bookToEdit?.id || '' };
            await onSave(bookToSave as Book);
            close();
        } catch (error) {
            console.error("Failed to save book:", error);
        } finally {
            setIsSaving(false);
        }
    }
  };
  
  const resourceNodes = developmentNodes.filter(n => n.type === 'Recurso');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 animate-fade-in" onClick={close}>
      <div className="bg-[#181818] border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-6">{bookToEdit ? t('bookModal.editTitle') : t('bookModal.addTitle')}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">{t('bookModal.title')}</label>
            <input name="title" value={book.title} onChange={handleChange} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700"/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">{t('bookModal.author')}</label>
            <input name="author" value={book.author} onChange={handleChange} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700"/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">{t('bookModal.status')}</label>
            <select name="status" value={book.status} onChange={handleChange} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700">
              <option value="Quero Ler">{t('library.status.toRead')}</option>
              <option value="Lendo">{t('library.status.reading')}</option>
              <option value="Lido">{t('library.status.read')}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">{t('bookModal.linkToResource')}</label>
            <select name="relatedDevelopmentNodeId" value={book.relatedDevelopmentNodeId} onChange={handleChange} className="w-full bg-gray-800/60 p-2 rounded-lg border border-gray-700">
              <option value="">{t('bookModal.none')}</option>
              {resourceNodes.map(node => <option key={node.id} value={node.id}>{node.label}</option>)}
            </select>
          </div>
        </div>
        
        <div className="w-full flex gap-4 mt-8 pt-6 border-t border-white/10">
            <button onClick={close} className="w-full bg-gray-700/80 text-white font-bold py-3 rounded-lg hover:bg-gray-700" disabled={isSaving}>{t('bookModal.cancel')}</button>
            <button onClick={handleSubmit} className="w-full bg-[#00A9FF] text-black font-bold py-3 rounded-lg hover:bg-opacity-90 shadow-lg shadow-[#00A9FF]/20" disabled={isSaving}>
                {isSaving ? 'Salvando...' : t('bookModal.save')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default BookModal;
