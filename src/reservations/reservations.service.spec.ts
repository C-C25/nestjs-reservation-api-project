import { ReservationsService } from './reservations.service';
import { CommonService } from '../common/common.service';
import { ChatsService } from '../chats/chats.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReservationsEntity } from './entities/reservations.entity';
import { SpacesService } from '../spaces/spaces.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ReservationStatusEnum } from './const/status.enum.const';
import { OptimisticLockVersionMismatchError } from 'typeorm';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let mockRepo: any;
  let mockSpacesService: any;
  let mockChatsService: any;
  let mockCommonService: any;

  beforeEach(async () => {
    mockRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockSpacesService = {
      findOneSpaces: jest.fn(),
    };

    mockChatsService = {
      createChatRoom: jest.fn(),
    };

    mockCommonService = {
      paginate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(ReservationsEntity),
          useValue: mockRepo,
        },
        { provide: SpacesService, useValue: mockSpacesService },
        { provide: ChatsService, useValue: mockChatsService },
        { provide: CommonService, useValue: mockCommonService },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReservation', () => {
    const userId = 1;
    const spaceId = 1;
    const dto = {
      startTime: new Date('2026-09-01T10:00:00Z'),
      endTime: new Date('2026-09-01T11:00:00Z'),
      content: '테스트 예약',
    };

    it('겹치는 예약이 없으면 정상 저장된다.', async () => {
      mockSpacesService.findOneSpaces.mockResolvedValue({ id: spaceId });
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue({
        ...dto,
        user: { id: userId },
        space: { id: spaceId },
      });
      mockRepo.save.mockResolvedValue({ id: 1, ...dto, version: 1 });

      const result = await service.createReservation(
        userId,
        spaceId,
        dto as any,
      );

      expect(result).toEqual({ id: 1, ...dto, version: 1 });
      expect(mockSpacesService.findOneSpaces).toHaveBeenCalledWith(spaceId);
      expect(mockRepo.findOne).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('겹치는 예약이 있으면 BadRequestException', async () => {
      mockSpacesService.findOneSpaces.mockResolvedValue({ id: spaceId });
      mockRepo.findOne.mockResolvedValue({ id: 99, ...dto });

      await expect(
        service.createReservation(userId, spaceId, dto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatusReservation', () => {
    const reservationId = 1;
    const dto = {
      status: ReservationStatusEnum.PENDING,
    };

    it('예약 상태가 정상적으로 변경 되면 저장된다.', async () => {
      const existingReservation = {
        id: reservationId,
        status: ReservationStatusEnum.CONFIRMED,
      };

      mockRepo.findOne.mockResolvedValue(existingReservation);
      mockRepo.save.mockResolvedValue({
        ...existingReservation,
        status: dto.status,
      });

      const result = await service.updateStatusReservation(
        reservationId,
        dto as any,
      );

      expect(result.status).toEqual(dto.status);
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('존재하지 않는 예약을 할경우 NotFoundException', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatusReservation(reservationId, dto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('COMPLETED 상태에서는 변경 할수 없다. BadRequestException', async () => {
      const completedReservation = {
        id: reservationId,
        status: ReservationStatusEnum.COMPLETED,
      };

      mockRepo.findOne.mockResolvedValue(completedReservation);

      await expect(
        service.updateStatusReservation(reservationId, dto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('에약 상태가 CONFIRMED에 따라 Room 이 자동으로 생긴다.', async () => {
      const existingReservation = {
        id: reservationId,
        status: ReservationStatusEnum.PENDING,
      };
      const confirmDto = {
        status: ReservationStatusEnum.CONFIRMED,
      };

      mockRepo.findOne.mockResolvedValue(existingReservation);
      mockRepo.save.mockResolvedValue({
        ...existingReservation,
        status: confirmDto.status,
      });

      await service.updateStatusReservation(reservationId, confirmDto as any);

      expect(mockChatsService.createChatRoom).toHaveBeenCalledWith(
        reservationId,
      );
    });

    it('저장 중 버전 충돌이 발생하면 ConflictException', async () => {
      const fakeVersionError = Object.create(
        OptimisticLockVersionMismatchError.prototype,
      );
      const existingReservation = {
        id: reservationId,
        status: ReservationStatusEnum.PENDING,
      };

      mockRepo.findOne.mockResolvedValue(existingReservation);
      mockRepo.save.mockRejectedValue(fakeVersionError);

      await expect(
        service.updateStatusReservation(reservationId, dto as any),
      ).rejects.toThrow(ConflictException);
    });
  });
});
