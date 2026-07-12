export interface PowerAppPrefill {
  leadId?: string;
  campana?: string;
  asesorId?: string;

  segmento?: string;
  tipoIdentificacionEmpresa?: 'NIT';
  tipoIdentificacionTarjetahabiente?: 'CC' | 'CE' | 'PA' | 'TI';
  numeroIdentificacionTarjetahabiente?: string;
  unidadNegocios?: string;
  tipoTarjetaNueva?: string;
  identificacionEmpresa?: string;
  nombreEmpresa?: string;
  nombreTarjetahabiente?: string;

  binProducto?: string;
  cargoDebitoAutomatico?: string;
  cupoTarjetaNueva?: number;
  cupoDisponibleCec?: number;

  codigoOficinaCentroServicio?: string;
  ciudadPuntoEntrega?: string;
  direccionPuntoComercial?: string;
  puntoEntrega?: 'PUNTO_ENTREGA_A_COMERCIAL' | 'ENVIO_CERTIFICADO_COURIER';

  origenLlamada: {
    callId: string;
    sessionId?: string;
    resumen?: string;
    grabacionUrl?: string;
    finalizadaEn?: string;
  };
}
