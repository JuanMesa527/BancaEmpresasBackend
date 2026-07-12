import { NotFoundError } from '../../../shared/exceptions/app-error.js';
import type { FollowUpCaseView } from '../domain/entities.js';
import { buildFollowUpView } from '../domain/follow-up-policy.js';
import type { FollowUpCaseRepository } from '../domain/repository.js';

export class RegisterUsageUseCase {
  constructor(
    private readonly repository: FollowUpCaseRepository,
    private readonly dayMs: number,
  ) {}

  async execute(clienteId: string): Promise<FollowUpCaseView> {
    const now = new Date();
    const caso = await this.repository.registerUsage(clienteId, now);
    if (!caso) {
      throw new NotFoundError('Caso de seguimiento no encontrado');
    }
    return buildFollowUpView(caso, now, this.dayMs);
  }
}
