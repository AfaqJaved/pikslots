import type { Break } from '@pikslots/domain';
import type { BreakSummary } from '@pikslots/shared';

export class BreakResponseMapper {
  static toBreakSummary(break_: Break): BreakSummary {
    return {
      id: break_.id,
      userId: break_.userId,
      day: break_.day,
      startTime: break_.startTime,
      endTime: break_.endTime,
      createdAt: break_.createdAt.toISOString(),
    };
  }
}
