import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

// Simple encryption/decryption using base64 (NOT for production - just for convenience)
const encodeCredentials = (text: string) => btoa(text);
const decodeCredentials = (text: string) => atob(text);

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');

    if (savedEmail && savedPassword) {
      try {
        setEmail(decodeCredentials(savedEmail));
        setPassword(decodeCredentials(savedPassword));
        setRememberMe(true);
      } catch {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', encodeCredentials(email));
        localStorage.setItem('rememberedPassword', encodeCredentials(password));
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }

      onAuthSuccess();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Ha ocurrido un error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearCredentials = () => {
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    setRememberMe(false);
  };
  const accent = isLogin
    ? {
        gradient: 'from-blue-50 to-sky-100',
        iconBg: 'bg-blue-600',
        focusRing: 'focus:ring-blue-500',
        button: 'bg-blue-600 hover:bg-blue-700',
        link: 'text-blue-600 hover:text-blue-700',
      }
    : {
        gradient: 'from-emerald-50 to-lime-100',
        iconBg: 'bg-emerald-600',
        focusRing: 'focus:ring-emerald-500',
        button: 'bg-emerald-600 hover:bg-emerald-700',
        link: 'text-emerald-600 hover:text-emerald-700',
      };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${accent.gradient} flex items-center justify-center p-4`}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="flex items-center justify-center mb-6">
          <div className={`${accent.iconBg} p-3 rounded-full transition-colors`}>
            <BookOpen size={32} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          FlashLearn
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Aprende idiomas con tarjetas inteligentes
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${accent.focusRing}`}
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${accent.focusRing} pr-10`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={`w-4 h-4 rounded border-gray-300 ${isLogin ? 'text-blue-600 focus:ring-blue-500' : 'text-emerald-600 focus:ring-emerald-500'} focus:ring-2`}
              />
              <span className="text-sm text-gray-700">Recordar usuario y contraseña</span>
            </label>
            {rememberMe && (
              <button
                type="button"
                onClick={handleClearCredentials}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Limpiar datos guardados
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${accent.button} text-white py-2 rounded-lg transition-colors disabled:opacity-50 font-medium`}
          >
            {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className={`${accent.link} text-sm font-medium transition-colors`}
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
