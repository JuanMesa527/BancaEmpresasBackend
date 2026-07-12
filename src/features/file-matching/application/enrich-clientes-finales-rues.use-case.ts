import { AppError } from '../../../shared/exceptions/app-error.js';
import type { RuesEnrichmentResumen } from '../domain/entities.js';
import type { ClientesFinalesRepository, RuesProvider } from '../domain/repositories.js';
import { mapWithConcurrency } from '../infrastructure/map-with-concurrency.js';

const CONCURRENCIA = 5;

export interface EnrichRuesOptions {
  limit?: number;
}

export class EnrichClientesFinalesRuesUseCase {
  private isRunning = false;

  constructor(
    private readonly clientesFinalesRepository: ClientesFinalesRepository,
    private readonly ruesProvider: RuesProvider,
  ) {}

  async execute(options: EnrichRuesOptions = {}): Promise<RuesEnrichmentResumen> {
    if (this.isRunning) {
      throw new AppError('Ya hay un enriquecimiento RUES en curso.', 409, 'ENRICH_IN_PROGRESS');
    }
    this.isRunning = true;
    try {
      const clienteIds = await this.clientesFinalesRepository.findAllClienteIds(options.limit);

      let encontrados = 0;
      let sinCoincidencia = 0;
      let errores = 0;

      await mapWithConcurrency(clienteIds, CONCURRENCIA, async (clienteId) => {
        try {
          const empresa = await this.ruesProvider.findByNit(clienteId);
          await this.clientesFinalesRepository.updateRuesEnrichment(clienteId, empresa);
          if (empresa) {
            encontrados += 1;
          } else {
            sinCoincidencia += 1;
          }
        } catch {
          errores += 1;
        }
      });

      return { procesados: clienteIds.length, encontrados, sinCoincidencia, errores };
    } finally {
      this.isRunning = false;
    }
  }
}
