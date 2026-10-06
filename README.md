# ZenFin

Finanzas personales para dos: cada persona tiene su cuenta y sus datos, y comparten solo lo que quieren (cuentas compartidas). Sincronizado en todos tus dispositivos.

```
mobile/    App Expo / React Native (habla directamente con Supabase; la seguridad la da RLS)
backend/   API Express: asistente IA (Groq · Llama) y webhook de WhatsApp
supabase/  schema.sql: tablas, políticas RLS, funciones y realtime
```

## Puesta en marcha

### 1. Supabase
1. Dashboard → **SQL Editor** → pega `supabase/schema.sql` → **Run**.
   (Si tenías tablas de prueba con los mismos nombres, descomenta el bloque RESET del principio.)
2. **Authentication → Providers → Email**: para probar rápido puedes desactivar *Confirm email*; en producción déjalo activado.

### 2. Backend
```bash
cd backend
cp .env.example .env   # rellena SUPABASE_*, GROQ_API_KEY…
npm install
npm run dev
```
Despliégalo donde prefieras (Render, Railway, Fly…) con las mismas variables. La clave de Groq y la `service_role` **solo viven aquí**, nunca en la app.

### 3. App
```bash
cd mobile
cp .env.example .env   # EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_API_URL
npm install
npx expo start
```

### 4. Compilar el iOS desde GitHub Actions
En **Settings → Secrets and variables → Actions** crea `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` y `EXPO_PUBLIC_API_URL`.

## Cómo usarlo en pareja
1. Cada uno crea su cuenta en su móvil.
2. Uno entra en **Más → Cuentas compartidas → Nueva cuenta** y comparte el código de invitación.
3. El otro usa **Unirme** e introduce el código. Los dos ven los mismos gastos compartidos y quién debe a quién.
4. Tus movimientos, categorías y presupuestos personales son privados.

## Seguridad
- RLS en todas las tablas: cada usuario solo accede a sus filas; las cuentas compartidas, solo a sus miembros.
- `/api/chat` exige sesión de Supabase y tiene límite de 20 mensajes/min por usuario.
- La salida de la IA se valida y normaliza antes de usarse.
- El webhook de WhatsApp verifica la firma `X-Hub-Signature-256` (`WHATSAPP_APP_SECRET`).
