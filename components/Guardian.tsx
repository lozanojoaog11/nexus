
import React, { useState, useRef, useEffect } from 'react';
import { askGuardian } from '../services/geminiService';
import { USER_MANIFESTO } from '../constants';
import { Message } from '../types';

const Guardian: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'guardian', text: 'O que está em sua mente, Arquiteto?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askGuardian(input, USER_MANIFESTO);
      const guardianMessage: Message = { sender: 'guardian', text: response };
      setMessages(prev => [...prev, guardianMessage]);
    } catch (error) {
      const errorMessage: Message = { sender: 'guardian', text: 'Erro ao comunicar com o Guardião.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 text-white w-full h-full flex flex-col animate-fade-in">
      <div className="flex-shrink-0 mb-6">
          <h1 className="text-3xl font-bold">Guardião</h1>
          <p className="text-gray-400">Seu conselheiro de IA para clareza estratégica.</p>
      </div>
      
      <div className="flex-grow overflow-y-auto mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'guardian' && (
                     <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-800 border border-gray-600">
                        <svg className="w-5 h-5 text-[#00A9FF]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                     </div>
                )}
              <div className={`max-w-xl p-4 rounded-xl ${msg.sender === 'user' ? 'bg-[#00A9FF] text-black' : 'bg-gray-800 text-white'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-800 border border-gray-600">
                <svg className="w-5 h-5 text-[#00A9FF]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
              </div>
              <div className="max-w-xl p-4 rounded-xl bg-gray-800 text-white">
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
      
      <div className="flex-shrink-0 flex items-center space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Faça sua pergunta..."
          className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00A9FF] transition-all"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-[#00A9FF] text-black font-bold p-3 rounded-lg hover:bg-opacity-80 transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  );
};

export default Guardian;
