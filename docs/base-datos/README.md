# Estrategia de base de datos

## Método de diseño

El esquema de base de datos se diseñará desde cero siguiendo un proceso riguroso de normalización:

1. **Modelo conceptual** — identificación de entidades y relaciones
2. **Modelo lógico** — atributos, claves, cardinalidades
3. **Primera forma normal (1FN)** — eliminación de grupos repetitivos
4. **Segunda forma normal (2FN)** — eliminación de dependencias parciales
5. **Tercera forma normal (3FN)** — eliminación de dependencias transitivas
6. **Modelo físico PostgreSQL** — tipos, índices, constraints
7. **Migraciones versionadas** — evolución controlada del esquema
8. **Row Level Security (RLS)** — políticas de acceso por rol
9. **Pruebas de integridad** — validación del modelo

> **IMPORTANTE:** No se creará un esquema físico definitivo sin documentar y aprobar primero la normalización completa.

## Entidades preliminares identificadas

Estas entidades han sido identificadas en el análisis inicial. Su estructura definitiva se determinará durante el proceso de normalización:

- Persona
- Usuario
- Rol
- Programa
- Oferta / Edición de programa
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

## Reglas generales

- No usar JSON para evitar diseñar relaciones correctamente.
- JSON puede utilizarse para resultados técnicos variables del IDP o respuesta OCR cruda.
- No repetir datos derivados en tablas.
- Las inscripciones deben referenciar Persona y Oferta mediante relaciones, no copiar datos.

## Estado actual

Pendiente: el diseño de la base de datos iniciará después de aprobar la base visual del proyecto.
