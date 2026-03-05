import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { AccountRatingHistoryService } from './account-rating-history.service';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { FilterAccountRatingHistoryQueryDto } from './dtos/filter-account-rating-history-query.dto';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('account-rating-histories')
@ApiTags('Account Rating Histories')
export class AccountRatingHistoryController {
  constructor(
    private readonly accountRatingHistoryService: AccountRatingHistoryService,
  ) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all account rating history records' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Account rating history records fetched',
  })
  async FindAll(
    @Query() query: FilterAccountRatingHistoryQueryDto,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.accountRatingHistoryService.FindAll(
      query,
      includeDeleted,
      req.accountInfo,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated account rating history records' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Paginated account rating history records fetched',
  })
  async FindPaginated(
    @Query() query: FilterAccountRatingHistoryQueryDto,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.accountRatingHistoryService.FindPaginated(
      query,
      includeDeleted,
      req.accountInfo,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account rating history by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Account rating history ID (UUID)',
  })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Account rating history fetched' })
  @ApiResponse({ status: 404, description: 'Account rating history not found' })
  async FindById(
    @Param('id') id: string,
    @Query('includeDeleted') includeDeleted: boolean = false,
    @Req() req: IAuthenticatedRequest,
  ) {
    return await this.accountRatingHistoryService.FindById(
      id,
      includeDeleted,
      req.accountInfo,
    );
  }
}
