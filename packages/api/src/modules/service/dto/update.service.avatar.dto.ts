import { UpdateServiceAvatarInput } from '@pikslots/shared';
import { PikSlotsStringValidation } from 'src/shared/decorators/validations';

export class UpdateServiceAvatarDto implements UpdateServiceAvatarInput {
  @PikSlotsStringValidation(1, 100)
  avatarKey: string;
}
