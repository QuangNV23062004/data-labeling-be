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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LabelPresetService } from './label-preset.service';
import { CreateLabelPresetDto } from './dtos/create-label-preset.dto';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { Roles } from 'src/decorators';
import { Role } from '../account/enums/role.enum';
import { FilterLabelPresetQueryDto } from './dtos/filter-label-preset-query.dto';
import { UpdateLabelPresetDto } from './dtos/update-label-preset.dto';

@ApiTags('Label Presets')
@ApiBearerAuth()
@Controller('label-presets')
export class LabelPresetController {
  constructor(private readonly labelPresetService: LabelPresetService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new label preset' })
  @ApiResponse({
    status: 201,
    description: 'Label preset created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Label preset name already exists' })
  async Create(
    @Body() labelPresetDto: CreateLabelPresetDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.labelPresetService.Create(
      labelPresetDto,
      req.accountInfo,
    );
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get paginated label presets' })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft-deleted label presets',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of label presets',
  })
  async FindPaginated(
    @Req() req: IAuthenticatedRequest,
    @Query() query: FilterLabelPresetQueryDto,
    @Query('includeDeleted') includeDeleted: boolean = false,
  ) {
    return await this.labelPresetService.FindPaginated(
      query,
      includeDeleted,
      req.accountInfo,
    );
  }

  @Get('all')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get all label presets without pagination' })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft-deleted label presets',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all label presets',
  })
  async FindAll(
    @Req() req: IAuthenticatedRequest,
    @Query() query: FilterLabelPresetQueryDto,
    @Query('includeDeleted') includeDeleted: boolean = false,
  ) {
    return await this.labelPresetService.FindAll(
      query,
      includeDeleted,
      req.accountInfo,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get a label preset by ID' })
  @ApiParam({
    name: 'id',
    description: 'Label preset UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft-deleted label preset',
  })
  @ApiResponse({ status: 200, description: 'Label preset found' })
  @ApiResponse({ status: 404, description: 'Label preset not found' })
  async FindById(
    @Req() req: IAuthenticatedRequest,
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted: boolean = false,
  ) {
    return await this.labelPresetService.FindById(
      id,
      includeDeleted,
      req.accountInfo,
    );
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update a label preset' })
  @ApiParam({
    name: 'id',
    description: 'Label preset UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Label preset updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Label preset not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async Update(
    @Req() req: IAuthenticatedRequest,
    @Param('id') id: string,
    @Body() labelPresetDto: UpdateLabelPresetDto,
  ) {
    return await this.labelPresetService.Update(
      id,
      labelPresetDto,
      req.accountInfo,
    );
  }

  @Patch('restore/:id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Restore a soft-deleted label preset' })
  @ApiParam({
    name: 'id',
    description: 'Label preset UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Label preset restored successfully',
  })
  @ApiResponse({ status: 404, description: 'Label preset not found' })
  async Restore(@Req() req: IAuthenticatedRequest, @Param('id') id: string) {
    return await this.labelPresetService.Restore(id, req.accountInfo);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Delete a label preset (soft or hard)' })
  @ApiParam({
    name: 'id',
    description: 'Label preset UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['soft', 'hard'],
    description: 'Type of deletion: soft (default) or hard (permanent)',
  })
  @ApiResponse({
    status: 200,
    description: 'Label preset deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Label preset not found' })
  async SoftDelete(
    @Req() req: IAuthenticatedRequest,
    @Query('type') type: 'hard' | 'soft',
    @Param('id') id: string,
  ) {
    if (type === 'hard') {
      return await this.labelPresetService.HardDelete(id, req.accountInfo);
    }
    return await this.labelPresetService.SoftDelete(id, req.accountInfo);
  }
}
