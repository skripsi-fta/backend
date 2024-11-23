import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import type {
  CheckPatientDTO,
  CreatePatientDTO,
  LinkPatientDTO,
} from './model/patient.dto';
import type { Request, Response } from 'express';
import { PatientService } from './patient.service';
import { sendResponse } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import type { UserDTO } from '../auth/model/auth.dto';

@Controller('')
@UseGuards(JwtAuthGuard)
export class PatientController {
  constructor(private patientService: PatientService) {}

  @Post('check')
  async checkPatient(@Body() body: CheckPatientDTO, @Res() res: Response) {
    const patientData = await this.patientService.checkPatient(body);

    return sendResponse(res, {
      statusCode: StatusCodes.ACCEPTED,
      message: 'Success - Patient found',
      data: patientData,
    });
  }

  @Post('link')
  async linkPatient(
    @Body() body: LinkPatientDTO,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const user = req.user as UserDTO;

    const patientData = await this.patientService.linkPatient(body, user);

    return sendResponse(res, {
      statusCode: StatusCodes.ACCEPTED,
      message: 'Success - Patient Linked',
      data: patientData,
    });
  }

  @Post('create')
  async createPatient(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreatePatientDTO,
  ) {
    const user = req.user as UserDTO;

    const newUserData = await this.patientService.createPatient(body, user);

    return sendResponse(res, {
      statusCode: StatusCodes.ACCEPTED,
      message: 'Success - Patient Created',
      data: newUserData,
    });
  }
}
