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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { memoryStorage } from 'multer';
import { CreateFileDto } from './dtos/create-file.dto';
import { FileService } from './file.service';
import { Roles } from 'src/decorators';
import { Role } from '../account/enums/role.enum';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { FilterFileQueryDto } from './dtos/filter-file-query.dto';
import { UpdateFileDto } from './dtos/update-file.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('files')
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get('all')
  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({ status: 200, description: 'List of files' })
  @ApiQuery({ type: FilterFileQueryDto })
  async FindAll(
    @Query() query: FilterFileQueryDto,
    @Query('includeDeleted') includeDeleted: boolean,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.fileService.FindAll(
      query,
      includeDeleted,
      request?.accountInfo,
    );
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get()
  @ApiOperation({ summary: 'Get paginated files' })
  @ApiResponse({ status: 200, description: 'Paginated list of files' })
  @ApiQuery({ type: FilterFileQueryDto })
  async FindPaginated(
    @Query() query: FilterFileQueryDto,
    @Query('includeDeleted') includeDeleted: boolean,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.fileService.FindPaginated(
      query,
      includeDeleted,
      request?.accountInfo,
    );
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ status: 200, description: 'File details' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async FindById(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted: boolean,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.fileService.FindById(id, includeDeleted, request?.accountInfo);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 512 * 1024 * 1024 }, //512 mb
    }),
  )
  @ApiOperation({ summary: 'Create a new file' })
  @ApiResponse({ status: 201, description: 'File created' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateFileDto })
  async Create(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    createFileDto: CreateFileDto,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.fileService.Create(file, createFileDto, request?.accountInfo);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(`:id`)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 512 * 1024 * 1024 }, //512 mb
    }),
  )
  @ApiOperation({ summary: 'Update a file' })
  @ApiResponse({ status: 200, description: 'File updated' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateFileDto })
  async Update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    updateFileDto: UpdateFileDto,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.fileService.Update(
      id,
      updateFileDto,
      file,
      request?.accountInfo,
    );
  }

  @Roles(Role.ADMIN)
  @Post('restore/:id')
  @ApiOperation({ summary: 'Restore a deleted file' })
  @ApiResponse({ status: 200, description: 'File restored' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async Restore(
    @Param('id') id: string,
    @Req() request: IAuthenticatedRequest,
  ) {
    return this.fileService.Restore(id, request?.accountInfo);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiQuery({ name: 'type', enum: ['soft', 'hard'], required: false })
  async Delete(
    @Param('id') id: string,
    @Req() request: IAuthenticatedRequest,
    @Query('type') type: 'soft' | 'hard',
  ) {
    if (type === 'hard') {
      return this.fileService.HardDelete(id, request?.accountInfo);
    }
    return this.fileService.SoftDelete(id, request?.accountInfo);
  }
}
