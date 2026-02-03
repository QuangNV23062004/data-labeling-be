import { AccountInfo } from 'src/interfaces/request';
import { Role } from 'src/modules/account/enums/role.enum';
import { ForbiddenException } from '@nestjs/common';
import { OnlyAdminCanHardDeleteException } from '../exceptions/global-exceptions.exceptions';

/**
 * Base service class providing common utility methods.
 * All entity-specific services should extend this class.
 */
export abstract class BaseService {
  /**
   * Determines whether to include soft-deleted records based on user role and request.
   * Only ADMIN users can view deleted records.
   *
   * @param accountInfo - Current user's account information
   * @param includeDeleted - Optional flag to include deleted records (only works for admins)
   * @returns true if deleted records should be included, false otherwise
   */
  protected getIncludeDeleted(
    accountInfo?: AccountInfo,
    includeDeleted?: boolean,
  ): boolean {
    // Only admins can view deleted records
    if (
      accountInfo &&
      accountInfo.role === Role.ADMIN &&
      includeDeleted !== false
    ) {
      return true;
    }
    return false;
  }

  /**
   * Validates that the user is an ADMIN before allowing hard delete operations.
   * Hard delete is a destructive operation that permanently removes records.
   *
   * @param accountInfo - Current user's account information
   * @throws ForbiddenException if user is not an admin
   */
  protected validateAdminForHardDelete(accountInfo?: AccountInfo): void {
    if (!accountInfo || accountInfo.role !== Role.ADMIN) {
      throw new OnlyAdminCanHardDeleteException();
    }
  }
}
