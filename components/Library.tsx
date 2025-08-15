
import React, { useState } from 'react';
import { Book, BookNote } from '../types';
import { PlusIcon } from '../constants';

const EditIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
);
const TrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
);


interface LibraryProps {
  books: Book[];
  addNoteToBook: (bookId: string, noteContent: string) => void;
  onAddBook: () => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onUpdateNote: (bookId: string, note: BookNote) => void;
  onDeleteNote: (bookId: string, noteId: string) => void;
}

const NoteItem: React.FC<{
    note: BookNote;
    onUpdate: (note: BookNote) => void;
    onDelete: (noteId: string) => void;
}> = ({ note, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(note.content);

    const handleSave = () => {
        onUpdate({ ...note, content: editText });
        setIsEditing(false);
    }

    return (
        <div className="bg-gray-800 p-4 rounded-md border border-gray-700 group">
            {isEditing ? (
                <div className="flex flex-col gap-2">
                    <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-1 focus:ring-[#00A9FF]"/>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsEditing(false)} className="text-xs px-2 py-1 rounded bg-gray-600 hover:bg-gray-500">Cancelar</button>
                        <button onClick={handleSave} className="text-xs px-2 py-1 rounded bg-[#00A9FF] text-black hover:bg-opacity-80">Salvar</button>
                    </div>
                </div>
            ) : (
                <>
                    <p className="text-white whitespace-pre-wrap">{note.content}</p>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleString('pt-BR')}</p>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white"><EditIcon className="w-4 h-4" /></button>
                            <button onClick={() => onDelete(note.id)} className="text-gray-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}


const Library: React.FC<LibraryProps> = ({ books, addNoteToBook, onAddBook, onEditBook, onDeleteBook, onUpdateNote, onDeleteNote }) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [noteInput, setNoteInput] = useState('');

  // Auto-select first book if none is selected
  React.useEffect(() => {
    if (!selectedBook && books.length > 0) {
        setSelectedBook(books[0]);
    }
    if (selectedBook && !books.find(b => b.id === selectedBook.id)) {
        setSelectedBook(books.length > 0 ? books[0] : null);
    }
  }, [books, selectedBook]);

  const handleAddNote = () => {
    if (selectedBook && noteInput.trim()) {
      addNoteToBook(selectedBook.id, noteInput.trim());
      setNoteInput('');
    }
  };
  
  // When the selected book's data changes from App.tsx, we need to update our local state
  React.useEffect(() => {
    if (selectedBook) {
        const updatedBook = books.find(b => b.id === selectedBook.id);
        if(updatedBook) {
            setSelectedBook(updatedBook);
        }
    }
  }, [books, selectedBook?.id]);

  return (
    <div className="p-8 text-white w-full h-full flex gap-8 animate-fade-in">
      <div className="w-1/3 flex flex-col">
        <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold">Biblioteca</h1>
             <button onClick={onAddBook} className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"><PlusIcon className="w-5 h-5"/></button>
        </div>
        <p className="text-gray-400 mb-6">Seu arsenal de conhecimento.</p>
        <div className="flex-grow overflow-y-auto bg-gray-900/50 rounded-lg p-2 border border-gray-700">
          {['Lendo', 'Lido', 'Quero Ler'].map(status => (
            <div key={status} className="mb-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">{status}</h2>
              <div className="space-y-1">
                {books.filter(b => b.status === status).map(book => (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className={`group p-3 rounded-md cursor-pointer transition-all duration-200 border-l-4 flex justify-between items-center ${
                      selectedBook?.id === book.id ? 'bg-[#00A9FF]/20 border-[#00A9FF]' : 'bg-gray-800/50 border-transparent hover:bg-gray-700/80'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-white">{book.title}</p>
                      <p className="text-sm text-gray-400">{book.author}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                       <button onClick={(e) => { e.stopPropagation(); onEditBook(book); }} className="p-1 text-gray-400 hover:text-white"><EditIcon className="w-4 h-4" /></button>
                       <button onClick={(e) => { e.stopPropagation(); onDeleteBook(book.id); }} className="p-1 text-gray-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/3 bg-gray-900/50 rounded-lg p-6 border border-gray-700 flex flex-col">
        {selectedBook ? (
          <>
            <div className="flex-shrink-0 mb-6">
              <h2 className="text-2xl font-bold">{selectedBook.title}</h2>
              <p className="text-gray-400">{selectedBook.author}</p>
            </div>
            <div className="flex-grow overflow-y-auto mb-4 pr-2">
                <h3 className="text-lg font-semibold mb-3">Notas</h3>
                <div className="space-y-4">
                    {selectedBook.notes.length > 0 ? (
                        selectedBook.notes.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(note => (
                            <NoteItem 
                                key={note.id}
                                note={note}
                                onUpdate={(updatedNote) => onUpdateNote(selectedBook.id, updatedNote)}
                                onDelete={(noteId) => onDeleteNote(selectedBook.id, noteId)}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500">Nenhuma nota para este livro.</p>
                    )}
                </div>
            </div>
            <div className="flex-shrink-0 flex gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder="Adicionar nota rápida..."
                className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00A9FF]"
              />
              <button onClick={handleAddNote} className="bg-[#00A9FF] text-black font-bold px-4 rounded-md hover:bg-opacity-80 transition">Salvar</button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Selecione um livro para ver os detalhes e notas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
