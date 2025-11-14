import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen } from 'lucide-react';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [comentar, setComentar] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // Registro
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;

        // Intentar obtener el usuario (puede ser null si se requiere verificación por correo)
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;

        if (user?.id) {
          // Crear fila en tabla "profiles" con el comentario opcional
          const { error: insertError } = await supabase.from('profiles').insert({
            id: user.id,
            email,
            comment: comentar || null,
          });
          if (insertError) {
            console.warn('No se pudo crear profile:', insertError);
          }
        } else {
          // Si no hay usuario inmediato (flujo de confirmación por email)
          alert('Registro enviado. Revisa tu correo para confirmar tu cuenta si es necesario.');
        }
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
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
          <div className={`${accent.iconBg} p-3 rounded-full`}>
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
            <label className="text-xs text-gray-500">Mínimo 6 caracteres</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${accent.focusRing}`}
              placeholder="••••••••"
            />
          </div>
          <div> 
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentario
            </label>
            <input
              type="text"
              value={comentar}
              onChange={(e) => setComentar(e.target.value)}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${accent.focusRing}`}
              placeholder="Escribe un comentario (opcional)"
            />



          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Recordar mi email</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-lg transition-colors disabled:opacity-50 font-medium ${accent.button}`}
          >
            {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className={`${accent.link} text-sm font-medium`}
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            
          </button>
        </div>
      </div>
    </div>
  );
}
