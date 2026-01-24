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
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LabelCategoryService } from './label-category.service';
import { CreateLabelCategoryDto } from './dtos/create-label-category.dto';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { FilterLabelCategoryDto } from './dtos/filter-label-category.dto';
import { Roles } from 'src/decorators';
import { Role } from '../account/enums/role.enum';

@ApiTags('Label Categories')
@ApiBearerAuth()
@Controller('label-categories')
export class LabelCategoryController {
  constructor(private readonly labelCategoryService: LabelCategoryService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new label category' })
  @ApiBody({ type: CreateLabelCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Label category created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async Create(
    @Body() createLabelCategoryDto: CreateLabelCategoryDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.labelCategoryService.Create(
      createLabelCategoryDto,
      req.accountInfo,
    );
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update an existing label category' })
  @ApiParam({ name: 'id', description: 'Label category ID' })
  @ApiBody({ type: CreateLabelCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Label category updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Label category not found' })
  async Update(
    @Param('id') id: string,
    @Body() updateLabelCategoryDto: CreateLabelCategoryDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.labelCategoryService.Update(
      id,
      updateLabelCategoryDto,
      req?.accountInfo,
    );
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @ApiOperation({ summary: 'Get paginated list of label categories' })
  @ApiQuery({ type: FilterLabelCategoryDto })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft deleted categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of label categories',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async FindPaginated(
    @Req() req: IAuthenticatedRequest,
    @Query() query: FilterLabelCategoryDto,
    @Query('includeDeleted') includeDeleted?: boolean,
  ) {
    return await this.labelCategoryService.FindPaginated(
      query,
      includeDeleted,
      req?.accountInfo,
    );
  }

  @Get('all')
  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @ApiOperation({ summary: 'Get all label categories (non-paginated)' })
  @ApiQuery({ type: FilterLabelCategoryDto })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft deleted categories',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all label categories',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async FindAll(
    @Req() req: IAuthenticatedRequest,
    @Query() query: FilterLabelCategoryDto,
    @Query('includeDeleted') includeDeleted?: boolean,
  ) {
    return await this.labelCategoryService.FindAll(
      query,
      includeDeleted,
      req?.accountInfo,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @ApiOperation({ summary: 'Get a label category by ID' })
  @ApiParam({ name: 'id', description: 'Label category ID' })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft deleted categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Label category details',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Label category not found' })
  async FindById(
    @Param('id') id: string,
    @Req() req: IAuthenticatedRequest,
    @Query('includeDeleted') includeDeleted?: boolean,
  ) {
    return await this.labelCategoryService.FindById(
      id,
      includeDeleted,
      req?.accountInfo,
    );
  }

  @Patch('restore/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restore a soft deleted label category' })
  @ApiParam({ name: 'id', description: 'Label category ID to restore' })
  @ApiResponse({
    status: 200,
    description: 'Label category restored successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Label category not found' })
  async Restore(@Param('id') id: string, @Req() req: IAuthenticatedRequest) {
    return await this.labelCategoryService.Restore(id, req.accountInfo);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Delete a label category (soft or hard delete)' })
  @ApiParam({ name: 'id', description: 'Label category ID to delete' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['soft', 'hard'],
    description: 'Delete type - soft (default) or hard',
  })
  @ApiResponse({
    status: 200,
    description: 'Label category deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Label category not found' })
  async Delete(
    @Param('id') id: string,
    @Req() req: IAuthenticatedRequest,
    @Query('type') type: 'soft' | 'hard' = 'soft',
  ) {
    if (type === 'hard') {
      return await this.labelCategoryService.HardDelete(id, req.accountInfo);
    }
    return await this.labelCategoryService.SoftDelete(id, req.accountInfo);
  }
}
