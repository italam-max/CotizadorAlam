// ARCHIVO: api/createUser.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // 1. Solo permitimos el método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Obtenemos las credenciales maestras del entorno (Configuraremos esto en Vercel)
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Falta configuración del servidor' });
  }

  // 3. Iniciamos Supabase en MODO ADMIN
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const { email, password, fullName, jobTitle, role } = req.body;

  try {
    // 4. Crear el usuario en el sistema de autenticación
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar el email
      user_metadata: {
        full_name: fullName, // Esto activará tu Trigger en la base de datos
      }
    });

    if (createError) throw createError;

    // 5. Actualizar el perfil con los datos extra (Rol y Puesto)
    // El trigger ya creó el perfil, ahora lo actualizamos
    if (userData.user) {
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ 
                job_title: jobTitle,
                role: role || 'user',
                active: true
            })
            .eq('id', userData.user.id);
            
        if (profileError) throw profileError;
    }

    return res.status(200).json({ message: 'Usuario creado exitosamente', user: userData.user });

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}