# CAETIP — CONTEXTO MAESTRO DEL PROYECTO Y PRIMERA EJECUCIÓN EN ANTIGRAVITY

## 0. Propósito de este documento

Este archivo es la fuente técnica principal para construir el nuevo sistema de CAETIP. Debe leerse antes de realizar cambios importantes en el proyecto.

No se debe depender de decisiones antiguas de otros repositorios. El sistema se construirá desde cero en un repositorio nuevo, con una nueva estructura de proyecto y una nueva base de datos. El proyecto anterior solo puede utilizarse como referencia visual o funcional si resulta útil.

**Regla para trabajos futuros en Antigravity:** antes de modificar arquitectura, estructura de carpetas, base de datos, permisos, navegación o reglas de negocio, revisar este documento y no contradecirlo sin aprobación explícita.

---

# 1. Título del proyecto

**PLATAFORMA WEB SOPORTADA POR PROCESAMIENTO INTELIGENTE DE DOCUMENTOS (IDP) PARA LA AUTOMATIZACIÓN, PREVALIDACIÓN Y MONITOREO EN TIEMPO REAL DEL PROCESO DE INSCRIPCIÓN EN CAETIP S.R.L.**

---

# 2. Objetivo práctico del sistema

La plataforma debe centralizar el proceso de inscripción de participantes de CAETIP, permitir un modelo híbrido de carga de documentos, procesar automáticamente la documentación mediante IDP, detectar inconsistencias, derivar casos dudosos a revisión humana y permitir que el participante consulte su propio avance.

La plataforma **NO certifica legalmente la autenticidad** de un CI, título o diploma. Realiza **prevalidación documental interna**.

---

# 3. Principios no negociables

1. Construir desde cero en un repositorio nuevo.
2. Crear un nuevo proyecto de Supabase cuando corresponda.
3. Crear una nueva base de datos, sin reutilizar el esquema anterior.
4. El sistema debe ser modular y mantenible.
5. No crear un monolito de archivos gigantes.
6. No crear microservicios innecesarios.
7. Arquitectura: **aplicación web modular + servicio IDP desacoplado**.
8. La base de datos relacional debe llegar como mínimo a **Tercera Forma Normal (3FN)** y su evolución debe documentarse.
9. Las modificaciones de la base de datos se realizarán mediante migraciones versionadas.
10. La seguridad se diseña desde el inicio: Auth, RLS, Storage privado y trazabilidad.
11. No agregar librerías, servicios o abstracciones sin necesidad concreta.
12. La interfaz visible para usuarios estará en español.
13. No exponer terminología técnica del IDP al participante.
14. Conservar el historial necesario, pero no generar archivos duplicados o basura.
15. Un documento reemplazado conserva historial lógico y metadatos; no deben generarse copias innecesarias fuera del mecanismo de versionado documental.
16. El IDP puede prevalidar o derivar a revisión, pero **nunca rechaza automáticamente una inscripción**.
17. El IDP no sobrescribe silenciosamente datos maestros del participante.
18. Antigravity implementa decisiones ya definidas; no debe rediseñar por cuenta propia el negocio, la arquitectura o los permisos.

---

# 4. Arquitectura objetivo

Arquitectura web modular por dominios con servicio IDP separado.

```text
Participante / Personal CAETIP
             |
             v
      Aplicación Web
 React + TypeScript + Vite
             |
      +------+------+
      |             |
      v             v
   Supabase      Servicio IDP
 PostgreSQL      Python + FastAPI
 Auth            OpenCV
 Storage         PaddleOCR
 Realtime        Clasificación
 RLS             Extracción
                 Normalización
                 Comparación
                 Prevalidación
```

No implementar por ahora arquitecturas complejas como Kubernetes, Kafka, RabbitMQ, Redis o múltiples microservicios.

---

# 5. Estructura recomendada del repositorio

```text
caetip-idp/
|
|-- web/
|   |-- src/
|   |   |-- modules/
|   |   |-- components/
|   |   |-- layouts/
|   |   |-- routes/
|   |   |-- hooks/
|   |   |-- schemas/
|   |   |-- types/
|   |   |-- utils/
|   |   `-- mocks/
|   `-- ...
|
|-- idp-service/
|   |-- app/
|   |   |-- api/
|   |   |-- preprocessing/
|   |   |-- ocr/
|   |   |-- classification/
|   |   |-- extraction/
|   |   |-- normalization/
|   |   |-- validation/
|   |   `-- tests/
|   `-- README.md
|
|-- supabase/
|   |-- migrations/
|   |-- seed/
|   `-- config/
|
|-- docs/
|   |-- arquitectura/
|   |-- base-datos/
|   |-- diagramas/
|   |-- pruebas/
|   |-- decisiones/
|   |-- ui/
|   `-- evidencias/
|
|-- .gitignore
|-- README.md
`-- docs/PROJECT_MASTER.md
```

No es obligatorio que todas las carpetas tengan contenido desde el primer día. No crear archivos vacíos solo para “llenar” la estructura.

---

# 6. Estrategia de desarrollo

Metodología de trabajo: **iterativa e incremental**.

Cada incremento debe seguir:

```text
Análisis
  -> Diseño
  -> Implementación
  -> Pruebas
  -> Revisión
  -> Documentación
```

Un módulo no se considera terminado solo porque la pantalla funcione. Debe incluir, según corresponda:

- implementación;
- validaciones;
- modelo de datos;
- permisos/RLS;
- manejo de errores;
- pruebas;
- evidencia;
- documentación actualizada.

---

# 7. Herramientas base

## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Hook Form cuando existan formularios
- Zod para validación
- Lucide React para iconos
- React Router para navegación
- TanStack Query únicamente cuando se implemente la capa real de datos

## Backend/BaaS
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- Row Level Security

## IDP
- Python
- FastAPI
- OpenCV
- PaddleOCR
- Tesseract solo como comparación/baseline
- RapidFuzz
- scikit-learn solo si las pruebas demuestran que es necesario

No usar Transformers, LLM, spaCy u otras herramientas solo para aumentar complejidad.

---

# 8. Estrategia de base de datos

La base de datos se diseñará desde cero.

Orden obligatorio:

1. Modelo conceptual.
2. Modelo lógico.
3. Revisión de dependencias.
4. 1FN.
5. 2FN.
6. 3FN.
7. Modelo físico PostgreSQL.
8. Migraciones.
9. RLS.
10. Pruebas de integridad.

No usar JSON para evitar diseñar relaciones correctamente. JSON puede utilizarse para resultados técnicos variables del IDP, metadatos o respuesta OCR cruda cuando esté justificado.

No repetir datos derivados.

Ejemplo incorrecto:

```text
inscripcion:
persona_id
nombre_persona
ci_persona
programa_id
nombre_programa
```

La inscripción debe referenciar Persona y Oferta/Edición del programa mediante relaciones.

Conceptos ya identificados que deberán estudiarse en el modelo:

- Persona
- Usuario
- Rol
- Programa
- Oferta/Edición de programa
- Universidad
- Inscripción
- Expediente
- Requisito
- Documento
- Versión documental
- Tipo documental
- Procesamiento IDP
- Extracción
- Resultado de comparación
- Prevalidación
- Observación
- Revisión
- Carrera
- Área profesional
- Carrera-Área
- Regla de afinidad
- Auditoría

**No crear todavía un esquema físico definitivo sin documentar primero la normalización.**

---

# 9. Flujo funcional general

```text
Persona solicita información
        |
        v
Confirma participación
        |
        v
CAETIP realiza pre-registro
        |
        v
Persona + Inscripción
        |
        v
Se habilita acceso
        |
        +-----------------------+
        |                       |
        v                       v
Participante sube          CAETIP recibe por
documentos                 WhatsApp y los carga
        |                       |
        +-----------+-----------+
                    |
                    v
             Mismo expediente
                    |
                    v
                  IDP
                    |
                    v
              Prevalidación
                    |
          +---------+----------+
          |                    |
          v                    v
   Prevalidado          Revisión humana
                              |
                 Encargado -> Secretaría
                              |
                       Admin/Director
                    |
                    v
       Expediente prevalidado
                    |
                    v
       Inscripción lista para continuar
```

---

# 10. Actores

## Participante
Puede:
- iniciar sesión;
- consultar sus propias inscripciones;
- consultar su propio expediente;
- cargar documentos;
- reemplazar documentos observados;
- asociar documentos existentes a requisitos de una inscripción;
- consultar observaciones;
- consultar su avance;
- modificar únicamente datos permitidos de su perfil.

No puede:
- ver participantes ajenos;
- aprobar documentos;
- modificar reglas;
- cambiar niveles de confianza;
- ver detalles técnicos internos del OCR;
- modificar estados manualmente.

## Encargado
Puede:
- registrar personas;
- crear inscripciones;
- cargar documentos por un participante;
- gestionar participantes de los programas que tiene asignados;
- consultar expedientes;
- realizar primera revisión;
- aceptar manualmente;
- observar;
- solicitar reemplazo;
- escalar casos.

## Secretaría
Puede:
- consultar casos escalados;
- revisar;
- resolver;
- observar;
- solicitar reemplazo;
- devolver o escalar.

## Administrador/Director
Puede:
- administrar usuarios;
- crear programas;
- crear ofertas/versiones;
- asignar encargados;
- definir requisitos;
- gestionar carreras y áreas;
- definir afinidad académica;
- resolver excepciones.

## Servicio IDP
Procesa documentos automáticamente. No toma decisiones institucionales finales.

---

# 11. Persona, inscripción, expediente y documento

Mantener siempre estas diferencias:

- **Persona:** individuo único.
- **Usuario:** acceso al sistema; no es igual a Persona.
- **Inscripción:** relación Persona + Oferta/Edición de programa.
- **Expediente:** conjunto de requisitos documentales de una inscripción.
- **Documento:** archivo personal que puede ser reutilizado cuando sea válido.
- **Asignación de documento a requisito:** relación entre un documento existente y un requisito concreto de una inscripción.
- **Procesamiento IDP:** análisis automático de una versión de documento.

Una misma persona puede tener múltiples inscripciones.

---

# 12. Repositorio personal de documentos

Este punto es obligatorio.

Los documentos personales no deben duplicarse innecesariamente por cada inscripción.

El participante tendrá un área **Documentos** que funciona como repositorio personal.

Ejemplos:
- Carnet de Identidad.
- Título Profesional.
- Hoja de Vida.
- Ficha de Inscripción Diplomado en Psicopedagogía.
- Ficha de Inscripción Diplomado X.

Un CI o título que siga siendo válido puede reutilizarse en varias inscripciones.

Una ficha de inscripción puede ser específica de un programa; el participante puede subir varias fichas con títulos diferenciados.

La reutilización se realizará **asociando un documento existente al requisito de una inscripción**, no creando otra copia del archivo.

Si un documento se reemplaza:
- conservar historial;
- marcar la versión anterior como reemplazada/no vigente;
- no generar copias adicionales fuera del versionado necesario.

---

# 13. Estados aprobados

## Inscripción
- PRE_REGISTRADA
- MATRICULA_PENDIENTE
- ACTIVA
- LISTA_PARA_CONTINUAR
- RECHAZADA
- CANCELADA
- RETIRADA

No existe “FINALIZADA”.

La inscripción solo puede ser rechazada manualmente.

## Expediente
- DOCUMENTACION_PENDIENTE
- EN_PROCESAMIENTO_DOCUMENTAL
- EN_REVISION_DOCUMENTAL
- EXPEDIENTE_OBSERVADO
- EXPEDIENTE_PREVALIDADO

## Documento
- DOCUMENTO_PENDIENTE
- DOCUMENTO_RECIBIDO
- DOCUMENTO_EN_PROCESAMIENTO
- DOCUMENTO_PREVALIDADO
- REQUIERE_REVISION_HUMANA
- ACEPTADO_MANUALMENTE
- DOCUMENTO_OBSERVADO
- REQUIERE_REEMPLAZO
- ERROR_DE_PROCESAMIENTO
- REEMPLAZADO

## Procesamiento IDP
- PROCESAMIENTO_PENDIENTE
- EN_COLA_DE_PROCESAMIENTO
- PROCESANDO_DOCUMENTO
- REVISION_AUTOMATICA_COMPLETADA
- PROCESAMIENTO_FALLIDO
- REINTENTO_PENDIENTE

---

# 14. Mensajes visibles al participante

No mostrar nombres técnicos internos del pipeline.

Usar mensajes como:
- Preparando Carnet de Identidad.
- Verificando datos del Carnet de Identidad.
- Comparando información del Título Profesional.
- Evaluando requisitos del Título Profesional.
- Revisión automática completada.
- Requiere revisión de CAETIP.
- Se necesita una nueva versión.

Siempre indicar qué documento se está procesando.

---

# 15. Documentos principales y campos relevantes

## Carnet de Identidad
Críticos:
- número de CI;
- nombres;
- apellidos;
- fecha de nacimiento.

No llenar la BD con campos del CI que no se utilizarán en la prevalidación.

## Título/Diploma
Críticos:
- nombre del titular;
- carrera/profesión.

Relevantes:
- universidad/institución;
- grado/tipo;
- fecha cuando exista;
- CI cuando aparezca.

No validar firmas, sellos, QR o autenticidad legal.

## Ficha de inscripción
Críticos:
- nombres;
- apellidos;
- CI;
- fecha de nacimiento;
- programa;
- carrera.

Relevantes:
- código de programa;
- universidad/instituto de procedencia;
- grado académico;
- correo;
- teléfono/WhatsApp;
- dirección;
- ciudad.

Informativos:
- estado civil;
- institución laboral;
- cargo;
- año laboral.

Las casillas “documentos presentados” de una ficha no determinan la completitud real del expediente.

## Hoja de Vida
Extraer:
- nombre;
- CI;
- fecha de nacimiento;
- correo;
- teléfono;
- títulos/diploma;
- nacionalidad como informativa.

Comprobar presencia de secciones cuando CAETIP las declare obligatorias:
- foto;
- habilidades;
- idiomas;
- cursos/talleres;
- experiencia;
- referencias;
- reconocimientos;
- publicaciones.

No intentar estructurar todo el contenido del CV si no se utiliza.

---

# 16. Referencias prioritarias para comparación

- CI / identidad: Carnet de Identidad.
- Nombre y apellidos: Carnet de Identidad como referencia documental prioritaria.
- Fecha de nacimiento: Carnet de Identidad.
- Carrera/profesión: Título/Diploma.
- Universidad/grado: Título/Diploma.
- Programa seleccionado: Inscripción registrada en el sistema.
- Código de programa: Oferta configurada.
- Afinidad: reglas configuradas por CAETIP.
- Correo/teléfono/dirección: perfil actual confirmado.

No decidir por “mayoría de documentos”.

---

# 17. Resultados de comparación

- COINCIDE
- COINCIDE_TRAS_NORMALIZACION
- DIFERENCIA_MENOR
- NO_COINCIDE
- NO_DISPONIBLE
- NO_EVALUABLE

Una discrepancia crítica impide la prevalidación automática.

---

# 18. Confianza

Tipos:
- identificación documental;
- lectura/extracción;
- coincidencia;
- cumplimiento de regla;
- resultado global.

Niveles:
- ALTA
- MEDIA
- BAJA
- NO_EVALUABLE

Acciones generales:
- ALTA -> puede prevalidarse si no existen inconsistencias críticas.
- MEDIA -> revisión humana.
- BAJA -> revisión o reemplazo.
- NO_EVALUABLE -> normalmente reemplazo o revisión excepcional.

No fijar porcentajes arbitrarios todavía. Se calibrarán con documentos reales.

---

# 19. Afinidad académica

No utilizar porcentajes de afinidad.

La afinidad se basa en conocimiento institucional configurable.

Conceptos:
- catálogo de carreras;
- nombre canónico;
- variantes/alias;
- áreas profesionales;
- una carrera puede pertenecer a varias áreas;
- reglas específicas por oferta/edición del programa.

Resultados:
- AFINIDAD_DIRECTA
- AFINIDAD_POR_AREA
- AFINIDAD_RELACIONADA
- AFINIDAD_NO_DETERMINADA
- POSIBLE_NO_CUMPLIMIENTO
- NO_CUMPLE_AFINIDAD (solo decisión humana)

Prioridad:
1. regla específica Carrera <-> Oferta;
2. regla Área <-> Oferta;
3. sin regla -> revisión.

Una carrera explícitamente no apta genera revisión; nunca rechazo automático.

Si una persona presenta varios títulos elegibles, basta que al menos uno cumpla la afinidad exigida, salvo regla institucional diferente.

---

# 20. Reglas principales de prevalidación

Un documento puede llegar a DOCUMENTO_PREVALIDADO solo si:
- corresponde al tipo esperado;
- es procesable;
- se obtienen campos críticos;
- los campos críticos coinciden;
- se cumplen las reglas aplicables;
- existe confianza suficiente;
- no existen inconsistencias críticas.

Si no:
- REQUIERE_REVISION_HUMANA;
- REQUIERE_REEMPLAZO;
- o ERROR_DE_PROCESAMIENTO, según el caso.

Un expediente llega a EXPEDIENTE_PREVALIDADO cuando todos los requisitos obligatorios se encuentran:
- DOCUMENTO_PREVALIDADO, o
- ACEPTADO_MANUALMENTE,

y no existen observaciones, reemplazos o revisiones pendientes.

Una inscripción llega a LISTA_PARA_CONTINUAR cuando:
- el expediente está prevalidado;
- la matrícula está confirmada;
- se cumplen las condiciones administrativas requeridas.

---

# 21. Motivos estructurados aprobados

Generales:
- ARCHIVO_ILEGIBLE
- ARCHIVO_INCOMPLETO
- TIPO_DOCUMENTO_INCORRECTO
- FORMATO_NO_RECONOCIDO
- BAJA_CONFIANZA_DE_LECTURA
- CAMPO_OBLIGATORIO_NO_DETECTADO

Identidad:
- NOMBRE_NO_COINCIDE
- CI_NO_COINCIDE
- FECHA_NACIMIENTO_NO_COINCIDE

Académicos:
- CARRERA_NO_CATALOGADA
- AFINIDAD_ACADEMICA_INCIERTA
- POSIBLE_INCOMPATIBILIDAD_ACADEMICA
- INFORMACION_ACADEMICA_NO_COINCIDE

Ficha/CV:
- FICHA_NO_CORRESPONDE_AL_PROGRAMA
- FICHA_INCOMPLETA
- FORMATO_HOJA_VIDA_INCORRECTO
- SECCIONES_REQUERIDAS_INCOMPLETAS

Técnicos:
- ARCHIVO_CORRUPTO
- TIPO_ARCHIVO_NO_ADMITIDO
- ERROR_INTERNO_IDP

No incluir UNIVERSIDAD_NO_IDENTIFICADA como motivo.

Cada motivo puede llevar un detalle textual adicional.

---

# 22. Reglas visuales generales

La UI debe conservar la esencia espacial de los bocetos entregados.

No hacer un dashboard genérico recargado.

## Barra lateral
- fondo negro;
- iconos blancos;
- angosta;
- logo CAETIP arriba con placeholder reemplazable;
- cerrar sesión abajo;
- opción activa claramente resaltada;
- el resaltado puede resolverse con fondo gris/blanco sutil y/o indicador lateral, buscando buena legibilidad;
- no ocupar ancho innecesario.

## Contenido
- espacios amplios;
- pocos bloques;
- tablas/listas como contenido principal;
- panel derecho de previsualización cuando corresponda;
- no agregar footer;
- no agregar encabezados gigantes;
- no agregar configuraciones arriba;
- evitar tarjetas innecesarias;
- usar iconos cuando ayuden (lupa, +, documento, usuario, etc.);
- interfaz visible completamente en español.

## Formularios
Preferir:
- modal amplio;
- drawer/panel lateral;
- formulario integrado;

en lugar de abrir una página visualmente ajena al módulo.

## Historial
Conservar historial lógico y trazabilidad, pero no duplicar archivos sin necesidad.

## Previsualización
Mostrar resúmenes, no pantallas saturadas con metadatos técnicos.

---

# 23. Login

Inspirarse en la referencia visual entregada, sin copiarla literalmente.

Debe ser:
- sencillo;
- moderno;
- sobrio;
- en español;
- con negro como color principal;
- tarjeta clara de acceso;
- campos Correo y Contraseña;
- botón Iniciar sesión;
- enlace Recuperar contraseña;
- opcional “Recordarme” solo si se implementa correctamente;
- espacio de imagen/fondo institucional;
- no incluir registro público libre de usuarios.

Los participantes obtienen acceso después de ser pre-registrados por CAETIP.

---

# 24. Navegación por rol

## Participante
- Inicio
- Inscripciones
- Documentos
- Mi perfil
- Cerrar sesión

## Encargado
- Inicio
- Expedientes
- Inscripciones
- Mi perfil
- Cerrar sesión

## Secretaría
Puede reutilizar layout del encargado con permisos adicionales en revisiones.

## Administrador
- Inicio
- Expedientes
- Inscripciones
- Usuarios
- Programas
- Mi perfil
- Cerrar sesión

No agregar opciones no aprobadas por simple estética.

---

# 25. Pantalla Participante — Documentos

Objetivo: repositorio personal reutilizable.

Distribución:
- barra lateral negra;
- gran bloque principal de documentos;
- botón + Subir documento;
- buscador si aporta valor;
- estado por documento;
- panel derecho de previsualización resumida.

Columnas sugeridas:
- Documento
- Tipo
- Última actualización
- Estado
- Acción

Ejemplos de nombres visibles:
- Carnet de Identidad
- Título Profesional
- Hoja de Vida
- Ficha de Inscripción — Psicopedagogía
- Ficha de Inscripción — Diplomado X

Acciones:
- Ver
- Reemplazar cuando corresponda
- Consultar observación

No mostrar botón de eliminación definitiva como acción principal.

Formulario “Subir documento”:
- Título o nombre del documento
- Tipo de documento
- Archivo
- nota opcional
- botón Subir

Tipos centrales:
- Carnet de Identidad
- Título/Diploma
- Hoja de Vida
- Ficha de Inscripción

No asociar obligatoriamente el archivo a un programa en esta pantalla.

Panel derecho:
- nombre del documento;
- tipo;
- estado;
- fecha;
- resumen de datos extraídos si existe;
- previsualización/miniatura cuando corresponda;
- observación breve si existe.

---

# 26. Pantalla Participante — Inscripciones

Objetivo: ver cada inscripción y asociar documentos existentes a sus requisitos.

Parte superior:
- pestañas con los programas/ofertas en los que el participante está inscrito;
- solo mostrar inscripciones reales;
- si hay varias ediciones de un mismo programa, mostrar nombre y versión de forma comprensible.

Contenido principal:
- nombre del programa;
- versión/gestión;
- estado de inscripción;
- lista de requisitos.

Columnas sugeridas:
- Requisito
- Documento asociado
- Estado del documento
- Estado del requisito
- Acción

Acción:
- Seleccionar documento existente compatible.
- Asociarlo al requisito.
- Cambiar asociación solo cuando las reglas lo permitan.

Ejemplo:
Requisito: Carnet de Identidad
Documento disponible: Carnet de Identidad (prevalidado)

Requisito: Ficha de Inscripción
Documentos disponibles:
- Ficha Psicopedagogía 2026
- Ficha Diplomado IA 2026

El usuario elige el adecuado.

Panel derecho:
- resumen del requisito/documento seleccionado;
- estado;
- observación;
- información relevante del programa.

No duplicar el archivo al asociarlo a una inscripción.

---

# 27. Pantalla Encargado — Inscripciones

Objetivo: pre-registrar participantes y asociarlos a una oferta/programa.

Distribución:
- misma barra lateral;
- gran tabla/listado;
- buscador;
- botón + Inscribir participante;
- panel derecho con previsualización resumida.

Columnas sugeridas:
- Nombre completo
- CI
- Correo
- Teléfono/WhatsApp
- Programa
- Versión/gestión
- Matrícula
- Estado de inscripción

Formulario “Inscribir participante”:
1. buscar primero por CI;
2. si Persona existe, reutilizarla;
3. si no existe, registrar:
   - nombres;
   - apellidos;
   - CI;
   - correo;
   - teléfono/WhatsApp;
4. seleccionar:
   - programa;
   - oferta/versión/gestión;
   - estado de matrícula (pendiente/confirmada);
5. crear inscripción.

En la fase visual inicial esto puede funcionar solo con datos mock.

Panel derecho:
- persona;
- CI;
- correo;
- teléfono;
- programa;
- versión;
- matrícula;
- estado.

---

# 28. Pantalla Encargado — Expedientes

Objetivo: monitorear programas asignados.

Parte superior:
- pestañas/programas asignados al encargado;
- al seleccionar un programa, permitir escoger entre sus ediciones/versiones disponibles;
- la selección de versión debe ser clara y compacta, mediante menú desplegable o control equivalente, sin crear un bloque enorme.

Tabla principal sugerida:
- Participante
- CI
- CI
- Título/Diploma
- Hoja de Vida
- Ficha
- Estado del expediente
- Acción

Los estados deben verse como chips discretos.

Acción:
- Ver expediente.

Panel derecho superior:
- buscador;
- previsualización del participante seleccionado:
  - nombre;
  - CI;
  - correo/teléfono;
  - estado de inscripción;
  - estado de expediente.

Panel derecho inferior:
- información del programa:
  - programa;
  - universidad;
  - versión/gestión;
  - fechas;
  - fecha límite documental;
  - requisitos principales;
  - estado.

No añadir paneles adicionales sin necesidad.

---

# 29. Pantalla Administrador — Programas

Es una de las vistas principales.

Distribución:
- barra lateral negra;
- título Programas;
- gran listado central;
- buscador;
- botón + Crear programa;
- panel derecho de previsualización.

Columnas sugeridas:
- Programa
- Universidad
- Versión/gestión
- Fecha de inicio
- Fecha de cierre
- Requisitos
- Encargado
- Estado

Formulario Crear/Editar Programa, preferiblemente modal o panel lateral:

## Datos generales
- Nombre del programa
- Universidad/institución que respalda
- Código del programa
- Versión/edición/gestión
- Modalidad, si CAETIP la utiliza
- Fecha de inicio
- Fecha de finalización
- Fecha límite de inscripción
- Fecha límite de documentación
- Estado (activo/inactivo)
- descripción/información breve

## Responsable
- Encargado asignado

## Requisitos documentales
Permitir seleccionar:
- Carnet de Identidad
- Título/Diploma
- Hoja de Vida
- Ficha de Inscripción
- otros requisitos no IDP si CAETIP los necesita

Distinguir:
- obligatorio;
- opcional;
- forma de recepción si aplica.

## Afinidad académica
La interfaz podrá reservar una sección para:
- carreras aptas;
- áreas aptas;
- carreras relacionadas;
- áreas relacionadas;
- carreras explícitamente no aptas.

En esta primera fase visual puede utilizar datos mock sin lógica real.

Panel derecho:
- resumen del programa seleccionado;
- universidad;
- edición;
- fechas;
- encargado;
- requisitos;
- estado.

---

# 30. Pantalla Administrador — Usuarios

Para la primera base visual debe ser sencilla.

Listado:
- Nombre
- Correo
- Rol
- Estado
- Acción

Acciones:
- ver;
- habilitar/deshabilitar;
- editar rol cuando corresponda.

No implementar seguridad real todavía si la fase es solo UI.

---

# 31. Inicio y Mi perfil

En la primera fase no diseñar dashboards complejos.

## Inicio
Crear una vista sencilla y coherente con el rol, sin métricas inventadas ni bloques innecesarios.

## Mi perfil
Mostrar datos básicos del usuario en un único bloque limpio.

No dedicar esfuerzo excesivo a estas pantallas antes de los módulos principales.

---

# 32. Fase actual: qué debe construir Antigravity

**Objetivo de esta primera ejecución: crear la base limpia del proyecto y las pantallas estáticas principales.**

Todavía NO implementar:
- conexión real a Supabase;
- Auth real;
- RLS;
- Storage real;
- base de datos productiva;
- OCR;
- servicio IDP funcional;
- reglas de prevalidación;
- afinidad funcional;
- Realtime;
- notificaciones;
- envío de correo;
- API real;
- persistencia real.

Sí construir:
1. repositorio/proyecto base;
2. README;
3. documentación maestra;
4. arquitectura de carpetas;
5. frontend React + TypeScript + Vite + Tailwind;
6. navegación con React Router;
7. layouts por rol reutilizables;
8. componentes visuales reutilizables;
9. datos mock aislados;
10. login estático;
11. pantallas estáticas principales;
12. formularios visuales con React Hook Form + Zod solo si se implementan en esta fase;
13. placeholder de servicio IDP con README, sin lógica;
14. carpeta Supabase con estructura para futuras migraciones, **sin inventar todavía el esquema final**;
15. documentación de decisiones y base de datos pendiente.

---

# 33. Primera ejecución en Antigravity

## Instrucción principal

Construye la fundación visual y estructural del proyecto desde cero siguiendo estrictamente este documento.

### Paso 1 — Repositorio
Si el workspace no pertenece a un repositorio nuevo:
- inicializar Git;
- usar rama principal `main`;
- crear `.gitignore`;
- crear `README.md`.

No crear un remoto de GitHub ficticio. Si la herramienta dispone de una conexión GitHub autorizada, puede crear un repositorio privado llamado `caetip-idp`; de lo contrario, dejar el repositorio local preparado y reportar que el remoto debe vincularse después.

### Paso 2 — Guardar este documento
Crear:
`docs/PROJECT_MASTER.md`

y guardar allí este contenido para que sea la referencia permanente del proyecto.

### Paso 3 — Frontend
Crear `web/` con:
- React;
- TypeScript;
- Vite;
- Tailwind CSS;
- React Router;
- Lucide React.

Instalar React Hook Form y Zod solo si los formularios estáticos realmente los usan desde esta fase.

No instalar TanStack Query hasta que exista integración real de datos.

No instalar una librería externa de componentes visuales; mantener Tailwind y componentes propios.

### Paso 4 — Arquitectura frontend
Trabajar modularmente.

Crear únicamente las carpetas que se utilicen.

Ejemplo esperado:
```text
src/
|-- components/
|-- layouts/
|-- modules/
|   |-- auth/
|   |-- participant/
|   |-- enrollments/
|   |-- documents/
|   |-- programs/
|   `-- users/
|-- routes/
|-- mocks/
|-- types/
`-- utils/
```

Evitar archivos gigantes. Extraer componentes cuando haya una responsabilidad visual reutilizable real.

### Paso 5 — Layout y estilo
Crear:
- barra lateral negra, angosta y reutilizable;
- placeholder de logo CAETIP;
- navegación configurada según rol;
- estados activos visibles;
- contenido principal espacioso;
- panel derecho de previsualización en las vistas que lo requieran.

No crear footer.

### Paso 6 — Login
Implementar visualmente el login en español inspirado en la referencia entregada.

### Paso 7 — Participante
Crear:
- Documentos;
- Inscripciones;
- Inicio sencillo;
- Mi perfil sencillo.

Implementar con datos mock el flujo visual de repositorio de documentos y asociación de documentos a requisitos.

### Paso 8 — Encargado
Crear:
- Inscripciones;
- Expedientes;
- Inicio sencillo;
- Mi perfil sencillo.

Usar datos mock.

### Paso 9 — Administrador
Crear:
- Programas;
- Usuarios;
- Inscripciones;
- Expedientes;
- Inicio sencillo;
- Mi perfil sencillo.

La prioridad visual es Programas.

### Paso 10 — Formularios
Crear visualmente:
- Subir documento;
- Inscribir participante;
- Crear/Editar programa.

Preferir modales o panel lateral.

### Paso 11 — Servicio IDP
Crear `idp-service/README.md` explicando que será un servicio desacoplado Python + FastAPI.

No implementar OCR todavía.

### Paso 12 — Supabase
Crear carpeta `supabase/` con:
- `migrations/`
- `seed/`

No crear tablas definitivas todavía.

Crear en `docs/base-datos/README.md`:
- estrategia conceptual -> lógico -> 1FN -> 2FN -> 3FN -> físico -> migraciones;
- lista preliminar de entidades;
- advertencia de no crear esquema final antes de aprobar la normalización.

### Paso 13 — Documentación
Crear únicamente documentación útil:
- `docs/PROJECT_MASTER.md`
- `docs/arquitectura/README.md`
- `docs/base-datos/README.md`
- `docs/ui/README.md`
- `docs/pruebas/README.md`
- `docs/decisiones/ADR-001-arquitectura-modular-idp-separado.md`

No crear decenas de archivos vacíos.

### Paso 14 — Datos mock
Los datos demostrativos deben estar aislados en `src/mocks/`.

No usar datos personales reales de documentos CAETIP.

### Paso 15 — Validación
Antes de finalizar:
- ejecutar build;
- corregir errores TypeScript;
- comprobar rutas;
- comprobar responsive básico;
- comprobar que no existan textos visibles innecesariamente en inglés;
- revisar que sidebar no sea ancha;
- comprobar que las seis pantallas prioritarias respetan la disposición de los bocetos.

---

# 34. Pantallas prioritarias de la primera entrega

1. Login.
2. Participante — Documentos.
3. Participante — Inscripciones.
4. Encargado — Inscripciones.
5. Encargado — Expedientes.
6. Administrador — Programas.

Las otras rutas pueden existir con interfaces sencillas, pero no deben consumir la mayor parte del trabajo inicial.

---

# 35. Criterios de aceptación de la primera entrega

La primera entrega se acepta si:

- existe un proyecto nuevo y limpio;
- existe control de versiones;
- existe README;
- existe `docs/PROJECT_MASTER.md`;
- la estructura modular es comprensible;
- no existe base de datos antigua;
- no existe conexión real a Supabase todavía;
- no existe lógica IDP todavía;
- las pantallas usan datos mock;
- la navegación visual por rol funciona;
- la barra lateral coincide con la visión: negra, angosta y clara;
- las vistas mantienen gran área central + panel de previsualización donde corresponde;
- Participante Documentos funciona conceptualmente como repositorio;
- Participante Inscripciones permite conceptualmente seleccionar un documento existente;
- Encargado Inscripciones representa el pre-registro;
- Encargado Expedientes representa el monitoreo de programas asignados y versiones;
- Administrador Programas representa creación/configuración/asignación;
- los formularios no rompen la composición visual;
- toda la interfaz visible está en español;
- no existen tarjetas, bloques o dependencias innecesarias;
- el build finaliza correctamente;
- Antigravity reporta de forma breve qué creó y cualquier decisión menor que tuvo que tomar.

---

# 36. Prohibiciones para esta primera ejecución

No:
- copiar el proyecto viejo;
- crear una BD improvisada;
- implementar autenticación simulada como si fuera productiva;
- agregar Redux;
- agregar una librería visual pesada;
- agregar shadcn/material/Bootstrap por cuenta propia;
- crear APIs ficticias complejas;
- implementar OCR;
- implementar afinidad real;
- crear microservicios adicionales;
- añadir dashboard con gráficas que no fueron solicitadas;
- añadir footer;
- hacer la sidebar grande;
- generar archivos de documentación vacíos;
- duplicar documentos mock por inscripción para representar reutilización;
- utilizar información personal real;
- introducir términos visibles en inglés si existe equivalente natural en español.

---

# 37. Después de esta primera entrega

No continuar automáticamente con la base de datos ni el IDP.

Detenerse.

La siguiente fase será revisar:
1. arquitectura generada;
2. pantallas;
3. modelo conceptual;
4. normalización de la base de datos;
5. esquema físico;
6. migraciones;
7. Supabase/Auth/RLS;
8. funcionalidad real por iteraciones.

Cualquier avance posterior debe mantener este documento como contexto maestro.
