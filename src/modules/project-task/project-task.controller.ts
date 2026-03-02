import { Controller, Post, Get, Delete, Patch, Body, HttpCode, HttpStatus, Query, Req, UnauthorizedException, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProjectTaskService } from './project-task.service';
import { CreateProjectTaskDto } from './dtos/create-project-task.dto';
import { FilterProjectTaskQueryDto } from './dtos/filter-project-task-query.dto';
import { PatchProjectTaskDto } from './dtos/patch-project-task.dto';
import { ProjectTaskEntity } from './project-task.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '../account/enums/role.enum';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { IAuthenticatedRequest } from 'src/interfaces/request';

@ApiTags('project-tasks')
@Controller('project-tasks')
export class ProjectTaskController {
  constructor(private readonly projectTaskService: ProjectTaskService) {}

  @Post()
  @Roles(Role.MANAGER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new project task',
    description: 'Creates a new project task with the provided project, annotator, and files. The manager (assignedBy) is automatically set from JWT.'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'The project task has been successfully created.',
    type: ProjectTaskEntity,
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data or validation failed.',
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Project, user(s), or file(s) not found.',
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Authentication required.',
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Only admins and managers can create project tasks.',
  })
  async create(
    @Body() createProjectTaskDto: CreateProjectTaskDto,
    @Req() req: IAuthenticatedRequest,
  ): Promise<ProjectTaskEntity> {
    if (!req.accountInfo || !req.accountInfo.sub) {
      throw new UnauthorizedException();
    }
    return this.projectTaskService.create(createProjectTaskDto, req.accountInfo.sub);
  }

  @Get('manager')
  @Roles(Role.MANAGER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'For managers to get all project tasks with pagination and filters',
    description: 'Retrieves all project tasks with optional filters for projectId, status, assignedByUserId, and assignedToUserId. Manager role only.'
  })
  @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], description: 'Sort order (default: DESC)' })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['createdAt', 'updatedAt', 'startedAt', 'completedAt'], description: 'Field to order by' })
  @ApiQuery({ name: 'projectId', required: false, type: 'string', format: 'uuid', description: 'Filter by project ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['assigned', 'in_progress', 'pending_review', 'approved', 'rejected', 'done'], description: 'Filter by task status' })
  @ApiQuery({ name: 'assignedByUserId', required: false, type: 'string', format: 'uuid', description: 'Filter by assigned by user ID (manager)' })
  @ApiQuery({ name: 'assignedToUserId', required: false, type: 'string', format: 'uuid', description: 'Filter by assigned to user ID (annotator)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Project tasks retrieved successfully with pagination.',
    type: PaginationResultDto<ProjectTaskEntity>,
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized - Manager role required.',
  })
  async getAll(@Query() query: FilterProjectTaskQueryDto): Promise<PaginationResultDto<ProjectTaskEntity>> {
    return this.projectTaskService.FindPaginated(query, false);
  }

  @Get('current-user')
  @Roles(Role.ANNOTATOR, Role.REVIEWER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all project tasks assigned to the logged-in user',
    description: 'Retrieves all project tasks assigned to the currently authenticated user with optional filters for projectId, status, and assignedByUserId. Available for annotator and reviewer roles.'
  })
  @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], description: 'Sort order (default: DESC)' })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['createdAt', 'updatedAt', 'startedAt', 'completedAt'], description: 'Field to order by' })
  @ApiQuery({ name: 'projectId', required: false, type: 'string', format: 'uuid', description: 'Filter by project ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['assigned', 'in_progress', 'pending_review', 'approved', 'rejected', 'done'], description: 'Filter by task status' })
  @ApiQuery({ name: 'assignedByUserId', required: false, type: 'string', format: 'uuid', description: 'Filter by assigned by user ID (manager)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Project tasks retrieved successfully with pagination.',
    type: PaginationResultDto<ProjectTaskEntity>,
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized - Annotator or Reviewer role required.',
  })
  async getCurrentUserTasks(
    @Query() query: FilterProjectTaskQueryDto,
    @Req() req: IAuthenticatedRequest,
  ): Promise<PaginationResultDto<ProjectTaskEntity>> {
    if (!req.accountInfo || !req.accountInfo.sub) {
      throw new UnauthorizedException();
    }
    return this.projectTaskService.FindPaginatedForUser(req.accountInfo.sub, query, false);
  }

  @Get(':id')
  @Roles(Role.MANAGER, Role.ANNOTATOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get a project task by ID',
    description: 'Retrieves a specific project task by its ID. Available for managers and annotators.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Project task retrieved successfully.',
    type: ProjectTaskEntity,
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Project task not found.',
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized - Manager or Annotator role required.',
  })
  async getById(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted: boolean = false,
  ): Promise<ProjectTaskEntity> {
    return this.projectTaskService.GetById(id, includeDeleted);
  }

  @Patch(':id')
  @Roles(Role.MANAGER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Partially update a project task',
    description: 'Updates a project task by ID. Can update annotator user, add files, or remove files. All fields are optional. Only admins and managers can patch project tasks.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Project task has been successfully updated.',
    type: ProjectTaskEntity,
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data or file IDs not found.',
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Project task or user not found.',
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Authentication required.',
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Only admins and managers can update project tasks.',
  })
  async update(
    @Param('id') id: string,
    @Body() patchProjectTaskDto: PatchProjectTaskDto,
  ): Promise<ProjectTaskEntity> {
    return this.projectTaskService.Patch(id, patchProjectTaskDto);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete a project task',
    description: 'Soft deletes a project task by setting the deletedAt timestamp. Only admins and managers can delete project tasks.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Project task has been successfully deleted.',
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Project task not found.',
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Authentication required.',
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Only admins and managers can delete project tasks.',
  })
  async delete(
    @Param('id') id: string,
  ): Promise<void> {
    await this.projectTaskService.Delete(id);
  }
}
