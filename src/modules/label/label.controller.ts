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
import { LabelService } from './label.service';
import { Role } from '../account/enums/role.enum';
import { Roles } from 'src/decorators';
import { CreateLabelDto } from './dtos/create-label.dto';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { UpdateLabelDto } from './dtos/update-label.dto';
import { FilterLabelQueryDto } from './dtos/filter-label-query.dto';

@Controller('labels')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  async Create(
    @Body() createLabelDto: CreateLabelDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return this.labelService.Create(createLabelDto, req?.accountInfo);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  async Update(
    @Param('id') id: string,
    @Body() updateLabelDto: UpdateLabelDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return this.labelService.Update(id, updateLabelDto, req?.accountInfo);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get()
  async FindPaginated(
    @Query() query: FilterLabelQueryDto,
    @Req() req: IAuthenticatedRequest,
    @Query('includeDeleted') includeDeleted?: boolean,
  ) {
    return this.labelService.FindPaginated(
      query,
      includeDeleted,
      req?.accountInfo,
    );
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get('all')
  async FindAll(
    @Query() query: FilterLabelQueryDto,
    @Req() req: IAuthenticatedRequest,
    @Query('includeDeleted') includeDeleted?: boolean,
  ) {
    return this.labelService.FindAll(query, includeDeleted, req?.accountInfo);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get(':id')
  async FindById(
    @Param('id') id: string,
    @Req() req: IAuthenticatedRequest,
    @Query('includeDeleted') includeDeleted?: boolean,
  ) {
    return this.labelService.FindById(id, includeDeleted, req?.accountInfo);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch('restore/:id')
  async Restore(@Param('id') id: string, @Req() req: IAuthenticatedRequest) {
    return this.labelService.Restore(id, req?.accountInfo);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
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
