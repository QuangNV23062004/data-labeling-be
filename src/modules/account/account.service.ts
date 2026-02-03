import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AccountRepository } from './account.repository';
import { AccountInfo } from 'src/interfaces/request/authenticated-request.interface';
import { AccountEntity } from './account.entity';
import { Role } from './enums/role.enum';
import { FilterAccountDto } from './dtos/filter-account.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { CreateAccountDto } from './dtos/create-account.dto';
import { Status } from './enums/account-status.enum';
import * as bcrypt from 'bcrypt';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { AuthPasswordService } from '../auth/services/auth-password.service';
import { BaseService } from 'src/common/service/base.service';
import {
  AccountNotFoundException,
  EmailInUseException,
  InsufficientPermissionException,
} from './exceptions/account-exceptions.exceptions';

@Injectable()
export class AccountService extends BaseService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly authPasswordService: AuthPasswordService,
  ) {
    super();
  }

  private getAllowedRoles(accountInfo?: AccountInfo): Role[] {
    if (accountInfo?.role === Role.ADMIN) {
      return [Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER];
    } else if (accountInfo?.role === Role.MANAGER) {
      return [Role.ANNOTATOR, Role.REVIEWER];
    } else {
      return [];
    }
  }

  private checkPermission(id: string, accountInfo?: AccountInfo) {
    if (
      accountInfo?.sub !== id &&
      accountInfo?.role !== Role.ADMIN &&
      accountInfo?.role !== Role.MANAGER
    ) {
      throw new InsufficientPermissionException();
    }
  }

  async FindByEmail(
    email: string,
    accountInfo?: AccountInfo,
    includeDeleted?: boolean,
  ): Promise<AccountEntity> {
    let safeIncludedDeleted: boolean = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    const account = await this.accountRepository.FindByEmail(
      email,
      safeIncludedDeleted,
    );

    if (!account) {
      throw new AccountNotFoundException();
    }

    if (accountInfo?.role !== Role.ADMIN && account.role === Role.ADMIN) {
      throw new AccountNotFoundException();
    }

    return account;
  }

  async FindAll(
    accountInfo?: AccountInfo,
    query?: FilterAccountDto,
    includeDeleted?: boolean,
  ): Promise<AccountEntity[]> {
    let safeIncludedDeleted: boolean = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    const role = this.getAllowedRoles(accountInfo);
    return this.accountRepository.FindAll(
      safeIncludedDeleted,
      accountInfo?.sub as string,
      role,
      query,
    );
  }

  async FindPaginated(
    accountInfo?: AccountInfo,
    query?: FilterAccountDto,
    includeDeleted?: boolean,
  ): Promise<PaginationResultDto<AccountEntity>> {
    let safeIncludedDeleted: boolean = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    const role = this.getAllowedRoles(accountInfo);
    return this.accountRepository.FindPaginated(
      safeIncludedDeleted,
      accountInfo?.sub as string,
      role,
      query,
    );
  }

  async FindById(
    id: string,
    accountInfo?: AccountInfo,
    includeDeleted?: boolean,
  ): Promise<AccountEntity> {
    let safeIncludedDeleted: boolean = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    const account = await this.accountRepository.FindById(
      id,
      safeIncludedDeleted,
    );

    if (accountInfo?.role !== Role.ADMIN && account?.role === Role.ADMIN) {
      throw new AccountNotFoundException();
    }

    if (!account) {
      throw new AccountNotFoundException();
    }
    return account;
  }

  async Create(account: CreateAccountDto): Promise<AccountEntity> {
    const em = await this.accountRepository.GetEntityManager();

    return em.transaction(async (transactionalEntityManager) => {
      const existingAccount = await this.accountRepository.FindByEmail(
        account.email,
        false,
        transactionalEntityManager,
      );

      if (existingAccount) {
        throw new EmailInUseException();
      }

      const { hash, salt } =
        await this.authPasswordService.hashPassword('123456');

      const accountEntity: Partial<AccountEntity> = {
        email: account.email,
        username: account.username,
        role: account.role,
        passwordHash: hash,
        passwordSalt: salt,
        status: Status.NEED_CHANGE_PASSWORD,
      };
      return this.accountRepository.Create(
        accountEntity as AccountEntity,
        transactionalEntityManager,
      );
    });
  }

  async Update(
    id: string,
    updateAccountDto: UpdateAccountDto,
    accountInfo?: AccountInfo,
  ): Promise<AccountEntity> {
    this.checkPermission(id, accountInfo);

    const em = await this.accountRepository.GetEntityManager();

    return em.transaction(async (transactionalEntityManager) => {
      const account = await this.accountRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      if (!account) {
        throw new AccountNotFoundException();
      }

      // Prevent non-admins from updating admin accounts
      if (accountInfo?.role !== Role.ADMIN && account.role === Role.ADMIN) {
        throw new InsufficientPermissionException();
      }

      if (updateAccountDto.email && updateAccountDto.email !== account.email) {
        account.email = updateAccountDto.email;
      }

      if (
        updateAccountDto.username &&
        updateAccountDto.username !== account.username
      ) {
        account.username = updateAccountDto.username;
      }

      if (updateAccountDto.role && accountInfo?.role !== Role.ADMIN) {
        throw new InsufficientPermissionException();
      }

      if (
        updateAccountDto.role &&
        updateAccountDto.role !== account.role &&
        updateAccountDto.role !== account.role
      ) {
        account.role = updateAccountDto.role;
      }

      if (
        updateAccountDto.status &&
        updateAccountDto.status !== account.status &&
        accountInfo?.role !== Role.ADMIN
      ) {
        throw new InsufficientPermissionException();
      }

      if (
        updateAccountDto.status &&
        updateAccountDto.status !== account.status
      ) {
        account.status = updateAccountDto.status;
      }

      return this.accountRepository.Update(account, transactionalEntityManager);
    });
  }

  async SoftDelete(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    this.checkPermission(id, accountInfo);

    const em = await this.accountRepository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const account = await this.accountRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );
      if (!account) {
        throw new AccountNotFoundException();
      }

      return await this.accountRepository.SoftDelete(
        id,
        transactionalEntityManager,
      );
    });
  }

  async Restore(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    this.checkPermission(id, accountInfo);

    const em = await this.accountRepository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const account = await this.accountRepository.FindById(
        id,
        true,
        transactionalEntityManager,
      );

      if (!account) {
        throw new AccountNotFoundException();
      }

      return await this.accountRepository.Restore(
        id,
        transactionalEntityManager,
      );
    });
  }

  async HardDelete(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    this.checkPermission(id, accountInfo);
    this.validateAdminForHardDelete(accountInfo);

    const em = await this.accountRepository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const account = await this.accountRepository.FindById(
        id,
        true,
        transactionalEntityManager,
      );

      if (!account) {
        throw new AccountNotFoundException();
      }

      return await this.accountRepository.HardDelete(
        id,
        transactionalEntityManager,
      );
    });
  }

  async BootstrapAdminAccount(): Promise<void> {
    const em = await this.accountRepository.GetEntityManager();

    return em.transaction(async (transactionalEntityManager) => {
      const users = await this.accountRepository.FindAll(
        false,
        '',
        [Role.ADMIN, Role.MANAGER, Role.ANNOTATOR, Role.REVIEWER],
        undefined,
        transactionalEntityManager,
      );

      let createAdmin = false;
      if (users.length === 0) {
        createAdmin = true;
      }

      if (users.find((user) => user.role === Role.ADMIN)) {
        createAdmin = false;
      }

      if (createAdmin) {
        const { hash, salt } =
          await this.authPasswordService.hashPassword('123456');

        const adminAccount: Partial<AccountEntity> = {
          email: 'admin@example.com',
          username: 'admin',
          role: Role.ADMIN,
          passwordHash: hash,
          passwordSalt: salt,
          status: Status.NEED_CHANGE_PASSWORD,
        };

        await this.accountRepository.Create(
          adminAccount as AccountEntity,
          transactionalEntityManager,
        );
        return;
      }

      return;
    });
  }
}
