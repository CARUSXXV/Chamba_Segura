# Perfil Unificado — Eliminación del Rol `es_trabajador`

## Contexto

Se identificó una inconsistencia de UX reportada por el beta tester **Joan**: la plataforma obligaba a los usuarios a escoger entre **Cliente** o **Trabajador** desde el registro, creando fricción innecesaria. Un cliente no podía postularse a trabajos y un trabajador no podía publicar trabajos sin tener que crear otra cuenta.

**Solución**: Eliminar el concepto de rol rígido (`es_trabajador`) para que **todos los usuarios puedan hacer ambas cosas**: publicar trabajos, postularse a trabajos ajenos, y ofrecer/contratar servicios.

---

## Cambios Realizados

### Fase 1 — Implementación Inicial (backend + parcial frontend)

| Archivo | Cambio |
|---|---|
| `backend/src/auth/auth.service.ts` | `register()` ya no acepta ni envía `es_trabajador` a `user_metadata` ni a la tabla `perfiles` |
| `backend/src/auth/auth.controller.ts` | Body de `POST /auth/register` sin `es_trabajador` |
| `backend/src/postulaciones/postulaciones.controller.ts` | `findAll()` llama a `findByUser(userId)` sin leer `user_metadata.es_trabajador` |
| `backend/src/postulaciones/postulaciones.service.ts` | `findByUser()` ahora devuelve **ambas perspectivas** (postulaciones enviadas + recibidas) en un array combinado ordenado por fecha |
| `frontend/src/app/auth/register/page.tsx` | Eliminado checkbox "Registrarme como Trabajador" y envío de `es_trabajador` |
| `frontend/src/app/trabajos/page.tsx` | Eliminada lógica `isTrabajador`; ambos botones ("Ofrecer Servicio" y "Publicar Trabajo") visibles para todos |
| `frontend/src/api/postulaciones.ts` | Tipos de respuesta ajustados al nuevo formato del backend |
| `update_roles.sql` | Script SQL listo para eliminar la columna `es_trabajador` de la tabla `perfiles` en Supabase |

### Fase 2 — Correcciones Críticas (esta actualización)

#### Bug crítico corregido
| Archivo | Problema | Solución |
|---|---|---|
| `frontend/src/app/trabajos/[id]/page.tsx` | El botón "Postularme" solo se mostraba si `es_trabajador=true`. Los demás usuarios no veían **ningún** botón. | Ahora **cualquier usuario que no sea el dueño** del trabajo puede postularse. |
| `frontend/src/app/trabajos/nuevo/page.tsx` | Los usuarios con `es_trabajador=true` eran redirigidos/bloqueados y no podían publicar trabajos. | Todos los usuarios autenticados pueden publicar trabajos. |

#### Dashboard y navegación unificados
| Archivo | Cambio |
|---|---|
| `frontend/src/app/components/AppDashboard.tsx` | Eliminada toda lógica condicional de `esTrabajador`. Los links del dashboard, las estadísticas, el saludo y la actividad reciente ahora son **uniformas para todos**. Se reemplazó el badge "Trabajador"/"Cliente" por "Miembro". |
| `frontend/src/app/dashboard/contrataciones/page.tsx` | Eliminado `isTrabajador` global. Ahora cada ítem (postulación o contratación) determina dinámicamente la relación del usuario con ese elemento específico (`trabajador_id`, `cliente_id`, `servicio.trabajador_id`). Esto permite que un usuario vea y gestione **ambas perspectivas** simultáneamente. |
| `frontend/src/app/servicios/page.tsx` | Eliminado condicional `esTrabajador`. Todos los usuarios ven el botón "Publicar Servicio" y el texto descriptivo unificado. |
| `frontend/src/app/perfil/page.tsx` | Eliminado badge "Trabajador"/"Cliente". |

#### Tipos y backend
| Archivo | Cambio |
|---|---|
| `frontend/src/api/profile.ts` | Eliminado `es_trabajador: boolean` del interface `Profile` |
| `backend/src/profiles/profiles.service.ts` | Eliminada lectura de `es_trabajador` desde `user_metadata` al construir perfil desde Auth |
| `backend/src/supabase/database.types.ts` | Eliminado `es_trabajador?: boolean` del interface `ProfilesRow` |

---

## Por qué ahora funciona correctamente

1. **Registro sin fricción**: el usuario crea una cuenta sin elegir rol. No hay barrera de entrada.
2. **Publicar trabajos**: cualquier usuario puede publicar un trabajo. No hay restricción por "ser trabajador".
3. **Postularse a trabajos**: cualquier usuario (excepto el dueño del trabajo) puede postularse.
4. **Ofrecer servicios**: cualquier usuario puede publicar y ofrecer servicios.
5. **Dashboard unificado**: en "Mis Contrataciones", el usuario ve **todas** sus postulaciones enviadas **y** las recibidas en sus propios trabajos, con acciones determinadas por su relación con cada elemento.
6. **Sin código muerto**: no quedan referencias a `es_trabajador` en el código fuente.

---

## Acción manual requerida

Ejecutar el script `update_roles.sql` en el panel de Supabase para eliminar la columna `es_trabajador` de la tabla `perfiles`:

```sql
ALTER TABLE public.perfiles DROP COLUMN IF EXISTS es_trabajador;
```

> Este paso es opcional para el funcionamiento (el código ya no la lee ni escribe), pero recomendado para mantener la base de datos limpia.

---

## Verificación

1. ✅ Registrar nuevo usuario — no hay checkbox de rol
2. ✅ Publicar un trabajo — funciona sin restricción de rol
3. ✅ Postularse al trabajo de otro — botón visible para cualquier no-dueño
4. ✅ Dueño del trabajo ve postulaciones recibidas y puede aceptar/rechazar
5. ✅ Postulante ve sus postulaciones enviadas y espera respuesta
6. ✅ Dashboard muestra ambas perspectivas: trabajos y servicios
7. ✅ Perfil ya no muestra badge "Trabajador"/"Cliente"
8. ✅ Cero referencias a `es_trabajador` en el código

---

## Commit histórico

```
07d200d fix: usar NEXT_PUBLIC_API_URL en registro en vez de localhost hardcodeado
```

(Los cambios del perfil unificado están en working tree — pendientes de commit)
