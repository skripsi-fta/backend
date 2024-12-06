import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/database/entities/appointment.entitity';
import { DataSource, Repository } from 'typeorm';
import { UserDTO } from '../auth/model/auth.dto';
import { CreateAppointmentDTO } from './model/appointment.dto';
import { Patient } from 'src/database/entities/patient.entity';
import { Auth } from 'src/database/entities/auth.entitity';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';
import { Schedule } from 'src/database/entities/schedule.entity';
import { generateQRCode } from 'src/utils/qrcode.utils';
import { LivequeueService } from 'src/module/dashboard/livequeue/livequeue.service';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly dataSource: DataSource,
    private readonly liveQueueService: LivequeueService,
  ) {}

  generateBookingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const getRandomChar = (str: string) =>
      str.charAt(Math.floor(Math.random() * str.length));

    const bookingCode =
      Array.from({ length: 3 }, () => getRandomChar(chars)).join('') +
      Array.from({ length: 2 }, () => getRandomChar(digits)).join('');

    return bookingCode;
  }

  async createAppointment(user: UserDTO, body: CreateAppointmentDTO) {
    const userPatientData = await this.authRepository.findOne({
      where: {
        id: user.id,
      },
      relations: {
        patient: true,
      },
    });

    if (!userPatientData.patient) {
      throw new ResponseError(
        'Data pasien tidak ditemukan',
        StatusCodes.NOT_FOUND,
      );
    }

    const scheduleExist = await this.scheduleRepository.findOne({
      where: { id: body.scheduleId },
    });

    if (!scheduleExist) {
      throw new ResponseError('Jadwal tidak ditemukan', StatusCodes.CONFLICT);
    }

    if (scheduleExist.status !== 'ready') {
      throw new ResponseError('Jadwal tidak tersedia', StatusCodes.CONFLICT);
    }

    const countAppointmentBySchedule = await this.appointmentRepository.count({
      where: { schedule: { id: body.scheduleId } },
    });

    if (countAppointmentBySchedule >= scheduleExist.capacity) {
      throw new ResponseError('Kuota jadwal sudah penuh', StatusCodes.CONFLICT);
    }

    const appointmentExist = await this.appointmentRepository.findOne({
      where: {
        patient: { id: userPatientData.patient.id },
        schedule: { id: body.scheduleId },
      },
    });

    if (appointmentExist) {
      throw new ResponseError(
        'Anda sudah terdaftar di jadwal ini',
        StatusCodes.CONFLICT,
      );
    }

    const bookingCode = this.generateBookingCode();

    const data = {
      bookingCode: bookingCode,
    };

    const bookingQr = await generateQRCode(JSON.stringify(data));

    const appointment = this.appointmentRepository.create({
      bookingCode: bookingCode,
      bookingQr: bookingQr,
      patient: userPatientData.patient,
      schedule: scheduleExist,
    });

    const result = await this.appointmentRepository.save(appointment);

    return result;
  }

  async getListAppointment({
    pageNumber,
    pageSize,
    type,
    user,
  }: {
    pageSize: number;
    pageNumber: number;
    type: string;
    user: UserDTO;
  }) {
    const userPatientData = await this.authRepository.findOne({
      where: {
        id: user.id,
      },
      relations: {
        patient: true,
      },
    });

    if (!userPatientData.patient) {
      throw new ResponseError(
        'Data pasien tidak ditemukan',
        StatusCodes.NOT_FOUND,
      );
    }

    let whereQuery = ' WHERE 1=1 ';

    const whereParams: any[] = [];

    whereQuery += ` AND a.patient_id = $${whereParams.length + 1}`;
    whereParams.push(userPatientData.patient.id);

    if (type === 'mendatang') {
      whereQuery += ` AND NOW() < (s.date + s.end_time::time)`;
    }

    if (type === 'lalu') {
      whereQuery += ` AND NOW() > (s.date + s.end_time::time)`;
    }

    const data = await this.dataSource.query(
      `
        WITH appointment_data AS (
            SELECT
                a.id,
                s.id as "scheduleId",
                s.date,
                s.capacity,
                s.status,
                TO_CHAR(s.start_time, 'HH24:MI') as "startTime",
                TO_CHAR(s.end_time, 'HH24:MI') as "endTime",
                s."type",
                d.id as "doctorId",
                d."name" as "doctorName",
                d.rating as "rating",
                d.total_rating as "totalRating",
                d.consule_price as "consulePrice",
                d.photo_path as "photoPathDoctor",
                s2."name" as "spesialisasiName"
            FROM
                appointment a
            LEFT JOIN schedule s ON s.id = a.schedule_id
            LEFT JOIN doctor d ON d.id = s.doctor_id
            LEFT JOIN specialization s2 ON s2.id = d.id
            ${whereQuery}
            ORDER BY s."date" ASC, s.start_time ASC
        ),
        total_count AS (
            SELECT
                COUNT(*) as total
            FROM
                appointment_data
        )
        SELECT
            appointment_data.*,
            total_count.total
        FROM
            appointment_data, total_count
        LIMIT $${whereParams.length + 1} OFFSET $${whereParams.length + 2}
      `,
      [
        ...whereParams,
        Number(pageSize),
        (Number(pageNumber) - 1) * Number(pageSize),
      ],
    );

    return {
      data: data.map((item) => ({
        ...item,
        total: undefined,
      })),
      currentPage: Number(pageNumber),
      totalPages: Number(Math.ceil((data[0]?.total || 0) / pageSize)),
      totalRows: Number(data[0]?.total || 0),
    };
  }

  async getDetailAppointment(appointmentId: number) {
    const data = (await this.dataSource.query(
      `
        SELECT
            a.id as "appointmentId",
            s.id as "scheduleId",
            a.booking_code as "bookingCode",
            a.appointment_status as "status",
            a.is_check_in as "checkedIn",
            TO_CHAR(a.check_in_time, 'HH24:MI') as "checkInTime",
            TO_CHAR(a.finish_time, 'HH24:MI') as "finishTime",
            a.consultation_fee as "consultationFee",
            a.pharmacy_fee as "pharmacyFee",
            a.notes as "notesDoctor",
            a.rating,
            d.name as "doctorName",
            s2."name" as "spesialisasiName",
            s.date as "scheduleDate",
            TO_CHAR(s.start_time, 'HH24:MI') as "startTime",
            TO_CHAR(s.end_time, 'HH24:MI') as "endTime",
            r."name" as "roomName",
            m.diagnosis_doctor as "diagnosisDoctor",
            m.prescription,
            m.notes as "notesMedicalRecord"
        FROM
            appointment a
        LEFT JOIN medical_record m ON m.id = a.medical_record_id
        LEFT JOIN schedule s ON s.id = a.schedule_id
        LEFT JOIN doctor d ON d.id = s.doctor_id
        LEFT JOIN room r ON r.id = s.room_id
        LEFT JOIN specialization s2 ON s2.id = d.id
        WHERE a.id = $1
      `,
      [appointmentId],
    )) as Array<{ appointmentId: number; scheduleId: number }>;

    if (data.length === 0) {
      throw new ResponseError(
        'Janji temu tidak ditemukan',
        StatusCodes.NOT_FOUND,
      );
    }

    const appointmentData = data[0];

    return { ...appointmentData };
  }

  async getQueueAppointment(appointmentId: number) {
    const cashierQ = await this.liveQueueService.getLiveCashierQueue();

    const pharmacyQ = await this.liveQueueService.getLivePharmacyQueue();
  }
}
