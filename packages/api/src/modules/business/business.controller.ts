import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { mapBusinessError } from './errors/business.errors.map';
import { RegisterBusinessDto } from './dto/register.business.dto';
import { RegisterBusinessDocs } from './docs/business.controller.docs';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { PikslotsBaseResponse } from 'src/shared/types/base.response';
import type { RegisterBusinessResponse } from '@pikslots/shared';
import { BusinessUseCaseFactory } from './factroy/business.usecases.factory';

@ApiTags('Businesses')
@Controller('/businesses')
export class BusinessController {
  constructor(
    private readonly businessUseCaseFactory: BusinessUseCaseFactory,
  ) {}

  @RegisterBusinessDocs()
  @Post('/register')
  async registerBusiness(
    @Res({ passthrough: true }) res: Response,
    @Body() registerBusinessDto: RegisterBusinessDto,
  ): Promise<
    PikslotsBaseErrorResponse | PikslotsBaseResponse<RegisterBusinessResponse>
  > {
    const result =
      await this.businessUseCaseFactory.registerBusinessUseCase.execute(
        registerBusinessDto,
      );

    if (!result.ok) {
      const errorResponse = mapBusinessError(result.error);
      res.status(errorResponse.statusCode);
      return errorResponse;
    }

    res.status(HttpStatus.CREATED);
    return new PikslotsBaseResponse(result.value, HttpStatus.CREATED);
  }
}
