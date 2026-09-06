# Servicio IDP — Procesamiento Inteligente de Documentos

## Descripción

Servicio desacoplado para el procesamiento automático de documentos de inscripción de CAETIP.

## Tecnologías planificadas

- **Python** — lenguaje principal
- **FastAPI** — framework web / API REST
- **OpenCV** — preprocesamiento de imágenes
- **PaddleOCR** — reconocimiento óptico de caracteres
- **RapidFuzz** — comparación difusa de texto

## Pipeline de procesamiento

1. **Recepción** — el documento llega al servicio vía API
2. **Preprocesamiento** — mejora de imagen (OpenCV)
3. **Clasificación** — identificación del tipo de documento
4. **Extracción (OCR)** — lectura de campos relevantes
5. **Normalización** — limpieza y estandarización de datos extraídos
6. **Comparación** — contraste con datos maestros del sistema
7. **Prevalidación** — evaluación automática de consistencia

## Estructura planificada

```
idp-service/
├── app/
│   ├── api/
│   ├── preprocessing/
│   ├── ocr/
│   ├── classification/
│   ├── extraction/
│   ├── normalization/
│   ├── validation/
│   └── tests/
└── README.md
```

## Estado actual

Placeholder. La implementación iniciará en fases posteriores.
