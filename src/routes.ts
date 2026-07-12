import type { Express } from 'express';
import { pipelineRouter } from './core/pipeline/presentation/routes.js';
import { getDeliveryFollowUpFinalizer } from './features/activation-follow-up/infrastructure/composition.js';
import { createActivationFollowUpRouter } from './features/activation-follow-up/presentation/routes.js';
import { createDeliveryConfirmationRouter } from './features/delivery-confirmation/presentation/routes.js';
import { getShipmentScheduler } from './features/delivery-confirmation/infrastructure/composition.js';
import { fileMatchingRouter } from './features/file-matching/presentation/routes.js';
import { createPowerAppsRouter } from './features/power-apps/presentation/routes.js';
import { getFollowUpCallService } from './features/sales-calls/infrastructure/composition.js';
import { salesCallsRouter } from './features/sales-calls/presentation/routes.js';

export function registerFeatureRoutes(app: Express): void {
  app.use('/api/pipeline', pipelineRouter);
  app.use('/api/file-matching', fileMatchingRouter);
  app.use('/api/sales-calls', salesCallsRouter);
  const followUpCalls = getFollowUpCallService();
  app.use('/api/power-apps', createPowerAppsRouter(getShipmentScheduler()));
  app.use(
    '/api/delivery-confirmation',
    createDeliveryConfirmationRouter(getDeliveryFollowUpFinalizer(followUpCalls)),
  );
  app.use('/api/activation-follow-up', createActivationFollowUpRouter(followUpCalls));
}
