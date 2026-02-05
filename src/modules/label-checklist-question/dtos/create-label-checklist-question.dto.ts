import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from 'src/modules/account/enums/role.enum';

export class CreateLabelChecklistQuestionDto {
  @ApiProperty({ description: 'The name of the checklist question' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Optional description of the question' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'ID of the associated label' })
  @IsOptional()
  @IsUUID()
  labelId?: string;

  @ApiProperty({
    description: 'Role of the question',
    enum: [Role.ANNOTATOR, Role.REVIEWER],
  })
  @IsNotEmpty()
  @IsEnum([Role.ANNOTATOR, Role.REVIEWER])
  roleEnum: Role;

  @ApiPropertyOptional({ description: 'Indicates if the question is required' })
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({
    description: 'ID of the user who created the question',
  })
  @IsOptional()
  @IsUUID()
  createdById?: string;
}
