import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';
import { ProjectConfigurationService } from './project-configuration.service';
import { UpdateProjectConfigurationDto } from './dtos/update-project-configuration.dto';
import { ProjectConfigurationEntity } from './project-configuration.entity';
import { Roles } from 'src/decorators';
import { Role } from '../account/enums/role.enum';
import { ApiResponse } from '@nestjs/swagger';

@Controller('project-configuration')
export class ProjectConfigurationController {
  constructor(
    private readonly projectConfigurationService: ProjectConfigurationService,
  ) {}


  @Get(':projectId')
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not Found' }) 
  async getByProjectId(
    @Param('projectId') projectId: string,
  ): Promise<ProjectConfigurationEntity> {
    return this.projectConfigurationService.GetByProjectId(projectId);
  }

  
  @Patch(':projectId')
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async update(
    @Param('projectId') projectId: string,
    @Body() updateProjectConfigurationDto: UpdateProjectConfigurationDto,
  ): Promise<ProjectConfigurationEntity> {
    return this.projectConfigurationService.Update(projectId, updateProjectConfigurationDto);
  }
}
