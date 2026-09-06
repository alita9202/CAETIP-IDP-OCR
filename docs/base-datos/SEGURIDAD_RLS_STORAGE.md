# Seguridad, RLS y Almacenamiento

Esta nota técnica detalla la estrategia de seguridad de acceso a datos implementada en la plataforma CAETIP-IDP.

## 1. Estrategia RLS y Funciones de Autorización

La base de datos restringe cada lectura o modificación a nivel de fila (`Row Level Security`), garantizando que un usuario autenticado (`auth.uid()`) solo pueda acceder a los datos que le corresponden. 

Para lograr esto sin duplicar lógica en cada política, se utilizan **funciones PostgreSQL auxiliares (Helpers)**:
- `current_persona_id()`: Extrae el ID de persona del usuario actual a través de la tabla `usuario`.
- `current_role_code()`: Extrae el código del rol (PARTICIPANTE, ENCARGADO, etc.).
- Funciones booleanas como `is_participante()`, `is_encargado()`, `is_admin()`, y `is_secretaria()`.
- `encargado_gestiona_oferta(id)` y `usuario_gestiona_persona(id)`: Previenen cruce de datos, asegurando que un Encargado solo vea y actúe sobre los aspirantes e inscripciones de las ofertas académicas que supervisa.

## 2. Privilegios (GRANTS)

Para mantener la seguridad perimetral, el rol `anon` de PostgreSQL no tiene ningún tipo de acceso (revocados todos los privilegios). 
El rol `authenticated` recibe únicamente permisos `SELECT`, `INSERT`, `UPDATE` y `DELETE` explícitos sobre las tablas de negocio requeridas y permisos limitados a `SELECT` en las tablas de catálogos paramétricos (roles, motivos, etc.). 

## 3. Storage: Bucket y Convenciones

Todo documento personal se almacena en el bucket privado de Supabase **`documentos-participantes`** (tamaño máximo: 20MB, solo PDF y formatos de imagen estándar). No hay buckets públicos.

### Rutas (Key convention)
Las llaves en Storage siguen el patrón estricto:
`{id_persona}/{id_documento}/{id_version_documento}/{nombre_archivo}`

*Razón:* Esto impide que la identidad (como nombres, apellidos o CI) quede expuesta en las URL o metadatos técnicos. 

### Políticas de Storage
- **Participantes:** Solo pueden consultar o subir archivos donde el primer segmento de la ruta en Storage coincida exactamente con su `current_persona_id()`. 
- **Encargados:** Pueden consultar o subir archivos bajo la carpeta de una persona siempre y cuando gestionen al aspirante según `usuario_gestiona_persona(id_persona)`.

## 4. Registro y Autenticación (Invitaciones)

El flujo del sistema se orienta a **Cuentas por Invitación (Invite-only)**:
1. CAETIP aprueba la participación.
2. El personal inscribe a la persona.
3. El sistema envía una invitación al correo electrónico para crear la identidad en `auth.users`.

*Nota:* Dado que el registro libre no está requerido funcionalmente en CAETIP, el **Sign-up Público ("Allow new users to sign up") debe deshabilitarse** en las opciones de "Auth Settings" de Supabase a nivel de Dashboard de manera manual, para evitar falsificación de cuentas.
