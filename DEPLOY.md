# Guía de Deploy — Chamba Segura

Arquitectura: **Frontend (Next.js 16) → Vercel** · **Backend (NestJS 11) → Render** · **DB/Auth → Supabase**

## Cambio realizado en el código

Se modificó `backend/src/main.ts` para que el CORS sea configurable vía variable de entorno `FRONTEND_URL`:

```ts
const frontendUrl = process.env.FRONTEND_URL;
app.enableCors({
  origin: frontendUrl ? [frontendUrl, 'http://localhost:3000', 'http://localhost:4173'] : '*',
  credentials: true,
});
```

- Si `FRONTEND_URL` está definida → solo permite ese origen (producción)
- Si no → permite cualquier origen (desarrollo local)

---

## 1. Push a GitHub

```bash
git add .
git commit -m "feat: configurar CORS para producción"
git push
```

---

## 2. Backend — Render (NestJS API)

### 2.1 Crear cuenta
Ve a [render.com](https://render.com) → Regístrate con GitHub (así importas el repo directo).

### 2.2 Crear Web Service
- Botón **"New +" → "Web Service"**
- Conecta tu cuenta GitHub y selecciona el repositorio `chamba_segura`

### 2.3 Configuración

| Campo | Valor |
|---|---|
| **Name** | `chamba-segura-api` (o el que quieras) |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Plan** | Free (Starter $7/mes si necesitas WebSockets) |

### 2.4 Environment Variables

Agrega estas variables (los valores están en `backend/.env`):

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | `https://sxlzsvfbdlzdqmqzukqa.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4bHpzdmZiZGx6ZHFtcXp1a3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTQ3MDgsImV4cCI6MjA5NTQ5MDcwOH0.O7RVOT03TUUdLzAb0cEf9K_5keDQnmEwqPtESxktPU8` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4bHpzdmZiZGx6ZHFtcXp1a3FhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTkxNDcwOCwiZXhwIjoyMDk1NDkwNzA4fQ.D6ZNdhYJl0UHmsBkPpK3ZJAnIJvJxFp-57JdT-XLDcE` |

Opcional (restringe CORS a tu frontend):

| Variable | Valor |
|---|---|
| `FRONTEND_URL` | `https://tu-app.vercel.app` |

### 2.5 Deploy
- Haz clic en **"Deploy Web Service"**
- Render clonará el repo, ejecutará `npm install && npm run build` y luego `npm run start:prod`
- Una vez terminado, te dará una URL como:
  ```
  https://chamba-segura-api.onrender.com
  ```
  **Guárdala, la necesitas para el frontend.**

---

## 3. Frontend — Vercel (Next.js)

### 3.1 Crear cuenta
Ve a [vercel.com](https://vercel.com) → Regístrate con GitHub.

### 3.2 Importar proyecto
- **"Add New..." → "Project"**
- Busca y selecciona `chamba_segura`

### 3.3 Configuración

| Campo | Valor |
|---|---|
| **Root Directory** | `frontend` |
| **Framework Preset** | `Next.js` (Vercel lo detecta automático) |
| **Build and Output Settings** | Dejar todo por defecto |

### 3.4 Environment Variables

Agrega estas variables (valores de `frontend/.env.local` + `NEXT_PUBLIC_API_URL` nuevo):

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://sxlzsvfbdlzdqmqzukqa.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4bHpzdmZiZGx6ZHFtcXp1a3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTQ3MDgsImV4cCI6MjA5NTQ5MDcwOH0.O7RVOT03TUUdLzAb0cEf9K_5keDQnmEwqPtESxktPU8` |
| `NEXT_PUBLIC_API_URL` | `https://chamba-segura-api.onrender.com/api/v1` |

> **⚠️ IMPORTANTE**: `NEXT_PUBLIC_API_URL` debe terminar en `/api/v1` y apuntar a la URL de tu backend en Render. Pon la URL real que te dio Render, no la de ejemplo.

### 3.5 Deploy
- **"Deploy"**
- Vercel detecta Next.js automáticamente, corre `next build` y publica
- Obtendrás una URL como:
  ```
  https://chamba-segura.vercel.app
  ```

---

## 4. Verificar que funciona

1. Abre la URL de Vercel
2. Regístrate o inicia sesión
3. Navega por las secciones (trabajos, servicios, perfil)
4. Si todo carga, el deploy está completo

Si ves errores de red en la consola del navegador, revisa que `NEXT_PUBLIC_API_URL` apunte correctamente al backend de Render.

---

## ⚠️ Notas importantes

### Free tier de Render — "duerme"
Render apaga el servicio gratis después de **15 minutos sin actividad**. Cuando alguien hace una request después de ese tiempo, tarda **~30 segundos** en responder mientras despierta. Es normal. Las siguientes requests serán rápidas.

Para evitar esto, necesitas el plan **Starter ($7/mes)**.

### WebSockets (chat en tiempo real)
El plan **Free de Render no soporta WebSockets persistentes**. Si el chat en tiempo real es importante:

1. Cambia Render a plan **Starter ($7/mes)**
2. O implementa polling como fallback en el frontend

### Variables de entorno
Los archivos `.env` y `.env.local` están en `.gitignore` y **no se suben al repositorio**. Por eso hay que copiar los valores manualmente en los dashboards de Render y Vercel. Es la práctica correcta de seguridad.

### Actualizar variables después del deploy
Si cambias variables de entorno en Render o Vercel, ellos hacen un **redeploy automático**.

### CORS
El backend ya está configurado para:

| Entorno | Comportamiento |
|---|---|
| Desarrollo local | Acepta cualquier origen (`*`) |
| Producción (con `FRONTEND_URL` seteada) | Solo acepta tu frontend de Vercel |

No es obligatorio definir `FRONTEND_URL` — sin ella el backend igual funciona (permite todos los orígenes).

---

## Solución de problemas comunes

| Problema | Causa | Solución |
|---|---|---|
| `ERR_CONNECTION_REFUSED` en API calls | Backend dormido en Render free tier | Espera 30s y recarga |
| `401 Unauthorized` | Token expirado o inválido | Cierra sesión y vuelve a iniciar |
| `CORS` error en consola | `FRONTEND_URL` mal configurada o no definida | Verifica variable en Render, o déjala sin definir (permite todos) |
| Página en blanco / error de build en Vercel | Falta `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Verifica que estén en las env vars de Vercel |
| Error 404 en API | `NEXT_PUBLIC_API_URL` sin `/api/v1` al final | Agrega `/api/v1` a la URL |
