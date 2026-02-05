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
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProjectDto } from './dtos/create-project.dto';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { ProjectService } from './project.service';
import { ProjectEntity } from './project.entity';
import { Role } from '../account/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilterProjectQueryDto } from './dtos/filter-project-query.dto';
import { memoryStorage } from 'multer';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';

@ApiTags('Project')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: 'Create new Project' })
  @ApiBody({ type: CreateProjectDto })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, //50 mb
    }),
  )
  @ApiResponse({ status: 201, description: 'Project created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  async Create(
    @Body() dto: CreateProjectDto,
    @UploadedFile() image: Express.Multer.File,
    @Request() req: IAuthenticatedRequest,
  ): Promise<ProjectEntity> {
    let userId = req.accountInfo?.sub;
    //TODO: handle image upload later
    return await this.projectService.Create(dto, userId!, image);
  }

  @ApiOperation({ summary: 'Update Project' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiParam({ name: 'id', required: true, description: 'Project Id' })
  @ApiResponse({ status: 200, description: 'Project updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, //50 mb
    }),
  )
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id') //REST API standard
  async Update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<ProjectEntity> {

    return await this.projectService.Update(id, dto, image);
  }

  @ApiOperation({ summary: 'Delete Project' })
  @ApiResponse({ status: 200, description: 'Project deleted' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  @ApiParam({ name: 'id', required: true, description: 'Project Id' })
  async Delete(@Param('id') id: string): Promise<void> {
    return await this.projectService.Delete(id);
  }

  @ApiOperation({ summary: 'Get Paginated Projects (Manager Only)' })
  @ApiResponse({ status: 200, description: 'Projects retrieved' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Get()
  @Get('manager')
  async GetPaginated(
    @Query() query: FilterProjectQueryDto,
    @Req() req: IAuthenticatedRequest,
  ): Promise<PaginationResultDto<ProjectEntity>> {
    return await this.projectService.GetPaginated(query, req?.accountInfo);
  }

  @ApiOperation({ summary: 'Get Project by Id' })
  @ApiResponse({ status: 200, description: 'Project retrieved' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Get(':id')
  async GetById(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() req: IAuthenticatedRequest,
  ): Promise<ProjectEntity | null> {
    return await this.projectService.GetById(
      id,
      includeDeleted,
      req?.accountInfo,
    );
  }
}
