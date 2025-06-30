import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Login.scss';

const API_URL = import.meta.env.VITE_BFF_URL;

const Login: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Login handler
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        const result = await login(email, password);
        if (!result.success) {
            setError(result.message || 'Erro ao autenticar.');
        }
    };

    // Forgot password handler
    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        try {
            const response = await fetch(`${API_URL}/usuarios/reset-password/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail }),
            });
            if (response.ok) {
                setSuccessMsg('E-mail de recuperação enviado!');
            } else {
                setError('E-mail não encontrado.');
            }
        } catch {
            setError('Erro ao conectar ao servidor.');
        }
    };

    const titulo = showForgot
        ? "Esqueceu a senha? Fica Tranquila(o)!"
        : "Seja Bem Vinda(o) !";

    const texto = showForgot
        ? "Vamos te ajudar. Informe os dados necessários para recuperar a sua senha"
        : "Portal Pessoas todas as funcionalidades para gestão  do seu time em um só lugar";

    return (
        <div className="login-container">
            <div className="login-left">
                <h2>{titulo}</h2>
                <p>{texto}</p>
            </div>
            <div className="login-right">
                {!showForgot ? (
                    <form className="login-form" onSubmit={handleLogin}>
                        <h2 className="login-title">Entrar</h2>
                        <p className="login-subtitle">Informe seu e-mail e senha para entrar na plataforma.</p>
                        <input
                            className="login-input"
                            type="email"
                            placeholder="E-MAIL"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <input
                            className="login-input"
                            type="password"
                            placeholder="SENHA"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        {error && <p className="login-message error">{error}</p>}
                        <button type="button" className="login-link" onClick={() => setShowForgot(true)}>
                            Esqueceu sua senha?
                        </button>
                        <button type="submit" className="login-button">ENTRAR</button>
                    </form>
                ) : (
                    <form className="login-form" onSubmit={handleForgot}>
                        <h2 className="login-title">Esqueci a senha</h2>
                        <p className="login-subtitle">
                            Digite seu e-mail e enviaremos um e-mail para você informando como recuperá-la.
                        </p>
                        <input
                            className="login-input"
                            type="email"
                            placeholder="E-MAIL"
                            value={forgotEmail}
                            onChange={e => setForgotEmail(e.target.value)}
                            required
                        />
                        {error && <p className="login-message error">{error}</p>}
                        {successMsg && <p className="login-message success">{successMsg}</p>}
                        <button type="button" className="login-link" onClick={() => setShowForgot(false)}>
                            Lembrou a senha? Entrar
                        </button>
                        <button type="submit" className="login-button">RECUPERAR SENHA</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;