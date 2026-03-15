import { Body, Controller, Delete, Get, HttpCode, Patch, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { FilterNotificationQueryDto } from './dtos/filter-notification-query.dto';
import { MarkNotificationsReadDto } from './dtos/mark-notifications-read.dto';
import { DeleteNotificationsDto } from './dtos/delete-notifications.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({
    summary: 'Get paginated notifications',
    description: 'Returns a paginated list of notifications for the authenticated user. Supports filtering by read status.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], description: 'Sort direction (default: DESC)' })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['createdAt', 'updatedAt', 'title'], description: 'Sort field (default: createdAt)' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean, description: 'Return only unread notifications' })
  @ApiResponse({ status: 200, description: 'Paginated list of notifications.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  @Get()
  async FindPaginated(
    @Query() query: FilterNotificationQueryDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    if (!req.accountInfo?.sub) throw new UnauthorizedException();
    query.accountId = req.accountInfo.sub;
    return this.notificationService.FindPaginated(query);
  }

  @ApiOperation({
    summary: 'Send a test notification',
    description:
      'Creates a notification for the specified account and immediately fires it over WebSocket. Intended for development/testing.',
  })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ status: 201, description: 'Notification created and fired to the target user.' })
  @ApiResponse({ status: 400, description: 'Validation failed — check required fields and UUID formats.' })
  @ApiResponse({ status: 404, description: 'Target account not found.' })
  @Post('test-send')
  async TestSend(@Body() dto: CreateNotificationDto) {
    return this.notificationService.Create(dto);
  }

  @ApiOperation({
    summary: 'Mark selected notifications as read',
    description:
      'Marks the provided notification IDs as read for the currently authenticated user. ' +
      'IDs that do not exist or belong to another user are silently ignored.',
  })
  @ApiBody({ type: MarkNotificationsReadDto })
  @ApiResponse({
    status: 200,
    description: 'Returns the number of notifications that were updated.',
    schema: { example: { updated: 3 } },
  })
  @ApiResponse({ status: 400, description: 'notificationIds must be a non-empty array of UUIDs.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  @HttpCode(200)
  @Patch('read')
  async MarkManyAsRead(
    @Body() dto: MarkNotificationsReadDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    if (!req.accountInfo?.sub) throw new UnauthorizedException();
    return this.notificationService.MarkManyAsRead(dto, req.accountInfo.sub);
  }

  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Marks every unread notification belonging to the authenticated user as read.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the number of notifications that were updated.',
    schema: { example: { updated: 12 } },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  @HttpCode(200)
  @Patch('read-all')
  async MarkAllAsRead(@Req() req: IAuthenticatedRequest) {
    if (!req.accountInfo?.sub) throw new UnauthorizedException();
    return this.notificationService.MarkAllAsRead(req.accountInfo.sub);
  }

  @ApiOperation({
    summary: 'Delete selected notifications',
    description:
      'Permanently deletes the provided notification IDs for the authenticated user. ' +
      'IDs that do not exist or belong to another user are silently ignored.',
  })
  @ApiBody({ type: DeleteNotificationsDto })
  @ApiResponse({ status: 204, description: 'Notifications deleted.' })
  @ApiResponse({ status: 400, description: 'notificationIds must be a non-empty array of UUIDs.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  @HttpCode(204)
  @Delete()
  async DeleteMany(
    @Body() dto: DeleteNotificationsDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    if (!req.accountInfo?.sub) throw new UnauthorizedException();
    await this.notificationService.DeleteMany(dto, req.accountInfo.sub);
  }

  @ApiOperation({
    summary: 'Delete all notifications',
    description: 'Permanently deletes every notification belonging to the authenticated user.',
  })
  @ApiResponse({ status: 204, description: 'All notifications deleted.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  @HttpCode(204)
  @Delete('all')
  async DeleteAll(@Req() req: IAuthenticatedRequest) {
    if (!req.accountInfo?.sub) throw new UnauthorizedException();
    await this.notificationService.DeleteAll(req.accountInfo.sub);
  }
}
