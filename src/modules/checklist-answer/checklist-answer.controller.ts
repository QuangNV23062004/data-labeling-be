import {
  Body,
  Controller,
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
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from 'src/decorators';
import { Role } from '../account/enums/role.enum';
import { CreateChecklistAnswerDto } from './dtos/create-checklist-answer.dto';
import { ChecklistAnswerService } from './checklist-answer.service';
import { UpdateChecklistAnswerDto } from './dtos/update-checklist-answer.dto';
import { FilterChecklistAnswerQueryDto } from './dtos/filter-checklist-answer-query.dto';
import { IAuthenticatedRequest } from 'src/interfaces/request';

@ApiTags('Checklist Answers')
@Controller('checklist-answers')
@ApiBearerAuth()
export class ChecklistAnswerController {
  constructor(
    private readonly checklistAnswerService: ChecklistAnswerService,
  ) {}

  @Post()
  @Roles(Role.ANNOTATOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Create a new checklist answer',
    description:
      'Create a new checklist answer for a file label. Annotators can submit initial answers, reviewers can approve/reject.',
  })
  @ApiBody({
    type: CreateChecklistAnswerDto,
    description: 'Checklist answer creation payload',
  })
  @ApiResponse({
    status: 201,
    description: 'Checklist answer created successfully',
    schema: {
      example: {
        id: 'uuid',
        fileLabelId: 'uuid',
        answerData: { answers: [], notes: '' },
        answerType: 'SUBMIT',
        roleType: 'ANNOTATOR',
        labelAttemptNumber: 0,
        createdAt: '2026-02-08T00:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or business rule violation',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async Create(
    @Body() createDto: CreateChecklistAnswerDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.checklistAnswerService.Create(
      createDto,
      req?.accountInfo,
    );
  }

  @Patch(':id')
  @Roles(Role.ANNOTATOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Update a checklist answer',
    description:
      'Update answerData or answerType of an existing checklist answer. Restricted to latest attempt only.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Checklist answer ID',
  })
  @ApiBody({
    type: UpdateChecklistAnswerDto,
    description: 'Checklist answer update payload',
  })
  @ApiResponse({
    status: 200,
    description: 'Checklist answer updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or business rule violation',
  })
  @ApiResponse({
    status: 404,
    description: 'Checklist answer not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Cannot update - answer already approved or not latest attempt',
  })
  async Update(
    @Body() updateDto: UpdateChecklistAnswerDto,
    @Param('id') id: string,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.checklistAnswerService.Update(
      id,
      updateDto,
      req?.accountInfo,
    );
  }

  @Get('all')
  @Roles(Role.ANNOTATOR, Role.REVIEWER, Role.MANAGER, Role.ADMIN)
  @ApiOperation({
    summary: 'Get all checklist answers (non-paginated)',
    description: 'Retrieve all checklist answers matching the filters. Returns complete list without pagination.',
  })
  @ApiQuery({
    name: 'fileLabelId',
    type: 'string',
    format: 'uuid',
    required: false,
    description: 'Filter by file label ID',
  })
  @ApiQuery({
    name: 'labelAttemptNumber',
    type: 'number',
    required: false,
    description: 'Filter by attempt number',
  })
  @ApiQuery({
    name: 'answerType',
    enum: ['SUBMIT', 'RESUBMITED', 'APPROVED', 'REJECTED'],
    required: false,
    description: 'Filter by answer type',
  })
  @ApiQuery({
    name: 'roleType',
    enum: ['ANNOTATOR', 'REVIEWER'],
    required: false,
    description: 'Filter by role type',
  })
  @ApiQuery({
    name: 'answerById',
    type: 'string',
    format: 'uuid',
    required: false,
    description: 'Filter by answerer ID',
  })
  @ApiQuery({
    name: 'includeDeleted',
    type: 'boolean',
    required: false,
    description: 'Include soft-deleted records',
  })
  @ApiResponse({
    status: 200,
    description: 'Checklist answers retrieved successfully',
    isArray: true,
  })
  async FindAll(
    @Query() query: FilterChecklistAnswerQueryDto,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.checklistAnswerService.FindAll(
      query,
      includeDeleted,
      req?.accountInfo,
    );
  }

  @Get()
  @Roles(Role.ANNOTATOR, Role.REVIEWER, Role.MANAGER, Role.ADMIN)
  @ApiOperation({
    summary: 'Get checklist answers (paginated)',
    description: 'Retrieve checklist answers with pagination support',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'fileLabelId',
    type: 'string',
    format: 'uuid',
    required: false,
    description: 'Filter by file label ID',
  })
  @ApiQuery({
    name: 'labelAttemptNumber',
    type: 'number',
    required: false,
    description: 'Filter by attempt number',
  })
  @ApiQuery({
    name: 'answerType',
    enum: ['SUBMIT', 'RESUBMITED', 'APPROVED', 'REJECTED'],
    required: false,
    description: 'Filter by answer type',
  })
  @ApiQuery({
    name: 'roleType',
    enum: ['ANNOTATOR', 'REVIEWER'],
    required: false,
    description: 'Filter by role type',
  })
  @ApiQuery({
    name: 'answerById',
    type: 'string',
    format: 'uuid',
    required: false,
    description: 'Filter by answerer ID',
  })
  @ApiQuery({
    name: 'orderBy',
    enum: ['createdAt', 'updatedAt', 'label_attempt_number'],
    required: false,
    description: 'Order field',
  })
  @ApiQuery({
    name: 'order',
    enum: ['ASC', 'DESC'],
    required: false,
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'includeDeleted',
    type: 'boolean',
    required: false,
    description: 'Include soft-deleted records',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated checklist answers retrieved successfully',
  })
  async FindPaginated(
    @Query() query: FilterChecklistAnswerQueryDto,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.checklistAnswerService.FindPaginated(
      query,
      includeDeleted,
      req?.accountInfo,
    );
  }

  @Get(':id')
  @Roles(Role.ANNOTATOR, Role.REVIEWER, Role.MANAGER, Role.ADMIN)
  @ApiOperation({
    summary: 'Get a checklist answer by ID',
    description: 'Retrieve a specific checklist answer',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Checklist answer ID',
  })
  @ApiQuery({
    name: 'includeDeleted',
    type: 'boolean',
    required: false,
    description: 'Include soft-deleted records',
  })
  @ApiResponse({
    status: 200,
    description: 'Checklist answer retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Checklist answer not found',
  })
  async FindById(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.checklistAnswerService.FindById(
      id,
      includeDeleted,
      req?.accountInfo,
    );
  }

  @Patch('restore/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Restore a soft-deleted checklist answer',
    description: 'Restore a previously soft-deleted checklist answer. Admin only.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Checklist answer ID to restore',
  })
  @ApiResponse({
    status: 200,
    description: 'Checklist answer restored successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Checklist answer not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  async Restore(@Param('id') id: string, @Req() req: IAuthenticatedRequest) {
    return await this.checklistAnswerService.Restore(id, req?.accountInfo);
  }
}
