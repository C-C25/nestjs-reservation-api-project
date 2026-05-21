import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewsEntity } from './entities/reviews.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from '../common/common.service';
import { ReviewsPaginateDto } from './dto/reviews_pagination.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewsDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewsEntity)
    private readonly reviewRepo: Repository<ReviewsEntity>,
    private readonly commonService: CommonService,
  ) {}

  reviewsPaginate(dto: ReviewsPaginateDto) {
    return this.commonService.pagiante(
      dto,
      this.reviewRepo,
      {
        relations: {
          user: true,
          space: true,
        },
      },
      'reviews',
    );
  }

  async creaetReviews(userId: number, spaceId: number, dto: CreateReviewDto) {
    const exstingReviews = await this.reviewRepo.exists({
      where: {
        user: { id: userId },
        space: { id: spaceId },
      },
    });

    if (exstingReviews) {
      throw new BadRequestException('이미 작성한 리뷰 입니다.');
    }

    const review = this.reviewRepo.create({
      ...dto,
      user: { id: userId },
      space: { id: spaceId },
    });

    const newReview = await this.reviewRepo.save(review);

    return newReview;
  }

  async updateReviews(userId: number, reviewId: number, dto: UpdateReviewsDto) {
    const review = await this.reviewRepo.findOne({
      where: {
        user: { id: userId },
        id: reviewId,
      },
    });

    if (!review) {
      throw new NotFoundException('삭제되었거 나 찾을수 없는 리뷰입니다.');
    }

    for (const key of Object.keys(dto)) {
      if (dto[key] !== undefined) {
        review[key] = dto[key];
      }
    }

    const updateReviews = await this.reviewRepo.save(review);

    return updateReviews;
  }

  async removeReview(userId: number, reviewId: number) {
    const review = await this.reviewRepo.findOne({
      where: {
        user: { id: userId },
        id: reviewId,
      },
    });

    if (!review) {
      throw new NotFoundException('삭제되었거 나 찾을수 없는 리뷰입니다.');
    }

    await this.reviewRepo.softDelete(reviewId);

    return reviewId;
  }
}
