export type ValidationSeverity = 'error' | 'warning';

export type ValidationIssueCode =
  | 'REQUIRED_FIELD'
  | 'INVALID_FORMAT'
  | 'FIELD_SWAP_NIT_CEDULA'
  | 'DUPLICATE_IDENTIFICATION'
  | 'CUPO_EXCEDE_DISPONIBLE'
  | 'CUPO_INVALIDO'
  | 'PRODUCTO_INVALIDO'
  | 'AGENDAMIENTO_FIN_DE_SEMANA'
  | 'AGENDAMIENTO_PASADO'
  | 'CAMARA_COMERCIO_REQUERIDA'
  | 'CAMARA_COMERCIO_NIT_NO_COINCIDE'
  | 'SEGMENTO_NO_ELEGIBLE'
  | 'MISSING_TARJETAHABIENTE_DATA';

export interface ValidationIssue {
  code: ValidationIssueCode;
  field: string;
  message: string;
  severity: ValidationSeverity;
  suggestion?: string;
}

export type PowerAppDecision = 'APROBADO' | 'RECHAZADO' | 'DEVUELTO';
