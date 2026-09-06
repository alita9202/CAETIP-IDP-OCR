# CAETIP — Plataforma Web con IDP

Plataforma web para la automatización, prevalidación y monitoreo en tiempo real del proceso de inscripción en CAETIP S.R.L., soportada por Procesamiento Inteligente de Documentos (IDP).

## Estructura del proyecto

```
caetip-idp/
├── web/               → Frontend: React + TypeScript + Vite + Tailwind CSS
├── idp-service/       → Servicio IDP: Python + FastAPI (placeholder)
├── supabase/          → Migraciones y seeds (pendiente)
├── docs/              → Documentación del proyecto
├── README.md
└── .gitignore
```

## Tecnologías

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React
- React Hook Form + Zod

### Backend / BaaS (pendiente)
- Supabase (PostgreSQL, Auth, Storage, Realtime, RLS)

### Servicio IDP (pendiente)
- Python + FastAPI
- OpenCV + PaddleOCR
- Clasificación, extracción, normalización, comparación, prevalidación

## Estado actual

**Fase 1 — Base visual y estructural.**

- Proyecto configurado con Vite + React + TypeScript + Tailwind.
- Pantallas estáticas principales con datos mock.
- Sin conexión a Supabase ni servicios reales.
- Sin lógica IDP implementada.

## Desarrollo local

```bash
cd web
npm install
npm run dev
```

## Documentación

- Contexto maestro: `docs/PROJECT_MASTER.md`
- Arquitectura: `docs/arquitectura/README.md`
- Base de datos: `docs/base-datos/README.md`
- Decisiones: `docs/decisiones/`

## Licencia

Proyecto privado — CAETIP S.R.L.
