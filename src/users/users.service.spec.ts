import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersEntity } from './entities/users.entity';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UsersEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    const id = 1;

    it('아이디로 유저를 조회 한다.', async () => {
      mockRepo.findOne.mockResolvedValue({ id });

      const result = await service.findById(id);

      expect(result).toEqual({ id });
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('findByEmail', () => {
    const email = 'test@email.com';

    it('이메일로 유저를 조회하면 해당 유저 정보를 반환한다.', async () => {
      mockRepo.findOne.mockResolvedValue({ email });

      const result = await service.findByEmail(email);

      expect(result).toEqual({ email });
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { email },
        select: {
          id: true,
          password: true,
          nickname: true,
          email: true,
          createdAt: true,
          role: true,
        },
      });
    });
  });

  describe('createUser', () => {
    const email = 'test@email.com';
    const nickname = 'testNickname';
    const password = 'test123123';

    it('이메일/닉네임 중복이 없으면 정상적으로 회원이 생성된다.', async () => {
      mockRepo.exists.mockResolvedValue(false); // 중복 없음
      mockRepo.create.mockReturnValue({ email, nickname, password });
      mockRepo.save.mockResolvedValue({ id: 1, password, nickname });

      const result = await service.createUser({
        email,
        nickname,
        password,
      });

      expect(result).toEqual({ id: 1, password, nickname });
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('이메일이 이미 존재하면 BadRequestException', async () => {
      mockRepo.exists.mockResolvedValue(true);

      await expect(
        service.createUser({ email, nickname, password }),
      ).rejects.toThrow(BadRequestException);
    });

    it('닉네임이 이미 존재하면 BadRequestException', async () => {
      mockRepo.exists.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

      await expect(
        service.createUser({ email, nickname, password }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
