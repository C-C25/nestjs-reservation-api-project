import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsPaginateDto } from './dto/reviews_pagination.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewsDto } from './dto/update-review.dto';
import { IsPublic } from '../common/decorator/is_public.decoreator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Get()
  @IsPublic()
  getReviews(@Query() query: ReviewsPaginateDto) {
    return this.reviewsService.reviewsPaginate(query)
  }

  @Post(":spaceId")
  postRevires(
    @Param("spaceId", ParseIntPipe) id: number,
    @Body() dto: CreateReviewDto,
    @Req() req,
  ) {
    return this.reviewsService.creaetReviews(req.user.id, id, dto);
  }

  @Patch(":reviewsId")
  patchReview(
    @Param("reviewsId", ParseIntPipe) reviewsId: number,
    @Body() dto: UpdateReviewsDto,
    @Req() req,
  ) {
    return this.reviewsService.updateReviews(req.user.id, reviewsId, dto);
  }

  @Delete(":reviewsId")
  deteleReviews(
    @Param("reviewsId", ParseIntPipe) reviewsId: number,
    @Req() req,
  ) {
    return this.reviewsService.removeReview(req.user.id, reviewsId);
  }
}
