
import React, { useState } from 'react';
import { ACCENT_COLOR } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

interface LoginProps {
    onSignIn: (email: string, password: string) => Promise<any>;
    onSignUp: (email: string, password: string) => Promise<any>;
    onSignInAnonymously: () => Promise<any>;
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

const Login: React.FC<LoginProps> = ({ onSignIn, onSignUp, onSignInAnonymously }) => {
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(isLoading) return;
        setIsLoading(true);
        setError('');

        try {
            if (isLogin) {
                await onSignIn(email, password);
            } else {
                await onSignUp(email, password);
            }
        } catch (err: any) {
            switch (err.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    setError(t('login.error.invalid'));
                    break;
                case 'auth/email-already-in-use':
                    setError(t('login.error.inUse'));
                    break;
                case 'auth/weak-password':
                    setError(t('login.error.weakPassword'));
                    break;
                default:
                    setError(t('login.error.generic'));
                    break;
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnonymousLogin = async () => {
        if(isLoading) return;
        setIsLoading(true);
        setError('');
        try {
            await onSignInAnonymously();
        } catch (err: any) {
            setError(t('login.error.anonymousFail'));
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex h-screen w-screen text-white items-center justify-center animate-fade-in">
            <div className="w-full max-w-sm p-8 space-y-6 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl">
                <div className="text-center">
                    <EixoLogo className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                    <h1 className="text-3xl font-bold text-white tracking-widest">EIXO</h1>
                    <p className="text-gray-400 mt-2">{isLogin ? t('login.accessSystem') : t('login.createAccount')}</p>
                </div>

                <div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            placeholder={t('login.email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-gray-800/60 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A9FF] transition-all"
                        />
                        <input
                            type="password"
                            placeholder={t('login.password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-gray-800/60 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A9FF] transition-all"
                        />
                        
                        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#00A9FF] text-black font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-[#00A9FF]/20 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center"
                        >
                             {isLoading && (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isLoading ? t('login.processing') : (isLogin ? t('login.signIn') : t('login.signUp'))}
                        </button>
                    </form>

                    <p className="text-sm text-center text-gray-500 pt-2">
                        {isLogin ? t('login.noAccount') : t('login.hasAccount')}
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-semibold text-[#00A9FF] hover:underline ml-1">
                            {isLogin ? t('login.createNow') : t('login.signInNow')}
                        </button>
                    </p>
                </div>


                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-[#181818] px-2 text-gray-500">
                        {t('login.devMode')}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleAnonymousLogin}
                    disabled={isLoading}
                    className="w-full bg-gray-700/80 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-all duration-200 disabled:opacity-50"
                >
                    {t('login.devSignIn')}
                </button>
            </div>
        </div>
    );
};

export default Login;
