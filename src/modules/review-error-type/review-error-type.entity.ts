import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity } from 'typeorm';
import { Severity } from './enums/serverity.enums';
@Entity({ name: 'review_error_types' })
export class ReviewErrorTypeEntity extends BaseEntity {
  @Column({ name: 'name', type: 'text', nullable: false })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'severity', type: 'enum', enum: Severity, nullable: false })
  severity: Severity;

  @Column({
    name: 'score_impact',
    type: 'int',
    nullable: false,
  })
  scoreImpact: number;
}
