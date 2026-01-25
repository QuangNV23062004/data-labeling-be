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
import { LabelService } from './label.service';
import { Role } from '../account/enums/role.enum';
import { Roles } from 'src/decorators';
import { CreateLabelDto } from './dtos/create-label.dto';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { UpdateLabelDto } from './dtos/update-label.dto';
import { FilterLabelQueryDto } from './dtos/filter-label-query.dto';

@ApiTags('Labels')
@ApiBearerAuth()
@Controller('labels')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  @ApiOperation({ summary: 'Create a new label' })
  @ApiResponse({
    status: 201,
    description: 'Label created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Label name already exists' })
  async Create(
    @Body() createLabelDto: CreateLabelDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return this.labelService.Create(createLabelDto, req?.accountInfo);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a label' })
  @ApiParam({
    name: 'id',
    description: 'Label UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Label updated successfully' })
  @ApiResponse({ status: 404, description: 'Label not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async Update(
    @Param('id') id: string,
    @Body() updateLabelDto: UpdateLabelDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return this.labelService.Update(id, updateLabelDto, req?.accountInfo);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get()
  @ApiOperation({ summary: 'Get paginated labels' })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft-deleted labels',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of labels',
  })
  async FindPaginated(
    @Query() query: FilterLabelQueryDto,
    @Req() req: IAuthenticatedRequest,
    @Query('includeDeleted') includeDeleted: boolean = false,
  ) {
    return this.labelService.FindPaginated(
      query,
      includeDeleted,
      req?.accountInfo,
    );
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get('all')
  @ApiOperation({ summary: 'Get all labels without pagination' })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft-deleted labels',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all labels',
  })
  async FindAll(
    @Query() query: FilterLabelQueryDto,
    @Req() req: IAuthenticatedRequest,
    @Query('includeDeleted') includeDeleted: boolean = false,
  ) {
    return this.labelService.FindAll(query, includeDeleted, req?.accountInfo);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get(':id')
  @ApiOperation({ summary: 'Get a label by ID' })
  @ApiParam({
    name: 'id',
    description: 'Label UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft-deleted label',
  })
  @ApiResponse({ status: 200, description: 'Label found' })
  @ApiResponse({ status: 404, description: 'Label not found' })
  async FindById(
    @Param('id') id: string,
    @Req() req: IAuthenticatedRequest,
    @Query('includeDeleted') includeDeleted: boolean = false,
  ) {
    return this.labelService.FindById(id, includeDeleted, req?.accountInfo);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore a soft-deleted label' })
  @ApiParam({
    name: 'id',
    description: 'Label UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Label restored successfully' })
  @ApiResponse({ status: 404, description: 'Label not found' })
  async Restore(@Param('id') id: string, @Req() req: IAuthenticatedRequest) {
    return this.labelService.Restore(id, req?.accountInfo);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Delete a label (soft or hard)' })
  @ApiParam({
    name: 'id',
    description: 'Label UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['soft', 'hard'],
    description: 'Type of deletion: soft (default) or hard (permanent)',
  })
  @ApiResponse({ status: 200, description: 'Label deleted successfully' })
  @ApiResponse({ status: 404, description: 'Label not found' })
  async Delete(
    @Param('id') id: string,
    @Query('type') type: 'soft' | 'hard' = 'soft',
    @Req() req: IAuthenticatedRequest,
  ) {
    if (type === 'hard') {
      return this.labelService.HardDelete(id, req?.accountInfo);
    }
    return this.labelService.SoftDelete(id, req?.accountInfo);
  }
}
