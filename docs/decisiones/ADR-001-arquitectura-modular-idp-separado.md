# ADR-001: Arquitectura modular con servicio IDP separado

## Estado

Aprobado

## Contexto

CAETIP necesita una plataforma web que centralice el proceso de inscripción y procese documentación mediante IDP (Procesamiento Inteligente de Documentos). Se evaluaron varias opciones arquitectónicas.

## Decisión

Se adopta una arquitectura de **aplicación web modular por dominios** con un **servicio IDP desacoplado**:

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **BaaS:** Supabase (PostgreSQL, Auth, Storage, Realtime, RLS)
- **IDP:** Python + FastAPI + OpenCV + PaddleOCR

## Razones

1. El procesamiento de documentos (Python, OpenCV, PaddleOCR) tiene requerimientos técnicos diferentes al frontend.
2. Separar el IDP permite escalarlo, probarlo y desplegarlo independientemente.
3. Supabase ofrece Auth, Storage y Realtime integrados, reduciendo infraestructura.
4. React modular por dominios mantiene el frontend organizado sin microservicios innecesarios.

## Alternativas descartadas

- **Monolito completo:** el IDP requiere Python y librerías de visión; mezclarlo con Node.js complica el despliegue.
- **Microservicios múltiples:** complejidad innecesaria para el alcance actual.
- **Kubernetes/Kafka/Redis:** sobreingeniería para esta etapa.

## Consecuencias

- El frontend se comunica con Supabase directamente para datos y auth.
- El frontend invoca al servicio IDP mediante API REST para procesamiento documental.
- Ambos servicios pueden desplegarse y escalar de forma independiente.
