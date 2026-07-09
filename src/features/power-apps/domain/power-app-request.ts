export interface PowerAppEmpresa {
  nit: string;
  razonSocial: string;
  segmento: string;
  ciudad: string;
  direccion: string;
}

export interface PowerAppTarjetahabiente {
  tipoDocumento: 'CC' | 'CE' | 'PA' | 'TI';
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  email: string;
  telefono: string;
}

export interface PowerAppCupo {
  solicitado: number;
  disponibleCec?: number;
}

export interface PowerAppEntrega {
  tipo: 'courier' | 'comercial';
  ciudad: string;
  direccion: string;
  fechaAgendamiento: string;
}

export interface PowerAppCamaraComercio {
  archivoNombre: string;
  nitCertificado?: string;
  fechaExpedicion?: string;
}

export interface PowerAppProducto {
  codigo: string;
  franquicia: string;
}

export interface PowerAppRequest {
  leadId?: string;
  campana?: string;
  empresa: PowerAppEmpresa;
  tarjetahabiente: PowerAppTarjetahabiente;
  cupo: PowerAppCupo;
  entrega: PowerAppEntrega;
  camaraComercio: PowerAppCamaraComercio;
  producto: PowerAppProducto;
  asesorId?: string;
}
