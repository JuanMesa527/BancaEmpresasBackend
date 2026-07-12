import { AppError } from '../../../shared/exceptions/app-error.js';
import type { ClienteFinal, FileMatchingResumen } from '../domain/entities.js';
import type {
  BasePotencialRepository,
  CecRepository,
  ClientesFinalesRepository,
  PagaresRepository,
} from '../domain/repositories.js';

export class BuildClientesFinalesUseCase {
  private isRunning = false;

  constructor(
    private readonly cecRepository: CecRepository,
    private readonly basePotencialRepository: BasePotencialRepository,
    private readonly pagaresRepository: PagaresRepository,
    private readonly clientesFinalesRepository: ClientesFinalesRepository,
    private readonly clientesFinalesSinPagareRepository: ClientesFinalesRepository,
  ) {}

  async execute(): Promise<FileMatchingResumen> {
    if (this.isRunning) {
      throw new AppError(
        'Ya hay una generación de clientes finales en curso.',
        409,
        'RUN_IN_PROGRESS',
      );
    }
    this.isRunning = true;
    try {
      const { candidatos, cecConCupo } = await this.buildCandidatosSinPagare();
      await this.clientesFinalesSinPagareRepository.replaceAll(candidatos);

      const { clientesFinales, conPagareActivo } = await this.aplicarCondicionPagare(candidatos);
      await this.clientesFinalesRepository.replaceAll(clientesFinales);

      return {
        cecConCupo,
        gestionablesSinTc: candidatos.length,
        conPagareActivo,
        clientesFinales: clientesFinales.length,
        clientesFinalesSinPagare: candidatos.length,
        generadoEn: new Date().toISOString(),
      };
    } finally {
      this.isRunning = false;
    }
  }

  private async buildCandidatosSinPagare(): Promise<{
    candidatos: ClienteFinal[];
    cecConCupo: number;
  }> {
    const cecClientes = await this.cecRepository.findConCupoDisponible();
    const cecPorId = new Map(cecClientes.map((cec) => [cec.numeIden, cec]));

    const gestionables = await this.basePotencialRepository.findGestionablesSinTarjeta([
      ...cecPorId.keys(),
    ]);

    const candidatosPorId = new Map<string, ClienteFinal>();
    for (const cliente of gestionables) {
      const cec = cecPorId.get(cliente.clienteId);
      if (!cec || candidatosPorId.has(cliente.clienteId)) continue;
      candidatosPorId.set(cliente.clienteId, {
        clienteId: cliente.clienteId,
        nombre: cliente.clienteNombre,
        ciudad: cliente.ciudad,
        subsegmento: cliente.subsegmento,
        cupoDisponible: cec.disponible,
        leaAprobado: cec.leaAprobado,
        correo: cliente.correo,
        telefono: cliente.telefono,
        representanteLegalNombre: null,
        representanteLegalDocumento: null,
        representanteLegalCargo: null,
        direccionComercial: null,
        municipioComercial: null,
        tipoSociedad: null,
        actividadEconomica: null,
        ruesFound: null,
        ruesEnrichedAt: null,
      });
    }

    return { candidatos: [...candidatosPorId.values()], cecConCupo: cecClientes.length };
  }

  private async aplicarCondicionPagare(candidatos: ClienteFinal[]): Promise<{
    clientesFinales: ClienteFinal[];
    conPagareActivo: number;
  }> {
    const idsConPagare = await this.pagaresRepository.findIdsConPagareActivo(
      candidatos.map((cliente) => cliente.clienteId),
    );
    return {
      clientesFinales: candidatos.filter((cliente) => idsConPagare.has(cliente.clienteId)),
      conPagareActivo: idsConPagare.size,
    };
  }
}
