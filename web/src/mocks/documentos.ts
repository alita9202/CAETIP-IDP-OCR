import type { Documento } from '../types';

export const documentosMock: Documento[] = [
  {
    id: 'doc-1',
    nombre: 'Carnet de Identidad',
    tipo: 'Carnet de Identidad',
    estado: 'DOCUMENTO_PREVALIDADO',
    fechaActualizacion: '2026-08-15',
    datosExtraidos: {
      'Número de CI': '7845123 LP',
      'Nombres': 'María Elena',
      'Apellidos': 'Quispe Mamani',
      'Fecha de nacimiento': '15/03/1990',
    },
  },
  {
    id: 'doc-2',
    nombre: 'Título Profesional',
    tipo: 'Título / Diploma',
    estado: 'REQUIERE_REVISION_HUMANA',
    fechaActualizacion: '2026-08-20',
    observacion: 'La imagen presenta baja nitidez en la sección del nombre del titular.',
    datosExtraidos: {
      'Titular': 'María Elena Quispe Mamani',
      'Carrera': 'Licenciatura en Ciencias de la Educación',
      'Universidad': 'Universidad Mayor de San Andrés',
    },
  },
  {
    id: 'doc-3',
    nombre: 'Hoja de Vida',
    tipo: 'Hoja de Vida',
    estado: 'DOCUMENTO_EN_PROCESAMIENTO',
    fechaActualizacion: '2026-08-22',
  },
  {
    id: 'doc-4',
    nombre: 'Ficha de Inscripción — Dip. Psicopedagogía',
    tipo: 'Ficha de Inscripción',
    estado: 'DOCUMENTO_OBSERVADO',
    fechaActualizacion: '2026-08-18',
    observacion: 'El campo de carrera no coincide con el título presentado.',
  },
  {
    id: 'doc-5',
    nombre: 'Ficha de Inscripción — Dip. Formación Docente',
    tipo: 'Ficha de Inscripción',
    estado: 'REQUIERE_REEMPLAZO',
    fechaActualizacion: '2026-08-10',
    observacion: 'El documento está incompleto. Faltan datos de contacto.',
  },
];
