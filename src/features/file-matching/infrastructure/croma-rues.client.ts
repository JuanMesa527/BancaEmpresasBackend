import { AppError } from '../../../shared/exceptions/app-error.js';
import type { EmpresaRues } from '../domain/entities.js';
import type { RuesProvider } from '../domain/repositories.js';

const RUES_PATH = '/co/rues/entity-by-nit/v1';
const REQUEST_TIMEOUT_MS = 15_000;
const RETRY_DELAY_MS = 600;

interface CiiuActivity {
  code?: string | null;
  description?: string | null;
}

interface RelatedParty {
  document_number?: string | null;
  name?: string | null;
  role?: string | null;
}

interface RuesEntity {
  name?: string | null;
  society_type?: string | null;
  legal_organization?: string | null;
  commercial_address?: string | null;
  commercial_municipality?: string | null;
  primary_activity?: CiiuActivity | null;
  ciiu_4?: CiiuActivity | null;
}

interface RuesResult {
  found?: boolean;
  entity?: RuesEntity | null;
  related_parties?: RelatedParty[] | null;
}

interface CromaEnvelope {
  data?: RuesResult | null;
}

function trimOrNull(value: string | null | undefined): string | null {
  const text = (value ?? '').replace(/\s+/g, ' ').trim();
  return text === '' ? null : text;
}

function soloDigitos(nit: string): string {
  return nit.replace(/\D/g, '');
}

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function candidatosDocumento(documento: string): string[] {
  const candidatos = documento.length >= 10
    ? [documento.slice(0, -1), documento]
    : [documento, documento.slice(0, -1)];
  return [...new Set(candidatos.filter((doc) => doc.length >= 4))];
}

function pickRepresentanteLegal(parties: RelatedParty[]): RelatedParty | null {
  const legales = parties.filter((party) => (party.role ?? '').toLowerCase().includes('representante legal'));
  if (legales.length === 0) return null;
  const principal = legales.find((party) => (party.role ?? '').toLowerCase().includes('principal'));
  return principal ?? legales[0];
}

function toEmpresaRues(result: RuesResult): EmpresaRues {
  const entity = result.entity ?? {};
  const repLegal = pickRepresentanteLegal(result.related_parties ?? []);
  return {
    representanteLegalNombre: trimOrNull(repLegal?.name),
    representanteLegalDocumento: trimOrNull(repLegal?.document_number),
    representanteLegalCargo: trimOrNull(repLegal?.role),
    direccionComercial: trimOrNull(entity.commercial_address),
    municipioComercial: trimOrNull(entity.commercial_municipality),
    tipoSociedad: trimOrNull(entity.legal_organization) ?? trimOrNull(entity.society_type),
    actividadEconomica: trimOrNull(entity.ciiu_4?.description) ?? trimOrNull(entity.primary_activity?.description),
  };
}

export class CromaRuesClient implements RuesProvider {
  constructor(
    private readonly apiUrl: string,
    private readonly apiKey: string,
  ) {}

  async findByNit(nit: string): Promise<EmpresaRues | null> {
    const documento = soloDigitos(nit);
    if (documento.length < 4) return null;

    for (const candidato of candidatosDocumento(documento)) {
      const result = await this.consultar(candidato);
      if (result?.found) return toEmpresaRues(result);
    }
    return null;
  }

  private async consultar(documentNumber: string): Promise<RuesResult | null> {
    if (!this.apiUrl || !this.apiKey) {
      throw new AppError('Croma no está configurado (CROMA_API_URL / CROMA_API_KEY).', 500, 'CROMA_NOT_CONFIGURED');
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const transitorio = await this.intento(documentNumber);
      if (!transitorio.retry) return transitorio.result;
      if (attempt === 0) await delay(RETRY_DELAY_MS);
    }
    throw new AppError('No se pudo consultar Croma RUES.', 502, 'CROMA_ERROR');
  }

  private async intento(
    documentNumber: string,
  ): Promise<{ result: RuesResult | null; retry: boolean }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${this.apiUrl}${RUES_PATH}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document_number: documentNumber }),
        signal: controller.signal,
      });

      if (response.status === 429 || response.status >= 500) {
        return { result: null, retry: true };
      }
      if (!response.ok) {
        throw new AppError(`Croma RUES respondió ${response.status}`, 502, 'CROMA_ERROR');
      }

      const body = (await response.json()) as CromaEnvelope;
      return { result: body.data ?? null, retry: false };
    } catch (error) {
      if (error instanceof AppError) throw error;
      return { result: null, retry: true };
    } finally {
      clearTimeout(timeout);
    }
  }
}
