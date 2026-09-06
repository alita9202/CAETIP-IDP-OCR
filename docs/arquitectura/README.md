# Arquitectura del proyecto

## Visión general

Arquitectura web modular por dominios con servicio IDP desacoplado.

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

## Componentes principales

### Frontend (`web/`)
- React + TypeScript + Vite
- Tailwind CSS para estilos
- React Router para navegación
- Arquitectura modular por dominios funcionales

### Servicio IDP (`idp-service/`)
- Python + FastAPI
- Procesamiento inteligente de documentos
- Desacoplado del frontend
- Comunicación mediante API REST

### Base de datos (`supabase/`)
- PostgreSQL gestionado por Supabase
- Migraciones versionadas
- Row Level Security

## Estado actual

Fase 1: base visual y estructural con datos mock. Sin conexiones reales.
