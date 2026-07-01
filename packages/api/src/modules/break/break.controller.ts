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
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { BREAK_ENDPOINTS } from '@pikslots/shared';
import { mapBreakError } from './errors/break.errors.map';
import { BreakUsecasesFactory } from './factory/break.usecases.factory';
import { CreateBreakDto } from './dto/create.break.dto';
import { UpdateBreakDto } from './dto/update.break.dto';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import type { BreakSummary } from '@pikslots/shared';
import { BreakResponseMapper } from './mappers/break.response.mapper';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { RolesGuard } from 'src/shared/security/guards/roles.guard';
import { Roles } from 'src/shared/security/guards/roles.decorator';

@ApiTags('Breaks')
@Controller('')
export class BreakController {
  constructor(
    private readonly breakUseCaseFactory: BreakUsecasesFactory,
    private readonly securityContext: SecurityContext,
  ) {}

  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Get(BREAK_ENDPOINTS.GET_USER_BREAKS)
  async getUserBreaks(
    @Param('userId') userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PikslotsBaseErrorResponse | PikslotsBaseResponse<BreakSummary[]>> {
    const result =
      await this.breakUseCaseFactory.findBreaksByUserUseCase.execute(userId);

    if (!result.ok) {
      const errorResponse = mapBreakError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<BreakSummary[]>(
      result.value.map(BreakResponseMapper.toBreakSummary),
      HttpStatus.OK,
    );
  }

  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Get(BREAK_ENDPOINTS.GET_BREAK_BY_ID)
  async getBreakById(
    @Param('breakId') breakId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PikslotsBaseErrorResponse | PikslotsBaseResponse<BreakSummary>> {
    const result =
      await this.breakUseCaseFactory.findBreakByIdUseCase.execute(breakId);

    if (!result.ok) {
      const errorResponse = mapBreakError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<BreakSummary>(
      BreakResponseMapper.toBreakSummary(result.value),
      HttpStatus.OK,
    );
  }

  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Post(BREAK_ENDPOINTS.CREATE_BREAK)
  async createBreak(
    @Param('userId') userId: string,
    @Param('buisnessId') buisnessId: string,
    @Body() dto: CreateBreakDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PikslotsBaseErrorResponse | PikslotsBaseResponse<BreakSummary>> {
    const result = await this.breakUseCaseFactory.createBreakUseCase.execute({
      userId,
      buisnessId,
      day: dto.day,
      startTime: dto.startTime,
      endTime: dto.endTime,
      requestedBy: this.securityContext.userId,
    });

    if (!result.ok) {
      const errorResponse = mapBreakError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.CREATED);
    return new PikslotsBaseResponse<BreakSummary>(
      BreakResponseMapper.toBreakSummary(result.value),
      HttpStatus.CREATED,
    );
  }

  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Patch(BREAK_ENDPOINTS.UPDATE_BREAK)
  async updateBreak(
    @Param('breakId') breakId: string,
    @Body() dto: UpdateBreakDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PikslotsBaseErrorResponse | PikslotsBaseResponse<BreakSummary>> {
    const result = await this.breakUseCaseFactory.updateBreakUseCase.execute({
      breakId,
      startTime: dto.startTime,
      endTime: dto.endTime,
      requesterId: this.securityContext.userId,
      requesterRole: this.securityContext.role,
    });

    if (!result.ok) {
      const errorResponse = mapBreakError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<BreakSummary>(
      BreakResponseMapper.toBreakSummary(result.value),
      HttpStatus.OK,
    );
  }

  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Delete(BREAK_ENDPOINTS.DELETE_BREAK)
  async deleteBreak(
    @Param('breakId') breakId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<{ message: 'success' }>
  > {
    const result = await this.breakUseCaseFactory.deleteBreakUseCase.execute({
      breakId,
      deletedBy: this.securityContext.userId,
      requesterRole: this.securityContext.role,
    });

    if (!result.ok) {
      const errorResponse = mapBreakError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<{ message: 'success' }>(
      { message: 'success' },
      HttpStatus.OK,
    );
  }
}
