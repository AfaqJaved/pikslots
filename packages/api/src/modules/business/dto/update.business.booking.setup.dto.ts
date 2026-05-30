import { ApiProperty } from '@nestjs/swagger';
import type { UpdateBusinessBookingSetupInput } from '@pikslots/shared';
import { IsBoolean } from 'class-validator';

export class UpdateBusinessBookingSetupDto implements UpdateBusinessBookingSetupInput {
  @ApiProperty() @IsBoolean() bookAppointmentSectionVisible: boolean;
  @ApiProperty() @IsBoolean() bookClassSectionVisible: boolean;
  @ApiProperty() @IsBoolean() aboutUsSectionVisible: boolean;
  @ApiProperty() @IsBoolean() ourTeamSectionVisible: boolean;
  @ApiProperty() @IsBoolean() servicesSectionVisible: boolean;
  @ApiProperty() @IsBoolean() classesSectionVisible: boolean;
  @ApiProperty() @IsBoolean() showFirstAvailable: boolean;
  @ApiProperty() @IsBoolean() skipTeamSelection: boolean;
  @ApiProperty() @IsBoolean() allowToBookMultipleServices: boolean;
  @ApiProperty() @IsBoolean() bypassTeamMemberSelection: boolean;
  @ApiProperty() @IsBoolean() customerLoginEnabled: boolean;
  @ApiProperty() @IsBoolean() customerLoginRequired: boolean;
  @ApiProperty() @IsBoolean() hidePikslotsBranding: boolean;
  @ApiProperty() @IsBoolean() accordionView: boolean;
  @ApiProperty() @IsBoolean() allowRescheduling: boolean;
  @ApiProperty() @IsBoolean() allowCancellations: boolean;
  @ApiProperty() @IsBoolean() showBookNewButton: boolean;
  @ApiProperty() @IsBoolean() nameEnabled: boolean;
  @ApiProperty() @IsBoolean() nameRequired: boolean;
  @ApiProperty() @IsBoolean() emailEnabled: boolean;
  @ApiProperty() @IsBoolean() emailRequired: boolean;
  @ApiProperty() @IsBoolean() phoneEnabled: boolean;
  @ApiProperty() @IsBoolean() phoneRequired: boolean;
  @ApiProperty() @IsBoolean() addressEnabled: boolean;
  @ApiProperty() @IsBoolean() addressRequired: boolean;
}
