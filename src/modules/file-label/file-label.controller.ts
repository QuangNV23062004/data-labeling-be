import {
  Body,
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CreateFileLabelDto } from './dtos/create-file-label.dto';
import { FileLabelService } from './file-label.service';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { UpdateFileLabelDto } from './dtos/update-file-label.dto';
import { FilterFileLabelQueryDto } from './dtos/filter-file-label-query.dto';
import { Role } from '../account/enums/role.enum';
import { Roles } from 'src/decorators';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AnnotatorSubmitDto } from './dtos/annotator-submit.dto';
import { GeminiSuggestDto } from './dtos/gemini-suggest.dto';

// Admin create and update and delete works for debug purpose, use annotator and reviewer for record in file label from token
@ApiTags('File Labels')
@Controller('file-labels')
export class FileLabelController {
  constructor(private readonly fileLabelService: FileLabelService) {}

  @Roles(Role.ADMIN, Role.ANNOTATOR)
  @Post()
  @ApiOperation({ summary: 'Create a file label' })
  @ApiResponse({ status: 201, description: 'File label created' })
  async Create(
    @Body() createFileLabelDto: CreateFileLabelDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.fileLabelService.Create(
      createFileLabelDto,
      req?.accountInfo,
    );
  }

  @Roles(Role.ADMIN, Role.ANNOTATOR, Role.REVIEWER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a file label' })
  @ApiResponse({ status: 200, description: 'File label updated' })
  @ApiParam({ name: 'id', description: 'File label ID' })
  async Update(
    @Param('id') id: string,
    @Body() updateFileLabelDto: UpdateFileLabelDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.fileLabelService.Update(
      id,
      updateFileLabelDto,
      req?.accountInfo,
    );
  }

  @Roles(Role.ADMIN)
  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore a deleted file label' })
  @ApiResponse({ status: 200, description: 'File label restored' })
  @ApiParam({ name: 'id', description: 'File label ID' })
  async Restore(@Param('id') id: string, @Req() req: IAuthenticatedRequest) {
    return await this.fileLabelService.Restore(id, req?.accountInfo);
  }

  @Roles(Role.ADMIN, Role.ANNOTATOR, Role.REVIEWER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file label' })
  @ApiResponse({ status: 200, description: 'File label deleted' })
  @ApiParam({ name: 'id', description: 'File label ID' })
  @ApiQuery({ name: 'type', enum: ['soft', 'hard'], required: false })
  async Delete(
    @Param('id') id: string,
    @Req() req: IAuthenticatedRequest,
    @Query('type') type?: 'soft' | 'hard',
  ) {
    if (type === 'hard') {
      return await this.fileLabelService.HardDelete(id, req?.accountInfo);
    }
    return await this.fileLabelService.SoftDelete(id, req?.accountInfo);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get('all')
  @ApiOperation({ summary: 'Get all file labels' })
  @ApiResponse({ status: 200, description: 'List of file labels' })
  @ApiQuery({ type: FilterFileLabelQueryDto })
  async FindAll(
    @Query() query: FilterFileLabelQueryDto,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Query('excludeReassigned') excludeReassigned: boolean = true,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.fileLabelService.FindAll(
      query,
      includeDeleted,
      excludeReassigned,
      req?.accountInfo,
    );
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get()
  @ApiOperation({ summary: 'Get paginated file labels' })
  @ApiResponse({ status: 200, description: 'Paginated list of file labels' })
  @ApiQuery({ type: FilterFileLabelQueryDto })
  async FindPaginated(
    @Query() query: FilterFileLabelQueryDto,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Query('excludeReassigned') excludeReassigned: boolean = true,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.fileLabelService.FindPaginated(
      query,
      includeDeleted,
      excludeReassigned,
      req?.accountInfo,
    );
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get(':id')
  @ApiOperation({ summary: 'Get file label by ID' })
  @ApiResponse({ status: 200, description: 'File label details' })
  @ApiParam({ name: 'id', description: 'File label ID' })
  async FindById(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.fileLabelService.FindById(
      id,
      includeDeleted,
      req?.accountInfo,
    );
  }

  @Post('annotator/submit')
  @Roles(Role.ANNOTATOR)
  @ApiOperation({ summary: 'Submit file labels by the annotator' })
  async AnnotatorSubmit(
    @Body() annotatorSubmitDto: AnnotatorSubmitDto,
    @Req() request: IAuthenticatedRequest,
  ) {
    // Implementation for submitting file labels, checklist answer from annotator in a single transaction
    return await this.fileLabelService.AnnotatorSubmit(
      annotatorSubmitDto,
      request?.accountInfo,
    );
  }

  @Post('gemini/suggest')
  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Ask Gemini to suggest a label for a file',
    description:
      'Downloads the file and queries Gemini with all available project labels to determine the best label suggestion.',
  })
  @ApiResponse({
    status: 201,
    description: 'Gemini label suggestion result',
    schema: {
      example: {
        labelId: '123e4567-e89b-12d3-a456-426614174001',
        labelName: 'Cat',
        confidence: 0.95,
        reasoning: 'The image clearly shows a domestic cat.',
      },
    },
  })
  async GeminiSuggest(@Body() dto: GeminiSuggestDto) {
    return this.fileLabelService.GeminiSuggest(dto);
  }
}
