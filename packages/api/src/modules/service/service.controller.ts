import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { RolesGuard } from 'src/shared/security/guards/roles.guard';
import { Roles } from 'src/shared/security/guards/roles.decorator';
import { mapServiceError } from './errors/service.errors.map';
import { RegisterServiceDto } from './dto/register.service.dto';
import { RegisterServiceDocs } from './docs/service.controller.docs';
import { ServiceUseCasesFactory } from './factory/service.usecases.factory';
import { RegisterServiceResponse } from '@pikslots/shared';

@ApiTags('Services')
@Controller('/services')
export class ServiceController {
  constructor(
    private readonly serviceUseCasesFactory: ServiceUseCasesFactory,
    private readonly securityContext: SecurityContext,
  ) {}

  @RegisterServiceDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Post('/')
  async registerService(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterServiceDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<RegisterServiceResponse>
  > {
    const result =
      await this.serviceUseCasesFactory.registerServiceUseCase.execute({
        title: dto.title,
        description: dto.description,
        imagesUrls: dto.imagesUrls,
        durationInMins: dto.durationInMins,
        bufferTimeInMins: dto.bufferTimeInMins,
        cost: dto.cost,
        businessId: this.securityContext.businessId!,
        createdBy: this.securityContext.userId,
      });

    if (!result.ok) {
      const errorResponse = mapServiceError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.CREATED);

    return new PikslotsBaseResponse({ message: 'success' }, HttpStatus.CREATED);
  }
}
