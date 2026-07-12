import express from 'express';
import { createApp } from './create-app.js';
import { env } from './infrastructure/config/env.js';
import { startActivationFollowUpScheduler } from './features/activation-follow-up/infrastructure/scheduler.js';
import { startDeliveryConfirmationScheduler } from './features/delivery-confirmation/infrastructure/scheduler.js';
import { getFollowUpCallService } from './features/sales-calls/infrastructure/composition.js';

void express;

const app = createApp();

export default app;

if (!process.env.VERCEL) {
  app.listen(env.port, () => {
    console.log(`Banca Empresas API listening on port ${env.port} [${env.nodeEnv}]`);
    startDeliveryConfirmationScheduler();
    startActivationFollowUpScheduler(getFollowUpCallService());
  });
}
