# ChambaSegura

**Plataforma de conexión entre profesionales técnicos del hogar y clientes**

---

## 📋 Resumen del Proyecto

**ChambaSegura** es una aplicación web full-stack diseñada para facilitar la conexión entre profesionales técnicos del hogar (electricistas, plomeros, carpinteros, etc.) y clientes que necesitan sus servicios. La plataforma actúa como un marketplace digital que ofrece un entorno seguro, transparente y eficiente para la contratación de servicios técnicos domiciliarios.

El nombre "ChambaSegura" combina el término coloquial latinoamericano "chamba" (trabajo) con "segura", reflejando su propuesta de valor fundamental: **trabajo garantizado y protegido**.

---

## 🎯 Propósito y Justificación

En Latinoamérica, la contratación de servicios técnicos para el hogar enfrenta múltiples problemas:

- **Falta de verificación**: No hay forma confiable de saber si un técnico está calificado.
- **Precios inflados**: Sin transparencia en las tarifas, los clientes suelen pagar de más.
- **Ausencia de garantía**: Si un trabajo sale mal, no hay mecanismos de protección.
- **Pérdida de tiempo**: Encontrar un buen técnico requiere preguntar referencias, esperar cotizaciones y coordinar sin herramientas digitales.

ChambaSegura resuelve estos problemas proporcionando:

- Profesionales verificados con perfiles digitales completos.
- Tarifas transparentes desde la publicación del servicio.
- Sistema Escrow (pago protegido) que retiene el pago hasta que el trabajo esté completo.
- Resolución de disputas integrada en la plataforma.
- Comunicación y seguimiento digital de principio a fin.

---

## 👥 Público Objetivo

### Clientes (Contratantes)
- Dueños de casa o departamentos que necesitan reparaciones o mantenimiento.
- Pequeñas empresas que requieren servicios técnicos recurrentes.
- Personas mayores que necesitan asistencia técnica confiable.
- Cualquier persona que valore la transparencia, la seguridad y la calidad en los servicios del hogar.

### Trabajadores (Técnicos)
- Electricistas, plomeros, carpinteros, pintores, albañiles, técnicos en aire acondicionado, cerrajeros, jardineros, y más.
- Profesionales independientes que buscan digitalizar su cartera de clientes.
- Técnicos que desean aumentar su visibilidad y conseguir nuevos clientes sin intermediarios.

---

## ⚙️ Funcionalidades Principales

### Gestión de Usuarios y Autenticación
- Registro de usuarios sin roles: todos los usuarios pueden publicar trabajos, postularse y ofrecer servicios.
- Inicio de sesión seguro mediante Supabase Auth con JWT.
- Perfiles de usuario editables con foto, datos de contacto y especialidad.
- Middleware de protección de rutas privadas.

### Marketplace de Trabajos (Jobs)
- **Cualquier usuario** puede publicar trabajos especificando título, descripción, categoría, presupuesto y habilidades requeridas.
- Visualización de trabajos disponibles con filtros por categoría y habilidades.
- Búsqueda y filtrado avanzado por categoría y habilidades técnicas.

### Catálogo de Servicios (Servicios)
- **Cualquier usuario** puede publicar servicios con oficio, tarifa promedio, descripción y opción de firma de contrato.
- Exploración de servicios disponibles para contactar directamente a los técnicos.

### Sistema de Postulaciones
- **Cualquier usuario** puede postularse a trabajos publicados por otros.
- El dueño del trabajo revisa las postulaciones recibidas y acepta/rechaza candidatos.
- El postulante ve el estado de sus postulaciones enviadas.
- Al aceptar una postulación, se genera automáticamente un servicio y una contratación.

### Motor de Contrataciones con Máquina de Estados
Las contrataciones siguen un flujo de estado riguroso:

```
PENDIENTE_FIRMA ──> SOLICITUD_PENDIENTE ──> ACEPTADO ──> EN_PROGRESO ──> COMPLETADO
       │                    │                    │
       └──> CANCELADO <─────┘                    │
                                                  └──> CANCELADO
```

- **PENDIENTE_FIRMA**: El servicio requiere firma de contrato; el cliente debe subir el documento firmado.
- **SOLICITUD_PENDIENTE**: El trabajador revisa la solicitud y la acepta o rechaza.
- **ACEPTADO**: El trabajador confirma que puede realizar el trabajo.
- **EN_PROGRESO**: El trabajo está en ejecución.
- **COMPLETADO**: El trabajo finalizó satisfactoriamente.
- **CANCELADO**: Cualquiera de las partes canceló (con distintas validaciones según el estado).

### Gestión de Contratos Digitales
- Subida de documentos de contrato firmado.
- Seguimiento del estado del contrato en tiempo real.
- Historial completo de contrataciones.

### Panel de Control (Dashboard)
- Vista general con saludo personalizado según la hora del día.
- Estadísticas del usuario (con placeholders para datos reales).
- Accesos directos a trabajos, servicios, contrataciones y perfil.
- Pestañas para organizar contrataciones por estado.

### Mensajería en Tiempo Real
- Chat en tiempo real entre participantes de una contratación mediante WebSockets.
- Historial de mensajes persistente por conversación.
- Creación automática de chat al aceptar una postulación.

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | Next.js | 16.2.6 |
| **UI Framework** | React | 19.2.4 |
| **Estilos** | Tailwind CSS | 4.x |
| **Backend** | NestJS | 11.x |
| **Lenguaje** | TypeScript | 5.9.3 |
| **Base de Datos** | Supabase (PostgreSQL) | — |
| **Autenticación** | Supabase Auth | — |
| **SDK Supabase** | @supabase/supabase-js | 2.106.2 |

### Estructura del Proyecto

```
chamba_segura/
│
├── backend/                          # API REST - NestJS
│   └── src/
│       ├── main.ts                   # Punto de entrada (puerto 4000)
│       ├── app.module.ts             # Módulo raíz
│       ├── auth/                     # Autenticación (registro, login, guard)
│       ├── supabase/                 # Cliente Supabase + tipos de base de datos
│       ├── jobs/                     # CRUD de trabajos
│       ├── servicios/                # CRUD de servicios
│       ├── contrataciones/           # Lógica de contrataciones y estados
│       ├── postulaciones/            # Postulaciones + flujo de aceptación
│       ├── profiles/                 # Perfiles de usuario
│       ├── users/                    # Módulo placeholder
│       └── messages/                 # Módulo placeholder (mensajería futura)
│
├── frontend/                         # Aplicación cliente - Next.js
│   └── src/
│       ├── app/
│       │   ├── layout.tsx            # Layout raíz con AuthProvider
│       │   ├── page.tsx              # Landing page / Dashboard
│       │   ├── auth/                 # Login y registro
│       │   ├── components/           # Componentes de UI
│       │   ├── dashboard/            # Panel de contrataciones
│       │   ├── mensajeria/           # Placeholder de mensajería
│       │   ├── perfil/               # Ver y editar perfil
│       │   ├── servicios/            # CRUD de servicios
│       │   └── trabajos/             # CRUD de trabajos
│       ├── api/                      # Capa de comunicación con backend
│       ├── context/                  # Contexto de autenticación
│       ├── utils/                    # Cliente Supabase
│       └── middleware.ts             # Protección de rutas
│
└── package.json                      # Scripts raíz (backend + frontend)
```

### Frontend: Next.js 16 App Router

La aplicación frontend utiliza el **App Router** de Next.js 16 con layout anidado y sistema de rutas basado en archivos. Todas las páginas interactivas utilizan la directiva `"use client"` para habilitar interactividad del lado del cliente.

**Patrón de diseño**: Cada página sigue una estructura consistente:

1. **Estados de carga**: Skeletons o spinners mientras se obtienen datos.
2. **Estados de error**: Mensajes con botón de reintento.
3. **Estados vacíos**: Mensajes informativos con llamadas a la acción.
4. **Estados de éxito**: Datos renderizados con diseño responsivo.

**Autenticación**: Implementada mediante:
- `AuthContext` con React Context API que provee `user`, `session`, `isLoading`, `signOut` y `setAuth`.
- Middleware de Next.js que verifica la cookie `sb-access-token` y redirige a `/auth/login` si no existe (excepto en rutas públicas).
- Comunicación con el backend mediante API calls con Bearer token.

**API Layer**: Módulos en `src/api/` que encapsulan todas las llamadas HTTP al backend (`http://localhost:4000/api/v1`). Cada módulo expone funciones tipadas con TypeScript para garantizar consistencia.

### Backend: NestJS 11 con Arquitectura Modular

El backend sigue la arquitectura de **módulos** de NestJS, cada uno con su propio controlador, servicio y responsabilidades claramente definidas:

- **AuthModule**: Gestiona registro e inicio de sesión mediante Supabase Auth. El registro crea el usuario en Supabase Auth y simultáneamente inserta su perfil en la tabla `perfiles`, con rollback si algo falla. No existe distinción de roles: todos los usuarios tienen el mismo perfil unificado.
- **SupabaseModule**: Módulo global que provee el cliente de Supabase configurado con la Service Role Key para operaciones administrativas.
- **AuthGuard**: Guard personalizado que extrae el token JWT del header `Authorization`, lo valida contra Supabase y adjunta el objeto `user` al request.
- **JobsModule**: CRUD completo de trabajos con filtros por categoría y habilidades (usando operador `@>` de PostgreSQL para arreglos).
- **ServiciosModule**: CRUD de servicios con joins a la tabla de perfiles.
- **PostulacionesModule**: Lógica de postulaciones con validaciones (no postularse al propio trabajo, no duplicados). Al aceptar una postulación, se rechazan automáticamente las demás y se genera una contratación.
- **ContratacionesModule**: Máquina de estados completa con validación de permisos dinámica según la relación del usuario con cada contratación (cliente_id vs servicio.trabajador_id).
- **ProfilesModule**: CRUD de perfiles con la capacidad de construir perfiles desde `user_metadata` de Supabase si no existen en la base de datos.

### Base de Datos: Supabase (PostgreSQL)

El esquema consta de 5 tablas principales:

| Tabla | Propósito |
|-------|-----------|
| `perfiles` | Datos de usuario (nombre, username, email, teléfono, foto) |
| `jobs` | Trabajos publicados por clientes |
| `servicios` | Servicios ofrecidos por trabajadores |
| `postulaciones` | Postulaciones de trabajadores a trabajos |
| `contrataciones` | Contratos con seguimiento de estado |

Todas las tablas están fuertemente tipadas mediante interfaces TypeScript en `database.types.ts`, lo que garantiza type-safety en toda la cadena backend-base de datos.

### Flujo de Contratación Completo

```
1. Cliente publica trabajo (POST /jobs)
2. Trabajador se postula (POST /postulaciones)
3. Cliente acepta postulación (PATCH /postulaciones/:id/estado)
   ├── Se rechazan otras postulaciones automáticamente
   ├── Se crea un servicio para el trabajador (si no existe)
   └── Se crea una contratación
4. Flujo de contratación según máquina de estados
5. Trabajo completado
```

---

## 🚀 Cómo Ejecutar el Proyecto

### Prerrequisitos
- Node.js 20+
- npm 10+
- Cuenta en Supabase (gratuita)

### Configuración

**Backend** (`backend/.env`):
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### Instalación y ejecución

```bash
# Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# Ejecutar ambos (desde la raíz)
npm run backend   # NestJS en http://localhost:4000
npm run frontend  # Next.js en http://localhost:3000
```

---

## 📐 Decisiones Técnicas Relevantes

### ¿Por qué Next.js 16 + NestJS?
Se optó por una arquitectura **frontend-backend desacoplada** para permitir escalabilidad independiente de cada capa. Next.js 16 proporciona renderizado híbrido (SSR/SSG/CSR) y una excelente experiencia de desarrollo, mientras que NestJS ofrece una arquitectura modular y opinada ideal para aplicaciones empresariales.

### ¿Por qué Supabase?
Supabase ofrece una solución integral que combina base de datos PostgreSQL con autenticación lista para usar, eliminando la necesidad de gestionar servidores de autenticación adicionales. La Service Role Key permite operaciones seguras del lado del servidor.

### ¿Por qué Tailwind CSS v4?
Tailwind CSS permite un desarrollo rápido de UI con un sistema de diseño consistente, sin necesidad de escribir CSS personalizado. La versión 4 introduce mejoras significativas en rendimiento y sintaxis.

### Perfil Unificado (Sin Roles)
El sistema adoptó un **modelo de perfil unificado**, eliminando la división rígida entre Cliente y Trabajador. Todos los usuarios autenticados pueden:
- Publicar trabajos y postularse a trabajos de otros.
- Publicar servicios y contratar servicios de otros.
- Gestionar postulaciones recibidas y enviadas desde un mismo panel.
- Participar en contrataciones como cliente o como trabajador según cada relación.

> Este cambio se documenta en detalle en [`CHANGELOG_PERFIL_UNIFICADO.md`](./CHANGELOG_PERFIL_UNIFICADO.md).

---

## 🔮 Alcance y Trabajo Futuro

### Funcionalidades Implementadas
- [x] Autenticación y registro con perfil unificado (sin roles)
- [x] Publicación y búsqueda de trabajos
- [x] Publicación y exploración de servicios
- [x] Sistema de postulaciones
- [x] Motor de contrataciones con máquina de estados
- [x] Gestión de contratos digitales
- [x] Perfiles de usuario editables
- [x] Panel de control unificado (sin distinción de roles)
- [x] Landing page profesional con marketing
- [x] Dashboard de contrataciones con tabs por estado
- [x] Protección de rutas con middleware
- [x] Diseño responsivo (Tailwind CSS)
- [x] Búsqueda geolocalizada por radio de distancia
- [x] Módulo de mensajería interna (tiempo real con WebSockets)
- [x] Sistema de calificaciones y reseñas


### Funcionalidades Planeadas / En Desarrollo

- [ ] Integración de pagos reales (Pasarela de pago)
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Subida de fotos y archivos a almacenamiento Supabase
- [ ] Panel de administración
- [ ] Estadísticas y reportes para técnicos
- [ ] Sistema de referidos
- [ ] Múltiples idiomas

---

## 📊 Especificaciones Técnicas

| Especificación | Detalle |
|---------------|---------|
| **Arquitectura** | Cliente-Servidor (Frontend-backend desacoplado) |
| **API Style** | RESTful |
| **API Prefix** | `/api/v1` |
| **Puerto Backend** | 4000 |
| **Puerto Frontend** | 3000 |
| **Autenticación** | JWT (Supabase Auth) |
| **Type Safety** | TypeScript estricto en frontend y backend |
| **CORS** | Habilitado globalmente |
| **Modalidad de trabajo** | SPA (Single Page Application) con CSR |
| **Estados UI** | Carga, error, vacío, éxito (en todas las vistas) |

---

## 📍 Geolocalización y Búsqueda Espacial

ChambaSegura utiliza **PostGIS** para ofrecer una experiencia de búsqueda basada en la ubicación del usuario.

### Características
- **Detección Automática**: El sistema solicita permiso para acceder a la ubicación del navegador mediante un hook personalizado `useGeolocation`.
- **Filtro de Radio**: Los usuarios pueden filtrar trabajos y servicios en un radio de 5km hasta 500km.
- **Cálculo de Distancia**: Cada tarjeta de trabajo o servicio muestra la distancia aproximada al usuario ("A 2.5 km de ti").
- **Privacidad**: Si el usuario deniega el permiso, el sistema sigue funcionando mediante búsquedas globales sin mostrar distancias.

### Implementación Técnica
- **Base de Datos**: Uso del tipo `geography(POINT, 4326)` con índices espaciales GIST.
- **Backend**: Funciones RPC de PostgreSQL (`buscar_trabajos_cercanos`, `buscar_servicios_cercanos`) para cálculos eficientes en el servidor mediante `ST_Distance` y `ST_DWithin`.
- **Frontend**: Hook de React para gestión de estado de geolocalización y formateo de distancias.

---

## 👨‍💻 Autores

Proyecto desarrollado como aplicación web full-stack para la conexión segura entre profesionales técnicos del hogar y clientes.
