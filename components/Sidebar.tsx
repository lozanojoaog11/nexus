
import React, { useState } from 'react';
import { View } from '../types';
import { NAV_ITEMS, ACCENT_COLOR } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onSignOut: () => void;
}

const EixoLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="2" stroke={ACCENT_COLOR} strokeWidth="1.5"/>
        <path d="M12 6V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 21V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M18 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M3 12H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16.9497 7.05021L18.081 5.91899" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5.91895 18.081L7.05017 16.9498" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16.9497 16.9498L18.081 18.081" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5.91895 5.91899L7.05017 7.05021" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
)

const SignOutIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
    </svg>
);

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const languages = {
        'pt-BR': { flag: '🇧🇷', name: t('lang.pt-BR') },
        'en-US': { flag: '🇺🇸', name: t('lang.en-US') },
        'es-ES': { flag: '🇪🇸', name: t('lang.es-ES') },
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
            >
                <span>{languages[language].flag} {languages[language].name}</span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <div className="absolute bottom-full mb-2 w-full bg-[#2a2a2a] border border-white/10 rounded-lg shadow-xl py-1">
                    {Object.entries(languages).map(([code, { flag, name }]) => (
                        <button
                            key={code}
                            onClick={() => {
                                setLanguage(code as 'pt-BR' | 'en-US' | 'es-ES');
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
                        >
                            {flag} {name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onSignOut }) => {
  const { t } = useTranslation();

  return (
    <div className="w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col flex-shrink-0">
      <div className="flex items-center space-x-3 mb-16">
        <EixoLogo className="w-8 h-8 text-gray-400"/>
        <h1 className="text-2xl font-bold text-white tracking-widest">EIXO</h1>
      </div>
      <nav className="flex flex-col space-y-3">
        {NAV_ITEMS.map(item => (
          <button
            key={item.view}
            onClick={() => setCurrentView(item.view)}
            className={`flex items-center space-x-4 p-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              currentView === item.view
                ? `bg-[#00A9FF] text-black shadow-lg shadow-[#00A9FF]/20`
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {item.icon}
            <span>{t(item.labelKey)}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto flex flex-col space-y-4">
        <LanguageSwitcher />
        <button
            onClick={onSignOut}
            className="flex items-center space-x-4 p-3 rounded-xl text-sm font-semibold transition-all duration-200 text-gray-500 hover:bg-red-500/10 hover:text-red-400"
        >
            <SignOutIcon className="w-5 h-5" />
            <span>{t('sidebar.signOut')}</span>
        </button>
        <div className="text-center text-gray-600 text-xs">
          <p>v1.2</p>
          <p>{t('sidebar.stableAxis')}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
