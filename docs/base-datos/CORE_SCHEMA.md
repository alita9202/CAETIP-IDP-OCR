# Núcleo de Base de Datos (Core Schema)

La migración inicial `core_schema` establece el modelo relacional físico en 3FN para la plataforma CAETIP-IDP. 

## Tablas principales

1. **Identidad y Acceso:**
   - `rol`: Catálogo de roles del sistema.
   - `persona`: Datos personales de participantes o staff.
   - `usuario`: Credenciales y estado de acceso de una persona. Relacionado 1:1 con `auth.users` de Supabase.

2. **Oferta Académica:**
   - `universidad` y `programa`: Definición base de los programas.
   - `oferta_programa`: Una edición/gestión específica de un programa.
   - `asignacion_encargado`: Personal asignado a una oferta concreta.

3. **Inscripción y Expediente:**
   - `inscripcion`: Relación entre una persona y una oferta.
   - `expediente`: Seguimiento del proceso documental de una inscripción (relación 1:1).

4. **Documentos y Requisitos:**
   - `tipo_documento`: Catálogo de tipos aceptados (CI, Título, etc.).
   - `requisito_oferta`: Plantilla de documentos requeridos por una oferta.
   - `requisito_expediente`: Instanciación de un requisito para el expediente de un alumno.
   - `documento`: Contenedor lógico de un archivo perteneciente a una *persona* (no al expediente, para permitir reutilización).
   - `version_documento`: Archivo físico almacenado en Storage. Un documento puede tener múltiples versiones si fue rechazado y resubido.
   - `asignacion_documento_requisito`: Tabla asociativa que vincula una versión específica de un documento con un requisito del expediente.

## Decisiones de Diseño Clave

- **Documento pertenece a Persona:** Un participante puede subir su "Carnet de Identidad" y reutilizar ese mismo documento en distintas inscripciones futuras sin volver a subirlo.
- **Separación Documento / VersionDocumento:** Permite mantener un historial de archivos. Si un CI es rechazado, se sube una nueva versión, pero el contenedor lógico "CI de Juan" sigue siendo el mismo.
- **Asignación a Versión:** `asignacion_documento_requisito` apunta a `version_documento` (y no a `documento`) para garantizar trazabilidad estricta. Si la versión 1 fue la que se prevalidó, eso queda registrado históricamente.
- **RequisitoOferta vs RequisitoExpediente:** `requisito_oferta` es la plantilla estática. Cuando un alumno se inscribe, se copian a `requisito_expediente` para dar seguimiento individual al cumplimiento de cada documento.
