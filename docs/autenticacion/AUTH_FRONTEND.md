# Autenticación Frontend

## Flujo de Inicio de Sesión

1. El usuario accede a `/login`.
2. Ingresa correo y contraseña.
3. Se ejecuta `supabase.auth.signInWithPassword()`.
4. Si las credenciales son válidas, se consulta `public.usuario` + `public.rol` para obtener el perfil y el código del rol.
5. Se verifica que `usuario.estado = 'ACTIVO'`. Si es `PENDIENTE`, `INACTIVO` o `BLOQUEADO`, se muestra un mensaje y se cierra la sesión.
6. Según el rol, se redirige automáticamente:
   - `PARTICIPANTE` → `/participante`
   - `ENCARGADO` → `/encargado`
   - `SECRETARIA` → `/admin`
   - `ADMINISTRADOR` → `/admin`

## Resolución del Rol

La fuente de verdad del rol es **siempre** `public.usuario → public.rol.codigo`, protegida por RLS. Nunca se lee desde `raw_user_meta_data` ni desde `localStorage`.

La consulta se realiza en el `AuthContext`:

```
usuario.select('id_usuario, id_persona, estado, rol:rol(codigo)')
.eq('id_usuario', auth.uid())
```

## Protección de Rutas

Se implementan tres componentes guard en `src/routes/guards.tsx`:

- **`RequireAuth`**: Verifica sesión activa, perfil cargado y estado `ACTIVO`. Redirige a `/login` si no hay sesión.
- **`RequireRole`**: Verifica que el rol del usuario esté en la lista de roles permitidos. Redirige al home del rol si no coincide.
- **`RedirectIfAuthenticated`**: Si el usuario ya está autenticado y activo, lo redirige desde `/login` a su área correspondiente.

## Estados de Usuario

| Estado     | Comportamiento                                             |
|------------|------------------------------------------------------------|
| ACTIVO     | Acceso normal                                              |
| PENDIENTE  | Se muestra mensaje y se cierra la sesión                   |
| INACTIVO   | Se muestra mensaje y se cierra la sesión                   |
| BLOQUEADO  | Se muestra mensaje y se cierra la sesión                   |

## Logout

El botón "Cerrar sesión" de la barra lateral ejecuta `supabase.auth.signOut()` a través del contexto `AuthContext`, limpia el estado global y redirige a `/login`.

## Recuperación de Contraseña

El flujo básico está implementado en el login:
1. El usuario hace clic en "Recuperar contraseña".
2. Ingresa su correo.
3. Se ejecuta `supabase.auth.resetPasswordForEmail()`.
4. Se muestra un mensaje neutro sin revelar si el correo existe.

## Secretaría

Dado que no existe un layout diferenciado para Secretaría, el rol `SECRETARIA` reutiliza el layout y rutas de `/admin`. Las restricciones de negocio se manejan desde RLS en la base de datos.

## Flujo Futuro de Invitaciones

El registro público está deshabilitado. El proceso previsto para crear usuarios es:
1. Un administrador registra la persona en el sistema.
2. Se envía una invitación por correo (`inviteUserByEmail`) desde un contexto administrativo seguro (backend o función Edge, nunca desde el frontend).
3. El participante recibe el enlace, establece su contraseña y accede al sistema.

## Cómo Crear el Primer Usuario Administrador de Prueba

1. Ir al Dashboard de Supabase → **Authentication** → **Users** → **Add User**.
2. Crear un usuario con correo y contraseña (ej: `admin@caetip.test` / contraseña segura).
3. Anotar el UUID generado (`auth.users.id`).
4. Ir a **SQL Editor** y ejecutar:

```sql
-- 1. Crear persona
INSERT INTO persona (ci, nombres, apellidos, correo)
VALUES ('0000001', 'Admin', 'CAETIP', 'admin@caetip.test')
RETURNING id_persona;

-- 2. Crear usuario (reemplazar UUIDs reales)
INSERT INTO usuario (id_usuario, id_persona, id_rol, estado)
VALUES (
  '<UUID-de-auth.users>',
  '<UUID-de-persona>',
  (SELECT id_rol FROM rol WHERE codigo = 'ADMINISTRADOR'),
  'ACTIVO'
);
```

5. Probar el login en la aplicación.
