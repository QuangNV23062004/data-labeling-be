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
import { LabelPresetService } from './label-preset.service';
import { CreateLabelPresetDto } from './dtos/create-label-preset.dto';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { Roles } from 'src/decorators';
import { Role } from '../account/enums/role.enum';
import { FilterLabelPresetQueryDto } from './dtos/filter-label-preset-query.dto';
import { UpdateLabelPresetDto } from './dtos/update-label-preset.dto';

@Controller('label-presets')
export class LabelPresetController {
  constructor(private readonly labelPresetService: LabelPresetService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
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
  async FindPaginated(
    @Req() req: IAuthenticatedRequest,
    @Query() query: FilterLabelPresetQueryDto,
    @Query('includeDeleted') includeDeleted?: boolean,
  ) {
    return await this.labelPresetService.FindPaginated(
      query,
      includeDeleted,
      req.accountInfo,
    );
  }

  @Get('all')
  @Roles(Role.ADMIN, Role.MANAGER)
  async FindAll(
    @Req() req: IAuthenticatedRequest,
    @Query() query: FilterLabelPresetQueryDto,
    @Query('includeDeleted') includeDeleted?: boolean,
  ) {
    return await this.labelPresetService.FindAll(
      query,
      includeDeleted,
      req.accountInfo,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async FindById(
    @Req() req: IAuthenticatedRequest,
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted?: boolean,
  ) {
    return await this.labelPresetService.FindById(
      id,
      includeDeleted,
      req.accountInfo,
    );
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
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
  async Restore(@Req() req: IAuthenticatedRequest, @Param('id') id: string) {
    return await this.labelPresetService.Restore(id, req.accountInfo);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
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
