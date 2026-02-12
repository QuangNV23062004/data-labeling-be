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
import { Roles } from 'src/decorators';
import { Role } from '../account/enums/role.enum';
import { ReviewErrorTypeService } from './review-error-type.service';
import { FilterReviewErrorTypeQueryDto } from './dtos/filter-review-error-type-query.dto';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { CreateReviewErrorTypeDto } from './dtos/create-review-error-type.dto';
import { UpdateReviewErrorTypeDto } from './dtos/update-review-error-type.dto';

@ApiTags('Review Error Types')
@ApiBearerAuth()
@Controller('review-error-types')
export class ReviewErrorTypeController {
  constructor(
    private readonly reviewErrorTypeService: ReviewErrorTypeService,
  ) {}

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get()
  @ApiOperation({
    summary: 'Get paginated list of review error types',
    description:
      'Retrieves a paginated list of review error types with optional filtering. Accessible by all authenticated users.',
  })
  @ApiQuery({
    name: 'includeDeleted',
    description: 'Include soft-deleted review error types',
    type: 'boolean',
    required: false,
    example: false,
  })
  @ApiOkResponse({
    description: 'Paginated list of review error types retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              severity: {
                type: 'string',
                enum: ['negligible', 'minor', 'moderate', 'major', 'critical'],
              },
              scoreImpact: { type: 'number' },
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
  async FindPaginated(
    @Query() query: FilterReviewErrorTypeQueryDto,
    @Query('includeDeleted') includeDeleted = false,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.reviewErrorTypeService.FindPaginated(
      query,
      includeDeleted,
      req.accountInfo,
    );
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get('all')
  @ApiOperation({
    summary: 'Get all review error types',
    description:
      'Retrieves all review error types with optional filtering (no pagination). Accessible by all authenticated users.',
  })
  @ApiQuery({
    name: 'includeDeleted',
    description: 'Include soft-deleted review error types',
    type: 'boolean',
    required: false,
    example: false,
  })
  @ApiOkResponse({
    description: 'List of all review error types retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          severity: {
            type: 'string',
            enum: ['negligible', 'minor', 'moderate', 'major', 'critical'],
          },
          scoreImpact: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async FindAll(
    @Query() query: FilterReviewErrorTypeQueryDto,

    @Query('includeDeleted') includeDeleted = false,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.reviewErrorTypeService.FindAll(
      query,
      includeDeleted,
      req.accountInfo,
    );
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get(':id')
  @ApiOperation({
    summary: 'Get review error type by ID',
    description:
      'Retrieves a specific review error type by its ID. Accessible by all authenticated users.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review error type ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'includeDeleted',
    description: 'Include soft-deleted review error types',
    type: 'boolean',
    required: false,
    example: false,
  })
  @ApiOkResponse({
    description: 'Review error type retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        severity: {
          type: 'string',
          enum: ['negligible', 'minor', 'moderate', 'major', 'critical'],
        },
        scoreImpact: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        deletedAt: { type: 'string', format: 'date-time', nullable: true },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiNotFoundResponse({ description: 'Review error type not found' })
  async FindById(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted = false,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.reviewErrorTypeService.FindById(
      id,
      includeDeleted,
      req.accountInfo,
    );
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.REVIEWER)
  @ApiOperation({
    summary: 'Create a new review error type',
    description:
      'Creates a new review error type that can be used to categorize review errors. Only admins, managers, and reviewers can perform this action.',
  })
  @ApiBody({
    type: CreateReviewErrorTypeDto,
    description: 'Review error type data to create',
  })
  @ApiCreatedResponse({
    description: 'Review error type created successfully',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: 'Review error type ID',
        },
        name: { type: 'string', description: 'Error type name' },
        description: {
          type: 'string',
          description: 'Error type description',
          nullable: true,
        },
        severity: {
          type: 'string',
          enum: ['negligible', 'minor', 'moderate', 'major', 'critical'],
          description: 'Error severity level',
        },
        scoreImpact: { type: 'number', description: 'Impact on review score' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({
    description:
      'Insufficient permissions. Admin, manager, or reviewer role required',
  })
  async Create(
    @Body() dto: CreateReviewErrorTypeDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.reviewErrorTypeService.Create(dto, req.accountInfo);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.REVIEWER)
  @ApiOperation({
    summary: 'Update a review error type',
    description:
      'Updates an existing review error type. Only admins, managers, and reviewers can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review error type ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateReviewErrorTypeDto,
    description: 'Review error type data to update',
  })
  @ApiOkResponse({
    description: 'Review error type updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: 'Review error type ID',
        },
        name: { type: 'string', description: 'Error type name' },
        description: {
          type: 'string',
          description: 'Error type description',
          nullable: true,
        },
        severity: {
          type: 'string',
          enum: ['negligible', 'minor', 'moderate', 'major', 'critical'],
          description: 'Error severity level',
        },
        scoreImpact: { type: 'number', description: 'Impact on review score' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({
    description:
      'Insufficient permissions. Admin, manager, or reviewer role required',
  })
  @ApiNotFoundResponse({ description: 'Review error type not found' })
  async Update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewErrorTypeDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.reviewErrorTypeService.Update(id, dto, req.accountInfo);
  }

  @Patch('restore/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Restore a soft-deleted review error type',
    description:
      'Restores a previously soft-deleted review error type. Only admins can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review error type ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Review error type restored successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions. Admin role required',
  })
  @ApiNotFoundResponse({
    description: 'Review error type not found or not soft-deleted',
  })
  async Restore(@Param('id') id: string, @Req() req: IAuthenticatedRequest) {
    return await this.reviewErrorTypeService.Restore(id, req.accountInfo);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.REVIEWER)
  @ApiOperation({
    summary: 'Delete a review error type',
    description:
      'Deletes a review error type. Supports both soft delete (default) and hard delete. Only admins, managers, and reviewers can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'Review error type ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'type',
    description: 'Type of deletion',
    enum: ['soft', 'hard'],
    required: false,
    example: 'soft',
  })
  @ApiOkResponse({ description: 'Review error type deleted successfully' })
  @ApiBadRequestResponse({ description: 'Invalid deletion type' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({
    description:
      'Insufficient permissions. Admin, manager, or reviewer role required',
  })
  @ApiNotFoundResponse({ description: 'Review error type not found' })
  async Delete(
    @Param('id') id: string,
    @Req() req: IAuthenticatedRequest,
    @Query('type') type: 'hard' | 'soft' = 'soft',
  ) {
    if (type === 'hard') {
      return await this.reviewErrorTypeService.HardDelete(id, req.accountInfo);
    }
    return await this.reviewErrorTypeService.SoftDelete(id, req.accountInfo);
  }
}
