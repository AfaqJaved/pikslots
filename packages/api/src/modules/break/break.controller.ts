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
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import { SecurityContext } from 'src/shared/security/context/security.context';
import { RolesGuard } from 'src/shared/security/guards/roles.guard';
import { Roles } from 'src/shared/security/guards/roles.decorator';
import { mapBreakError } from './errors/break.errors.map';
import { BREAK_ENDPOINTS } from '@pikslots/shared';
import type {
  CreateBreakResponse,
  UpdateBreakResponse,
  DeleteBreakResponse,
  FindBreakByIdResponse,
  FindBreaksByUserResponse,
} from '@pikslots/shared';
import {
  CreateBreakDocs,
  FindBreaksByUserDocs,
  FindBreakByIdDocs,
  UpdateBreakDocs,
  DeleteBreakDocs,
} from './docs/break.controller.docs';
import { BreakUseCasesFactory } from './factory/break.usecases.factory';
import { CreateBreakDto } from './dto/create.break.dto';
import { UpdateBreakDto } from './dto/update.break.dto';

@ApiTags('Breaks')
@Controller('')
export class BreakController {
  constructor(
    private readonly breakUseCasesFactory: BreakUseCasesFactory,
    private readonly securityContext: SecurityContext,
  ) {}

  @CreateBreakDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Post(BREAK_ENDPOINTS.CREATE)
  async createBreak(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: CreateBreakDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<CreateBreakResponse>
  > {
    const result = await this.breakUseCasesFactory.createBreakUseCase.execute({
      day: dto.day,
      startTime: dto.startTime,
      endTime: dto.endTime,
      userId: dto.userId,
      businessId: dto.businessId,
      createdBy: this.securityContext.userId,
    });

    if (!result.ok) {
      const errorResponse = mapBreakError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.CREATED);
    return new PikslotsBaseResponse<CreateBreakResponse>(
      { message: 'success' },
      HttpStatus.CREATED,
    );
  }

  @FindBreaksByUserDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Get(BREAK_ENDPOINTS.FIND_ALL_BY_USER)
  async findBreaksByUser(
    @Res({ passthrough: true }) res: Response,
    @Param('userId') userId: string,
    @Param('businessId') businessId: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<FindBreaksByUserResponse>
  > {
    const result =
      await this.breakUseCasesFactory.findBreaksByUserUseCase.execute({
        userId,
        businessId,
      });

    if (!result.ok) {
      const errorResponse = mapBreakError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<FindBreaksByUserResponse>(
      result.value.map((b) => ({
        id: b.id,
        day: b.day,
        startTime: b.startTime,
        endTime: b.endTime,
        userId: b.userId,
        businessId: b.businessId,
      })),
      HttpStatus.OK,
    );
  }

  @FindBreakByIdDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Get(BREAK_ENDPOINTS.FIND_BY_ID)
  async findBreakById(
    @Res({ passthrough: true }) res: Response,
    @Param('breakId') breakId: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<FindBreakByIdResponse>
  > {
    const result = await this.breakUseCasesFactory.findBreakByIdUseCase.execute(
      {
        id: breakId,
      },
    );

    if (!result.ok) {
      const errorResponse = mapBreakError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    const b = result.value;
    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<FindBreakByIdResponse>(
      {
        id: b.id,
        day: b.day,
        startTime: b.startTime,
        endTime: b.endTime,
        userId: b.userId,
        businessId: b.businessId,
        createdAt: b.createdAt.toISOString(),
        createdBy: b.createdBy,
        updatedAt: b.updatedAt.toISOString(),
        updatedBy: b.updatedBy,
        deletedAt: b.deletedAt ? b.deletedAt.toISOString() : null,
        deletedBy: b.deletedBy,
        isDeleted: b.isDeleted,
      },
      HttpStatus.OK,
    );
  }

  @UpdateBreakDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Patch(BREAK_ENDPOINTS.UPDATE)
  async updateBreak(
    @Res({ passthrough: true }) res: Response,
    @Param('breakId') breakId: string,
    @Body() dto: UpdateBreakDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<UpdateBreakResponse>
  > {
    const result = await this.breakUseCasesFactory.updateBreakUseCase.execute({
      id: breakId,
      day: dto.day,
      startTime: dto.startTime,
      endTime: dto.endTime,
      updatedBy: this.securityContext.userId,
    });

    if (!result.ok) {
      const errorResponse = mapBreakError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<UpdateBreakResponse>(
      { message: 'success' },
      HttpStatus.OK,
    );
  }

  @DeleteBreakDocs()
  @UseGuards(RolesGuard)
  @Roles('Platform Owner', 'Business Owner', 'Admin', 'Enhanced', 'Standard')
  @Delete(BREAK_ENDPOINTS.DELETE)
  async deleteBreak(
    @Res({ passthrough: true }) res: Response,
    @Param('breakId') breakId: string,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<DeleteBreakResponse>
  > {
    const result = await this.breakUseCasesFactory.deleteBreakUseCase.execute({
      id: breakId,
      deletedBy: this.securityContext.userId,
    });

    if (!result.ok) {
      const errorResponse = mapBreakError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.OK);
    return new PikslotsBaseResponse<DeleteBreakResponse>(
      { message: 'success' },
      HttpStatus.OK,
    );
  }
}
