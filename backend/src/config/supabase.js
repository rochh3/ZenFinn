const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;

// Cliente "anon": solo sirve para validar los JWT que envía la app.
const authClient = createClient(url, process.env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Cliente "admin" (service role): se salta RLS. SOLO para el webhook de WhatsApp,
// donde no hay sesión de usuario. Siempre se filtra explícitamente por usuario.
const adminClient = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

module.exports = { authClient, adminClient };
