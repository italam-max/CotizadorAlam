// ARCHIVO: src/components/auth/LoginPage.tsx
import { useState } from 'react';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
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
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Contenedor principal
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden bg-gray-900">
      
      {/* --- CAPA 1: IMAGEN DE FONDO --- */}
      <div 
        className="absolute inset-0 z-0" // Quitamos 'transform scale-105' para no hacer zoom extra
        style={{ 
            // Asegúrate de que el archivo en public/images/ se llame EXACTAMENTE así:
            backgroundImage: "url('/images/fondo-alamex.png')",
            
            // 'cover' es clave: Escala la imagen proporcionalmente hasta cubrir todo.
            // NO deforma, pero sí RECORTA si las proporciones no coinciden.
            backgroundSize: 'cover',     
            
            // Centra la imagen horizontal y verticalmente.
            backgroundPosition: 'center center', 
            
            // Evita mosaicos
            backgroundRepeat: 'no-repeat',

            // (Opcional) Si tu imagen es muy brillante, esto ayuda a que el texto se lea. 
            // Si la imagen ya es oscura, puedes quitar esta línea.
            filter: 'brightness(0.8)' 
        }} 
      ></div>

      {/* --- CAPA 2: FILTRO DE COLOR --- */}
      {/* Un tono azul corporativo sobre la imagen para unificar el diseño */}
      <div className="absolute inset-0 bg-blue-950/60 z-10 mix-blend-multiply pointer-events-none"></div>

      {/* --- CAPA 3: CONTENIDO (Login) --- */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-20">
        {/* Logo Corporativo Real */}
        <div className="inline-flex items-center gap-4 mb-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 animate-fadeIn">
            <div className="bg-white p-2 rounded-lg shadow-sm transform -rotate-6">
                <img 
                  src="/images/logo-alamex.png" 
                  alt="Logo Alamex" 
                  className="w-10 h-10 object-contain" 
                />
            </div>
            <div className="text-left">
                <h1 className="text-3xl font-black text-white tracking-wide uppercase italic leading-none drop-shadow-md">ALAMEX</h1>
                <p className="text-xs font-bold text-yellow-400 tracking-wider mt-1 drop-shadow-sm">Ascending Together</p>
            </div>
        </div>
        
        <h2 className="mt-2 text-2xl font-black text-white drop-shadow-md">
          Portal de Cotización Interno
        </h2>
        <p className="mt-2 text-sm text-blue-100 font-medium">
          Acceso exclusivo para personal autorizado.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-20">
        <div className="bg-white/95 backdrop-blur-lg py-10 px-6 shadow-2xl rounded-3xl sm:px-12 border-t-4 border-yellow-500 animate-slideUp">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3 animate-bounce-in">
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-sm font-bold text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 pl-1">
                Correo Corporativo
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-3 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent sm:text-sm bg-gray-50/50 focus:bg-white transition-all font-medium"
                  placeholder="usuario@alamex.mx"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 pl-1">
                Contraseña
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-3 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent sm:text-sm bg-gray-50/50 focus:bg-white transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none tracking-wide"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'INGRESAR AL SISTEMA'}
              </button>
            </div>
          </form>
        </div>
        <p className="text-center text-xs text-blue-200/80 mt-8 font-medium drop-shadow-sm">
          © {new Date().getFullYear()} Elevadores Alamex S.A. de C.V. <br/> Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}