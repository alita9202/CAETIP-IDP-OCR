# Módulo: Programas y Ofertas

## Modelo de Datos

### Programa vs Oferta

| Concepto | Tabla | Descripción |
|---|---|---|
| **Programa** | `programa` | Concepto académico genérico (ej: "Diplomado en Psicopedagogía"). No contiene versiones, fechas ni universidad. |
| **Oferta** | `oferta_programa` | Edición/versión concreta de un Programa (ej: "1ra versión, Gestión 2026-1, UMSS"). Contiene universidad, fechas, modalidad y estado. |

Un Programa puede tener múltiples Ofertas. Los requisitos documentales y la asignación de encargados se asocian a la **Oferta**, no al Programa.

## Consultas Utilizadas

| Operación | Tabla(s) | Hook |
|---|---|---|
| Listar programas | `programa` | `useProgramas()` |
| Listar ofertas de un programa | `oferta_programa` + joins a `universidad`, `requisito_oferta`, `tipo_documento`, `asignacion_encargado`, `usuario`, `persona` | `useOfertasByPrograma(id)` |
| Listar universidades | `universidad` | `useUniversidades()` |
| Listar tipos de documento | `tipo_documento` | `useTiposDocumento()` |
| Listar encargados disponibles | `usuario` + `persona` (filtrado por rol ENCARGADO) | `useEncargadosDisponibles()` |

## CRUD Disponible

### Programas
- **Crear:** nombre (requerido), descripción, activo.
- **Editar:** nombre, descripción, activo/inactivo.
- **Eliminar:** No se permite eliminación física. Se desactiva (activo = false).

### Ofertas
- **Crear:** programa (auto), universidad (requerida), versión (requerida), gestión (requerida), modalidad, fechas, estado (BORRADOR por defecto).
- **Editar:** todos los campos administrativos.
- **Estados válidos:** `BORRADOR`, `HABILITADA`, `CERRADA`, `INACTIVA` (según CHECK de la BD).

### Universidades
- **Crear:** nombre (requerido), sigla.
- Se crean desde un modal embebido dentro del formulario de oferta.

## Requisitos Documentales

Se configuran por Oferta, no por Programa. Utiliza el catálogo real `tipo_documento`. Cada requisito establece:
- Tipo de documento (del catálogo).
- Obligatorio / Opcional.
- Orden.

No se hardcodean los cuatro tipos iniciales; se consulta dinámicamente el catálogo. La oferta no puede tener duplicado el mismo tipo de documento (se reescribe la lista completa en cada guardado).

## Encargados

La asignación de encargados se maneja desde el panel de detalle de la oferta. Si hay usuarios con rol ENCARGADO y estado ACTIVO, aparece un selector. Si no existen, se muestra "Sin encargado asignado".

La asignación desactiva automáticamente la asignación anterior antes de crear la nueva.

## Permisos

Todas las operaciones CRUD usan el cliente Supabase normal del usuario ADMINISTRADOR autenticado. Las políticas RLS garantizan que solo el rol ADMINISTRADOR pueda insertar/actualizar/eliminar en las tablas de catálogos y ofertas.

## Server State

Se utiliza **TanStack Query (React Query)** para:
- Consultas con cache y staleTime.
- Invalidación automática tras crear/editar.
- Estados de loading y error integrados.
- Separación entre servicios (`programas.service.ts`) y hooks (`programas.hooks.ts`).
