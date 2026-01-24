import { AccountInfo } from 'src/interfaces/request';
import { Role } from 'src/modules/account/enums/role.enum';

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
}
