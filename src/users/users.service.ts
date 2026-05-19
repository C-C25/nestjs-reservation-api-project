import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersEntity } from './entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterAuthDto } from '../auth/dto/auth_register.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly userRepo: Repository<UsersEntity>,
    ) { }

    async findById(id: number) {
        return this.userRepo.findOne({
            where: { id },
        });
    }

    async createUser(dto: RegisterAuthDto) {
        const isEmailExists = await this.userRepo.exists({
            where: { email: dto.email },
        });

        if (isEmailExists) {
            throw new BadRequestException("사용중인 이메일 입니다.");
        };

        const isNicknameExists = await this.userRepo.exists({
            where: { nickname: dto.nickname },
        });

        if (isNicknameExists) {
            throw new BadRequestException("사용중인 닉네임 입니다.");
        };

        const newUser = this.userRepo.create({
            email: dto.email,
            password: dto.password,
            nickname: dto.nickname,
        });

        const saveUser = await this.userRepo.save(newUser);

        return saveUser;
    };

    async findByEmail(email: string) {
        return this.userRepo.findOne({
            where: {
                email
            },
            select: {
                id: true,
                password: true,
                nickname: true,
                email: true,
                createdAt: true,
                role: true,
            }
        });
    }
}
