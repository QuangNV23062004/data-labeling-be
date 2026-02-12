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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ReviewErrorService } from './review-error.service';
import { Role } from '../account/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateReviewErrorDto } from './dtos/create-review-error.dto';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { FilterReviewErrorQueryDto } from './dtos/filter-review-error-query.dto';
import { UpdateReviewErrorDto } from './dtos/update-review-error.dto';

@ApiTags('Review Errors')
@ApiBearerAuth()
@Controller('review-errors')
export class ReviewErrorController {
  constructor(private readonly reviewErrorService: ReviewErrorService) {}

  @Post()
  @Roles(Role.ADMIN, Role.REVIEWER)
  @ApiOperation({
    summary: 'Create a new review error',
    description:
      'Creates a new review error associated with a specific review and error type. Only admins and reviewers can perform this action.',
  })
  @ApiBody({
    type: CreateReviewErrorDto,
    description: 'Review error data to create',
  })
  @ApiCreatedResponse({
    description: 'Review error created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'Review error ID' },
        reviewId: {
          type: 'string',
          format: 'uuid',
          description: 'Associated review ID',
        },
        reviewErrorTypeId: {
          type: 'string',
          format: 'uuid',
          description: 'Review error type ID',
        },
        errorLocation: {
          type: 'object',
          description: 'Location of the error (JSON object)',
        },
        description: { type: 'string', description: 'Error description' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or review not mutable',
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions. Admin or reviewer role required',
  })
  @ApiNotFoundResponse({ description: 'Review or review error type not found' })
  async Create(
    @Body() createReviewErrorDto: CreateReviewErrorDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return this.reviewErrorService.Create(
      createReviewErrorDto,
      req?.accountInfo,
    );
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.REVIEWER)
  @ApiOperation({
    summary: 'Update a review error',
    description:
      'Updates an existing review error. Only admins and reviewers can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review error ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateReviewErrorDto,
    description: 'Review error data to update',
  })
  @ApiOkResponse({
    description: 'Review error updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'Review error ID' },
        reviewId: {
          type: 'string',
          format: 'uuid',
          description: 'Associated review ID',
        },
        reviewErrorTypeId: {
          type: 'string',
          format: 'uuid',
          description: 'Review error type ID',
        },
        errorLocation: {
          type: 'object',
          description: 'Location of the error (JSON object)',
        },
        description: { type: 'string', description: 'Error description' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions. Admin or reviewer role required',
  })
  @ApiNotFoundResponse({ description: 'Review error not found' })
  async Update(
    @Param('id') id: string,
    @Body() updateReviewErrorDto: UpdateReviewErrorDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return this.reviewErrorService.Update(
      id,
      updateReviewErrorDto,
      req?.accountInfo,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.REVIEWER)
  @ApiOperation({
    summary: 'Delete a review error',
    description:
      'Deletes a review error. Supports both soft delete (default) and hard delete. Only admins and reviewers can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review error ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'type',
    description: 'Type of deletion',
    enum: ['soft', 'hard'],
    required: true,
    example: 'soft',
  })
  @ApiOkResponse({ description: 'Review error deleted successfully' })
  @ApiBadRequestResponse({ description: 'Invalid deletion type' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions. Admin or reviewer role required',
  })
  @ApiNotFoundResponse({ description: 'Review error not found' })
  async Delete(
    @Param('id') id: string,
    @Query('type') type: 'soft' | 'hard',
    @Req() req: IAuthenticatedRequest,
  ) {
    if (type === 'hard') {
      return this.reviewErrorService.HardDelete(id, req?.accountInfo);
    }
    return this.reviewErrorService.SoftDelete(id, req?.accountInfo);
  }

  @Patch('restore/:id')
  @Roles(Role.ADMIN, Role.REVIEWER)
  @ApiOperation({
    summary: 'Restore a soft-deleted review error',
    description:
      'Restores a previously soft-deleted review error. Only admins and reviewers can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review error ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Review error restored successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions. Admin or reviewer role required',
  })
  @ApiNotFoundResponse({
    description: 'Review error not found or not soft-deleted',
  })
  async Restore(@Param('id') id: string, @Req() req: IAuthenticatedRequest) {
    return this.reviewErrorService.Restore(id, req?.accountInfo);
  }

  @Get()
  @Roles(Role.ADMIN, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get paginated list of review errors',
    description:
      'Retrieves a paginated list of review errors with optional filtering. Only admins and reviewers can access this endpoint.',
  })
  @ApiQuery({
    name: 'includeDeleted',
    description: 'Include soft-deleted review errors',
    type: 'boolean',
    required: false,
    example: false,
  })
  @ApiOkResponse({
    description: 'Paginated list of review errors retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              reviewId: { type: 'string', format: 'uuid' },
              reviewErrorTypeId: { type: 'string', format: 'uuid' },
              errorLocation: { type: 'object' },
              description: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
              },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions. Admin or reviewer role required',
  })
  async FindPaginated(
    @Req() req: IAuthenticatedRequest,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Query() query: FilterReviewErrorQueryDto,
  ) {
    return this.reviewErrorService.FindPaginated(
      query,
      includeDeleted,
      req?.accountInfo,
    );
  }

  @Get('all')
  @Roles(Role.ADMIN, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get all review errors',
    description:
      'Retrieves all review errors with optional filtering (no pagination). Only admins and reviewers can access this endpoint.',
  })
  @ApiQuery({
    name: 'includeDeleted',
    description: 'Include soft-deleted review errors',
    type: 'boolean',
    required: false,
    example: false,
  })
  @ApiOkResponse({
    description: 'List of all review errors retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          reviewId: { type: 'string', format: 'uuid' },
          reviewErrorTypeId: { type: 'string', format: 'uuid' },
          errorLocation: { type: 'object' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions. Admin or reviewer role required',
  })
  async FindAll(
    @Req() req: IAuthenticatedRequest,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Query() query: FilterReviewErrorQueryDto,
  ) {
    return this.reviewErrorService.FindAll(
      query,
      includeDeleted,
      req?.accountInfo,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get review error by ID',
    description:
      'Retrieves a specific review error by its ID. Only admins and reviewers can access this endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review error ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'includeDeleted',
    description: 'Include soft-deleted review errors',
    type: 'boolean',
    required: false,
    example: false,
  })
  @ApiOkResponse({
    description: 'Review error retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'Review error ID' },
        reviewId: {
          type: 'string',
          format: 'uuid',
          description: 'Associated review ID',
        },
        reviewErrorTypeId: {
          type: 'string',
          format: 'uuid',
          description: 'Review error type ID',
        },
        errorLocation: {
          type: 'object',
          description: 'Location of the error (JSON object)',
        },
        description: { type: 'string', description: 'Error description' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        deletedAt: { type: 'string', format: 'date-time', nullable: true },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions. Admin or reviewer role required',
  })
  @ApiNotFoundResponse({ description: 'Review error not found' })
  async FindById(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() req: IAuthenticatedRequest,
  ) {
    return this.reviewErrorService.FindById(
      id,
      includeDeleted,
      req?.accountInfo,
    );
  }
}
