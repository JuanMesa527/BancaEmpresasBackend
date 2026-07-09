import { config as loadDotenv } from 'dotenv';
import express from 'express';
import { createApp } from './app.js';
import { env } from './infrastructure/config/env.js';
import { startDeliveryConfirmationScheduler } from './features/delivery-confirmation/infrastructure/scheduler.js';

if (!process.env.VERCEL) {
  loadDotenv();
}

// Vercel detecta Express a través de este entrypoint.
void express;

const app = createApp();

export default app;

if (!process.env.VERCEL) {
  app.listen(env.port, () => {
    console.log(`Banca Empresas API listening on port ${env.port} [${env.nodeEnv}]`);
    startDeliveryConfirmationScheduler();
  });
}
