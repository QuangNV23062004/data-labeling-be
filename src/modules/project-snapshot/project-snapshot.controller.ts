import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '../account/enums/role.enum';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { ProjectSnapshotService } from './project-snapshot.service';
import { CreateProjectSnapshotDto } from './dtos/create-project-snapshot.dto';
import { UpdateProjectSnapshotDto } from './dtos/update-project-snapshot.dto';
import { FilterProjectSnapshotQueryDto } from './dtos/filter-project-snapshot-query.dto';
import { ProjectSnapshotEntity } from './project-snapshot.entity';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';

@ApiTags('Project Snapshots')
@ApiBearerAuth()
@Controller('project-snapshots')
export class ProjectSnapshotController {
  constructor(private readonly snapshotService: ProjectSnapshotService) {}

  @ApiOperation({ summary: 'List snapshots for a project (paginated, excludes snapshotData)' })
  @ApiParam({ name: 'projectId', required: true, description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Paginated snapshot list' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Get('project/:projectId')
  async GetSnapshots(
    @Param('projectId') projectId: string,
    @Query() query: FilterProjectSnapshotQueryDto,
  ): Promise<PaginationResultDto<Omit<ProjectSnapshotEntity, 'snapshotData'>>> {
    return this.snapshotService.GetPaginated(projectId, query);
  }

  @ApiOperation({ summary: 'Get a snapshot by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Snapshot ID' })
  @ApiQuery({ name: 'includeData', required: false, type: Boolean, description: 'Include snapshotData in response (default: false)' })
  @ApiResponse({ status: 200, description: 'Snapshot found' })
  @ApiResponse({ status: 404, description: 'Snapshot not found' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Get(':id')
  async GetById(
    @Param('id') id: string,
    @Query('includeData') includeData?: string,
  ): Promise<ProjectSnapshotEntity> {
    return this.snapshotService.GetById(id, includeData === 'true');
  }

  @ApiOperation({ summary: 'Create a project snapshot' })
  @ApiParam({ name: 'projectId', required: true, description: 'Project ID' })
  @ApiBody({ type: CreateProjectSnapshotDto })
  @ApiResponse({ status: 201, description: 'Snapshot created' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Post('project/:projectId')
  async CreateSnapshot(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectSnapshotDto,
    @Request() req: IAuthenticatedRequest,
  ): Promise<ProjectSnapshotEntity> {
    return this.snapshotService.CreateSnapshot(projectId, dto, req.accountInfo!.sub!);
  }

  @ApiOperation({ summary: 'Soft delete a snapshot' })
  @ApiParam({ name: 'id', required: true, description: 'Snapshot ID' })
  @ApiResponse({ status: 204, description: 'Snapshot deleted' })
  @ApiResponse({ status: 404, description: 'Snapshot not found' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async DeleteSnapshot(@Param('id') id: string): Promise<void> {
    return this.snapshotService.DeleteSnapshot(id);
  }

  @ApiOperation({ summary: 'Update snapshot name/description' })
  @ApiParam({ name: 'id', required: true, description: 'Snapshot ID' })
  @ApiBody({ type: UpdateProjectSnapshotDto })
  @ApiResponse({ status: 200, description: 'Snapshot updated' })
  @ApiResponse({ status: 404, description: 'Snapshot not found' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  async UpdateSnapshot(
    @Param('id') id: string,
    @Body() dto: UpdateProjectSnapshotDto,
  ): Promise<Omit<ProjectSnapshotEntity, 'snapshotData'>> {
    return this.snapshotService.UpdateSnapshot(id, dto);
  }
}
