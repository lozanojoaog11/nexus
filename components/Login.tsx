
import React, { useState } from 'react';
import { ACCENT_COLOR } from '../constants';

interface LoginProps {
    onSignIn: (email: string, password: string) => Promise<any>;
    onSignUp: (email: string, password: string) => Promise<any>;
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

const Login: React.FC<LoginProps> = ({ onSignIn, onSignUp }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                    setError('E-mail ou senha inválidos.');
                    break;
                case 'auth/email-already-in-use':
                    setError('Este e-mail já está em uso.');
                    break;
                case 'auth/weak-password':
                    setError('A senha deve ter pelo menos 6 caracteres.');
                    break;
                default:
                    setError('Ocorreu um erro. Tente novamente.');
                    break;
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-screen text-white items-center justify-center animate-fade-in">
            <div className="w-full max-w-sm p-8 space-y-8 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl">
                <div className="text-center">
                    <EixoLogo className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                    <h1 className="text-3xl font-bold text-white tracking-widest">EIXO</h1>
                    <p className="text-gray-400 mt-2">{isLogin ? 'Acesse seu sistema' : 'Crie sua conta'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-gray-800/60 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A9FF] transition-all"
                    />
                    <input
                        type="password"
                        placeholder="Senha"
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
                        {isLoading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-500">
                    {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-semibold text-[#00A9FF] hover:underline ml-1">
                        {isLogin ? "Crie uma agora" : "Faça login"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
