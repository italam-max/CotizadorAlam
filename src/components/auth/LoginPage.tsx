// ARCHIVO: src/components/auth/LoginPage.tsx
// CORRECCIÓN: Agregamos las llaves { } alrededor de useState
import { useState } from 'react';
import { Box, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // Si el login es exitoso, Supabase actualizará la sesión automáticamente
      // y App.tsx redibujará la pantalla principal.
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo Corporativo Estilizado */}
        <div className="inline-flex items-center gap-3 mb-6 bg-blue-900 p-4 rounded-2xl shadow-lg">
            <div className="bg-yellow-500 text-blue-900 p-2 rounded-lg shadow-sm transform -rotate-12">
                <Box size={32} strokeWidth={2.5} />
            </div>
            <div className="text-left">
                <h1 className="text-3xl font-black text-white tracking-wide uppercase italic leading-none">ALAMEX</h1>
                <p className="text-xs font-bold text-yellow-400 tracking-wider mt-1">Ascending Together</p>
            </div>
        </div>
        <h2 className="mt-2 text-2xl font-black text-blue-900">
          Portal de Cotización Interno
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Acceso exclusivo para personal autorizado.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-2xl rounded-2xl sm:px-12 border-t-4 border-yellow-500 relative overflow-hidden">
          {/* Elemento decorativo de fondo */}
          <div className="absolute -top-10 -right-10 text-blue-50 opacity-50 transform rotate-12 pointer-events-none">
             <Box size={150} />
          </div>

          <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3 animate-bounce-in">
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-sm font-bold text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700">
                Correo Corporativo
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent sm:text-sm transition-all"
                  placeholder="nombre@alamex.mx"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                Contraseña
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  'Iniciar Sesión Segura'
                )}
              </button>
            </div>
          </form>
        </div>
        <p className="text-center text-xs text-gray-500 mt-8">
          © {new Date().getFullYear()} Elevadores Alamex S.A. de C.V. <br/> Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}