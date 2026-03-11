import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { DatasetService } from './dataset.service';
import { ExportRequestDto } from './dtos/export-request.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '../account/enums/role.enum';

@ApiTags('Datasets')
@ApiBearerAuth()
@Controller('datasets')
@UseGuards(AuthGuard, RolesGuard)
export class DatasetController {
  constructor(private readonly datasetService: DatasetService) {}

  @ApiOperation({
    summary: 'Initiate a snapshot export',
    description:
      'Starts a background job that serialises the snapshot into annotations.json and zips it together with all labelled media files. Poll GET /datasets/export/:exportId for status.',
  })
  @ApiParam({ name: 'snapshotId', description: 'ID of the project snapshot to export' })
  @ApiQuery({ name: 'includeFileUrl', required: false, type: Boolean, description: 'Include cloud URL of each sample in annotations.json (default: true)' })
  @ApiQuery({ name: 'includeAnnotatorInfo', required: false, type: Boolean, description: 'Include annotatorId and annotatorEmail per annotation (default: false)' })
  @ApiQuery({ name: 'includeReviewerInfo', required: false, type: Boolean, description: 'Include reviewerId and reviewerEmail per annotation (default: false)' })
  @ApiQuery({ name: 'includeLabelColor', required: false, type: Boolean, description: 'Include hex color on each category entry (default: true)' })
  @ApiResponse({ status: 202, description: 'Export job accepted', schema: { example: { exportId: 'uuid', status: 'PENDING' } } })
  @ApiNotFoundResponse({ description: 'Snapshot not found' })
  @ApiResponse({ status: 400, description: 'Snapshot has no files' })
  @Post('export/:snapshotId')
  @Roles(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.ACCEPTED)
  async InitiateExport(
    @Param('snapshotId') snapshotId: string,
    @Query() config: ExportRequestDto,
  ): Promise<{ exportId: string; status: string }> {
    return this.datasetService.InitiateExport(snapshotId, config);
  }

  @ApiOperation({
    summary: 'Poll export job status',
    description: 'Returns the current status of the export job. Statuses: PENDING | DONE | FAILED.',
  })
  @ApiParam({ name: 'exportId', description: 'Export job ID returned by POST /datasets/export/:snapshotId' })
  @ApiOkResponse({
    description: 'Export job status',
    schema: {
      example: { exportId: 'uuid', status: 'DONE', fileSize: 204800, error: null },
    },
  })
  @ApiNotFoundResponse({ description: 'Export job not found or expired' })
  @Get('export/:exportId')
  @Roles(Role.ADMIN, Role.MANAGER)
  async GetExportStatus(@Param('exportId') exportId: string) {
    return this.datasetService.GetExportStatus(exportId);
  }

  @ApiOperation({
    summary: 'Download completed export as a ZIP',
    description:
      'Streams the zip archive containing annotations.json and all labelled media files under files/. Can only be downloaded once — the dataset is removed after the first download.',
  })
  @ApiParam({ name: 'exportId', description: 'Export job ID' })
  @ApiProduces('application/zip')
  @ApiOkResponse({ description: 'ZIP file download stream' })
  @ApiNotFoundResponse({ description: 'Export job not found or expired' })
  @ApiResponse({ status: 409, description: 'Export not ready (still PENDING/FAILED) or already downloaded' })
  @Get('export/:exportId/download')
  @Roles(Role.ADMIN, Role.MANAGER)
  async DownloadExport(
    @Param('exportId') exportId: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, fileName } = this.datasetService.DownloadExport(exportId);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`,
    );
    res.send(buffer);
  }

  @ApiOperation({
    summary: 'Cancel / discard a single export job',
    description: 'Removes the export job entry and frees memory.',
  })
  @ApiParam({ name: 'exportId', description: 'Export job ID' })
  @ApiNoContentResponse({ description: 'Export job removed' })
  @ApiNotFoundResponse({ description: 'Export job not found or expired' })
  @Delete('export/:exportId')
  @Roles(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async DeleteExport(@Param('exportId') exportId: string): Promise<void> {
    this.datasetService.DeleteExport(exportId);
  }

  @ApiOperation({
    summary: 'Clear all export jobs from memory',
    description: 'Removes every pending, completed, and failed export job, freeing memory.',
  })
  @ApiOkResponse({
    description: 'Number of entries cleared',
    schema: { example: { cleared: 5 } },
  })
  @Delete('export')
  @Roles(Role.ADMIN, Role.MANAGER)
  async ClearAllExports(): Promise<{ cleared: number }> {
    return this.datasetService.ClearAllExports();
  }
}

