import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { usePageTitle } from '../hooks/usePageTitle';
import {
    ShieldCheck,
    Mail,
    Lock,
    ArrowRight,
    AlertCircle,
    Loader2
} from 'lucide-react';

const LoginPage: React.FC = () => {
    usePageTitle('Área restrita');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/admin');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('E-mail ou senha incorretos.');
            } else {
                setError('Falha na autenticação. Verifique sua conexão.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        setInfo('');
        setLoading(true);
        try {
            await signInWithPopup(auth, new GoogleAuthProvider());
            navigate('/admin');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
                setError('A janela do Google foi fechada antes de concluir o acesso.');
            } else if (err.code === 'auth/popup-blocked') {
                setError('O navegador bloqueou a janela do Google. Libere pop-ups para este site e tente de novo.');
            } else {
                setError('Não foi possível entrar com o Google. Tente de novo.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        setError('');
        setInfo('');
        if (!email) {
            setError('Digite seu e-mail institucional e clique em "Esqueci a senha" de novo.');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (err) {
            console.error(err);
        }
        // Mensagem neutra para não revelar se o e-mail existe
        setInfo('Se o e-mail estiver cadastrado, você receberá as instruções de redefinição.');
    };

    return (
        <div className="min-h-screen bg-slate-50 relative font-sans">
            {/* Background elements - Fixed to prevent scrolling */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-red/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            {/* Content Container - Allow scrolling if needed */}
            <div className="min-h-screen flex items-center justify-center p-6 relative z-10 overflow-y-auto">
                <div className="w-full max-w-md my-8">
                    <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 mb-6 group hover:scale-105 transition-all duration-500 overflow-hidden">
                            <img src="/spc-logo.png" alt="SPC Logo" className="h-full w-full object-cover" />
                        </div>
                        <h1 className="text-2xl font-black text-brand-dark tracking-tight">Portal de Gestão SPC</h1>
                        <p className="text-sm text-slate-500 font-medium mt-2">Área restrita a servidores autorizados da SPC</p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-100 animate-in zoom-in-95">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            {info && (
                                <div role="status" className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-xs font-bold border border-emerald-100">
                                    {info}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="login-email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail institucional</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        id="login-email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu e-mail institucional"
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-sm text-brand-dark"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label htmlFor="login-password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha</label>
                                    <button type="button" onClick={handleReset} className="text-[9px] font-black text-brand-blue uppercase tracking-widest hover:underline">Esqueci a senha</button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        id="login-password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-sm text-brand-dark"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 hover:bg-brand-blue hover:shadow-2xl hover:shadow-brand-blue/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none group"
                            >
                                {loading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        Entrar <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="flex items-center gap-3 mb-4" aria-hidden="true">
                                <span className="h-px flex-1 bg-slate-100"></span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ou</span>
                                <span className="h-px flex-1 bg-slate-100"></span>
                            </div>
                            <button
                                type="button"
                                onClick={handleGoogle}
                                disabled={loading}
                                className="w-full py-4 bg-white text-brand-dark border-2 border-slate-200 rounded-2xl font-black uppercase tracking-[0.15em] text-[11px] flex items-center justify-center gap-3 hover:border-brand-blue hover:text-brand-blue transition-all disabled:opacity-70 disabled:pointer-events-none"
                            >
                                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
                                Entrar com Google
                            </button>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-50 text-center space-y-4">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <ShieldCheck size={14} className="text-brand-blue" /> Ambiente Seguro & Monitorado
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <Link to="/" className="text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-brand-dark transition-colors">
                            Voltar para a Área Pública
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
