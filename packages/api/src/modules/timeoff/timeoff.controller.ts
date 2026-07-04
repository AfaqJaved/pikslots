import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TimeoffPersistenceMapper } from './mappers/timeoff.database.mapper';
import {
  RegisterTimeoffResponse,
  EditTimeoffResponse,
  TIMEOFF_ENDPOINTS,
  FindTimeoffByIdResponse,
  FindAllTimeoffByUserResponse,
  DeleteTimeoffResponse,
} from '@pikslots/shared';
import { RolesGuard } from 'src/shared/security/guards/roles.guard';
import { Roles } from 'src/shared/security/guards/roles.decorator';
import type { Response } from 'express';
import { RegisterTimeoffDto } from './dto/register.timeoff.dto';
import { EditTimeoffDto } from './dto/edit.timeoff.dto';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import { TimeoffUsecasesFactory } from './factory/timeoff.usecases.factory';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { mapTimeoffError } from './errors/timeoff.error.map';

@Controller('')
export class TimeOffController {
  private timeoffDatabaseMapper = new TimeoffPersistenceMapper();

  constructor(
    private readonly timeoffUseCaseFactory: TimeoffUsecasesFactory,
    private readonly securityContext: SecurityContext,
  ) {}
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Post(TIMEOFF_ENDPOINTS.REGISTER)
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterTimeoffDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<RegisterTimeoffResponse>
  > {
    const result =
      await this.timeoffUseCaseFactory.registerTimeoffUsecase.execute({
        title: dto.title,
        userId: dto.userId,
        businessId: dto.businessId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
        recurrence: dto.recurrence,
      });

    if (!result.ok) {
      const errorResponse = mapTimeoffError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.CREATED);
    return new PikslotsBaseResponse({ message: 'success' }, HttpStatus.CREATED);
  }

  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Get(TIMEOFF_ENDPOINTS.FIND)
  async findById(
    @Res({ passthrough: true }) res: Response,
    @Param('findById') id: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<FindTimeoffByIdResponse>
  > {
    const result =
      await this.timeoffUseCaseFactory.findTImeoffUsecase.execute(id);

    if (!result.ok) {
      const errorResponse = mapTimeoffError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const value = result.value;
    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<FindTimeoffByIdResponse>(
      {
        id: value.id,
        title: value.title,
        userId: value.userId,
        businessId: value.businessId,
        startDate: value.startDate,
        endDate: value.endDate,
        startTime: value.startTime,
        endTime: value.endTime,
        recurrence: value.recurrence,
        createdAt: value.createdAt,
        createdBy: value.createdBy,
        updatedAt: value.updatedAt,
        updatedBy: value.updatedBy,
        deletedAt: value.deletedAt,
        deletedBy: value.deletedBy,
        isDeleted: value.isDeleted,
      },
      HttpStatus.OK,
    );
  }

  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Get(TIMEOFF_ENDPOINTS.FINDALL)
  async findAll(
    @Res({ passthrough: true }) res: Response,
    @Param('userId') userId: string,
    @Param('businessId') businessId: string,
  ): Promise<
    | PikslotsBaseErrorResponse
    | PikslotsBaseResponse<FindAllTimeoffByUserResponse>
  > {
    const result =
      await this.timeoffUseCaseFactory.findAllTimeoffUsecase.execute({
        userId,
        businessId,
      });

    if (!result.ok) {
      const errorResponse = mapTimeoffError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<FindAllTimeoffByUserResponse>(
      result.value?.map((value) => ({
        id: value.id,
        title: value.title,
        userId: value.userId,
        businessId: value.businessId,
        startDate: value.startDate,
        endDate: value.endDate,
        startTime: value.startTime,
        endTime: value.endTime,
        recurrence: value.recurrence,
        createdAt: value.createdAt,
        createdBy: value.createdBy,
        updatedAt: value.updatedAt,
        updatedBy: value.updatedBy,
        deletedAt: value.deletedAt,
        deletedBy: value.deletedBy,
        isDeleted: value.isDeleted,
      })) ?? [],
      HttpStatus.OK,
    );
  }

  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Patch(TIMEOFF_ENDPOINTS.UPDATE)
  async update(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
    @Body() dto: EditTimeoffDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<EditTimeoffResponse>
  > {
    const result = await this.timeoffUseCaseFactory.editTimeoffUsecase.execute({
      id,
      title: dto.title,
      userId: dto.userId,
      businessId: dto.businessId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      recurrence: dto.recurrence,
    });

    if (!result.ok) {
      const errorResponse = mapTimeoffError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse({ message: 'success' }, HttpStatus.OK);
  }

  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Delete(TIMEOFF_ENDPOINTS.DELETE)
  async delete(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<DeleteTimeoffResponse>
  > {
    const result =
      await this.timeoffUseCaseFactory.deleteTimeoffUsecase.execute(id);

    if (!result.ok) {
      const errorResponse = mapTimeoffError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse({ message: 'success' }, HttpStatus.OK);
  }
}
