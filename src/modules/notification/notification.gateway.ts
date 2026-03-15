import {
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthJwtService } from '../auth/services/auth-jwt.service';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*', // Restrict to your frontend URL in production
  },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  /**
   * Tracks active socket IDs per account.
   * One account may have many concurrent connections (multiple tabs / devices).
   * accountId → Set<socketId>
   */
  private readonly accountSockets = new Map<string, Set<string>>();

  @WebSocketServer()
  server: Server;

  constructor(private readonly authJwtService: AuthJwtService) {}

  afterInit(_server: Server) {
    this.logger.log('WebSocket gateway initialized');
  }

  async handleConnection(client: Socket) {
    const token = this.extractToken(client);
    if (!token) {
      this.logger.warn(`Rejected: no token (socketId=${client.id})`);
      client.disconnect();
      return;
    }

    let payload: any;
    try {
      payload = await this.authJwtService.verifyAccessToken(token);
    } catch {
      this.logger.warn(`Rejected: invalid token (socketId=${client.id})`);
      client.disconnect();
      return;
    }

    const accountId: string = payload.sub;
    client.data.accountId = accountId;

    // Join a per-account room so all sockets for the same account receive broadcasted events.
    await client.join(`account:${accountId}`);

    // Track the socket for observability and cleanup.
    if (!this.accountSockets.has(accountId)) {
      this.accountSockets.set(accountId, new Set());
    }
    this.accountSockets.get(accountId)!.add(client.id);

    this.logger.log(
      `Connected: accountId=${accountId}, socketId=${client.id}, ` +
        `total connections=${this.accountSockets.get(accountId)!.size}`,
    );
  }

  handleDisconnect(client: Socket) {
    const accountId: string | undefined = client.data?.accountId;
    if (!accountId) return;

    const sockets = this.accountSockets.get(accountId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.accountSockets.delete(accountId);
      }
    }

    this.logger.log(
      `Disconnected: accountId=${accountId}, socketId=${client.id}, ` +
        `remaining=${this.accountSockets.get(accountId)?.size ?? 0}`,
    );
  }

  /**
   * Emits a new-notification event to every socket belonging to the given account.
   * Works for one client or many — no caller changes needed.
   */
  fireNotificationToAccount(accountId: string, notification: any): void {
    this.server.to(`account:${accountId}`).emit('notification.created', notification);
  }

  /**
   * Pushes an updated unread count to all sockets of the account.
   * Call this after mark-as-read and mark-all-as-read operations.
   */
  fireUnreadCountToAccount(accountId: string, count: number): void {
    this.server.to(`account:${accountId}`).emit('notification.unread-count', { count });
  }

  /**
   * Notifies all sockets of the account that specific notifications were marked as read.
   * Pass null for notificationIds to signal that all notifications were marked as read.
   */
  fireReadStatusToAccount(accountId: string, notificationIds: string[] | null): void {
    this.server.to(`account:${accountId}`).emit('notification.read', { notificationIds });
  }

  /**
   * Notifies all sockets of the account that notifications were deleted.
   * Pass null for notificationIds to signal that all notifications were deleted.
   */
  fireDeletedToAccount(accountId: string, notificationIds: string[] | null): void {
    this.server.to(`account:${accountId}`).emit('notification.deleted', { notificationIds });
  }

  getConnectedSocketCount(accountId: string): number {
    return this.accountSockets.get(accountId)?.size ?? 0;
  }

  /**
   * Extracts the JWT from the socket handshake.
   * Priority:
   *  1. socket.io auth payload  — connect({ auth: { token: '...' } })
   *  2. Authorization header    — Bearer <token>
   *  3. AccessToken cookie      — same source as the HTTP guard
   */
  private extractToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.token as string | undefined;
    if (authToken) return authToken;

    const authHeader = client.handshake.headers?.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) return token;
    }

    return undefined;
  }
}