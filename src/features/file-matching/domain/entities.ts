export interface ClienteFinal {
  clienteId: string;
  nombre: string | null;
  ciudad: string | null;
  subsegmento: string | null;
  cupoDisponible: number | null;
  leaAprobado: number | null;
  correo: string | null;
  telefono: string | null;
  representanteLegalNombre: string | null;
  representanteLegalDocumento: string | null;
  representanteLegalCargo: string | null;
  direccionComercial: string | null;
  municipioComercial: string | null;
  tipoSociedad: string | null;
  actividadEconomica: string | null;
  ruesFound: boolean | null;
  ruesEnrichedAt: string | null;
}

export interface EmpresaRues {
  representanteLegalNombre: string | null;
  representanteLegalDocumento: string | null;
  representanteLegalCargo: string | null;
  direccionComercial: string | null;
  municipioComercial: string | null;
  tipoSociedad: string | null;
  actividadEconomica: string | null;
}

export interface RuesEnrichmentResumen {
  procesados: number;
  encontrados: number;
  sinCoincidencia: number;
  errores: number;
}

export interface CecCliente {
  numeIden: string;
  disponible: number | null;
  leaAprobado: number | null;
}

export interface BasePotencialCliente {
  clienteId: string;
  clienteNombre: string | null;
  ciudad: string | null;
  subsegmento: string | null;
  correo: string | null;
  telefono: string | null;
}

export interface FileMatchingResumen {
  cecConCupo: number;
  gestionablesSinTc: number;
  conPagareActivo: number;
  clientesFinales: number;
  clientesFinalesSinPagare: number;
  generadoEn: string;
}
