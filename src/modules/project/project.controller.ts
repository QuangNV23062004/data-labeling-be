import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProjectDto } from './dtos/create-project.dto';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { ProjectService } from './project.service';
import { ProjectEntity } from './project.entity';
import { Role } from '../account/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilterProjectQueryDto } from './dtos/filter-project-query.dto';

@ApiTags('Project')
@ApiBearerAuth()
@Controller('project')
export class ProjectController {
  constructor( private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: 'Create new Project' })
  @ApiBody({ type: CreateProjectDto })
  @UseInterceptors(FileInterceptor('image'))
  @ApiResponse({ status: 201, description: 'Project created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  async Create(@Body() dto: CreateProjectDto, @UploadedFile() image: Express.Multer.File, @Request() req: IAuthenticatedRequest):Promise<ProjectEntity>{
    let userId = req.accountInfo?.sub;
    return await this.projectService.Create(dto, userId!);
  }

  @ApiOperation({ summary: 'Update Project' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({ status: 200, description: 'Project updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch()
  async Update(@Body() dto: UpdateProjectDto):Promise<ProjectEntity>{
    return await this.projectService.Update(dto);
  }

  @ApiOperation({ summary: 'Delete Project' })
  @ApiResponse({ status: 200, description: 'Project deleted' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(":id")
  async Delete(@Param('id') id: string):Promise<void>{
    return await this.projectService.Delete(id);
  }

  @ApiOperation({ summary: 'Get Paginated Projects (Manager Only)' })
  @ApiResponse({ status: 200, description: 'Projects retrieved' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Get("manager")  
  async GetPaginated(@Query() query: FilterProjectQueryDto): Promise<ProjectEntity[]> {
    return await this.projectService.GetPaginated(query);
  }

  @ApiOperation({ summary: 'Get Project by Id' })
  @ApiResponse({ status: 200, description: 'Project retrieved' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Get(':id')
  async GetById(@Param('id') id: string, @Query('includeDeleted') includeDeleted: boolean = false):Promise<ProjectEntity | null>{
    return await this.projectService.GetById(id, includeDeleted);
  }
}
