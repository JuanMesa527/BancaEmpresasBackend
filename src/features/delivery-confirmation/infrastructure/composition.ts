import { env } from '../../../infrastructure/config/env.js';
import { getSupabaseClient } from '../../../infrastructure/database/supabase.js';
import { SupabasePipelineStageAdvancer } from '../../../core/pipeline/application/advance-stage.js';
import type {
  DeliveryConfirmationRepository,
  LeadContactDirectory,
  ManagerDirectory,
} from '../domain/repository.js';
import type { DeliveryEmailSender } from '../domain/email-sender.js';
import type { ConfirmationTokenService } from '../domain/token-service.js';
import type { PipelineStageAdvancer } from '../../../shared/contracts/pipeline.js';
import type { ShipmentScheduler } from '../../../shared/contracts/shipment-scheduler.js';
import {
  SupabaseDeliveryConfirmationRepository,
  ClientesFinalesManagerDirectory,
  ClientesFinalesLeadContactDirectory,
} from './supabase-repository.js';
import { HmacConfirmationTokenService } from './token-service.js';
import { NodemailerGmailEmailSender } from './nodemailer-gmail-email-sender.js';
import { ResendDeliveryEmailSender } from './resend-email-sender.js';
import { DemoShipmentScheduler } from './demo-shipment-scheduler.js';

function createEmailSender(): DeliveryEmailSender {
  if (env.gmail.user && env.gmail.appPassword) {
    return new NodemailerGmailEmailSender(env.gmail.user, env.gmail.appPassword);
  }
  if (env.resend.apiKey && env.resend.fromEmail) {
    return new ResendDeliveryEmailSender(env.resend.apiKey, env.resend.fromEmail);
  }
  throw new Error(
    'Configure GMAIL_USER/GMAIL_APP_PASSWORD or RESEND_API_KEY/RESEND_FROM_EMAIL to send delivery confirmation emails',
  );
}

export interface DeliveryConfirmationDeps {
  repository: DeliveryConfirmationRepository;
  managers: ManagerDirectory;
  leadContacts: LeadContactDirectory;
  emailSender: DeliveryEmailSender;
  tokens: ConfirmationTokenService;
  pipeline: PipelineStageAdvancer;
  dayMs: number;
  frontendConfirmationUrl: string;
}

let deps: DeliveryConfirmationDeps | null = null;

export function getDeliveryConfirmationDeps(): DeliveryConfirmationDeps {
  if (deps) return deps;

  const db = getSupabaseClient();

  deps = {
    repository: new SupabaseDeliveryConfirmationRepository(db),
    managers: new ClientesFinalesManagerDirectory(db),
    leadContacts: new ClientesFinalesLeadContactDirectory(db),
    emailSender: createEmailSender(),
    tokens: new HmacConfirmationTokenService(env.deliveryConfirmation.tokenSecret),
    pipeline: new SupabasePipelineStageAdvancer(db),
    dayMs: env.deliveryConfirmation.dayMs,
    frontendConfirmationUrl: env.deliveryConfirmation.frontendConfirmationUrl,
  };

  return deps;
}

export function getShipmentScheduler(): ShipmentScheduler {
  return new DemoShipmentScheduler(getDeliveryConfirmationDeps);
}
