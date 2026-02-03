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
  ApiBody,
} from '@nestjs/swagger';
import { FilterLabelChecklistQuestionQueryDto } from './dtos/filter-label-checklist-question-query.dto';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { LabelChecklistQuestionService } from './label-checklist-question.service';
import { Roles } from 'src/decorators';
import { Role } from '../account/enums/role.enum';
import { CreateLabelChecklistQuestionDto } from './dtos/create-label-checklist-question.dto';

@ApiTags('Label Checklist Questions')
@Controller('label-checklist-questions')
export class LabelChecklistQuestionController {
  constructor(
    private readonly labelChecklistQuestionService: LabelChecklistQuestionService,
  ) {}

  @ApiOperation({ summary: 'Get all label checklist questions' })
  @ApiResponse({ status: 200, description: 'List of questions' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @Roles(Role.ADMIN, Role.MANAGER, Role.REVIEWER, Role.ANNOTATOR)
  @Get('all')
  async FindAll(
    @Query() query: FilterLabelChecklistQuestionQueryDto,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() request: IAuthenticatedRequest,
  ) {
    return await this.labelChecklistQuestionService.FindAll(
      query,
      includeDeleted,
      request.accountInfo,
    );
  }

  @ApiOperation({ summary: 'Get paginated label checklist questions' })
  @ApiResponse({ status: 200, description: 'Paginated list of questions' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.REVIEWER, Role.ANNOTATOR)
  async FindPaginated(
    @Query() query: FilterLabelChecklistQuestionQueryDto,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.labelChecklistQuestionService.FindPaginated(
      query,
      includeDeleted,
      request.accountInfo,
    );
  }

  @ApiOperation({ summary: 'Get a label checklist question by ID' })
  @ApiResponse({ status: 200, description: 'Question details' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @Roles(Role.ADMIN, Role.MANAGER, Role.REVIEWER, Role.ANNOTATOR)
  @Get(':id')
  async FindById(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.labelChecklistQuestionService.FindById(
      id,
      includeDeleted,
      request.accountInfo,
    );
  }

  @ApiOperation({ summary: 'Create a new label checklist question' })
  @ApiResponse({ status: 201, description: 'Question created' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiBody({ type: CreateLabelChecklistQuestionDto })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  async Create(
    @Body() createLabelChecklistQuestionDto: CreateLabelChecklistQuestionDto,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.labelChecklistQuestionService.Create(
      createLabelChecklistQuestionDto,
      request.accountInfo,
    );
  }

  @ApiOperation({ summary: 'Update a label checklist question' })
  @ApiResponse({ status: 200, description: 'Question updated' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiBody({ type: CreateLabelChecklistQuestionDto })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  async Update(
    @Param('id') id: string,
    @Body() updateLabelChecklistQuestionDto: CreateLabelChecklistQuestionDto,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.labelChecklistQuestionService.Update(
      id,
      updateLabelChecklistQuestionDto,
      request.accountInfo,
    );
  }

  @ApiOperation({ summary: 'Restore a soft-deleted label checklist question' })
  @ApiResponse({ status: 200, description: 'Question restored' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch('restore/:id')
  async Restore(
    @Param('id') id: string,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.labelChecklistQuestionService.Restore(id, request.accountInfo);
  }

  @ApiOperation({ summary: 'Delete a label checklist question' })
  @ApiResponse({ status: 200, description: 'Question deleted' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiQuery({ name: 'type', required: false, enum: ['soft', 'hard'] })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  async Delete(
    @Param('id') id: string,
    @Req() request: IAuthenticatedRequest,
    @Query('type') type: 'soft' | 'hard' = 'soft',
  ) {
    if (type === 'hard') {
      return this.labelChecklistQuestionService.HardDelete(
        id,
        request.accountInfo,
      );
    }
    return this.labelChecklistQuestionService.SoftDelete(
      id,
      request.accountInfo,
    );
  }
}
