import type { EstadoDocumento, EstadoInscripcion, EstadoExpediente } from '../types';

export const estadoDocumentoLabel: Record<EstadoDocumento, string> = {
  DOCUMENTO_PENDIENTE: 'Pendiente',
  DOCUMENTO_RECIBIDO: 'Recibido',
  DOCUMENTO_EN_PROCESAMIENTO: 'En procesamiento',
  DOCUMENTO_PREVALIDADO: 'Prevalidado',
  REQUIERE_REVISION_HUMANA: 'Requiere revisión',
  ACEPTADO_MANUALMENTE: 'Aceptado',
  DOCUMENTO_OBSERVADO: 'Observado',
  REQUIERE_REEMPLAZO: 'Requiere reemplazo',
  ERROR_DE_PROCESAMIENTO: 'Error',
  REEMPLAZADO: 'Reemplazado',
};

export const estadoDocumentoColor: Record<EstadoDocumento, string> = {
  DOCUMENTO_PENDIENTE: 'bg-gray-100 text-gray-700',
  DOCUMENTO_RECIBIDO: 'bg-blue-50 text-blue-700',
  DOCUMENTO_EN_PROCESAMIENTO: 'bg-yellow-50 text-yellow-700',
  DOCUMENTO_PREVALIDADO: 'bg-green-50 text-green-700',
  REQUIERE_REVISION_HUMANA: 'bg-orange-50 text-orange-700',
  ACEPTADO_MANUALMENTE: 'bg-green-50 text-green-700',
  DOCUMENTO_OBSERVADO: 'bg-red-50 text-red-700',
  REQUIERE_REEMPLAZO: 'bg-red-50 text-red-700',
  ERROR_DE_PROCESAMIENTO: 'bg-red-100 text-red-800',
  REEMPLAZADO: 'bg-gray-100 text-gray-500',
};

export const estadoInscripcionLabel: Record<EstadoInscripcion, string> = {
  PRE_REGISTRADA: 'Pre-registrada',
  MATRICULA_PENDIENTE: 'Matrícula pendiente',
  ACTIVA: 'Activa',
  LISTA_PARA_CONTINUAR: 'Lista para continuar',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
  RETIRADA: 'Retirada',
};

export const estadoInscripcionColor: Record<EstadoInscripcion, string> = {
  PRE_REGISTRADA: 'bg-blue-50 text-blue-700',
  MATRICULA_PENDIENTE: 'bg-yellow-50 text-yellow-700',
  ACTIVA: 'bg-green-50 text-green-700',
  LISTA_PARA_CONTINUAR: 'bg-green-100 text-green-800',
  RECHAZADA: 'bg-red-50 text-red-700',
  CANCELADA: 'bg-gray-100 text-gray-600',
  RETIRADA: 'bg-gray-100 text-gray-600',
};

export const estadoExpedienteLabel: Record<EstadoExpediente, string> = {
  DOCUMENTACION_PENDIENTE: 'Pendiente',
  EN_PROCESAMIENTO_DOCUMENTAL: 'En procesamiento',
  EN_REVISION_DOCUMENTAL: 'En revisión',
  EXPEDIENTE_OBSERVADO: 'Observado',
  EXPEDIENTE_PREVALIDADO: 'Prevalidado',
};

export const estadoExpedienteColor: Record<EstadoExpediente, string> = {
  DOCUMENTACION_PENDIENTE: 'bg-gray-100 text-gray-700',
  EN_PROCESAMIENTO_DOCUMENTAL: 'bg-yellow-50 text-yellow-700',
  EN_REVISION_DOCUMENTAL: 'bg-orange-50 text-orange-700',
  EXPEDIENTE_OBSERVADO: 'bg-red-50 text-red-700',
  EXPEDIENTE_PREVALIDADO: 'bg-green-50 text-green-700',
};
