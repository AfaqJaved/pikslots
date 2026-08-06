import { ApiProperty } from '@nestjs/swagger';
import { GetAvailableDatesForBookingInput } from '@pikslots/shared';
import { PikSlotsStringValidation } from 'src/shared/decorators/validations';

export class GetAvailableDatesDto implements GetAvailableDatesForBookingInput {
  @ApiProperty({
    description: 'business id',
    example: 'uuid-x123',
  })
  @PikSlotsStringValidation(1, 100)
  businessId: string;

  @ApiProperty({
    description: 'service Id ',
    example: 'uuid-x123',
  })
  @PikSlotsStringValidation(1, 100)
  serviceId: string;

  @ApiProperty({
    description: 'business time zones',
    example: 'America/newyork',
  })
  @PikSlotsStringValidation(1, 50)
  businessTimezone: string;
}
