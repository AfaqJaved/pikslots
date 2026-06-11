import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
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
import { mapServiceGroupError } from './errors/service.group.errors.map';
import { SERVICE_GROUP_ENDPOINTS } from '@pikslots/shared';
import { RegisterServiceGroupDto } from './dto/create.service.group.dto';
import {
  CreateServiceGroupDocs,
  FindAllServiceGroupsByBusinessDocs,
} from './docs/service.group.controller.docs';
import { ServiceGroupUseCasesFactory } from './factory/service.group.usecases.factory';
import type {
  RegisterServiceGroupResponse,
  ServiceGroupResponse,
} from '@pikslots/shared';

@ApiTags('Service Groups')
@Controller('')
export class ServiceGroupController {
  constructor(
    private readonly serviceGroupUseCasesFactory: ServiceGroupUseCasesFactory,
    private readonly securityContext: SecurityContext,
  ) {}

  @CreateServiceGroupDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin')
  @Post(SERVICE_GROUP_ENDPOINTS.REGISTER)
  async registerServiceGroup(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterServiceGroupDto,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<RegisterServiceGroupResponse>
  > {
    const result =
      await this.serviceGroupUseCasesFactory.registerServiceGroupUseCase.execute(
        {
          name: dto.name,
          businessId: dto.businessId,
          associatedServices: dto.associatedServices,
          createdBy: this.securityContext.userId,
        },
      );

    if (!result.ok) {
      const errorResponse = mapServiceGroupError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.CREATED);
    return new PikslotsBaseResponse<RegisterServiceGroupResponse>(
      result.value,
      HttpStatus.CREATED,
    );
  }

  @FindAllServiceGroupsByBusinessDocs()
  @Get(SERVICE_GROUP_ENDPOINTS.FIND_ALL_BY_BUSINESS)
  async findAllByBusiness(
    @Res({ passthrough: true }) res: Response,
    @Param('businessId') businessId: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<ServiceGroupResponse[]>
  > {
    const result =
      await this.serviceGroupUseCasesFactory.findAllServiceGroupsByBusinessUseCase.execute(
        businessId,
      );

    if (!result.ok) {
      const errorResponse = mapServiceGroupError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<ServiceGroupResponse[]>(
      result.value.map((g) => ({
        id: g.id,
        name: g.name,
        businessId: g.businessId,
      })),
      HttpStatus.OK,
    );
  }
}
