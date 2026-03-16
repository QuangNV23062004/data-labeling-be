import { ApiProperty } from '@nestjs/swagger';

export class AccountStatisticsDto {
  @ApiProperty({
    description: 'Total number of accounts visible to current user',
  })
  totalAccounts: number;

  @ApiProperty({ description: 'Number of admin accounts' })
  adminCount: number;

  @ApiProperty({ description: 'Number of manager accounts' })
  managerCount: number;

  @ApiProperty({ description: 'Number of annotator accounts' })
  annotatorCount: number;

  @ApiProperty({ description: 'Number of reviewer accounts' })
  reviewerCount: number;

  @ApiProperty({ description: 'Number of active accounts' })
  activeCount: number;

  @ApiProperty({ description: 'Number of inactive accounts' })
  inactiveCount: number;

  @ApiProperty({ description: 'Number of accounts that must change password' })
  needChangePasswordCount: number;
}
