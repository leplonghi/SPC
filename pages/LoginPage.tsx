import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserRole } from '../types';
import {
    ShieldCheck,
    Mail,
    Lock,
    ArrowRight,
    AlertCircle,
    Loader2
} from 'lucide-react';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
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

    const handleTestLogin = async (role: 'admin' | 'editor' | 'viewer') => {
        setLoading(true);
        setError('');

        const credentials = {
            admin: { email: 'admin@spc.ma.gov.br', pass: 'admin123', role: UserRole.SUPER_ADMIN, name: 'Super Admin' },
            editor: { email: 'editor@spc.ma.gov.br', pass: 'editor123', role: UserRole.EDITOR_DPHAP, name: 'Editor DPHAP' },
            viewer: { email: 'viewer@spc.ma.gov.br', pass: 'viewer123', role: UserRole.VIEWER, name: 'Visitante' }
        };

        const cred = credentials[role];
        setEmail(cred.email);
        setPassword(cred.pass);

        try {
            await signInWithEmailAndPassword(auth, cred.email, cred.pass);
            navigate('/admin');
        } catch (err: any) {
            console.log("Login normal falhou, tentando criar usuário de teste...", err.code);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                try {
                    // Create user if not exists (DEV helper)
                    const userCred = await createUserWithEmailAndPassword(auth, cred.email, cred.pass);
                    // Create Firestore profile
                    await setDoc(doc(db, 'users', userCred.user.uid), {
                        name: cred.name,
                        role: cred.role,
                        department: role === 'editor' ? 'DPHAP' : 'Gestão'
                    });
                    // Force reload to ensure AuthContext picks up the new role from Firestore
                    window.location.reload();
                } catch (createErr: any) {
                    console.error("Erro ao criar usuário de teste:", createErr);
                    setError(`Erro ao criar usuário de teste: ${createErr.message}`);
                    setLoading(false);
                }
            } else if (err.code === 'auth/wrong-password') {
                setError('Senha incorreta (usuário já existe). Corrija no Firebase Console ou use outro e-mail.');
                setLoading(false);
            } else if (err.code === 'auth/configuration-not-found') {
                setError('Erro de configuração: Ative o provedor "E-mail/Senha" no Firebase Console.');
                setLoading(false);
            } else {
                console.error("Test Login Error Detailed:", err);
                setError(`Erro no login de teste: ${err.code}`);
                setLoading(false);
            }
        }
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
                        <p className="text-sm text-slate-500 font-medium mt-2">Área restrita para administradores e editores</p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-100 animate-in zoom-in-95">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Institucional</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="exemplo@spc.ma.gov.br"
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-sm text-brand-dark"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha</label>
                                    <button type="button" className="text-[9px] font-black text-brand-blue uppercase tracking-widest hover:underline">Esqueci a senha</button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
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
                                        Entrar no Ecossistema <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-50 text-center space-y-4">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <ShieldCheck size={14} className="text-brand-blue" /> Ambiente Seguro & Monitorado
                            </p>

                            {/* DEV ONLY BUTTONS */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Acesso Rápido - (Teste/Dev)</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleTestLogin('admin')}
                                        className="py-2 px-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-[10px] font-bold uppercase"
                                    >
                                        Admin
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTestLogin('editor')}
                                        className="py-2 px-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-[10px] font-bold uppercase"
                                    >
                                        Editor
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTestLogin('viewer')}
                                        className="py-2 px-1 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-lg text-[10px] font-bold uppercase"
                                    >
                                        Viewer
                                    </button>
                                </div>
                            </div>
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
