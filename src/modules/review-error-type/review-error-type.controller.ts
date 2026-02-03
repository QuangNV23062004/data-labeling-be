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
import { Roles } from 'src/decorators';
import { Role } from '../account/enums/role.enum';
import { ReviewErrorTypeService } from './review-error-type.service';
import { FilterReviewErrorTypeQueryDto } from './dtos/filter-review-error-type-query.dto';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { CreateReviewErrorTypeDto } from './dtos/create-review-error-type.dto';
import { UpdateReviewErrorTypeDto } from './dtos/update-review-error-type.dto';

@Controller('review-error-types')
export class ReviewErrorTypeController {
  constructor(
    private readonly reviewErrorTypeService: ReviewErrorTypeService,
  ) {}

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get()
  async FindPaginated(
    @Query() query: FilterReviewErrorTypeQueryDto,
    @Query('includeDeleted') includeDeleted = false,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.reviewErrorTypeService.FindPaginated(
      query,
      includeDeleted,
      req.accountInfo,
    );
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get('all')
  async FindAll(
    @Query() query: FilterReviewErrorTypeQueryDto,

    @Query('includeDeleted') includeDeleted = false,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.reviewErrorTypeService.FindAll(
      query,
      includeDeleted,
      req.accountInfo,
    );
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER)
  @Get(':id')
  async FindById(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted = false,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.reviewErrorTypeService.FindById(
      id,
      includeDeleted,
      req.accountInfo,
    );
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.REVIEWER)
  async Create(
    @Body() dto: CreateReviewErrorTypeDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.reviewErrorTypeService.Create(dto, req.accountInfo);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.REVIEWER)
  async Update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewErrorTypeDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.reviewErrorTypeService.Update(id, dto, req.accountInfo);
  }

  @Patch('restore/:id')
  @Roles(Role.ADMIN)
  async Restore(@Param('id') id: string, @Req() req: IAuthenticatedRequest) {
    return await this.reviewErrorTypeService.Restore(id, req.accountInfo);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.REVIEWER)
  async Delete(
    @Param('id') id: string,
    @Req() req: IAuthenticatedRequest,
    @Query('type') type: 'hard' | 'soft' = 'soft',
  ) {
    if (type === 'hard') {
      return await this.reviewErrorTypeService.HardDelete(id, req.accountInfo);
    }
    return await this.reviewErrorTypeService.SoftDelete(id, req.accountInfo);
  }
}
