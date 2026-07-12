
export type TipoIdentificacionEmpresa = 'NIT';
export type TipoIdentificacionTarjetahabiente = 'CC' | 'CE' | 'PA' | 'TI';

export type PuntoEntrega =
  | 'PUNTO_ENTREGA_A_COMERCIAL'
  | 'ENVIO_CERTIFICADO_COURIER';

export interface PowerAppRequest {
  leadId?: string;
  campana?: string;
  asesorId?: string;

  segmento: string;
  tipoIdentificacionEmpresa: TipoIdentificacionEmpresa;
  tipoIdentificacionTarjetahabiente: TipoIdentificacionTarjetahabiente;
  numeroIdentificacionTarjetahabiente: string;
  unidadNegocios: string;
  tipoTarjetaNueva: string;
  identificacionEmpresa: string;
  nombreEmpresa: string;
  nombreTarjetahabiente: string;

  binProducto: string;
  cargoDebitoAutomatico: string;
  cupoTarjetaNueva: number;
  cupoDisponibleCec?: number;

  archivosAdjuntos: string[];

  codigoOficinaCentroServicio: string;
  ciudadPuntoEntrega: string;
  direccionPuntoComercial: string;
  puntoEntrega: PuntoEntrega;
}
