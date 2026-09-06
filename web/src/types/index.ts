export type UserRole = 'participante' | 'encargado' | 'secretaria' | 'administrador';

export interface User {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  rol: UserRole;
  estado: 'activo' | 'inactivo';
}

export type EstadoDocumento =
  | 'DOCUMENTO_PENDIENTE'
  | 'DOCUMENTO_RECIBIDO'
  | 'DOCUMENTO_EN_PROCESAMIENTO'
  | 'DOCUMENTO_PREVALIDADO'
  | 'REQUIERE_REVISION_HUMANA'
  | 'ACEPTADO_MANUALMENTE'
  | 'DOCUMENTO_OBSERVADO'
  | 'REQUIERE_REEMPLAZO'
  | 'ERROR_DE_PROCESAMIENTO'
  | 'REEMPLAZADO';

export type TipoDocumento =
  | 'Carnet de Identidad'
  | 'Título / Diploma'
  | 'Hoja de Vida'
  | 'Ficha de Inscripción';

export interface Documento {
  id: string;
  nombre: string;
  tipo: TipoDocumento;
  estado: EstadoDocumento;
  fechaActualizacion: string;
  observacion?: string;
  datosExtraidos?: Record<string, string>;
}

export type EstadoInscripcion =
  | 'PRE_REGISTRADA'
  | 'MATRICULA_PENDIENTE'
  | 'ACTIVA'
  | 'LISTA_PARA_CONTINUAR'
  | 'RECHAZADA'
  | 'CANCELADA'
  | 'RETIRADA';

export type EstadoExpediente =
  | 'DOCUMENTACION_PENDIENTE'
  | 'EN_PROCESAMIENTO_DOCUMENTAL'
  | 'EN_REVISION_DOCUMENTAL'
  | 'EXPEDIENTE_OBSERVADO'
  | 'EXPEDIENTE_PREVALIDADO';

export type EstadoMatricula = 'Pendiente' | 'Confirmada';

export interface Requisito {
  id: string;
  nombre: string;
  tipo: TipoDocumento;
  obligatorio: boolean;
  documentoAsociadoId?: string;
  estadoRequisito: 'Pendiente' | 'Cumplido' | 'Observado' | 'En revisión';
}

export interface Programa {
  id: string;
  nombre: string;
  universidad: string;
  codigo: string;
  version: string;
  modalidad?: string;
  fechaInicio: string;
  fechaFin: string;
  fechaLimiteInscripcion: string;
  fechaLimiteDocumentacion: string;
  estado: 'Activo' | 'Inactivo' | 'En inscripción' | 'Finalizado';
  descripcion: string;
  encargadoId: string;
  encargadoNombre: string;
  requisitos: RequisitoPrograma[];
}

export interface RequisitoPrograma {
  tipo: TipoDocumento | string;
  obligatorio: boolean;
}

export interface Inscripcion {
  id: string;
  personaId: string;
  nombreCompleto: string;
  ci: string;
  correo: string;
  telefono: string;
  programaId: string;
  programaNombre: string;
  version: string;
  matricula: EstadoMatricula;
  estado: EstadoInscripcion;
  requisitos: Requisito[];
}

export interface Expediente {
  id: string;
  participanteId: string;
  nombreCompleto: string;
  ci: string;
  correo: string;
  telefono: string;
  programaId: string;
  estadoInscripcion: EstadoInscripcion;
  estadoExpediente: EstadoExpediente;
  documentos: {
    carnetIdentidad: EstadoDocumento;
    tituloDiploma: EstadoDocumento;
    hojaVida: EstadoDocumento;
    fichaInscripcion: EstadoDocumento;
  };
}
