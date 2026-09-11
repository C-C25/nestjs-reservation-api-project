import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { ReservationStatusEnum } from './const/status.enum.const';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      createReservation: jest.fn(),
      reservationPaginate: jest.fn(),
      updateStatusReservation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [{ provide: ReservationsService, useValue: mockService }],
    })
      .overrideInterceptor(TransactionInterceptor)
      .useValue({ intercept: (context, next) => next.handle() })
      .compile();

    controller = module.get<ReservationsController>(ReservationsController);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  describe('getReservation', () => {
    const query = {
      where__id__more_than: '1',
      order__id: 'DESC',
    };
    const req = { user: { id: 1 } };

    it('데이터가 있으면 값을 가져온다.', async () => {
      mockService.reservationPaginate.mockResolvedValue([]);

      const result = controller.getReservation(query as any, req as any);

      expect(mockService.reservationPaginate).toHaveBeenCalledWith(
        query,
        req.user,
      );
    });
  });

  describe('postReservation', () => {
    /** controller
     * @Param('spaceId', ParseIntPipe) spaceId: number,
     * @Body() dto: CreateReservationDto,
     * @Request() req,
     * @QueryRunner() qr: QR,
     */
    const spaceId = 1;
    const dto = {
      startTime: '2026-10-01T10:00:00Z',
      endTime: '2026-10-01T11:00:00Z',
      content: '테스트 내용',
    };
    const req = { user: { id: 1 } };
    const qr = undefined;

    it('예약이 정상적으로 생성한다.', async () => {
      mockService.createReservation.mockResolvedValue({ user: { id: 1 } });

      const result = controller.postReservations(
        spaceId as any,
        dto as any,
        req as any,
        qr,
      );

      expect(mockService.createReservation).toHaveBeenCalledWith(
        req.user.id,
        spaceId,
        dto,
        qr,
      );
    });
  });

  describe('patchReservation', () => {
    const reservationId = 1;
    const dto = { status: ReservationStatusEnum.CONFIRMED };
    const qr = undefined;

    it('예약 상태를 수정 한다.', async () => {
      mockService.updateStatusReservation.mockResolvedValue({
        reservation: { id: 1 },
      });

      const result = controller.patchReservation(
        reservationId as any,
        dto as any,
        qr,
      );

      expect(mockService.updateStatusReservation).toHaveBeenCalledWith(
        reservationId as any,
        dto,
        qr,
      );
      await expect(result).resolves.toEqual({ reservation: { id: 1 } });
    });
  });
});
