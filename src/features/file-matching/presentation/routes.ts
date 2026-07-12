import { Router } from 'express';
import { env } from '../../../infrastructure/config/env.js';
import { getSupabaseClient } from '../../../infrastructure/database/supabase.js';
import { SupabasePipelineCaseRepository } from '../../../core/pipeline/infrastructure/supabase-pipeline-case.repository.js';
import { BuildClientesFinalesUseCase } from '../application/build-clientes-finales.use-case.js';
import { EnrichClientesFinalesRuesUseCase } from '../application/enrich-clientes-finales-rues.use-case.js';
import { SupabaseBasePotencialRepository } from '../infrastructure/supabase-base-potencial.repository.js';
import { SupabaseCecRepository } from '../infrastructure/supabase-cec.repository.js';
import { SupabaseClientesFinalesRepository } from '../infrastructure/supabase-clientes-finales.repository.js';
import { SupabasePagaresRepository } from '../infrastructure/supabase-pagares.repository.js';
import { CromaRuesClient } from '../infrastructure/croma-rues.client.js';
import { FileMatchingController } from './controller.js';

export const fileMatchingRouter = Router();

let controller: FileMatchingController | null = null;

function getController(): FileMatchingController {
  if (controller) return controller;

  const supabase = getSupabaseClient();
  const clientesFinalesRepository = new SupabaseClientesFinalesRepository(
    supabase,
    'clientes_finales',
  );
  const clientesFinalesSinPagareRepository = new SupabaseClientesFinalesRepository(
    supabase,
    'clientes_finales_sin_pagare',
  );
  const buildClientesFinales = new BuildClientesFinalesUseCase(
    new SupabaseCecRepository(supabase),
    new SupabaseBasePotencialRepository(supabase),
    new SupabasePagaresRepository(supabase),
    clientesFinalesRepository,
    clientesFinalesSinPagareRepository,
  );

  const enrichClientesFinalesRues = new EnrichClientesFinalesRuesUseCase(
    clientesFinalesRepository,
    new CromaRuesClient(env.croma.apiUrl, env.croma.apiKey),
  );

  controller = new FileMatchingController(
    buildClientesFinales,
    clientesFinalesRepository,
    clientesFinalesSinPagareRepository,
    enrichClientesFinalesRues,
    new SupabasePipelineCaseRepository(supabase),
  );
  return controller;
}

fileMatchingRouter.get('/health', (_req, res) => {
  res.json({
    feature: 'file-matching',
    status: 'ok',
    sources: ['base_potencial', 'cec', 'clientes_potenciales_grabar'],
  });
});

fileMatchingRouter.post('/run', (req, res) => getController().run(req, res));
fileMatchingRouter.post('/enrich-rues', (req, res, next) => {
  getController()
    .enrichRues(req, res)
    .catch(next);
});
fileMatchingRouter.get('/clientes-finales/:clienteId', (req, res, next) => {
  getController()
    .getClienteFinalById(req, res)
    .catch(next);
});
fileMatchingRouter.get('/clientes-finales', (req, res) =>
  getController().listClientesFinales(req, res),
);
fileMatchingRouter.get('/clientes-finales-sin-pagare', (req, res) =>
  getController().listClientesFinalesSinPagare(req, res),
);
