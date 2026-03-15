import { Body, Controller, Patch, Post, Req, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IAuthenticatedRequest } from 'src/interfaces/request';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { MarkNotificationsReadDto } from './dtos/mark-notifications-read.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: 'Send a notification to a user (test)' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ status: 201, description: 'Notification sent' })
  @ApiResponse({ status: 404, description: 'Target account not found' })
  @Post('test-send')
  async TestSend(@Body() dto: CreateNotificationDto) {
    return this.notificationService.Create(dto);
  }

  @ApiOperation({ summary: 'Mark multiple notifications as read' })
  @ApiBody({ type: MarkNotificationsReadDto })
  @ApiResponse({ status: 200, description: 'Number of notifications marked as read' })
  @ApiResponse({ status: 400, description: 'notificationIds must be a non-empty array' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch('read')
  async MarkManyAsRead(
    @Body() dto: MarkNotificationsReadDto,
    @Req() req: IAuthenticatedRequest,
  ) {
    if (!req.accountInfo?.sub) throw new UnauthorizedException();
    return this.notificationService.MarkManyAsRead(dto, req.accountInfo.sub);
  }

  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'Number of notifications marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch('read-all')
  async MarkAllAsRead(@Req() req: IAuthenticatedRequest) {
    if (!req.accountInfo?.sub) throw new UnauthorizedException();
    return this.notificationService.MarkAllAsRead(req.accountInfo.sub);
  }
}
