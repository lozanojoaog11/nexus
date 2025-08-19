

import React, { useState, useEffect } from 'react';
import { Book, DevelopmentNode } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface BookModalProps {
  onClose: () => void;
  onSave: (book: Book) => void;
  bookToEdit: Book | null;
  developmentNodes: DevelopmentNode[];
}

const BookModal: React.FC<BookModalProps> = ({ onClose, onSave, bookToEdit, developmentNodes }) => {
  const { t } = useTranslation();
  const [book, setBook] = useState<Omit<Book, 'id' | 'notes'> & { notes: Book['notes'] }>({
    title: '',
    author: '',
    status: 'Quero Ler',
    relatedDevelopmentNodeId: '',
    notes: [],
    ...bookToEdit,
  });

  useEffect(() => {
    if (bookToEdit) {
      setBook({ ...bookToEdit });
    }
  }, [bookToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBook(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (book.title.trim() && book.author.trim()) {
      const bookToSave = { ...book, id: bookToEdit?.id || '' };
      onSave(bookToSave as Book);
    }
  };
  
  const resourceNodes = developmentNodes.filter(n => n.type === 'Recurso');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
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
            <button onClick={onClose} className="w-full bg-gray-700/80 text-white font-bold py-3 rounded-lg hover:bg-gray-700">{t('bookModal.cancel')}</button>
            <button onClick={handleSubmit} className="w-full bg-[#00A9FF] text-black font-bold py-3 rounded-lg hover:bg-opacity-90 shadow-lg shadow-[#00A9FF]/20">{t('bookModal.save')}</button>
        </div>
      </div>
    </div>
  );
};

export default BookModal;
