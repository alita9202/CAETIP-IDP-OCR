# Segunda Fase: Procesamiento IDP y Prevalidación

La migración `idp_validation_affinity` añade la estructura necesaria para procesar, validar y auditar documentos sin acoplar la evaluación técnica a la inscripción.

## Procesamiento y Prevalidación (Primer Filtro)

El proceso comienza en `procesamiento_idp` y genera `dato_extraido`. La evaluación lógica del documento se realiza en `prevalidacion_documental`.

- Se permite que un mismo documento (`version_documento`) pase por múltiples ciclos de reprocesamiento.
- Todo reprocesamiento genera nuevos registros; **nunca se sobrescriben** para garantizar trazabilidad.
- Los resultados automáticos se comparan en `comparacion_documental`.

## Prevalidación de Expediente (Segundo Filtro)

Una vez que un documento prevalidado se vincula al expediente del estudiante (`asignacion_documento_requisito`), se ejecuta el segundo filtro:
- `prevalidacion_expediente`: Evalúa si el documento cumple los requisitos del programa.
- `comparacion_expediente`: Valida si los datos extraídos (ej. nombre) coinciden con los datos de inscripción y reglas de afinidad.

## Afinidad Académica y Revisión

- El sistema define compatibilidad mediante `regla_afinidad_carrera` y `regla_afinidad_area`.
- **Ninguna regla automática puede rechazar definitivamente un documento.** Si el IDP indica que el documento no es válido o no hay afinidad, siempre pasa a `revision_documental` o `revision_expediente`.
- Solo una revisión humana puede tomar la decisión de rechazo (`NO_CUMPLE_AFINIDAD`).
- Toda observación se categoriza con un catálogo estructurado (`motivo_observacion`).

## Regla de Selección de Documentos

Existe un trigger en la base de datos (`check_documento_prevalidado_antes_de_asignar`) que impide físicamente insertar un documento en un expediente si no ha sido previamente calificado como `DOCUMENTO_PREVALIDADO` (por el sistema) o `ACEPTADO_MANUALMENTE` (por un supervisor humano).

## Auditoría
Todo el ciclo de vida del procesamiento, revisión manual y modificación de datos queda respaldado en la tabla `auditoria`.
