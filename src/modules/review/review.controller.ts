import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { Role } from '../account/enums/role.enum';
import { Roles } from 'src/decorators';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { FilterReviewQueryDto } from './dtos/filter-review-query.dto';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @Roles(Role.REVIEWER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async Create(
    @Body() createReviewDto: CreateReviewDto,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.reviewService.Create(createReviewDto, request.accountInfo);
  }

  @Patch(':id')
  @Roles(Role.REVIEWER, Role.ADMIN)
  @ApiOperation({ summary: 'Update an existing review' })
  @ApiParam({
    name: 'id',
    description: 'Review ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async Update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.reviewService.Update(id, updateReviewDto, request?.accountInfo);
  }

  @Patch('restore/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted review' })
  @ApiParam({
    name: 'id',
    description: 'Review ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Review restored successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async Restore(
    @Param('id') id: string,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.reviewService.Restore(id, request?.accountInfo);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.REVIEWER)
  @ApiOperation({ summary: 'Delete a review (soft or hard delete)' })
  @ApiParam({
    name: 'id',
    description: 'Review ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'type',
    description: 'Delete type: soft (default) or hard permanent deletion',
    enum: ['soft', 'hard'],
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async Delete(
    @Param('id') id: string,
    @Query('type') type: 'soft' | 'hard' = 'soft',
    @Req() request: IAuthenticatedRequest,
  ) {
    if (type === 'hard') {
      return this.reviewService.HardDelete(id, request?.accountInfo);
    }
    return this.reviewService.SoftDelete(id, request?.accountInfo);
  }

  @Get()
  @Roles(Role.REVIEWER, Role.ADMIN, Role.MANAGER, Role.ANNOTATOR)
  @ApiOperation({ summary: 'Get paginated reviews' })
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({
    name: 'includeDeleted',
    description: 'Include soft-deleted reviews',
    required: false,
    type: 'boolean',
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async FindPaginated(
    @Query() query: FilterReviewQueryDto,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.reviewService.FindPaginated(
      query,
      includeDeleted,
      request?.accountInfo,
    );
  }

  @Get('all')
  @Roles(Role.REVIEWER, Role.ADMIN, Role.MANAGER, Role.ANNOTATOR)
  @ApiOperation({ summary: 'Get all reviews without pagination' })
  @ApiQuery({
    name: 'includeDeleted',
    description: 'Include soft-deleted reviews',
    required: false,
    type: 'boolean',
  })
  @ApiResponse({
    status: 200,
    description: 'All reviews retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async FindAll(
    @Query() query: FilterReviewQueryDto,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.reviewService.FindAll(
      query,
      includeDeleted,
      request?.accountInfo,
    );
  }

  @Get(':id')
  @Roles(Role.REVIEWER, Role.ADMIN, Role.MANAGER, Role.ANNOTATOR)
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiParam({
    name: 'id',
    description: 'Review ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'includeDeleted',
    description: 'Include soft-deleted reviews',
    required: false,
    type: 'boolean',
  })
  @ApiResponse({
    status: 200,
    description: 'Review retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async FindById(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.reviewService.FindById(
      id,
      includeDeleted,
      request?.accountInfo,
    );
  }
}
