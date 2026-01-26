import { PartialType } from '@nestjs/swagger';
import { CreateAccountRatingDto } from './create-account-rating.dto';

export class UpdateAccountRatingDto extends PartialType(CreateAccountRatingDto) {}
