import type { BasePotencialCliente, CecCliente, ClienteFinal, EmpresaRues } from './entities.js';

export interface CecRepository {
  findConCupoDisponible(): Promise<CecCliente[]>;
}

export interface RuesProvider {
  findByNit(nit: string): Promise<EmpresaRues | null>;
}

export interface BasePotencialRepository {
  findGestionablesSinTarjeta(clienteIds: string[]): Promise<BasePotencialCliente[]>;
}

export interface PagaresRepository {
  findIdsConPagareActivo(identificaciones: string[]): Promise<Set<string>>;
}

export interface ClientesFinalesPageQuery {
  page: number;
  limit: number;
  search?: string;
}

export interface ClientesFinalesPageResult {
  total: number;
  page: number;
  pageSize: number;
  clientes: ClienteFinal[];
}

export interface ClientesFinalesRepository {
  replaceAll(clientes: ClienteFinal[]): Promise<void>;
  findAll(): Promise<ClienteFinal[]>;
  findPage(query: ClientesFinalesPageQuery): Promise<ClientesFinalesPageResult>;
  findByClienteId(clienteId: string): Promise<ClienteFinal | null>;
  findAllClienteIds(limit?: number): Promise<string[]>;
  updateRuesEnrichment(clienteId: string, empresa: EmpresaRues | null): Promise<void>;
}
