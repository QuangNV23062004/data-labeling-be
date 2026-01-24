import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('accounts')
@Index('IDX_ACCOUNT_EMAIL', ['email'])
export class AccountEntity extends BaseEntity {
  @Column({ name: 'username' })
  username: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Exclude()
  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Exclude()
  @Column({ name: 'password_salt' })
  passwordSalt: string;

  @Column({ name: 'role', default: 'user' })
  role: string;

  @Column({ name: 'status', default: 'active' })
  status: string;
}
