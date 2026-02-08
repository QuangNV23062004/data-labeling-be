import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProjectInstructionService } from './project-instruction.service';
import { CreateProjectInstructionDto } from './dtos/create-project-instruction.dto';
import { UpdateProjectInstructionDto } from './dtos/update-project-instruction.dto';
import { ProjectInstructionEntity } from './project-instruction.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '../account/enums/role.enum';
import { IAuthenticatedRequest } from 'src/interfaces/request';

@ApiTags('ProjectInstruction')
@ApiBearerAuth()
@Controller('project-instruction')
export class ProjectInstructionController {
  constructor(
    private readonly projectInstructionService: ProjectInstructionService,
  ) {}

  @ApiOperation({ summary: 'Create new Project Instruction' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        content: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, //50 mb
    }),
  )
  @ApiResponse({
    status: 201,
    description: 'Project Instruction created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  async Create(
    @Body() dto: CreateProjectInstructionDto,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<ProjectInstructionEntity> {
    return await this.projectInstructionService.Create(dto, file);
  }

  @ApiOperation({ summary: 'Update Project Instruction' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, //50 mb
    }),
  )
  @ApiResponse({
    status: 200,
    description: 'Project Instruction updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Project Instruction not found' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':projectId')
  async Update(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectInstructionDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProjectInstructionEntity> {
    return await this.projectInstructionService.Update(projectId, dto, file);
  }

  @ApiOperation({ summary: 'Update Project Instruction File' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, //50 mb
    }),
  )
  @ApiResponse({
    status: 200,
    description: 'Project Instruction file updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Project Instruction not found' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':projectId/file')
  async UpdateFile(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<ProjectInstructionEntity> {
    if (!file) 
      throw new BadRequestException('File is required');
    return await this.projectInstructionService.UpdateFile(projectId, file);
  }

  @ApiOperation({ summary: 'Get Project Instruction by Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Project Instruction retrieved successfully',
    type: ProjectInstructionEntity,
  })
  @ApiResponse({ status: 404, description: 'Project Instruction not found' })
  @Get(':projectId')
  async GetByProjectId(
    @Param('projectId') projectId: string,
  ): Promise<ProjectInstructionEntity> {
    return await this.projectInstructionService.GetByProjectId(projectId);
  }

  @ApiOperation({ summary: 'Delete Project Instruction File' })
  @ApiResponse({
    status: 200,
    description: 'Project Instruction file deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Project or Project Instruction not found' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':projectId/file')
  async DeleteFile(
    @Param('projectId') projectId: string,
  ): Promise<void> {
    return await this.projectInstructionService.DeleteFile(projectId);
  }
}
