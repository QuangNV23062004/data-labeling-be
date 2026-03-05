import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { AccountRatingService } from './account-rating.service';
import { CreateAccountRatingDto } from './dtos/create-account-rating.dto';
import { AccountRatingEntity } from './account-rating.entity';
import { Role } from '../account/enums/role.enum';
import { Roles } from 'src/decorators';
import { FilterAccountRatingQueryDto } from './dtos/filter-account-rating-query.dto';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('account-ratings')
@ApiTags('Account Ratings')
export class AccountRatingController {
  constructor(private readonly accountRatingService: AccountRatingService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create or recalculate an account rating' })
  @ApiBody({ type: CreateAccountRatingDto })
  @ApiResponse({
    status: 201,
    description: 'Account rating created',
    type: AccountRatingEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Account or project not found' })
  @ApiResponse({
    status: 409,
    description: 'Rating already exists for this account and project',
  })
  async Create(
    @Body() createAccountRatingDto: CreateAccountRatingDto,
  ): Promise<AccountRatingEntity> {
    return this.accountRatingService.Create(createAccountRatingDto);
  }

  @Get()
  @Roles(Role.MANAGER, Role.ADMIN, Role.ANNOTATOR, Role.REVIEWER)
  @ApiOperation({ summary: 'Get paginated account ratings' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Account ratings fetched',
    type: PaginationResultDto<AccountRatingEntity>,
  })
  async FindPaginated(
    @Query() query: FilterAccountRatingQueryDto,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() req: IAuthenticatedRequest,
  ): Promise<PaginationResultDto<AccountRatingEntity>> {
    return this.accountRatingService.FindPaginated(
      query,
      includeDeleted,
      req?.accountInfo,
    );
  }

  @Get('all')
  @Roles(Role.MANAGER, Role.ADMIN, Role.ANNOTATOR, Role.REVIEWER)
  @ApiOperation({ summary: 'Get all account ratings' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'All account ratings fetched',
    type: [AccountRatingEntity],
  })
  async FindAll(
    @Query() query: FilterAccountRatingQueryDto,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() req: IAuthenticatedRequest,
  ): Promise<AccountRatingEntity[]> {
    return this.accountRatingService.FindAll(
      query,
      includeDeleted,
      req?.accountInfo,
    );
  }

  @Get(':id')
  @Roles(Role.MANAGER, Role.ADMIN, Role.ANNOTATOR, Role.REVIEWER)
  @ApiOperation({ summary: 'Get account rating by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Account rating ID (UUID)',
  })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Account rating fetched',
    type: AccountRatingEntity,
  })
  @ApiResponse({ status: 404, description: 'Account rating not found' })
  async FindById(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() req: IAuthenticatedRequest,
  ): Promise<AccountRatingEntity> {
    return this.accountRatingService.FindById(
      id,
      includeDeleted,
      req?.accountInfo,
    );
  }
}
