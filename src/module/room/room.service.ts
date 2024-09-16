import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Room } from 'src/database/entities/room.entity';
import { RoomPostDTO, RoomPutDTO } from './model/room.dto';
import { ResponseError } from 'src/utils/api.utils';
import { StatusCodes } from 'http-status-codes';

@Injectable()
export class RoomService {
  constructor(
    private log: LoggerService,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async getRoom(
    id: number,
    name: string,
    pageSize: number,
    pageNumber: number,
  ) {
    const [data, count] = await this.roomRepository.findAndCount({
      select: ['id', 'name', 'detail'],
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: {
        id: 'ASC',
      },
      where: {
        id: id ? id : undefined,
        name: name ? ILike(`%${name}%`) : undefined,
      },
    });

    return {
      totalRows: count,
      list: data.map((room) => ({
        id: room.id,
        name: room.name,
        detail: room.detail,
      })),
    };
  }

  async addRoom(data: RoomPostDTO) {
    const roomExist = await this.roomRepository.findOne({
      where: [{ name: data.name }],
    });

    if (roomExist) {
      throw new ResponseError('Room already exist', StatusCodes.BAD_REQUEST);
    }

    const newRoom = this.roomRepository.create(data);
    const result = await this.roomRepository.save(newRoom);
    this.log.info(JSON.stringify(result));
    return {
      id: result.id,
      name: result.name,
      detail: result.detail,
    };
  }

  async updateRoom(data: RoomPutDTO) {
    const room = await this.roomRepository.findOneBy({ id: data.id });

    if (!room) {
      throw new ResponseError('Failed - Room not found', StatusCodes.NOT_FOUND);
    }

    room.name = data.name;
    room.detail = data.detail;

    const result = await this.roomRepository.save(room);
    return {
      id: result.id,
      name: result.name,
      detail: result.detail,
    };
  }

  async deleteRoom(id: number) {
    const room = await this.roomRepository.findOneBy({ id });

    if (!room) {
      throw new ResponseError('Failed - Room not found', StatusCodes.NOT_FOUND);
    }

    return await this.roomRepository.delete({ id });
  }
}
